/**
 * Test de integridad del dataset de "Team Radio" (Etapa 3).
 *
 * Cubre:
 *  - Sin ids duplicados.
 *  - Cada driverId existe en DRIVERS.
 *  - El año de cada radio cae dentro de driver.active (con margen de 1 año
 *    para cubrir vueltas de descarga / pretemporada cerca del límite).
 *  - Los cortes de dificultad son EXCLUSIVOS y correctos: facil >= 2022,
 *    medio 2017-2021, dificil <= 2016 (a diferencia del resto del sitio,
 *    que usa pools acumulativos — ver comentario en teamRadios.ts).
 *  - Ninguna carrera de la BLACKLIST de gpResults.ts aparece acá.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-teamradio-data.ts
 */
import { DRIVERS_BY_ID } from "../src/data";
import { TEAM_RADIOS } from "../src/data/teamRadios";
import { GP_CALENDAR } from "../src/data/gpCalendar";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${msg}`);
  }
}

// ─── Ids únicos ──────────────────────────────────────────────────────
const ids = new Set<string>();
let dupCount = 0;
for (const r of TEAM_RADIOS) {
  if (ids.has(r.id)) dupCount++;
  ids.add(r.id);
}
assert(dupCount === 0, `sin ids duplicados (encontrados: ${dupCount})`);

// ─── driverId existe + año dentro de la carrera del piloto ───────────
let missingDriver = 0;
let yearOutOfRange = 0;
for (const r of TEAM_RADIOS) {
  const d = DRIVERS_BY_ID[r.driverId];
  if (!d) {
    missingDriver++;
    console.log(`  ❌ driverId inexistente: "${r.driverId}" (radio ${r.id})`);
    continue;
  }
  const end = d.active.end ?? new Date().getFullYear() + 1;
  if (r.y < d.active.start - 1 || r.y > end + 1) {
    yearOutOfRange++;
    console.log(
      `  ❌ ${r.id}: año ${r.y} fuera del rango activo de ${r.driverId} (${d.active.start}-${d.active.end ?? "presente"})`,
    );
  }
}
assert(missingDriver === 0, `todos los driverId existen en DRIVERS (faltantes: ${missingDriver})`);
assert(yearOutOfRange === 0, `todos los años caen dentro de la carrera del piloto (fuera de rango: ${yearOutOfRange})`);

// ─── Cortes de dificultad exclusivos ──────────────────────────────────
// Etapa 3 recalibró los cortes específicamente para este juego (no son los
// mismos que difficultyFloor). Estos rangos deben coincidir con los que
// use teamradio.logic.ts en la Etapa 4.
const FACIL_MIN = 2022;
const MEDIO_MIN = 2017;
const MEDIO_MAX = 2021;
const DIFICIL_MAX = 2016;

const facil = TEAM_RADIOS.filter((r) => r.y >= FACIL_MIN);
const medio = TEAM_RADIOS.filter((r) => r.y >= MEDIO_MIN && r.y <= MEDIO_MAX);
const dificil = TEAM_RADIOS.filter((r) => r.y <= DIFICIL_MAX);

assert(facil.length + medio.length + dificil.length === TEAM_RADIOS.length,
  `los 3 rangos de año son exclusivos y cubren el 100% del dataset (facil=${facil.length}, medio=${medio.length}, dificil=${dificil.length}, total=${TEAM_RADIOS.length})`);

assert(facil.length >= 30, `facil tiene un pool razonable (${facil.length}, minimo esperado 30)`);
assert(medio.length >= 30, `medio tiene un pool razonable (${medio.length}, minimo esperado 30)`);
assert(dificil.length >= 30, `dificil tiene un pool razonable (${dificil.length}, minimo esperado 30)`);

console.log(`\n▶ Distribución: facil=${facil.length} (${FACIL_MIN}+), medio=${medio.length} (${MEDIO_MIN}-${MEDIO_MAX}), dificil=${dificil.length} (hasta ${DIFICIL_MAX})`);

// ─── Sin carreras trágicas (misma BLACKLIST que gpResults.ts) ─────────
const TRAGIC = new Set(["1994-San Marino", "2014-Japanese", "1970-Italian"]);
let tragicFound = 0;
for (const r of TEAM_RADIOS) {
  const key = `${r.y}-${r.g.split(" ")[0]}`;
  if (TRAGIC.has(key)) {
    tragicFound++;
    console.log(`  ❌ ${r.id}: carrera en la BLACKLIST (${key})`);
  }
}
assert(tragicFound === 0, `ninguna radio pertenece a una carrera de la BLACKLIST (encontradas: ${tragicFound})`);

// ─── Cada radio existe como carrera real en GP_CALENDAR ───────────────
// Necesario para la Etapa 4: el algoritmo de opciones falsas arma los
// distractores buscando en GP_CALENDAR: si la carrera "correcta" de una
// radio no está ahí, esa radio queda sin poder generarse.
const calendarKeys = new Set(GP_CALENDAR.map((c) => `${c.y}|${c.g}|${c.c}`));
let missingFromCalendar = 0;
for (const r of TEAM_RADIOS) {
  const key = `${r.y}|${r.g}|${r.c}`;
  if (!calendarKeys.has(key)) {
    missingFromCalendar++;
    console.log(`  ❌ ${r.id}: "${r.g}" (${r.y}, ${r.c}) no está en GP_CALENDAR`);
  }
}
assert(missingFromCalendar === 0, `todas las radios existen en GP_CALENDAR (faltantes: ${missingFromCalendar})`);

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
if (failed > 0) process.exit(1);
