// src/components/career/CareerRetired.tsx
//
// Pantalla final: la carrera termino (retiro voluntario, sin ofertas, o se
// llego a las 24 temporadas). Muestra el palmares completo y un epilogo
// corto segun el resultado (campeon / ganador / puntuador / sin puntos).

import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { StatPill } from "@/components/ui/StatPill";
import type { CareerState } from "@/lib/career/types";

type CareerRetiredProps = {
  state: CareerState;
  onNewCareer: () => void;
};

function epilogueKey(state: CareerState): string {
  const { championships, wins, points } = state.totals;
  if (championships > 0) return "career.retired.epilogue_champion";
  if (wins > 0) return "career.retired.epilogue_winner";
  if (points > 0) return "career.retired.epilogue_scorer";
  return "career.retired.epilogue_struggler";
}

const REASON_KEY: Record<NonNullable<CareerState["retirementReason"]>, string> = {
  voluntary: "career.retired.reason_voluntary",
  "no-offers": "career.retired.reason_no_offers",
  "max-seasons": "career.retired.reason_max_seasons",
};

export function CareerRetired({ state, onNewCareer }: CareerRetiredProps) {
  const { t } = useI18n();
  const totals = state.totals;
  const battlesLost = totals.teammateBattlesTotal - totals.teammateBattlesWon;

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("career.retired.eyebrow")}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
        {state.player.firstName} {state.player.lastName}
      </h1>
      {state.retirementReason && (
        <p className="mt-1 text-sm text-ink-faint">{t(REASON_KEY[state.retirementReason])}</p>
      )}

      <p className="mt-4 text-sm leading-relaxed text-ink-muted">{t(epilogueKey(state))}</p>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
        <StatPill label={t("career.retired.summary_seasons")} value={totals.seasonsRaced} />
        <StatPill label={t("career.retired.summary_championships")} value={totals.championships} accent="yellow" />
        <StatPill label={t("career.retired.summary_wins")} value={totals.wins} />
        <StatPill label={t("career.retired.summary_podiums")} value={totals.podiums} />
        <StatPill label={t("career.retired.summary_poles")} value={totals.poles} />
        <StatPill label={t("career.season.fastest_laps")} value={totals.fastestLaps} />
        <StatPill label={t("career.season.overtakes")} value={totals.overtakes} accent="green" />
        <StatPill
          label={t("career.retired.summary_dnfs")}
          value={totals.mechanicalDnfs + totals.accidents}
          accent={totals.mechanicalDnfs + totals.accidents > 0 ? "red" : "default"}
        />
      </div>

      {totals.teammateBattlesTotal > 0 && (
        <p className="mt-3 text-sm text-ink-muted">
          {t("career.retired.summary_teammate_record", {
            won: totals.teammateBattlesWon,
            lost: battlesLost,
          })}
        </p>
      )}

      <Button block size="lg" className="mt-6" onClick={onNewCareer}>
        {t("career.retired.new_career")}
      </Button>
    </Panel>
  );
}
