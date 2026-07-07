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
