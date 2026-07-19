/**
 * Genera `src/data/driverPhotos.generated.ts`: un mapa driverId -> foto de
 * Wikipedia/Wikimedia Commons (CC BY-SA / dominio público).
 *
 * Se corre A MANO (no en el build, para no depender de red en CI):
 *   npx tsx --tsconfig tsconfig.app.json scripts/fetch-driver-photos.ts
 *
 * El .ts generado se commitea. Los pilotos sin match usan el Helmet SVG como
 * fallback en runtime (ver src/components/games/shared/DriverAvatar.tsx).
 *
 * ESTRATEGIA de matching (para no traer la foto de un homónimo):
 *  1. Prueba varios títulos candidatos (con y sin sufijo "(racing driver)").
 *  2. Valida que la página sea realmente de un piloto de F1: el extracto o las
 *     categorías deben mencionar Formula One / Grand Prix, y (si hay años en el
 *     texto) que solapen con el período activo real del piloto del dataset.
 *  3. Toma el thumbnail de pageimages (si la página no tiene foto, se descarta).
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { DRIVERS } from "@/data";
import type { Driver } from "@/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/driverPhotos.generated.ts");

const API = "https://en.wikipedia.org/w/api.php";
const UA = "box-daily-box/1.0 (https://github.com/JRoccaArg/box-daily-box)";
const THUMB_SIZE = 240;
const THROTTLE_MS = 220; // ~4.5 req/s

type License = "cc-by-sa" | "cc-by" | "public-domain" | "other" | null;
type Photo = { thumb: string; source: string; license: License };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Títulos candidatos de Wikipedia, en orden de preferencia. */
function candidateTitles(d: Driver): string[] {
  const full = `${d.firstName} ${d.lastName}`;
  return [`${full} (racing driver)`, `${full} (racing)`, full];
}

type PageInfo = {
  title: string;
  extract: string;
  categories: string[];
  thumb: string | null;
  canonicalUrl: string;
};

async function fetchPage(title: string): Promise<PageInfo | null> {
  const params = new URLSearchParams({
    action: "query",
    prop: "pageimages|extracts|categories|info",
    piprop: "thumbnail",
    pithumbsize: String(THUMB_SIZE),
    exintro: "1",
    explaintext: "1",
    cllimit: "50",
    inprop: "url",
    redirects: "1",
    format: "json",
    titles: title,
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const data: any = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  const page: any = Object.values(pages)[0];
  if (!page || page.missing !== undefined) return null;
  return {
    title: page.title ?? title,
    extract: (page.extract ?? "").toString(),
    categories: (page.categories ?? []).map((c: any) => (c.title ?? "").toString()),
    thumb: page.thumbnail?.source ?? null,
    canonicalUrl: page.canonicalurl ?? page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

/** ¿La página corresponde a un piloto de F1 (y no a un homónimo)? */
function looksLikeF1Driver(d: Driver, page: PageInfo): boolean {
  const hay = (page.extract + " " + page.categories.join(" ")).toLowerCase();
  const mentionsF1 =
    hay.includes("formula one") ||
    hay.includes("formula 1") ||
    hay.includes("grand prix") ||
    hay.includes("racing driver") ||
    hay.includes("racing automobile");
  if (!mentionsF1) return false;

  // Si el extracto menciona años, al menos uno debe caer en el período activo
  // (con margen de +/-3 años por variaciones biográficas). Si no hay años en el
  // texto, no bloqueamos por esto.
  const years = [...page.extract.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map((m) => Number(m[1]));
  if (years.length > 0) {
    const start = d.active.start - 3;
    const end = (d.active.end ?? new Date().getFullYear()) + 3;
    const overlap = years.some((y) => y >= start && y <= end);
    if (!overlap) return false;
  }
  return true;
}

/** Heurística de licencia a partir de las categorías de la página. */
function guessLicense(): License {
  // La API de pageimages no expone la licencia del archivo directo sin otra
  // llamada a Commons. Marcamos null (desconocida) y la atribución general del
  // footer cubre CC BY-SA / dominio público, que es la política de Commons.
  return null;
}

async function resolveDriver(d: Driver): Promise<Photo | null> {
  for (const title of candidateTitles(d)) {
    const page = await fetchPage(title);
    await sleep(THROTTLE_MS);
    if (!page || !page.thumb) continue;
    if (!looksLikeF1Driver(d, page)) continue;
    return { thumb: page.thumb, source: page.canonicalUrl, license: guessLicense() };
  }
  return null;
}

function serialize(map: Record<string, Photo>): string {
  const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  const body = entries
    .map(([id, p]) => `  ${JSON.stringify(id)}: ${JSON.stringify(p)},`)
    .join("\n");
  return `/**
 * ARCHIVO GENERADO por \`scripts/fetch-driver-photos.ts\` — NO EDITAR A MANO.
 *
 * Mapa driverId -> foto de Wikimedia Commons. Los ids sin entrada usan el
 * Helmet SVG como fallback en \`DriverAvatar\`.
 *
 * Para regenerar: \`npx tsx --tsconfig tsconfig.app.json scripts/fetch-driver-photos.ts\`
 * Última generación: ${new Date().toISOString()} — ${entries.length} pilotos con foto.
 */

export type GeneratedPhoto = {
  thumb: string;
  source: string;
  license: "cc-by-sa" | "cc-by" | "public-domain" | "other" | null;
};

export const DRIVER_PHOTOS: Record<string, GeneratedPhoto> = {
${body}
};
`;
}

async function main() {
  const onlyRecent = process.argv.includes("--recent");
  const list = onlyRecent
    ? DRIVERS.filter((d) => (d.active.end ?? 9999) >= 2010)
    : DRIVERS;

  console.log(`Buscando fotos para ${list.length} pilotos${onlyRecent ? " (activos desde 2010)" : ""}...`);
  const map: Record<string, Photo> = {};
  const misses: string[] = [];
  let done = 0;

  for (const d of list) {
    try {
      const photo = await resolveDriver(d);
      if (photo) map[d.id] = photo;
      else misses.push(d.id);
    } catch (err) {
      misses.push(d.id);
      console.warn(`  ! error en ${d.id}:`, (err as Error).message);
    }
    done++;
    if (done % 25 === 0) console.log(`  ${done}/${list.length} (${Object.keys(map).length} con foto)`);
  }

  writeFileSync(OUT, serialize(map), "utf8");
  console.log(`\nListo: ${Object.keys(map).length} con foto, ${misses.length} sin foto.`);
  console.log(`Escrito en ${OUT}`);
  if (misses.length > 0 && misses.length <= 60) {
    console.log(`Sin foto: ${misses.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
