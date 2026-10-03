// src/lib/v2/badgeSelection.ts
//
// Selección de insignias para el ranking (perfil v2). Lógica pura.
//
// El server es la autoridad (validateFeaturedSelection / deriveDisplayBadges
// en src/api/badges.ts). Esto solo ESPEJA sus reglas para que la UI ofrezca
// únicamente lo válido y muestre una vista previa fiel:
//  - Máximo 3 lugares (admin/superadmin aparte, no elegibles).
//  - Solo se elige lo que se POSEE (filas en `badges` → `counts`).
//  - Podio (mensual o anual): agrupado (1 lugar, contador ×N) o individual
//    (no más lugares que ejemplares). Logros: siempre individuales, únicos.
//  - Modo automático (featured = null): podio anual oro→plata→bronce, podio
//    mensual oro→plata→bronce (agrupados), después logros en orden de catálogo.

import type { FeaturedSlot, UserBadges } from "@/lib/api";

export const MAX_FEATURED = 3;

export const PODIUM_ORDER = [
  "annual_gold",
  "annual_silver",
  "annual_bronze",
  "monthly_gold",
  "monthly_silver",
  "monthly_bronze",
] as const satisfies ReadonlyArray<FeaturedSlot["type"]>;

type SlotType = FeaturedSlot["type"];

export function isPodiumType(type: string): boolean {
  return (PODIUM_ORDER as readonly string[]).includes(type);
}

export type SelectableBadge = {
  type: SlotType;
  /** Ejemplares que poseés (podio puede ser > 1). */
  count: number;
  /** Períodos ganados ('YYYY-MM'; anual = 'YYYY-01'), del más reciente al más viejo. */
  periods: string[];
  podium: boolean;
};

/** Lo que podés elegir: lo que poseés, en el orden en que el server lo prioriza. */
export function selectableBadges(data: UserBadges): SelectableBadge[] {
  const out: SelectableBadge[] = [];
  const periodsOf = (type: string) =>
    data.owned
      .filter((b) => b.type === type && b.referenceMonth)
      .map((b) => b.referenceMonth as string)
      .sort()
      .reverse();
  for (const type of PODIUM_ORDER) {
    const count = data.counts[type] ?? 0;
    if (count > 0) out.push({ type, count, periods: periodsOf(type), podium: true });
  }
  // data.achievements ya viene en el orden del catálogo del server.
  for (const a of data.achievements) {
    if ((data.counts[a.type] ?? 0) > 0) {
      out.push({ type: a.type, count: 1, periods: [], podium: false });
    }
  }
  return out;
}

/** Vista previa del modo automático (espejo de deriveDisplayBadges). */
export function automaticSelection(data: UserBadges): FeaturedSlot[] {
  return selectableBadges(data)
    .slice(0, MAX_FEATURED)
    .map((b) => (b.podium && b.count > 1 ? { type: b.type, grouped: true } : { type: b.type }));
}

/** Descarta de una selección guardada lo que ya no poseés (como el server al leer). */
export function sanitizeSelection(
  featured: FeaturedSlot[],
  counts: Record<string, number>,
): FeaturedSlot[] {
  const out: FeaturedSlot[] = [];
  const used: Record<string, number> = {};
  for (const slot of featured) {
    if (out.length >= MAX_FEATURED) break;
    const owned = counts[slot.type] ?? 0;
    if (owned <= 0) continue;
    if (!isPodiumType(slot.type)) {
      if (used[slot.type]) continue;
      used[slot.type] = 1;
      out.push({ type: slot.type });
      continue;
    }
    if (slot.grouped) {
      out.push({ type: slot.type, grouped: true });
      continue;
    }
    if ((used[slot.type] ?? 0) >= owned) continue;
    used[slot.type] = (used[slot.type] ?? 0) + 1;
    out.push({ type: slot.type });
  }
  return out;
}

export function isSelected(featured: FeaturedSlot[], type: SlotType): boolean {
  return featured.some((s) => s.type === type);
}

export function isGrouped(featured: FeaturedSlot[], type: SlotType): boolean {
  return featured.some((s) => s.type === type && s.grouped);
}

/**
 * Agrega o quita una insignia. Un podio con varios ejemplares entra agrupado
 * (un solo lugar con ×N); quitarla quita todos sus lugares.
 */
export function toggleBadge(
  featured: FeaturedSlot[],
  badge: SelectableBadge,
): FeaturedSlot[] {
  if (isSelected(featured, badge.type)) {
    return featured.filter((s) => s.type !== badge.type);
  }
  if (featured.length >= MAX_FEATURED) return featured;
  const slot: FeaturedSlot =
    badge.podium && badge.count > 1 ? { type: badge.type, grouped: true } : { type: badge.type };
  return [...featured, slot];
}

/** Podio con varios ejemplares: agrupado (1 lugar ×N) ↔ individual (un lugar por ejemplar, hasta el cupo). */
export function toggleGrouping(
  featured: FeaturedSlot[],
  badge: SelectableBadge,
): FeaturedSlot[] {
  if (!badge.podium || badge.count <= 1) return featured;
  const index = featured.findIndex((s) => s.type === badge.type);
  const without = featured.filter((s) => s.type !== badge.type);
  const at = index < 0 ? without.length : Math.min(index, without.length);
  let insert: FeaturedSlot[];
  if (isGrouped(featured, badge.type)) {
    const capacity = MAX_FEATURED - without.length;
    const n = Math.max(1, Math.min(badge.count, capacity));
    insert = Array.from({ length: n }, () => ({ type: badge.type }));
  } else {
    insert = [{ type: badge.type, grouped: true }];
  }
  return [...without.slice(0, at), ...insert, ...without.slice(at)];
}

