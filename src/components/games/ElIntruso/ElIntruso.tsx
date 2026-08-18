import { useEffect, useMemo, useState } from "react";
import type { GameProps } from "@/types";
import { buildIntruso } from "./intruso.logic";
import { DriverCard } from "@/components/games/shared/DriverCard";
import { assignPuzzleColors } from "@/components/games/shared/puzzleColors";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

/**
 * El Intruso: 9 pilotos comparten una caracteristica oculta y 1 no.
 * El usuario debe identificar al intruso. La regla se revela al terminar.
 */
export function ElIntruso({ difficulty, date, seed, status, onWin, onLose }: GameProps) {
  const { t } = useI18n();
  const puzzle = useMemo(() => buildIntruso(difficulty, date, seed), [difficulty, date, seed]);
  const colors = useMemo(
    () => assignPuzzleColors(puzzle.tiles, difficulty, date, seed),
    [puzzle, difficulty, date, seed],
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // `revealed` depende SOLO de `status` (la fuente de verdad del shell), no
  // de `submittedId`. Antes tambien miraba `submittedId !== null`, lo que
  // bloqueaba la UI apenas se tocaba "Confirmar" AUNQUE onWin/onLose no
  // hubiera terminado de propagarse al shell (bug raro: la animacion queda
  // "congelada", el timer sigue corriendo y no se puede ni reintentar ni
  // cambiar de opcion, porque nada en el shell reflejaba el intento). Con
  // `status` como unica fuente, en el caso normal (99.9%) no cambia nada
  // -- finish() es sincronico y status pasa a won/lost en el mismo tick --
  // pero si algo falla, la UI queda usable en vez de trabada.
  const finished = status !== "playing";
  const revealed = finished;

  useEffect(() => {
    if (finished && submittedId === null) setSelected(null);
  }, [finished, submittedId]);

  const confirm = () => {
    if (!selected || revealed) return;
    setSubmittedId(selected);
    if (selected === puzzle.intruderId) onWin({ driverId: selected });
    else onLose({ driverId: selected });
  };

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("intruso.eyebrow")}</p>
      <p className="mt-2 text-sm text-ink-muted">
        {t("intruso.hint")}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {puzzle.tiles.map((d) => {
          const isIntruder = d.id === puzzle.intruderId;
          const isPicked = selected === d.id;

          let state: "idle" | "selected" | "correct" | "wrong" | "muted" = "idle";
          if (revealed) {
            if (isIntruder) state = "correct";
            else if (isPicked) state = "wrong";
            else state = "muted";
          } else if (isPicked) {
            state = "selected";
          }

          return (
            <DriverCard
              key={d.id}
              driver={d}
              color={colors.get(d.id)}
              state={state}
              disabled={revealed}
              onClick={() => !revealed && setSelected(d.id)}
            />
          );
        })}
      </div>

      {revealed ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-asphalt-700 px-4 py-3 text-center">
          <p className="eyebrow">{t("intruso.rule_label")}</p>
          <p className="mt-1 font-display text-lg font-semibold text-white">{t(puzzle.rule.key, puzzle.rule.vars)}</p>
        </div>
      ) : (
        <div className="mt-5">
          <Button block disabled={!selected} onClick={confirm}>
            {selected ? t("intruso.confirm") : t("intruso.select")}
          </Button>
        </div>
      )}
    </Panel>
  );
}
