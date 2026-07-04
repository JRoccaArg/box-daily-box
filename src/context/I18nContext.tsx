// src/context/I18nContext.tsx
//
// Definición del contexto de internacionalización (no para fast-refresh).

import { createContext } from "react";
import type { Locale } from "@/i18n";

export type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export const I18nCtx = createContext<I18nContextValue | null>(null);

