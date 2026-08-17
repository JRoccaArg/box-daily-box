/**
 * Test de la lógica de "Team Radio" (Etapa 4).
 *
 * Cubre:
 *  - Determinismo: mismo día + dificultad => mismo puzzle, siempre.
 *  - Invariantes de las opciones: siempre 6, sin duplicados, la correcta
 *    SIEMPRE presente, y ninguna fuera de la ventana activa del piloto.
 *  - Variedad de opciones: la MISMA radio en dos fechas distintas muestra
 *    un set de opciones distinto (evita memorizar el par radio-respuesta).
 *  - Rangos exclusivos: cada dificultad solo saca radios de su franja.
 *  - La dificultad endurece las opciones falsas (dificil tiene más opciones
 *    "pegadas" que facil).
 *  - Duelos: con `seed` el puzzle no depende de la fecha.
 *  - verifyTeamRadio: gana solo con la correcta, pierde con las otras 5 y
 *    con solución malformada.
 *  - Smoke de 120 días x 3 dificultades: sin excepciones.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-teamradio.ts
 */
import { DRIVERS_BY_ID } from "../src/data";
import {
  buildTeamRadio,
  getTeamRadioPool,
  verifyTeamRadio,
  optionId,
  OPTION_COUNT,
  DIFFICULTY_RANGES,
} from "../src/components/games/TeamRadio/teamradio.logic";
import type { Difficulty } from "../src/types";

