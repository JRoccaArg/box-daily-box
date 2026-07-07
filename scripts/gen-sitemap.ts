/**
 * Genera public/sitemap.xml a partir de la matriz idioma×ruta.
 *
 * Solo incluye idiomas en INDEXABLE_LOCALES (src/lib/seo.ts) — si un idioma
 * queda afuera de esa lista (traducción incompleta), no aparece acá ni en
 * los hreflang de cada entrada, para no arriesgar "contenido delgado".
 *
 * Se corre en el build (ver package.json). También se puede correr manual:
 *   npx tsx --tsconfig tsconfig.app.json scripts/gen-sitemap.ts
 */
import { writeFileSync } from "node:fs";
import { INDEXABLE_LOCALES, SITE_URL } from "@/lib/seo";
import { homePath, gamePath } from "@/lib/routes";

// Lista de juegos por id. No se importa src/components/games/registry.ts
// acá: ese archivo importa los componentes React de cada juego (y por
// transitividad src/lib/api.ts, que usa import.meta.env, inexistente al
// correr este script standalone con tsx fuera de Vite). Mismo patrón que
// VALID_GAME_IDS en src/api/auth.ts: una lista de ids duplicada a propósito.
const GAME_IDS = ["pittexto", "polewordle", "el-intruso", "parrilla-bingo", "gp-resultado", "top10-standings"];

type Entry = { priority: string; alternates: { locale: string; href: string }[] };

function buildEntries(): Entry[] {
  const routes: { path: (l: (typeof INDEXABLE_LOCALES)[number]) => string; priority: string }[] = [
    { path: homePath, priority: "1.0" },
    ...GAME_IDS.map((id) => ({
      path: (l: (typeof INDEXABLE_LOCALES)[number]) => gamePath(l, id),
      priority: "0.9",
    })),
  ];

  return routes.map(({ path, priority }) => ({
    priority,
    alternates: INDEXABLE_LOCALES.map((l) => ({ locale: l, href: `${SITE_URL}${path(l)}` })),
  }));
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function render(): string {
  const today = new Date().toISOString().slice(0, 10);
  const routeEntries = buildEntries();

  const urlBlocks: string[] = [];
  for (const { alternates, priority } of routeEntries) {
    // Una entrada <url> POR IDIOMA (Google recomienda esto, no solo una
    // entrada canonical), cada una con el bloque completo de hreflang.
    for (const alt of alternates) {
      const hreflangLinks = alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.locale}" href="${xmlEscape(a.href)}" />`)
        .join("\n");
      urlBlocks.push(
        `  <url>\n` +
          `    <loc>${xmlEscape(alt.href)}</loc>\n` +
          `    <lastmod>${today}</lastmod>\n` +
          `    <changefreq>daily</changefreq>\n` +
          `    <priority>${priority}</priority>\n` +
          `${hreflangLinks}\n` +
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />\n` +
          `  </url>`,
      );
    }
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${urlBlocks.join("\n")}\n` +
    `</urlset>\n`
  );
}

const xml = render();
writeFileSync("public/sitemap.xml", xml, "utf-8");
console.log(`✅ sitemap.xml generado: ${INDEXABLE_LOCALES.length} idiomas × ${1 + GAME_IDS.length} páginas`);
