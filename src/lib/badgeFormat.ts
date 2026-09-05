// src/lib/badgeFormat.ts
//
// Formatea la descripción de un badge para el tooltip (título nativo del
// navegador al pasar el mouse/mantener presionado). Compartido entre
// GlobalRanking.tsx y BadgeGallery.tsx para no duplicar el formato.

import type { BadgeType } from "./api";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** 'YYYY-MM' -> "Junio 2026" (nombre del mes traducido, capitalizado). */
export function formatBadgeMonth(monthStr: string, t: Translate): string {
  const [y, m] = monthStr.split("-");
  const monthName = t(`month.${Number(m) - 1}`);
  const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalized} ${y}`;
}

/** Prefijo de clave i18n según la posición del podio (oro/plata/bronce). */
const PODIUM_PREFIX: Record<"monthly_gold" | "monthly_silver" | "monthly_bronze", string> = {
  monthly_gold: "gold",
  monthly_silver: "silver",
  monthly_bronze: "bronze",
};

function isPodiumBadge(
  type: BadgeType,
): type is "monthly_gold" | "monthly_silver" | "monthly_bronze" {
  return type === "monthly_gold" || type === "monthly_silver" || type === "monthly_bronze";
}

/**
 * Descripción completa del badge para el tooltip: "Ganador de Junio 2026"
 * (oro), "Segundo puesto en Junio 2026" (plata), "Tercer puesto en Junio
 * 2026" (bronce) — cada posición tiene su propio texto, no solo el oro.
 * "Administrador del sitio" para admin/superadmin.
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
    return t(`badge.tooltip_${prefix}_one`, { month: formatBadgeMonth(months[0] as string, t) });
  }
  return t(`badge.tooltip_${prefix}_many`, {
    months: months.map((m) => formatBadgeMonth(m, t)).join(", "),
  });
}
