import { nationality } from "@/data";

type FlagProps = {
  /** Codigo de nacionalidad (p.ej. "ARG"). */
  code: string;
  /** Mostrar el codigo de 3 letras junto a la bandera. */
  showCode?: boolean;
  size?: "sm" | "md" | "lg";
};

const FLAG_SIZE: Record<NonNullable<FlagProps["size"]>, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

/** Bandera de nacionalidad renderizada como SVG via flag-icons. */
export function Flag({ code, showCode = false, size = "md" }: FlagProps) {
  const nat = nationality(code);
  return (
    <span className="inline-flex items-center gap-1.5" title={nat.name}>
      <span
        className={`fi fi-${nat.alpha2} ${FLAG_SIZE[size]} leading-none`}
        role="img"
        aria-label={nat.name}
      />
      {showCode && <span className="font-mono text-xs text-ink-muted">{code}</span>}
    </span>
  );
}
