// src/i18n/index.ts
//
// Sistema de internacionalización liviano.
//
// - Autodetección desde navigator.language
// - Override manual persistido en localStorage ("lang")
// - Función t() con interpolación de variables: t("key", { name: "Max" })
// - Fallback a inglés si el idioma no está soportado

import type { Locale, Translations } from "./types";
import { SUPPORTED_LOCALES } from "./types";
import es from "./es";
import en from "./en";
import pt from "./pt";
import hi from "./hi";
import it from "./it";
import fr from "./fr";
import zh from "./zh";
import ja from "./ja";
import de from "./de";
import nl from "./nl";
import ar from "./ar";
import ru from "./ru";
import tr from "./tr";
import sl from "./sl";

const DICTIONARIES: Record<Locale, Translations> = { es, en, pt, hi, it, fr, zh, ja, de, nl, ar, ru, tr, sl };

const STORAGE_KEY = "lang";

/** Detecta el idioma del navegador y lo mapea a un Locale soportado.
 *  Ej: "es-AR" → "es", "pt-BR" → "pt", "de-DE" → "en" (fallback). */
function detectLocale(): Locale {
  try {
    const langs = navigator.languages ?? [navigator.language];
    for (const raw of langs) {
      const prefix = raw.split("-")[0]?.toLowerCase();
      if (prefix && isLocale(prefix)) return prefix;
    }
  } catch {
    // SSR o entorno sin navigator.
  }
  return "en";
}

function isLocale(s: string): s is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(s);
}

/** Lee el idioma guardado en localStorage, o detecta automáticamente. */
export function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    // localStorage no disponible.
  }
  return detectLocale();
}

/** Persiste la elección de idioma. */
export function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Silencioso.
  }
}

/** Devuelve la traducción para una clave, con interpolación opcional.
 *
 *  Uso:
 *    translate("es", "home.completed", { done: 3, total: 4 })
 *    → "3 de 4 completados"
 *
 *  Si la clave no existe en el idioma actual, intenta en inglés.
 *  Si tampoco existe en inglés, devuelve la clave misma (debug-friendly).
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES.en;
  let text = dict[key] ?? DICTIONARIES.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return text;
}

export { SUPPORTED_LOCALES } from "./types";
export type { Locale } from "./types";
