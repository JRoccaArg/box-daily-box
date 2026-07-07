// src/context/I18nProvider.tsx
//
// Proveedor de internacionalización. El `locale` es CONTROLADO por la URL
// (segmento /:lang), no por estado interno: así el HTML prerenderizado por
// idioma siempre coincide con lo que React monta en el cliente (sin mismatch
// de hidratación). Cambiar de idioma navega a la misma ruta con otro prefijo.

import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Locale } from "@/i18n";
import { setStoredLocale, translate } from "@/i18n";
import { I18nCtx, type I18nContextValue } from "./I18nContext";

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const setLocale = useCallback(
    (next: Locale) => {
      setStoredLocale(next);
      // Reemplaza el segmento de idioma actual, preserva el resto del path
      // (ej: /pt/juego/pittexto -> /en/juego/pittexto).
      const rest = location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
      navigate(`/${next}${rest}`);
    },
    [location.pathname, navigate],
  );

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
