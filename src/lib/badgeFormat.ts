// src/lib/badgeFormat.ts
//
// Formatea la descripción de un badge para el tooltip (título nativo del
// navegador al pasar el mouse/mantener presionado). Compartido por todo lo que
// muestra insignias (ranking, perfil) para no duplicar el formato.

import type { BadgeType } from "./api";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** 'YYYY-MM' -> "Junio 2026" (nombre del mes traducido, capitalizado). */
export function formatBadgeMonth(monthStr: string, t: Translate): string {
  const [y, m] = monthStr.split("-");
  const monthName = t(`month.${Number(m) - 1}`);
  const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalized} ${y}`;
}

type PodiumType =
  | "monthly_gold"
  | "monthly_silver"
  | "monthly_bronze"
  | "annual_gold"
  | "annual_silver"
  | "annual_bronze";

/** Prefijo de clave i18n según la posición del podio (oro/plata/bronce). */
const PODIUM_PREFIX: Record<PodiumType, string> = {
  monthly_gold: "gold",
  monthly_silver: "silver",
  monthly_bronze: "bronze",
  annual_gold: "annual_gold",
  annual_silver: "annual_silver",
  annual_bronze: "annual_bronze",
};

export function isPodiumBadge(type: BadgeType): type is PodiumType {
  return type in PODIUM_PREFIX;
}

export function isAnnualBadge(type: BadgeType): boolean {
  return type.startsWith("annual_");
}

/**
 * Período de un badge de podio para mostrar: "Junio 2026" (mensual) o "2026"
 * (anual: el server guarda el año como 'YYYY-01').
 */
export function formatBadgePeriod(type: BadgeType, period: string, t: Translate): string {
  return isAnnualBadge(type) ? period.substring(0, 4) : formatBadgeMonth(period, t);
}

/**
 * Descripción completa del badge para el tooltip: "Ganador de Junio 2026"
 * (oro), "Segundo puesto en Junio 2026" (plata), "Tercer puesto en Junio
 * 2026" (bronce), "Campeón de 2026" (oro anual)… "Administrador del sitio"
 * para admin/superadmin.
 */
export function formatBadgeTooltip(
  type: BadgeType,
  months: string[] | undefined,
  t: Translate,
): string {
  if (type === "admin") return t("badge.tooltip_admin");
  if (type === "superadmin") return t("badge.tooltip_superadmin");
  if (type.startsWith("ach_")) return t(`badge.tooltip_${type}`);
  if (!isPodiumBadge(type)) return t(`badge.${type}`);
  if (!months || months.length === 0) return t(`badge.${type}`);
  const prefix = PODIUM_PREFIX[type];
  if (months.length === 1) {
    return t(`badge.tooltip_${prefix}_one`, { month: formatBadgePeriod(type, months[0] as string, t) });
  }
  return t(`badge.tooltip_${prefix}_many`, {
    months: months.map((m) => formatBadgePeriod(type, m, t)).join(", "),
  });
}
