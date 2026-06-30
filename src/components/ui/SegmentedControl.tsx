type Option<T extends string | number> = {
  value: T;
  label: string;
  /** Sublinea opcional (p.ej. descripcion de dificultad). */
  hint?: string;
};

type SegmentedControlProps<T extends string | number> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Distribuir en columna (util cuando hay hints largos). */
  stacked?: boolean;
  "aria-label"?: string;
};

/**
 * Selector tipo segmentos (radio-group accesible). Se usa para elegir
 * dificultad y tiempo antes de cada juego.
 */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  stacked = false,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[
        "gap-2",
        stacked ? "flex flex-col" : "grid",
        stacked ? "" : `grid-cols-${Math.min(options.length, 4)}`,
      ].join(" ")}
      style={stacked ? undefined : { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-lg border px-4 py-3 text-left transition-colors duration-150",
              selected
                ? "border-racing/60 bg-racing/10"
                : "border-white/10 bg-asphalt-700 hover:border-white/25 hover:bg-asphalt-600",
            ].join(" ")}
          >
            <div
              className={[
                "font-display text-[15px] font-semibold tracking-tight",
                selected ? "text-white" : "text-ink",
              ].join(" ")}
            >
              {opt.label}
            </div>
            {opt.hint ? (
              <div className="mt-0.5 text-xs leading-snug text-ink-muted">{opt.hint}</div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
