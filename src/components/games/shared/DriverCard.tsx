import type { Driver } from "@/types";
import { nationality, countryName } from "@/data";
import { useI18n } from "@/context";
import { DriverAvatar } from "./DriverAvatar";

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

/**
 * Tarjeta de piloto reutilizable (El Intruso, Parrilla Bingo). Representa al
 * piloto con su foto (Wikimedia) o, en su defecto, un casco teñido del color de
 * su escuderia, más apellido + bandera.
 */
export function DriverCard({ driver, onClick, state = "idle", disabled, full = false }: DriverCardProps) {
  const { t } = useI18n();
  const nat = nationality(driver.nationalityCode);
  const natName = countryName(driver.nationalityCode, t);
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
      <DriverAvatar driver={driver} size="md" />
      <div className="leading-tight">
        <div className="font-display text-sm font-bold tracking-tight text-white">
          {full ? `${driver.firstName} ` : ""}
          {driver.lastName}
        </div>
        <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
          <span className={`fi fi-${nat.alpha2}`} role="img" aria-label={natName} />
          <span className="font-mono">{driver.nationalityCode}</span>
        </div>
      </div>
    </Tag>
  );
}
