// src/lib/routes.ts
//
// Helpers de rutas con prefijo de idioma. Centraliza la construcción de
// paths para que ningún componente hardcodee "/" o "/juego/x" sin locale.

import type { Locale } from "@/i18n";

/** Home del idioma dado, ej: homePath("en") -> "/en/" */
export function homePath(locale: Locale): string {
  return `/${locale}/`;
}

/** Página de un juego en un idioma, ej: gamePath("en", "pittexto") -> "/en/juego/pittexto" */
export function gamePath(locale: Locale, gameId: string): string {
  return `/${locale}/juego/${gameId}`;
}

/** Página de un duelo (invitación/juego en vivo, Roadmap §4), ej: duelPath("en", "ABCDEFGH") -> "/en/duelo/ABCDEFGH" */
export function duelPath(locale: Locale, duelId: string): string {
  return `/${locale}/duelo/${duelId}`;
}

/** Términos y Condiciones, ej: termsPath("en") -> "/en/terms" */
export function termsPath(locale: Locale): string {
  return `/${locale}/terms`;
}

/** Política de Privacidad, ej: privacyPath("en") -> "/en/privacy" */
export function privacyPath(locale: Locale): string {
  return `/${locale}/privacy`;
}

/** Página de info / cómo jugar, ej: infoPath("en") -> "/en/info" */
export function infoPath(locale: Locale): string {
  return `/${locale}/info`;
}

/** Página de contacto, ej: contactPath("en") -> "/en/contact" */
export function contactPath(locale: Locale): string {
  return `/${locale}/contact`;
}

/** Modo Carrera (simulador standalone, sin ranking), ej: careerModePath("en") -> "/en/modo-carrera" */
export function careerModePath(locale: Locale): string {
  return `/${locale}/modo-carrera`;
}
