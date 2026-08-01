// src/content/legal/types.ts
//
// Modelo de contenido de las páginas legales (Términos, Privacidad).
//
// El texto legal es LARGO y no es microcopy de UI, así que vive acá (fuera de
// los diccionarios i18n) como datos estructurados y tipados. Un mismo componente
// (`src/pages/LegalPage.tsx`) renderiza cualquier documento. La estructura
// tipada garantiza que toda traducción tenga las mismas secciones.
//
// Seguridad: los bloques son texto plano (o listas / email). NUNCA se renderiza
// HTML crudo (sin dangerouslySetInnerHTML), así que el contenido no puede
// inyectar markup.

/** Un bloque dentro de una sección: párrafo, lista con viñetas, o email (mailto). */
export type LegalBlock =
  | { p: string }
  | { list: string[] }
  | { email: string };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  /** Título (H1) del documento, ya localizado. */
  title: string;
  /** Fecha de última actualización, 'YYYY-MM-DD'. */
  lastUpdated: string;
  /** Párrafos introductorios (antes de las secciones numeradas). */
  intro: string[];
  sections: LegalSection[];
};

/** El par de documentos legales de un idioma. */
export type LegalContent = {
  terms: LegalDoc;
  privacy: LegalDoc;
};

/** Páginas legales disponibles. */
export type LegalPageId = "terms" | "privacy";
