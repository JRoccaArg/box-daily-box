// src/content/info/index.ts
//
// Resuelve el contenido de la página Info por idioma. A diferencia de
// src/content/legal (que cae a inglés para 12 idiomas), ESTA página tiene
// traducción propia en los 14 idiomas — se indexa en Google en todos ellos,
// así que no puede haber contenido de relleno en otro idioma bajo su URL
// (evita "contenido duplicado").

import type { Locale } from "@/i18n";
import type { InfoContent } from "./types";
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

const CONTENT: Record<Locale, InfoContent> = {
  es, en, pt, hi, it, fr, zh, ja, de, nl, ar, ru, tr, sl,
};

export function getInfoContent(locale: Locale): InfoContent {
  return CONTENT[locale] ?? en;
}

export type { InfoContent, InfoGameId, FaqItem } from "./types";
