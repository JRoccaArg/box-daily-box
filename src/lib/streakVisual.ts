/**
 * Presentación compartida de la racha. Mantiene los mismos umbrales en la
 * cabecera, el progreso mensual y los rankings, sin mezclar UI con la lógica
 * que calcula la racha en el servidor.
 */
export type StreakTier = "base" | "amber" | "red" | "blue" | "violet" | "gold";

export type StreakVisual = {
  tier: StreakTier;
  textClass: string;
  chipClass: string;
  flameClass: string;
};

const VISUALS: Record<StreakTier, StreakVisual> = {
  base: {
    tier: "base",
    textClass: "text-sector-yellow",
    chipClass: "border-sector-yellow/30 bg-sector-yellow/10 text-sector-yellow",
    flameClass: "text-sector-yellow",
  },
  amber: {
    tier: "amber",
    textClass: "text-amber-400",
    chipClass: "border-amber-400/30 bg-amber-400/10 text-amber-400",
    flameClass: "text-amber-400",
  },
  red: {
    tier: "red",
    textClass: "text-racing-400",
    chipClass: "border-racing-400/30 bg-racing/10 text-racing-400",
    flameClass: "text-racing-400",
  },
  blue: {
    tier: "blue",
    textClass: "text-sky-400",
    chipClass: "border-sky-400/30 bg-sky-400/10 text-sky-400",
    flameClass: "text-sky-400",
  },
  violet: {
    tier: "violet",
    textClass: "text-sector-purple",
    chipClass: "border-sector-purple/30 bg-sector-purple/10 text-sector-purple",
    flameClass: "origin-bottom text-sector-purple motion-safe:animate-flame-live",
  },
  gold: {
    tier: "gold",
    textClass: "text-[#FFE076]",
    chipClass: "border-[#FFE076]/35 bg-[#FFE076]/10 text-[#FFE076]",
    flameClass: "origin-bottom text-[#FFE076] motion-safe:animate-flame-live",
  },
};

/** Devuelve solo el aspecto: 1–6 amarillo, 7–14 ámbar, 15–29 rojo, 30–59 azul, 60–99 violeta y 100+ dorado. */
export function getStreakVisual(days: number): StreakVisual {
  if (days >= 100) return VISUALS.gold;
  if (days >= 60) return VISUALS.violet;
  if (days >= 30) return VISUALS.blue;
  if (days >= 15) return VISUALS.red;
  if (days >= 7) return VISUALS.amber;
  return VISUALS.base;
}
