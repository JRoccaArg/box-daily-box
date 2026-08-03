// src/components/career/CareerHistoryPanel.tsx
//
// Panel lateral con el resumen de TODAS las temporadas de la partida en
// curso (estilo "modo carrera" del Copero): puntos propios y del
// companiero, si fuiste campeon de pilotos, si tu equipo gano el
// campeonato de constructores, equipo + puesto del auto, y
// victorias/podios de esa temporada especifica. Pedido explicito del
// usuario en la Etapa 3.
//
// Solo muestra temporadas ya "reveladas" (ver CareerModePage: la cola de
// resumenes pendientes de mostrar se excluye a proposito, para no
// spoilear el resultado antes de que el jugador toque "Continuar").

import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Trophy, Flag } from "@/components/ui/Icon";
import { teamName } from "@/data";
import type { SeasonResult } from "@/lib/career/types";

type CareerHistoryPanelProps = {
  history: SeasonResult[];
};

export function CareerHistoryPanel({ history }: CareerHistoryPanelProps) {
  const { t } = useI18n();

  return (
    <Panel className="lg:sticky lg:top-4">
      <p className="eyebrow speed-bar pl-1">{t("career.history.eyebrow")}</p>
      <h2 className="mt-1 font-display text-lg font-bold text-white">{t("career.history.title")}</h2>

      {history.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">{t("career.history.empty")}</p>
      ) : (
        <div className="mt-3 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
          {[...history].reverse().map((s) => (
            <div key={s.season} className="rounded-lg border border-white/10 bg-asphalt-700/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-faint">{t("career.season.title", { year: s.year })}</span>
                {s.stats?.championshipPosition === 1 && <Trophy size={16} className="text-sector-yellow" />}
                {s.stats?.constructorsChampion && <Flag size={16} className="text-sector-purple" />}
              </div>

              {!s.stats ? (
                <p className="mt-1 text-sm text-ink-faint">{t("career.season.no_seat")}</p>
              ) : (
                <>
                  <div className="mt-1 flex items-center gap-2">
                    {s.teamId && (
                      <img
                        src={`/team-logos/${s.teamId}.png`}
                        alt={teamName(s.teamId)}
                        className="h-6 w-6 shrink-0 object-contain"
                      />
                    )}
                    <span className="truncate text-sm font-medium text-white">
                      {s.teamId ? teamName(s.teamId) : ""}
                    </span>
                    <span className="ml-auto font-mono text-sm font-bold text-white">
                      P{s.stats.championshipPosition}
                    </span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-ink-muted">
                    <span>{t("career.history.points_you", { points: s.stats.points })}</span>
                    <span>{t("career.history.points_teammate", { points: s.stats.teammatePoints })}</span>
                    <span>{t("career.history.wins_podiums", { wins: s.stats.wins, podiums: s.stats.podiums })}</span>
                    <span>{t("career.offers.car_rank", { rank: s.stats.carRank })}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
