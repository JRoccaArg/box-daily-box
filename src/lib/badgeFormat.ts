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

/**
 * Descripción completa del badge para el tooltip: "Ganador de Junio 2026",
 * "Ganador de: Junio 2026, Mayo 2026, Abril 2026", "Administrador del sitio".
 */
export function formatBadgeTooltip(
  type: BadgeType,
  months: string[] | undefined,
  t: Translate,
): string {
  if (type === "admin") return t("badge.tooltip_admin");
  if (type === "superadmin") return t("badge.tooltip_superadmin");
  if (!months || months.length === 0) return t(`badge.${type}`);
  if (months.length === 1) {
    return t("badge.tooltip_monthly_one", { month: formatBadgeMonth(months[0] as string, t) });
  }
  return t("badge.tooltip_monthly_many", {
    months: months.map((m) => formatBadgeMonth(m, t)).join(", "),
  });
}
