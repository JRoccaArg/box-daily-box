// scripts/fetch-standings.mjs
//
// Herramienta de mantenimiento (uso único / re-generación puntual).
// Descarga los standings finales del campeonato de pilotos de CADA temporada
// de F1 (1950-presente) desde la API pública Jolpica (fork mantenido de
// Ergast: https://api.jolpi.ca/ergast/) y genera
// src/data/championshipStandings.ts con el dataset completo.
//
// Uso: node scripts/fetch-standings.mjs
//
// No requiere API key. Se agrega un delay entre requests para ser
// respetuosos con el rate limit publico de la API.

const START_YEAR = 1950;
const END_YEAR = 2026; // Se corta antes si la API no tiene datos (temporada no iniciada/terminada).
const DELAY_MS = 350;

// Gentilicio (en ingles, tal como lo devuelve Ergast/Jolpica) -> ISO alpha-3.
// Cubre todas las nacionalidades que aparecieron alguna vez en la F1.
// Paises historicos (URSS, Rodesia, Alemania Oriental/Occidental, Yugoslavia)
// se mapean a su equivalente moderno mas cercano.
const NATIONALITY_MAP = {
  "American": "USA",
  "Argentine": "ARG",
  "Argentinian": "ARG",
  "Australian": "AUS",
  "Austrian": "AUT",
  "Belgian": "BEL",
  "Brazilian": "BRA",
  "British": "GBR",
  "Canadian": "CAN",
  "Chilean": "CHL",
  "Chinese": "CHN",
  "Colombian": "COL",
  "Czech": "CZE",
  "Danish": "DNK",
  "Dutch": "NLD",
  "East German": "DEU",
  "Finnish": "FIN",
  "French": "FRA",
  "German": "DEU",
  "Hong Kong": "HKG",
  "Hungarian": "HUN",
  "Indian": "IND",
  "Indonesian": "IDN",
  "Irish": "IRL",
  "Italian": "ITA",
  "Japanese": "JPN",
  "Liechtensteiner": "LIE",
  "Malaysian": "MYS",
  "Mexican": "MEX",
  "Monegasque": "MCO",
  "New Zealander": "NZL",
  "Polish": "POL",
  "Portuguese": "PRT",
  "Rhodesian": "ZWE",
  "Russian": "RUS",
  "South African": "ZAF",
  "Spanish": "ESP",
  "Swedish": "SWE",
  "Swiss": "CHE",
  "Thai": "THA",
  "Uruguayan": "URY",
  "Venezuelan": "VEN",
  "West German": "DEU",
  "Yugoslav": "SRB",
  "Emirati": "ARE",
};

async function fetchYear(year) {
  const url = `https://api.jolpi.ca/ergast/f1/${year}/driverstandings.json?limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} para año ${year}`);
  const json = await res.json();
  const list = json?.MRData?.StandingsTable?.StandingsLists ?? [];
  if (list.length === 0) return null; // Temporada sin datos (no iniciada / no existe aun).
  return list[0].DriverStandings;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const seasons = [];
  const unmapped = new Set();

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    let entries;
    try {
      entries = await fetchYear(year);
    } catch (err) {
      console.error(`⚠️  Error en ${year}: ${err.message} — se omite.`);
      continue;
    }
    if (!entries) {
      console.log(`ℹ️  ${year}: sin datos (temporada no disponible aun) — corte.`);
      break;
    }

    const standings = entries.map((e) => {
      const demonym = e.Driver.nationality;
      const code = NATIONALITY_MAP[demonym];
      if (!code) unmapped.add(demonym);
      const name = `${e.Driver.givenName} ${e.Driver.familyName}`;
      return {
        name,
        nationalityCode: code ?? "UNK",
        points: parseFloat(e.points),
      };
    });

    seasons.push({ year, standings });
    console.log(`✅ ${year}: ${standings.length} pilotos.`);
    await sleep(DELAY_MS);
  }

  if (unmapped.size > 0) {
    console.error("\n❌ Nacionalidades sin mapear (agregar a NATIONALITY_MAP):");
    for (const n of unmapped) console.error(`   - "${n}"`);
    process.exit(1);
  }

  const header = `// src/data/championshipStandings.ts
//
// Dataset de standings FINALES del campeonato de pilotos, temporada por
// temporada (${seasons[0].year}-${seasons[seasons.length - 1].year}).
// Generado con scripts/fetch-standings.mjs desde la API publica Jolpica
// (fork mantenido de Ergast). Para regenerar: node scripts/fetch-standings.mjs
//
// Se guarda el standing COMPLETO de cada año (no solo el top 10) para que
// el calculo de puntos acumulados en periodos de 2-4 años sea exacto.
// El nombre del piloto es la clave de agregacion (igual patron que
// src/data/gpResults.ts), no se usan IDs internos.

export type StandingEntry = {
  /** Nombre completo del piloto (para autocompletado y matching). */
  name: string;
  /** ISO alpha-3 (referencia src/data/nationalities.ts). */
  nationalityCode: string;
  points: number;
};

export type SeasonStandings = {
  year: number;
  standings: StandingEntry[];
};

export const CHAMPIONSHIP_STANDINGS: SeasonStandings[] = `;

  const fs = await import("node:fs");
  const path = await import("node:path");
  const outPath = path.join(process.cwd(), "src", "data", "championshipStandings.ts");
  const body = JSON.stringify(seasons, null, 2) + ";\n";
  fs.writeFileSync(outPath, header + body, "utf-8");
  console.log(`\n✅ Dataset escrito en ${outPath} (${seasons.length} temporadas).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
