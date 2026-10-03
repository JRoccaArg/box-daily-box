// src/components/v2/CountryPicker.tsx
//
// Selector de país con la estética del boceto. Tres apariencias:
//  - "field":    campo de formulario (.fake-select) — perfil.
//  - "passport": dentro de la tarjeta de piloto (.passport-country) — acceso.
//  - "filter":   filtro del ranking (.country-filter), con "Todos los países".
// Los nombres salen traducidos (countryName) y ordenados según el idioma, a
// diferencia del CountrySelect de la versión actual (fijo en español).

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
import { NATIONALITIES, countryName } from "@/data/nationalities";
import { V2Flag } from "./V2Flag";

type Variant = "field" | "passport" | "filter";

type CountryPickerProps = {
  value: string;
  onChange: (code: string) => void;
  variant: Variant;
  /** País fijo (ya guardado en el server): se muestra pero no se puede abrir. */
  locked?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Etiqueta accesible del botón. */
  label: string;
};

const CLASS: Record<Variant, string> = {
  field: "fake-select",
  passport: "passport-country",
  filter: "country-filter",
};

export function CountryPicker({
  value,
  onChange,
  variant,
  locked = false,
  disabled = false,
  placeholder,
  label,
}: CountryPickerProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const options = useMemo(() => {
    const collator = new Intl.Collator(locale);
    return Object.keys(NATIONALITIES)
      .map((code) => ({ code, name: countryName(code, t) }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [t, locale]);

  const filtered = useMemo(() => {
    const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase(locale);
    const q = normalize(query.trim());
    if (!q) return options;
    return options.filter(
      (o) => normalize(o.name).includes(q) || o.code.toLowerCase().includes(q),
    );
  }, [options, query, locale]);

  useEffect(() => {
    if (!open) return;
    // En pantallas táctiles no se enfoca el buscador: abriría el teclado y taparía la lista.
    if (!window.matchMedia?.("(pointer: coarse)").matches) searchRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function pick(code: string) {
    onChange(code);
    close();
    triggerRef.current?.focus();
  }

  const selectedName = value && NATIONALITIES[value] ? countryName(value, t) : null;
  const interactive = !locked && !disabled;

  return (
    <div
      className="v2-picker"
      ref={rootRef}
      // Solo se cierra al pasar el foco a OTRO elemento (Tab). Un toque sobre la barra de la lista o un
      // botón en Safari no devuelve relatedTarget y cerraba la lista a mitad de la selección.
      onBlur={(e) => { const next = e.relatedTarget as Node | null; if (next && !e.currentTarget.contains(next)) close(); }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close();
          triggerRef.current?.focus();
        } else if (open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          e.preventDefault();
          const buttons = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          const next = e.key === "ArrowDown" ? Math.min(index + 1, buttons.length - 1) : Math.max(index - 1, 0);
          buttons[next]?.focus();
        }
      }}
    >
      <button
        type="button"
        ref={triggerRef}
        className={`${CLASS[variant]} v2-picker-button${locked ? " is-locked" : ""}`}
        onClick={() => interactive && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={selectedName ? `${label}: ${selectedName}` : label}
      >
        {selectedName ? <V2Flag code={value} /> : null}
        <span className="v2-picker-value">
          {selectedName ?? placeholder ?? t("profile.country_select")}
        </span>
        {locked ? (
          <span className="v2-picker-fixed">{t("profile.country_fixed")}</span>
        ) : (
          <span aria-hidden="true">⌄</span>
        )}
      </button>

      {open && (
        <div className="v2-picker-popover">
          <input
            ref={searchRef}
            className="v2-picker-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("v2.country.search")}
            aria-label={t("v2.country.search")}
            autoComplete="off"
            spellCheck={false}
          />
          <ul className="v2-picker-list" role="listbox" id={listId} aria-label={label}>
            {variant === "filter" && (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={!value}
                  className={!value ? "is-current" : ""}
                  onClick={() => pick("")}
                >
                  {t("ranking.all_countries")}
                </button>
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.code === value}
                  aria-label={o.name}
                  className={o.code === value ? "is-current" : ""}
                  onClick={() => pick(o.code)}
                >
                  <V2Flag code={o.code} />
                  <span>{o.name}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="v2-picker-empty">{t("v2.country.none")}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
