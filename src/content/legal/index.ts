// src/content/legal/index.ts
//
// Resuelve el contenido legal por idioma. Hoy existen las versiones autoritativas
// en español (vinculante) e inglés; los demás idiomas caen al inglés hasta que se
// traduzcan (mismo patrón de fallback que el sistema i18n). Para agregar un idioma,
// crear `./xx.ts` (mismo shape que `es.ts`) e importarlo acá.

import type { Locale } from "@/i18n";
import type { LegalContent, LegalDoc, LegalPageId } from "./types";
import es from "./es";
import en from "./en";

// Cada locale mapea a su contenido; los no traducidos apuntan a `en`
// EXPLÍCITAMENTE (no por defecto silencioso), para que quede claro qué falta.
const CONTENT: Record<Locale, LegalContent> = {
  es,
  en,
  pt: en,
  hi: en,
  it: en,
  fr: en,
  zh: en,
  ja: en,
  de: en,
  nl: en,
  ar: en,
  ru: en,
  tr: en,
  sl: en,
};

/** Documento legal (Términos o Privacidad) para un idioma, con fallback a inglés. */
export function getLegalDoc(locale: Locale, page: LegalPageId): LegalDoc {
  return (CONTENT[locale] ?? en)[page];
}

export type { LegalDoc, LegalPageId } from "./types";
