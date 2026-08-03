// src/content/career/index.ts
//
// Resuelve el contenido narrativo del Modo Carrera por idioma. Hoy existen
// espaniol e ingles (decision del usuario); los demas idiomas caen al
// ingles hasta que se traduzcan, exactamente igual que el contenido legal.
// Para agregar un idioma: crear `./xx.ts` con el mismo shape que `es.ts` e
// importarlo aca.

import type { Locale } from "@/i18n";
import type { CareerContent, EventText } from "./types";
import es from "./es";
import en from "./en";

// Los no traducidos apuntan a `en` EXPLICITAMENTE (no por defecto
// silencioso), para que quede a la vista que falta traducirlos.
const CONTENT: Record<Locale, CareerContent> = {
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

/** Todo el contenido narrativo de un idioma (con fallback a ingles). */
export function getCareerContent(locale: Locale): CareerContent {
  return CONTENT[locale] ?? en;
}

/**
 * Texto de un evento concreto. Devuelve `undefined` si el id no existe,
 * para que la UI pueda saltearlo en vez de romper (no deberia pasar: hay
 * un test que cruza mecanica y textos en los dos idiomas).
 */
export function getEventText(locale: Locale, eventId: string): EventText | undefined {
  return getCareerContent(locale).events[eventId] ?? en.events[eventId];
}

export type { CareerContent, EventText } from "./types";
