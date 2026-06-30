import { Timer as TimerIcon } from "./Icon";

type TimerDisplayProps = {
  /** Segundos restantes, o null si el juego no usa cronometro. */
  secondsLeft: number | null;
  /** Total inicial, para calcular el umbral de "quedando poco". */
  total?: number | null;
};

/** Formatea segundos a M:SS. */
function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Muestra el tiempo restante con estetica de pantalla de cronometraje.
 * Cambia a ambar/rojo cuando queda poco para crear tension visual.
 */
export function TimerDisplay({ secondsLeft, total }: TimerDisplayProps) {
  if (secondsLeft === null) {
    return (
      <div className="inline-flex items-center gap-1.5 text-ink-faint">
        <TimerIcon size={16} />
        <span className="font-mono text-sm">--:--</span>
      </div>
    );
  }

  const low = total ? secondsLeft <= Math.max(5, Math.round(total * 0.2)) : secondsLeft <= 10;
  const critical = secondsLeft <= 5;

  const color = critical
    ? "text-racing-400"
    : low
      ? "text-sector-yellow"
      : "text-ink";

  return (
    <div className={["inline-flex items-center gap-1.5", color].join(" ")}>
      <TimerIcon size={16} />
      <span className={["tnum font-mono text-lg font-semibold", critical ? "animate-pop" : ""].join(" ")}>
        {format(secondsLeft)}
      </span>
    </div>
  );
}
