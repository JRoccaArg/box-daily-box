// src/lib/seo.ts
//
// Fuente única de metadatos por (idioma, ruta). La usan tanto el prerender
// (HTML horneado por página) como la navegación client-side (<Seo>), así que
// nunca pueden divergir entre lo que indexa Google y lo que ve el usuario.

import { translate } from "@/i18n";
import type { Locale } from "@/i18n";
import { SUPPORTED_LOCALES } from "@/i18n/types";
import { homePath, gamePath } from "@/lib/routes";

export const SITE_URL = "https://www.boxdailybox.com";

/**
 * Idiomas con traducción suficientemente completa para indexar (sin claves
 * faltantes que caigan a fallback en inglés). El resto de SUPPORTED_LOCALES
 * (si lo hubiera) seguiría disponible en la app, pero quedaría fuera de
 * sitemap/hreflang y con noindex, para no arriesgar penalización por
 * "contenido delgado". Hoy los 14 idiomas soportados están 100% completos
 * (mismo conteo de claves que en.ts), así que se indexan todos.
 *
 * Si se agrega un idioma nuevo sin traducción completa, NO incluirlo acá
 * hasta terminarla — así queda automáticamente fuera de sitemap/hreflang
 * y con noindex (ver `buildSeo`).
 */
export const INDEXABLE_LOCALES: Locale[] = [...SUPPORTED_LOCALES];

export function isIndexableLocale(locale: Locale): boolean {
  return INDEXABLE_LOCALES.includes(locale);
}

/** Idiomas que se leen de derecha a izquierda. */
const RTL_LOCALES: Locale[] = ["ar"];

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/** og:locale (formato idioma_PAÍS) por idioma soportado. */
const OG_LOCALE: Record<Locale, string> = {
  es: "es_AR", en: "en_US", pt: "pt_BR", hi: "hi_IN", it: "it_IT",
  fr: "fr_FR", zh: "zh_CN", ja: "ja_JP", de: "de_DE", nl: "nl_NL",
  ar: "ar_SA", ru: "ru_RU", tr: "tr_TR", sl: "sl_SI",
};

export function ogLocaleFor(locale: Locale): string {
  return OG_LOCALE[locale];
}

export type SeoRoute =
  | { kind: "home" }
  | { kind: "game"; gameId: string };

export type SeoAlternate = { locale: Locale; href: string };

export type SeoData = {
  title: string;
  description: string;
  path: string;
  canonical: string;
  ogImage: string;
  /** Alternates para hreflang: solo idiomas indexables. */
  alternates: SeoAlternate[];
  /** true si este idioma no debe indexarse (traducción incompleta). */
  noindex: boolean;
};

function pathFor(locale: Locale, route: SeoRoute): string {
  return route.kind === "home" ? homePath(locale) : gamePath(locale, route.gameId);
}

/** Arma title/description/canonical/hreflang para una página en un idioma. */
export function buildSeo(locale: Locale, route: SeoRoute): SeoData {
  const title =
    route.kind === "home"
      ? translate(locale, "seo.home.title")
      : translate(locale, `seo.game.${route.gameId}.title`);
  const description =
    route.kind === "home"
      ? translate(locale, "seo.home.description")
      : translate(locale, `seo.game.${route.gameId}.description`);

  const path = pathFor(locale, route);

  return {
    title,
    description,
    path,
    canonical: `${SITE_URL}${path}`,
    ogImage: `${SITE_URL}/og-image.png`,
    alternates: INDEXABLE_LOCALES.map((l) => ({ locale: l, href: `${SITE_URL}${pathFor(l, route)}` })),
    noindex: !isIndexableLocale(locale),
  };
}
