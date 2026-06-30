import type { ReactNode } from "react";

type StatPillProps = {
  label: string;
  value: ReactNode;
  /** Acento de color para el valor. */
  accent?: "default" | "green" | "purple" | "red" | "yellow";
};

const ACCENT: Record<NonNullable<StatPillProps["accent"]>, string> = {
  default: "text-white",
  green: "text-sector-green",
  purple: "text-sector-purple",
  red: "text-racing-400",
  yellow: "text-sector-yellow",
};

/** Cifra grande + etiqueta, en bloque. Para paneles de estadisticas. */
export function StatPill({ label, value, accent = "default" }: StatPillProps) {
  return (
    <div className="rounded-lg border border-white/5 bg-asphalt-700 px-3 py-3 text-center">
      <div className={["tnum font-display text-3xl font-bold leading-none", ACCENT[accent]].join(" ")}>
        {value}
      </div>
      <div className="eyebrow mt-1.5">{label}</div>
    </div>
  );
}
