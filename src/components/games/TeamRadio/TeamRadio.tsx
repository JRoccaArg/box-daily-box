import { useMemo, useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import type { GameProps } from "@/types";
import { buildTeamRadio } from "./teamradio.logic";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

/**
 * Barras de ondas de sonido, puramente decorativas (no hay audio real: la
 * radio se juega leyendo el texto). Anima solo mientras el jugador no
 * respondió; se congela al revelar. Respeta prefers-reduced-motion via la
 * regla global de src/index.css (no hace falta duplicarla acá).
 */
function SoundWave({ animate }: { animate: boolean }) {
  const bars = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div className="flex h-12 items-center justify-center gap-1" aria-hidden="true">
      {bars.map((i) => (
        <span
          key={i}
          className={[
            "w-1.5 rounded-full bg-racing-400/80",
            animate ? "animate-radio-wave" : "",
          ].join(" ")}
          style={{
            height: "100%",
            animationDelay: `${(i % 4) * 0.12}s`,
            animationDuration: `${0.8 + (i % 3) * 0.2}s`,
            transform: animate ? undefined : `scaleY(${0.3 + (i % 4) * 0.15})`,
          }}
        />
      ))}
    </div>
  );
}

type RippleDot = { id: number; x: number; y: number };

/**
 * Botón de opción con efecto ripple al tocar (técnica adaptada del
 * primitivo "Ripple Button" de animate-ui: motion.button + un círculo que
 * nace en el punto de click y se expande/desvanece). Se reimplementó con
 * los colores propios del proyecto en vez de copiar el wrapper de
 * animate-ui, que asume variables CSS de shadcn/ui (--primary, --accent…)
 * que este proyecto no usa en ningún otro lado.
 */
function OptionButton({
  label,
  sublabel,
  state,
  disabled,
  onClick,
}: {
  label: string;
  sublabel: string;
  state: "idle" | "selected" | "correct" | "wrong" | "muted";
  disabled: boolean;
  onClick: () => void;
}) {
  const [ripples, setRipples] = useState<RippleDot[]>([]);
  const ref = useRef<HTMLButtonElement>(null);

  const addRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dot: RippleDot = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top };
    setRipples((prev) => [...prev, dot]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== dot.id)), 550);
  }, []);

  const STATE_CLASS: Record<typeof state, string> = {
    idle: "border-white/10 bg-asphalt-700 hover:border-white/30 hover:bg-asphalt-600",
    selected: "border-racing/70 bg-racing/10",
    correct: "border-sector-green/70 bg-sector-green/10",
    wrong: "border-racing/70 bg-racing/15",
    muted: "border-white/5 opacity-50",
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={(e) => {
        if (disabled) return;
        addRipple(e);
        onClick();
      }}
      style={{ position: "relative", overflow: "hidden" }}
      className={[
        "flex w-full flex-col items-start gap-0.5 rounded-xl border-2 px-3.5 py-3 text-left transition-colors",
        "disabled:cursor-default",
        STATE_CLASS[state],
      ].join(" ")}
    >
      <span className="font-display text-sm font-semibold leading-tight text-white">{label}</span>
      <span className="text-xs text-ink-muted">{sublabel}</span>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 9, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: r.y - 8,
            left: r.x - 8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.55)",
            pointerEvents: "none",
          }}
        />
      ))}
    </motion.button>
  );
}

/**
 * Team Radio: se muestra el texto de una radio icónica de F1 y el jugador
 * elige en qué Gran Premio se dijo, entre 6 opciones.
 */
export function TeamRadio({ difficulty, date, seed, status, onWin, onLose }: GameProps) {
  const { t } = useI18n();
  const puzzle = useMemo(() => buildTeamRadio(difficulty, date, seed), [difficulty, date, seed]);

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

  const confirm = () => {
    if (!selected || revealed) return;
    setSubmittedId(selected);
    if (selected === puzzle.correctId) onWin({ optionId: selected });
    else onLose({ optionId: selected });
  };

  const driverName = puzzle.driver ? `${puzzle.driver.firstName} ${puzzle.driver.lastName}` : null;

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("teamradio.eyebrow")}</p>
      <p className="mt-2 text-sm text-ink-muted">{t("teamradio.hint")}</p>

      <div className="mt-5 rounded-xl border border-white/10 bg-asphalt-700 px-4 py-4">
        <SoundWave animate={!revealed} />
        <p className="mt-3 text-center font-display text-lg font-semibold italic leading-snug text-white">
          "{puzzle.radio.quote}"
        </p>
        {driverName && (
          <p className="mt-2 text-center text-sm text-ink-muted">
            {t("teamradio.said_by", { driver: driverName })}
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {puzzle.options.map((o) => {
          const isCorrect = o.id === puzzle.correctId;
          const isPicked = selected === o.id;

          let state: "idle" | "selected" | "correct" | "wrong" | "muted" = "idle";
          if (revealed) {
            if (isCorrect) state = "correct";
            else if (isPicked) state = "wrong";
            else state = "muted";
          } else if (isPicked) {
            state = "selected";
          }

          return (
            <OptionButton
              key={o.id}
              label={o.g}
              sublabel={`${o.c} · ${o.y}`}
              state={state}
              disabled={revealed}
              onClick={() => setSelected(o.id)}
            />
          );
        })}
      </div>

      {revealed ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-asphalt-700 px-4 py-3 text-center">
          <p className="eyebrow">
            {submittedId === puzzle.correctId ? t("teamradio.correct") : t("teamradio.answer_was")}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-white">
            {puzzle.radio.g} {puzzle.radio.y}
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <Button block disabled={!selected} onClick={confirm}>
            {selected ? t("teamradio.confirm") : t("teamradio.select")}
          </Button>
        </div>
      )}
    </Panel>
  );
}
