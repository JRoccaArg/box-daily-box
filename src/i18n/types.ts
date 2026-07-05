// src/i18n/types.ts
//
// Tipos del sistema de internacionalización.

/** Idiomas soportados. Para agregar uno nuevo, crear el archivo de
 *  traducciones (ej: `de.ts`) y agregarlo a SUPPORTED_LOCALES. */
export const SUPPORTED_LOCALES = ["es", "en", "pt", "hi", "it", "fr", "zh", "ja", "de", "nl", "ar", "ru", "tr", "sl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Metadatos de cada idioma para el selector. */
export type LocaleMeta = {
  code: Locale;
  /** Nombre del idioma en su propio idioma. */
  label: string;
  flag: string;
};

export const LOCALE_META: LocaleMeta[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "sl", label: "Slovenščina", flag: "🇸🇮" },
];

/** Diccionario plano de traducciones. Las claves usan dot-notation
 *  agrupadas por sección (ej: "home.title", "game.surrender"). */
export type Translations = Record<string, string>;
