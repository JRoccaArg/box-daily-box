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
      className={["gap-2", stacked ? "flex flex-col" : "grid"].join(" ")}
      // `auto-fit` + `minmax(88px, 1fr)`: en vez de forzar SIEMPRE N columnas
      // (lo que en pantallas angostas con muchas opciones -p.ej. 5 horarios
      // incluyendo "Sin Tiempo"- dejaba columnas tan finas que el hint de
      // texto se salia de la caja), el grid decide solo cuantas entran por
      // fila segun el ancho disponible y el resto pasa a la fila siguiente.
      // Se ve bien en cualquier tamaño de pantalla sin JS ni media queries.
      style={stacked ? undefined : { gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))" }}
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
              "min-w-0 rounded-lg border px-4 py-3 text-left transition-colors duration-150",
              selected
                ? "border-racing/60 bg-racing/10"
                : "border-white/10 bg-asphalt-700 hover:border-white/25 hover:bg-asphalt-600",
            ].join(" ")}
          >
            <div
              className={[
                "break-words font-display text-[15px] font-semibold tracking-tight",
                selected ? "text-white" : "text-ink",
              ].join(" ")}
            >
              {opt.label}
            </div>
            {opt.hint ? (
              <div className="mt-0.5 break-words text-xs leading-snug text-ink-muted">{opt.hint}</div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