// Dificultades habilitadas para este juego (debe coincidir con registry.ts,
// Etapa 5/6). No se importa el registry acá: arrastra componentes React.
const DIFFS: Difficulty[] = ["facil", "medio", "dificil"];

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${msg}`);
  }
}

// ─── Parte A: pools por dificultad ───────────────────────────────────

console.log("\n=== Parte A: pools y rangos exclusivos ===");

for (const diff of DIFFS) {
  const pool = getTeamRadioPool(diff);
  const [min, max] = DIFFICULTY_RANGES[diff];
  assert(pool.length > 0, `[${diff}] pool no vacío (${pool.length} radios)`);
  const allInRange = pool.every((r) => r.y >= min && r.y <= max);
  assert(allInRange, `[${diff}] todas las radios caen en su rango de años (${min}-${max === 9999 ? "hoy" : max})`);
}

// Los 3 pools no comparten NINGUNA radio (rangos exclusivos, no acumulativos).
const idsByDiff = DIFFS.map((d) => new Set(getTeamRadioPool(d).map((r) => r.id)));
let overlap = 0;
for (let i = 0; i < idsByDiff.length; i++) {
  for (let j = i + 1; j < idsByDiff.length; j++) {
    for (const id of idsByDiff[i] as Set<string>) {
      if ((idsByDiff[j] as Set<string>).has(id)) overlap++;
    }
  }
}
assert(overlap === 0, `los 3 pools son exclusivos, sin radios compartidas (solapamientos: ${overlap})`);

// ─── Parte B: determinismo ───────────────────────────────────────────

console.log("\n=== Parte B: determinismo ===");

const d1 = new Date(2026, 5, 15);
const d2 = new Date(2026, 5, 15);
const p1 = buildTeamRadio("medio", d1);
const p2 = buildTeamRadio("medio", d2);
assert(p1.radio.id === p2.radio.id, `mismo día + dificultad => misma radio (${p1.radio.id})`);
assert(
  JSON.stringify(p1.options.map((o) => o.id)) === JSON.stringify(p2.options.map((o) => o.id)),
  "mismo día + dificultad => mismas opciones, en el mismo orden",
);

const duel1 = buildTeamRadio("medio", d1, "duelo-abc123");
const duel2 = buildTeamRadio("medio", new Date(2030, 0, 1), "duelo-abc123");
assert(duel1.radio.id === duel2.radio.id, "con seed de duelo el puzzle NO depende de la fecha");

// ─── Parte C: invariantes de las opciones ────────────────────────────

console.log("\n=== Parte C: invariantes de las opciones (120 días x 3 dificultades) ===");

for (const diff of DIFFS) {
  let badCount = 0;
  let missingCorrect = 0;
  let dupes = 0;
  let outsideWindow = 0;

  for (let day = 0; day < 120; day++) {
    const date = new Date(2026, 0, 1 + day);
    const puzzle = buildTeamRadio(diff, date);

    if (puzzle.options.length !== OPTION_COUNT) badCount++;

    const ids = puzzle.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) dupes++;
    if (!ids.includes(puzzle.correctId)) missingCorrect++;

    // La correcta debe apuntar a la carrera real de la radio.
    const expected = optionId({ y: puzzle.radio.y, g: puzzle.radio.g, c: puzzle.radio.c });
    if (puzzle.correctId !== expected) missingCorrect++;

    // Ninguna opción puede caer fuera de los años en que el piloto corrió:
    // sería descartable de un vistazo sin saber nada de la radio.
    const driver = DRIVERS_BY_ID[puzzle.radio.driverId];
    if (driver) {
      const from = driver.active.start;
      const to = driver.active.end ?? 9999;
      for (const o of puzzle.options) {
        if (o.y < from || o.y > to) outsideWindow++;
      }
    }
  }

  assert(badCount === 0, `[${diff}] siempre ${OPTION_COUNT} opciones (fallos: ${badCount})`);
  assert(dupes === 0, `[${diff}] sin opciones duplicadas (días con duplicados: ${dupes})`);
  assert(missingCorrect === 0, `[${diff}] la opción correcta siempre está presente y es la real (fallos: ${missingCorrect})`);
  assert(outsideWindow === 0, `[${diff}] ninguna opción fuera de los años activos del piloto (fallos: ${outsideWindow})`);
}

// ─── Parte D: variedad de opciones para la MISMA radio ───────────────

console.log("\n=== Parte D: la misma radio no repite siempre las mismas opciones ===");

// Se recorren días hasta encontrar dos fechas que caigan en la misma radio,
// y se comparan sus sets de opciones.
for (const diff of DIFFS) {
  const seen = new Map<string, string[]>();
  let compared = 0;
  let identical = 0;

  for (let day = 0; day < 400; day++) {
    const date = new Date(2026, 0, 1 + day);
    const puzzle = buildTeamRadio(diff, date);
    const ids = puzzle.options.map((o) => o.id).sort();
    const prev = seen.get(puzzle.radio.id);
    if (prev) {
      compared++;
      if (JSON.stringify(prev) === JSON.stringify(ids)) identical++;
    } else {
      seen.set(puzzle.radio.id, ids);
    }
  }

  if (compared === 0) {
    assert(true, `[${diff}] (el pool no se repitió en 400 días, nada que comparar)`);
  } else {
    // Se tolera alguna coincidencia (con pools chicos de candidatos puede
    // pasar), pero no que TODAS las reapariciones sean idénticas.
    assert(
      identical < compared,
      `[${diff}] al reaparecer una radio, las opciones cambian (${compared - identical}/${compared} reapariciones con set distinto)`,
    );
  }
}

// ─── Parte E: la dificultad endurece las opciones falsas ─────────────

console.log("\n=== Parte E: dificil ofrece opciones más confusas que facil ===");

/** Cuenta opciones falsas "pegadas": mismo circuito, o mismo año. */
function tightDistractors(diff: Difficulty, days: number): number {
  let tight = 0;
  for (let day = 0; day < days; day++) {
    const date = new Date(2026, 0, 1 + day);
    const p = buildTeamRadio(diff, date);
    for (const o of p.options) {
      if (o.id === p.correctId) continue;
      if (o.c === p.radio.c || o.y === p.radio.y) tight++;
    }
  }
  return tight;
}

const tightFacil = tightDistractors("facil", 120);
const tightDificil = tightDistractors("dificil", 120);
assert(
  tightDificil > tightFacil,
  `dificil tiene más opciones pegadas que facil (dificil=${tightDificil}, facil=${tightFacil} sobre 600 falsas)`,
);

// ─── Parte F: verificador ────────────────────────────────────────────

console.log("\n=== Parte F: verifyTeamRadio ===");

const vDate = new Date(2026, 2, 10);
const vPuzzle = buildTeamRadio("medio", vDate);

const okResult = verifyTeamRadio("medio", vDate, { optionId: vPuzzle.correctId });
assert(okResult.won, `la opción correcta gana (${vPuzzle.correctId})`);

let wrongAllLose = true;
for (const o of vPuzzle.options) {
  if (o.id === vPuzzle.correctId) continue;
  if (verifyTeamRadio("medio", vDate, { optionId: o.id }).won) wrongAllLose = false;
}
assert(wrongAllLose, "las otras 5 opciones pierden");

assert(!verifyTeamRadio("medio", vDate, { optionId: "" }).won, "solución vacía pierde");
assert(
  !verifyTeamRadio("medio", vDate, { optionId: "9999::Fake Grand Prix" }).won,
  "una opción que no estaba en pantalla pierde",
);
assert(
  !verifyTeamRadio("medio", vDate, {} as { optionId: string }).won,
  "solución malformada pierde",
);

// El server no debe poder ser engañado usando otra dificultad.
const otherDiff = verifyTeamRadio("facil", vDate, { optionId: vPuzzle.correctId });
assert(
  !otherDiff.won || getTeamRadioPool("facil").some((r) => optionId(r) === vPuzzle.correctId),
  "la respuesta de una dificultad no gana en otra (salvo coincidencia real de carrera)",
);

// ─── Resultado ───────────────────────────────────────────────────────

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
if (failed > 0) process.exit(1);
