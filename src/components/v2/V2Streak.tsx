// src/components/v2/V2Streak.tsx
//
// Llama de racha del boceto. Los tramos de color son los MISMOS que usa el
// resto del sitio (src/lib/streakVisual.ts: 1–6 amarillo, 7–14 ámbar, 15–29
// rojo, 30–59 azul, 60–99 violeta, 100+ dorado); acá solo se traducen a las
// clases del boceto.

import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
import { getStreakVisual, type StreakTier } from "@/lib/streakVisual";

const TIER_CLASS: Record<StreakTier, string> = {
  base: "yellow",
  amber: "amber",
  red: "red",
  blue: "blue",
  violet: "violet",
  gold: "gold",
};

export function V2Streak({ days, className }: { days: number; className?: string }) {
  const { t } = useI18n();
  const tier = TIER_CLASS[getStreakVisual(days).tier];
  return (
    <span
      className={["streak", tier, className ?? ""].join(" ").trim()}
      aria-label={t("v2.streak.aria", { count: days })}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2c1 6-3 7-3 10-2-1-2-3-2-4-4 4-5 8-2 11 3 4 10 4 13-1 3-5-1-11-6-16Z" />
        <path className="flame-core" d="M12 13c-3 3-3 6 0 7 3 0 4-4 0-7Z" />
      </svg>
      {days}
    </span>
  );
}
