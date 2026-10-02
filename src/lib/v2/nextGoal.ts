// src/lib/v2/nextGoal.ts
//
// "Tu próxima meta" de la página de Logros: el logro todavía NO completado que
// está más cerca de completarse según su progreso real. Lógica pura (sin UI)
// para poder testearla.
//
// Reglas (decididas al implementar la etapa, ver roadmap del rediseño):
//  - Se excluyen siempre los ya obtenidos: fila en `badges` (counts > 0) o
//    progreso completo (`unlocked`, por si el otorgamiento quedó pendiente).
//  - "Más cerca" = mayor fracción rawCurrent/target, calculada EXACTA. No se
//    usa `percent` del server porque está redondeado (499/500 da 100%).
//    Así las unidades distintas (victorias / juegos distintos) se comparan
//    como avance relativo, que es lo único comparable entre ellas.
//  - Desempate: menos unidades faltantes; después el más fácil del catálogo
//    (el server lo ordena del más difícil al más fácil).
//  - Si todos están obtenidos → null (la UI muestra "colección completa").

import type { AchievementBadgeType, AchievementProgress } from "@/lib/api";

export type NextGoal = {
  item: AchievementProgress;
  /** Avance exacto 0..1 (nunca 1: si llegara, el logro ya estaría obtenido). */
  ratio: number;
  /** Unidades que faltan (victorias o juegos, según el logro). */
  remaining: number;
};

/** ¿El jugador ya tiene este logro? */
export function isAchievementOwned(
  item: AchievementProgress,
  counts: Record<string, number>,
): boolean {
  return (counts[item.type] ?? 0) > 0 || item.unlocked;
}

/** Avance exacto 0..1 de un logro. */
export function achievementRatio(item: AchievementProgress): number {
  if (item.target <= 0) return 0;
  return Math.min(Math.max(item.rawCurrent, 0) / item.target, 1);
}

/** Porcentaje para mostrar: entero hacia abajo, nunca 100 si no está obtenido. */
export function displayPercent(item: AchievementProgress, owned: boolean): number {
  if (owned) return 100;
  return Math.min(99, Math.floor(achievementRatio(item) * 100));
}

export function pickNextGoal(
  items: AchievementProgress[],
  counts: Record<string, number>,
): NextGoal | null {
  let best: (NextGoal & { index: number }) | null = null;
  items.forEach((item, index) => {
    if (isAchievementOwned(item, counts)) return;
    const ratio = achievementRatio(item);
    const remaining = Math.max(item.target - Math.max(item.rawCurrent, 0), 0);
    const better =
      !best ||
      ratio > best.ratio ||
      (ratio === best.ratio &&
        (remaining < best.remaining || (remaining === best.remaining && index > best.index)));
    if (better) best = { item, ratio, remaining, index };
  });
  if (!best) return null;
  const { item, ratio, remaining } = best;
  return { item, ratio, remaining };
}

/** Unidad en la que se mide cada logro (para los textos "faltan N …"). */
export type AchievementUnit = "wins" | "games";

const UNIT: Record<AchievementBadgeType, AchievementUnit> = {
  ach_legend_50: "wins",
  ach_wins_500: "wins",
  ach_legend_10: "wins",
  ach_wins_100: "wins",
  ach_specialist_50: "wins",
  ach_perfect_day: "games",
  ach_complete: "games",
};

export function achievementUnit(type: string): AchievementUnit {
  return UNIT[type as AchievementBadgeType] ?? "wins";
}

/** Tono del símbolo en el boceto (silver/blue/gold/bronze/green). */
const TONE: Record<AchievementBadgeType, string> = {
  ach_legend_50: "gold",
  ach_wins_500: "silver",
  ach_legend_10: "gold",
  ach_wins_100: "silver",
  ach_specialist_50: "bronze",
  ach_perfect_day: "green",
  ach_complete: "blue",
};

export function achievementTone(type: string): string {
  return TONE[type as AchievementBadgeType] ?? "";
}
