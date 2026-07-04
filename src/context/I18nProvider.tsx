// src/context/I18nProvider.tsx
//
// Proveedor de internacionalización.

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n";
import { getStoredLocale, setStoredLocale, translate } from "@/i18n";
import { I18nCtx, type I18nContextValue } from "./I18nContext";

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

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}
