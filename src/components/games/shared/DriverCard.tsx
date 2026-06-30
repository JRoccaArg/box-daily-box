import type { Driver } from "@/types";
import { nationality } from "@/data";
import { driverColor } from "./driverColor";

type Selectable = "idle" | "selected" | "correct" | "wrong" | "muted";

type DriverCardProps = {
  driver: Driver;
  onClick?: () => void;
  state?: Selectable;
  disabled?: boolean;
  /** Mostrar nombre completo en vez de solo apellido. */
  full?: boolean;
};

const RING: Record<Selectable, string> = {
  idle: "border-white/10 hover:border-white/30 hover:bg-asphalt-600",
  selected: "border-racing/70 bg-racing/10",
  correct: "border-sector-green/70 bg-sector-green/10",
  wrong: "border-racing/70 bg-racing/15",
  muted: "border-white/5 opacity-50",
};

/** Casco estilizado teñido con el color de la escuderia. */
function Helmet({ color }: { color: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 13a9 9 0 0 1 18 0v1a2 2 0 0 1-2 2h-5l-1 3H7a4 4 0 0 1-4-4z"
        fill={color}
        opacity="0.9"
      />
      <path d="M8 13h11" stroke="rgba(0,0,0,0.45)" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M3 13a9 9 0 0 1 18 0v1a2 2 0 0 1-2 2h-5l-1 3H7a4 4 0 0 1-4-4z"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/**
 * Tarjeta de piloto reutilizable (El Intruso, Parrilla Bingo). Representa al
 * piloto con un casco teñido del color de su escuderia + apellido + bandera,
 * evocando la F1 sin depender de imagenes externas.
 */
export function DriverCard({ driver, onClick, state = "idle", disabled, full = false }: DriverCardProps) {
  const nat = nationality(driver.nationalityCode);
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      className={[
        "flex w-full flex-col items-center gap-2 rounded-xl border-2 bg-asphalt-700 px-2 py-3",
        "text-center transition-colors duration-150",
        onClick ? "disabled:cursor-not-allowed" : "",
        RING[state],
      ].join(" ")}
    >
      <Helmet color={driverColor(driver)} />
      <div className="leading-tight">
        <div className="font-display text-sm font-bold tracking-tight text-white">
          {full ? `${driver.firstName} ` : ""}
          {driver.lastName}
        </div>
        <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
          <span aria-hidden="true">{nat.flag}</span>
          <span className="font-mono">{driver.nationalityCode}</span>
        </div>
      </div>
    </Tag>
  );
}
