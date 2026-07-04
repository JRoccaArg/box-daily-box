// src/context/useI18n.ts
//
// Hook para acceder al sistema de internacionalización.

import { useContext } from "react";
import { I18nCtx, type I18nContextValue } from "./I18nContext";

/** Hook para acceder al sistema de traducciones. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n debe usarse dentro de I18nProvider");
  return ctx;
}
