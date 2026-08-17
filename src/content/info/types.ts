// src/content/info/types.ts
//
// Modelo de contenido de la página de Info / Cómo Jugar (Roadmap #7). Igual
// que src/content/legal: texto largo estructurado y tipado, fuera de los
// diccionarios i18n (no es microcopy de UI). A diferencia de legal, ESTA
// página se indexa en Google en los 14 idiomas (contenido informativo/FAQ,
// no legal), así que existe una traducción propia por idioma (sin fallback).
//
// El renderer (InfoPage.tsx) reutiliza claves i18n YA traducidas en los 14
// idiomas para lo que se repite en toda la app (nombre/tagline de cada juego,
// etiquetas y pistas de dificultad, la fórmula de puntaje) — así el contenido
// nuevo de acá se limita a las explicaciones adicionales, sin duplicar textos
// que ya existen y podrían divergir.

/** Ids de los 8 juegos (slugs estables, ver src/components/games/registry.ts). */
export type InfoGameId =
  | "pittexto"
  | "polewordle"
  | "el-intruso"
  | "parrilla-bingo"
  | "gp-resultado"
  | "top10-standings"
  | "career-path"
  | "team-radio";

export type FaqItem = { q: string; a: string };

export type InfoContent = {
  title: string;
  subtitle: string;
  /** Aviso de hasta qué temporada llegan los datos (DATA_AS_OF_SEASON en
   *  src/data/drivers.ts). Se muestra bien arriba, justo debajo del subtitulo. */
  dataAsOfNote: string;

  gamesHeading: string;
  gamesIntro: string;
  /** Un párrafo extra por juego (más detalle que el tagline corto de home). */
  gameDetail: Record<InfoGameId, string>;

  difficultyHeading: string;
  difficultyIntro: string;

  scoringHeading: string;
  /** Frase previa a la fórmula (que se reutiliza de "monthly.scoring_body"). */
  scoringIntro: string;

  rankingHeading: string;
  rankingBody: string[];

  badgesHeading: string;
  badgesBody: string[];

  streakHeading: string;
  streakBody: string;

  duelsHeading: string;
  duelsBody: string[];

  faq: FaqItem[];
};
