import { useEffect, useRef, useState } from "react";
import { NATIONALITIES } from "@/data/nationalities";
import type { Nationality } from "@/types";

type CountrySelectProps = {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  size?: "sm" | "md";
  allowClear?: boolean;
};

const allCountries = Object.values(NATIONALITIES).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function CountrySelect({
  value,
  onChange,
  placeholder = "Selecciona tu país",
  disabled = false,
  id,
  size = "md",
  allowClear = false,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = value ? NATIONALITIES[value] ?? null : null;

  const filtered = query.trim()
    ? allCountries.filter(
        (n) =>
          n.name.toLowerCase().includes(query.toLowerCase()) ||
          n.code.toLowerCase().includes(query.toLowerCase()),
      )
    : allCountries;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const pick = (n: Nationality) => {
    onChange(n.code);
    setOpen(false);
    setQuery("");
  };

  const py = size === "sm" ? "py-2" : "py-3";

  return (
    <div ref={containerRef} className="relative" id={id}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`flex w-full items-center gap-2 rounded-lg border border-white/15 bg-asphalt-700 px-4 ${py} text-left text-ink transition-colors hover:border-white/25 disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {selected ? (
          <>
            <span className={`fi fi-${selected.alpha2}`} role="img" aria-label={selected.name} />
            <span className={`flex-1 truncate ${size === "sm" ? "text-sm" : ""}`}>
              {selected.name} ({selected.code})
            </span>
            {allowClear && (
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="mr-1 text-ink-faint hover:text-ink"
                aria-label="Limpiar"
              >
                ✕
              </span>
            )}
          </>
        ) : (
          <span className={`flex-1 text-ink-faint ${size === "sm" ? "text-sm" : ""}`}>
            {placeholder}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-lg border border-white/10 bg-asphalt-800 shadow-panel">
          <div className="p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border border-white/10 bg-asphalt-700 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-racing/50"
            />
          </div>
          <ul
            ref={listRef}
            className="max-h-[40vh] overflow-y-auto overscroll-contain divide-y divide-white/5 px-1 pb-1"
          >
            {filtered.map((n) => (
              <li key={n.code}>
                <button
                  type="button"
                  onClick={() => pick(n)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-asphalt-600 ${
                    n.code === value ? "bg-asphalt-600 text-white" : "text-ink"
                  }`}
                >
                  <span className={`fi fi-${n.alpha2}`} role="img" aria-label={n.name} />
                  <span className="truncate">{n.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-xs text-ink-faint">{n.code}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-ink-faint">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
