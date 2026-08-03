// src/components/career/CareerSeasonSummary.tsx
//
// Resumen de UNA temporada recien simulada. Se muestra de a una (aunque el
// modo de juego haya avanzado 2 o 3 de una vez), con un boton "Continuar"
// entre cada una — pedido explicito del usuario, para poder asimilar cada
// resultado antes de pasar al siguiente.

import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { StatPill } from "@/components/ui/StatPill";
import { Trophy, Flag } from "@/components/ui/Icon";
import { teamName } from "@/data";
import type { SeasonResult } from "@/lib/career/types";

type CareerSeasonSummaryProps = {
  result: SeasonResult;
  onContinue: () => void;
};

export function CareerSeasonSummary({ result, onContinue }: CareerSeasonSummaryProps) {
  const { t } = useI18n();
  const s = result.stats;

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("career.season.eyebrow")}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
        {t("career.season.title", { year: result.year })}
      </h1>

      {!s ? (
        <p className="mt-4 text-sm text-ink-muted">{t("career.season.no_seat")}</p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-3">
            {result.teamId && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5 p-1.5">
                <img
                  src={`/team-logos/${result.teamId}.png`}
                  alt={teamName(result.teamId)}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div>
              <div className="font-display font-semibold text-white">
                {result.teamId ? teamName(result.teamId) : ""}
              </div>
              <div className="text-xs text-ink-muted">{t("career.offers.car_rank", { rank: s.carRank })}</div>
            </div>
            {s.championshipPosition === 1 && (
              <span className="ml-auto flex items-center gap-1 rounded-md border border-sector-yellow/40 bg-sector-yellow/10 px-2 py-1 text-xs font-medium text-sector-yellow">
                <Trophy size={14} /> {t("career.season.drivers_champion")}
              </span>
            )}
          </div>

          {s.constructorsChampion && (
            <div className="mt-2 flex items-center gap-1.5 rounded-md border border-sector-purple/40 bg-sector-purple/10 px-3 py-1.5 text-xs font-medium text-sector-purple">
              <Flag size={14} /> {t("career.season.constructors_champion")}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            <StatPill label={t("career.season.points")} value={s.points} />
            <StatPill label={t("career.season.position")} value={`P${s.championshipPosition}`} />
            <StatPill label={t("career.season.wins")} value={s.wins} accent="yellow" />
            <StatPill label={t("career.season.podiums")} value={s.podiums} />
            <StatPill label={t("career.season.poles")} value={s.poles} />
            <StatPill label={t("career.season.fastest_laps")} value={s.fastestLaps} />
            <StatPill label={t("career.season.overtakes")} value={s.overtakes} accent="green" />
            <StatPill
              label={t("career.season.mechanical_dnfs")}
              value={s.mechanicalDnfs}
              accent={s.mechanicalDnfs > 0 ? "red" : "default"}
            />
            <StatPill
              label={t("career.season.accidents")}
              value={s.accidents}
              accent={s.accidents > 0 ? "red" : "default"}
            />
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-asphalt-700/60 p-3 text-sm">
            <p className="text-ink-muted">
              {t("career.season.teammate_comparison", {
                points: s.points,
                teammate: s.teammateName,
                teammatePoints: s.teammatePoints,
              })}
            </p>
            <p className="mt-1 text-ink-muted">
              {t(
                s.performanceDelta > 0
                  ? "career.season.performance_above"
                  : s.performanceDelta < 0
                    ? "career.season.performance_below"
                    : "career.season.performance_even",
              )}
            </p>
          </div>
        </>
      )}

      <Button block size="lg" className="mt-6" onClick={onContinue}>
        {t("career.season.continue")}
      </Button>
    </Panel>
  );
}
