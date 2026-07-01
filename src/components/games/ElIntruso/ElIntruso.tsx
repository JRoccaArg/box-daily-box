import { useEffect, useMemo, useState } from "react";
import type { GameProps } from "@/types";
import { buildIntruso } from "./intruso.logic";
import { DriverCard } from "@/components/games/shared/DriverCard";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

/**
 * El Intruso: 9 pilotos comparten una caracteristica oculta y 1 no.
 * El usuario debe identificar al intruso. La regla se revela al terminar.
 */
export function ElIntruso({ difficulty, date, status, onWin, onLose }: GameProps) {
  const puzzle = useMemo(() => buildIntruso(difficulty, date), [difficulty, date]);

  const [selected, setSelected] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const finished = status !== "playing";
  const revealed = submittedId !== null || finished;

  // Si el shell fuerza el fin (rendirse/tiempo) sin envio previo, igual se
  // revela el intruso real.
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
      <p className="eyebrow speed-bar pl-1">El intruso</p>
      <p className="mt-2 text-sm text-ink-muted">
        9 de estos 10 pilotos comparten algo en comun. Encontra al que no encaja.
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
              state={state}
              disabled={revealed}
              onClick={() => !revealed && setSelected(d.id)}
            />
          );
        })}
      </div>

      {revealed ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-asphalt-700 px-4 py-3 text-center">
          <p className="eyebrow">Los otros 9</p>
          <p className="mt-1 font-display text-lg font-semibold text-white">{puzzle.rule}</p>
        </div>
      ) : (
        <div className="mt-5">
          <Button block disabled={!selected} onClick={confirm}>
            {selected ? "Confirmar intruso" : "Selecciona un piloto"}
          </Button>
        </div>
      )}
    </Panel>
  );
}
