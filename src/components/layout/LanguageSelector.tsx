// src/components/layout/LanguageSelector.tsx
//
// Selector de idioma compacto para el header.
// Muestra la bandera del idioma actual; al clickear despliega un menú.

import { useRef, useState, useEffect } from "react";
import { useI18n } from "@/context";
import { LOCALE_META } from "@/i18n/types";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALE_META.find((m) => m.code === locale) ?? LOCALE_META[0]!;

  // Cerrar al clickear fuera.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("lang.label")}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-sm text-ink transition-colors hover:border-white/25 hover:bg-white/5"
      >
        <span className="text-base">{current.flag}</span>
        <span className="hidden text-xs uppercase tracking-wider text-ink-muted sm:inline">
          {current.code}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-white/10 bg-asphalt-800 py-1 shadow-xl">
          {LOCALE_META.map((meta) => (
            <button
              key={meta.code}
              onClick={() => {
                setLocale(meta.code);
                setOpen(false);
              }}
              className={[
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-white/5",
                meta.code === locale ? "text-white" : "text-ink-muted",
              ].join(" ")}
            >
              <span className="text-base">{meta.flag}</span>
              <span>{meta.label}</span>
              {meta.code === locale && (
                <span className="ml-auto text-xs text-racing-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
