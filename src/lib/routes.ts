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

/**
 * Link PÚBLICO de un desafío, SIN idioma: es lo que se comparte. Al abrirlo,
 * la raíz redirige al idioma de quien lo abre (ver RootRedirect), no al de
 * quien lo compartió. Ej: challengeSharePath("ABCDEFGHJK") -> "/reto/ABCDEFGHJK"
 */
export function challengeSharePath(challengeId: string): string {
  return `/reto/${challengeId}`;
}

/** Página de un desafío ya con idioma, ej: challengePath("en", "ABCDEFGHJK") -> "/en/reto/ABCDEFGHJK" */
export function challengePath(locale: Locale, challengeId: string): string {
  return `/${locale}/reto/${challengeId}`;
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

// ─── Páginas de cuenta (rediseño v2) ────────────────────────────────
// Personales: noindex y fuera del sitemap (ver buildSeo / gen-sitemap).

/** Clasificación global, ej: rankingPath("es") -> "/es/ranking" */
export function rankingPath(locale: Locale): string {
  return `/${locale}/ranking`;
}

/**
 * Acceso (Google o visitante), ej: accessPath("es") -> "/es/acceso".
 * `returnTo` es la ruta interna a la que volver al confirmar la identidad
 * (ej. el juego que se quiso abrir sin nombre/país).
 */
export function accessPath(locale: Locale, returnTo?: string): string {
  const base = `/${locale}/acceso`;
  return returnTo ? `${base}?volver=${encodeURIComponent(returnTo)}` : base;
}

/** Perfil ("Mi recorrido"), ej: profilePath("es") -> "/es/perfil" */
export function profilePath(locale: Locale): string {
  return `/${locale}/perfil`;
}

export function accountPath(locale: Locale): string {
  return `/${locale}/perfil/cuenta`;
}

/** Logros, ej: achievementsPath("es") -> "/es/perfil/logros" */
export function achievementsPath(locale: Locale): string {
  return `/${locale}/perfil/logros`;
}

/** Amigos, ej: friendsPath("es") -> "/es/perfil/amigos" */
export function friendsPath(locale: Locale): string {
  return `/${locale}/perfil/amigos`;
}

/**
 * Valida una ruta de retorno recibida por query string o guardada antes de ir
 * a Google: solo rutas internas del sitio (empiezan con "/", sin "//", sin
 * barra invertida ni esquema), para que no sirva de redirección abierta.
 */
export function safeReturnPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string" || raw.length > 300) return null;
  if (Array.from(raw).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  if (/^\/[^/?#]*:/.test(raw)) return null;
  return raw;
}
