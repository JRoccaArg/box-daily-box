// src/context/I18nContext.tsx
//
// Proveedor de internacionalización. Envuelve la app y expone:
//  - t(key, vars?) → string traducido
//  - locale → idioma actual
//  - setLocale(locale) → cambiar idioma (persiste en localStorage)

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n";
import { getStoredLocale, setStoredLocale, translate } from "@/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Traduce una clave con interpolación opcional. */
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nCtx = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

  const setLocale = useCallback((l: Locale) => {
    setStoredLocale(l);
    setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

/** Hook para acceder al sistema de traducciones. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n debe usarse dentro de I18nProvider");
  return ctx;
}
