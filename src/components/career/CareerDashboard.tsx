// src/components/career/CareerDashboard.tsx
//
// Pantalla "hub" cuando la partida esta en fase "ready": bajo contrato,
// lista para simular la proxima tanda de temporadas (1, 2 o 3 segun el
// modo elegido). Muestra el equipo actual y el contrato restante, con
// botones para simular o retirarse.

import { useState } from "react";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { teamName } from "@/data";
import type { CareerState } from "@/lib/career/types";

type CareerDashboardProps = {
  state: CareerState;
  onSimulate: () => void;
  onRetire: () => void;
};

export function CareerDashboard({ state, onSimulate, onRetire }: CareerDashboardProps) {
  const { t } = useI18n();
  const [confirmingRetire, setConfirmingRetire] = useState(false);

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("career.ready.eyebrow")}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
        {state.player.firstName} {state.player.lastName}
      </h1>

      {state.teamId && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/10 bg-asphalt-700/60 p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5 p-1.5">
            <img
              src={`/team-logos/${state.teamId}.png`}
              alt={teamName(state.teamId)}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="font-display font-semibold text-white">{teamName(state.teamId)}</div>
            <div className="text-xs text-ink-muted">
              {t("career.ready.contract_years", { years: state.contractYears })}
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-ink-muted">
        {t("career.ready.season_of_max", { season: state.season, max: 24 })}
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button size="lg" onClick={onSimulate}>
          {t("career.ready.simulate_button", { step: state.step })}
        </Button>
        <Button variant="outline" size="lg" onClick={() => setConfirmingRetire(true)}>
          {t("career.ready.retire_button")}
        </Button>
      </div>

      <Modal
        open={confirmingRetire}
        onClose={() => setConfirmingRetire(false)}
        title={t("career.ready.retire_confirm_title")}
      >
        <p className="text-sm text-ink-muted">{t("career.ready.retire_confirm_body")}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" block onClick={() => setConfirmingRetire(false)}>
            {t("career.ready.retire_confirm_no")}
          </Button>
          <Button
            variant="danger"
            block
            onClick={() => {
              setConfirmingRetire(false);
              onRetire();
            }}
          >
            {t("career.ready.retire_confirm_yes")}
          </Button>
        </div>
      </Modal>
    </Panel>
  );
}