export function sameSelection(a: FeaturedSlot[] | null, b: FeaturedSlot[] | null): boolean {
  if (a === null || b === null) return a === b;
  if (a.length !== b.length) return false;
  return a.every((s, i) => s.type === b[i]?.type && !!s.grouped === !!b[i]?.grouped);
}

// ─── Selector por casillas (desplegable del perfil) ──────────────────

/** Tono del medallón: la plata usa la variante gris del boceto; el resto, la dorada. */
export function badgeTone(type: string): "gold" | "silver" {
  return type === "monthly_silver" || type === "annual_silver" || type === "ach_wins_100" || type === "ach_wins_500"
    ? "silver"
    : "gold";
}

/** Estado de una opción del desplegable respecto de la casilla que se está editando. */
export type PickerState = "current" | "available" | "in-use" | "locked";

export type PickerOption = {
  /** Identificador estable para React (un podio con varios ejemplares tiene dos filas). */
  key: string;
  type: SlotType;
  podium: boolean;
  /** Para podios con varios ejemplares: ocupa un solo lugar con contador (×N). */
  grouped: boolean;
  /** Ejemplares que posee (logros: 0 o 1). */
  count: number;
  state: PickerState;
  /** Solo logros bloqueados: avance real hacia el objetivo. */
  progress?: { current: number; target: number };
  /** Podio: períodos ganados ('YYYY-MM'; anual = 'YYYY-01'), del más reciente al más viejo. */
  periods: string[];
};

/** ¿La opción se puede elegir ahora mismo para esa casilla? */
export function isPickable(option: PickerOption): boolean {
  return option.state === "available" || option.state === "current";
}

/**
 * Opciones del desplegable de la casilla `slot`: primero los 7 logros (todos,
 * con su estado: obtenido o bloqueado) y después los podios que ya ganó.
 *
 * Solo se puede elegir lo que se POSEE (el server valida contra las filas de
 * `badges`, no contra el progreso): un logro con progreso completo pero sin
 * fila todavía figura como bloqueado hasta que el server lo otorgue.
 */
export function pickerOptions(
  data: UserBadges,
  selection: FeaturedSlot[],
  slot: number,
): { achievements: PickerOption[]; podiums: PickerOption[] } {
  const here = selection[slot];
  const elsewhere = selection.filter((_, i) => i !== slot);
  const periodsOf = (type: string) =>
    data.owned
      .filter((b) => b.type === type && b.referenceMonth)
      .map((b) => b.referenceMonth as string)
      .sort()
      .reverse();

  const achievements: PickerOption[] = data.achievements.map((a) => {
    const owned = (data.counts[a.type] ?? 0) > 0;
    const state: PickerState = !owned
      ? "locked"
      : here?.type === a.type
        ? "current"
        : elsewhere.some((s) => s.type === a.type)
          ? "in-use"
          : "available";
    return {
      key: a.type,
      type: a.type,
      podium: false,
      grouped: false,
      count: owned ? 1 : 0,
      state,
      progress: owned ? undefined : { current: Math.min(a.rawCurrent, a.target), target: a.target },
      periods: [],
    };
  });

  const podiums: PickerOption[] = [];
  for (const type of PODIUM_ORDER) {
    const count = data.counts[type] ?? 0;
    if (count <= 0) continue;
    const periods = periodsOf(type);
    const sameType = elsewhere.filter((s) => s.type === type);
    const groupedElsewhere = sameType.some((s) => s.grouped);
    const individualsElsewhere = sameType.filter((s) => !s.grouped).length;
    if (count > 1) {
      const groupedState: PickerState =
        here?.type === type && here.grouped ? "current" : sameType.length > 0 ? "in-use" : "available";
      podiums.push({ key: `${type}:group`, type, podium: true, grouped: true, count, state: groupedState, periods });
    }
    const singleState: PickerState =
      here?.type === type && !here.grouped
        ? "current"
        : groupedElsewhere || individualsElsewhere >= count
          ? "in-use"
          : "available";
    podiums.push({ key: `${type}:one`, type, podium: true, grouped: false, count, state: singleState, periods });
  }
  return { achievements, podiums };
}

/** Pone (o saca, con `null`) una insignia en la casilla `slot`. Mantiene la lista compacta y con tope de 3. */
export function setSlot(selection: FeaturedSlot[], slot: number, value: FeaturedSlot | null): FeaturedSlot[] {
  const next = selection.slice(0, MAX_FEATURED);
  if (value === null) {
    if (slot < next.length) next.splice(slot, 1);
    return next;
  }
  if (slot >= next.length) next.push(value);
  else next[slot] = value;
  return next.slice(0, MAX_FEATURED);
}

/** Casilla de la lista a la que corresponde clickear la casilla visual `slot` (las vacías se llenan en orden). */
export function slotTarget(selection: FeaturedSlot[], slot: number): number {
  return Math.min(slot, selection.length, MAX_FEATURED - 1);
}
