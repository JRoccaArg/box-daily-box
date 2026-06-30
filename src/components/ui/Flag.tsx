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

/** Bandera de nacionalidad (emoji) con codigo opcional. */
export function Flag({ code, showCode = false, size = "md" }: FlagProps) {
  const nat = nationality(code);
  return (
    <span className="inline-flex items-center gap-1.5" title={nat.name}>
      <span className={["leading-none", FLAG_SIZE[size]].join(" ")} aria-hidden="true">
        {nat.flag}
      </span>
      {showCode && <span className="font-mono text-xs text-ink-muted">{code}</span>}
    </span>
  );
}
