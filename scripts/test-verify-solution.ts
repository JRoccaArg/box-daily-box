/**
 * Test REAL del anti-cheat central: src/api/verify.ts (verifyChallenge).
 *
 * Este es el módulo que decide si un intento gana o pierde en el servidor —
 * NUNCA se confía en el veredicto del cliente. Para cada uno de los 6 juegos,
 * en varias fechas y dificultades:
 *   - La solución CORRECTA (derivada de la misma lógica determinista que usa
 *     el propio verificador) gana.
 *   - Una solución manipulada/incorrecta pierde.
 *   - Input malformado/incompleto no revienta y pierde.
 *   - Un gameId desconocido no gana.
 *
 * Importa el código REAL (no lo replica), así que detecta regresiones de
 * verdad si alguien rompe verify.ts.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-verify-solution.ts
 */
import type { Difficulty } from "@/types";
import { dateKey } from "@/lib/seed";
import { verifyChallenge } from "@/api/verify";
import { buildTarget } from "@/components/games/PitTexto/pittexto.logic";
import { buildIntruso } from "@/components/games/ElIntruso/intruso.logic";
import { buildBingo } from "@/components/games/ParrillaBingo/bingo.logic";
import { buildGPChallenge } from "@/components/games/GPResultado/gpresultado.logic";
import { buildChallenge as buildTop10Challenge } from "@/components/games/Top10Standings/top10standings.logic";
import { getDriverPoolAtLeast } from "@/lib/filters";
import { dailyPick } from "@/lib/daily";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

const DIFFS: Difficulty[] = ["facil", "medio", "dificil", "leyenda"];

function testDates(): Date[] {
  const base = new Date(2026, 0, 5);
  return Array.from({ length: 8 }, (_, i) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + i * 7));
}

function pitTexto() {
  console.log("\n▶ PitTexto");
  for (const diff of DIFFS) {
    for (const date of testDates()) {
      const key = dateKey(date);
      const target = buildTarget(diff, date);
      assert(
        verifyChallenge("pittexto", diff, key, { driverId: target.id }).won === true,
        `[${diff} ${key}] driverId correcto (${target.id}) gana`,
      );
      assert(
        verifyChallenge("pittexto", diff, key, { driverId: "___no-existe___" }).won === false,
        `[${diff} ${key}] driverId inventado pierde`,
      );
      assert(
        verifyChallenge("pittexto", diff, key, { driverId: "" } as any).won === false,
        `[${diff} ${key}] driverId vacío pierde (no revienta)`,
      );
    }
  }
}

function poleWordle() {
  console.log("\n▶ PoleWordle");
  for (const diff of DIFFS) {
    for (const date of testDates()) {
      const key = dateKey(date);
      // Réplica MÍNIMA de la construcción del pool en verify.ts (privada, no
      // exportada): getDriverPoolAtLeast + mismo filtro de longitud + mismo
      // salt en dailyPick. Si esto diverge de verify.ts, el test avisa solo
      // (assert de "gana" fallaría), no hace falta que sea 100% robusto.
      const base = getDriverPoolAtLeast(diff, 10);
      const sane = base.filter((d) => d.wordleKey.length >= 4 && d.wordleKey.length <= 11);
      const pool = sane.length >= 8 ? sane : base;
      const target = dailyPick(pool, date, `polewordle::${diff}`);

      assert(
        verifyChallenge("polewordle", diff, key, { guesses: ["XXXXX", target.wordleKey] }).won === true,
        `[${diff} ${key}] guess correcto (${target.wordleKey}) entre varios gana`,
      );
      assert(
        verifyChallenge("polewordle", diff, key, { guesses: ["XXXXX", "YYYYY"] }).won === false,
        `[${diff} ${key}] ningún guess correcto pierde`,
      );
      assert(
        verifyChallenge("polewordle", diff, key, { guesses: [] }).won === false,
        `[${diff} ${key}] guesses vacío pierde`,
      );
    }
  }
}

function elIntruso() {
  console.log("\n▶ El Intruso");
  for (const diff of DIFFS) {
    for (const date of testDates()) {
      const key = dateKey(date);
      const puzzle = buildIntruso(diff, date);
      const wrongTile = puzzle.tiles.find((t) => t.id !== puzzle.intruderId)!;
      assert(
        verifyChallenge("el-intruso", diff, key, { driverId: puzzle.intruderId }).won === true,
        `[${diff} ${key}] intruso correcto (${puzzle.intruderId}) gana`,
      );
      assert(
        verifyChallenge("el-intruso", diff, key, { driverId: wrongTile.id }).won === false,
        `[${diff} ${key}] elegir uno de los 9 "normales" pierde`,
      );
    }
  }
}

function parrillaBingo() {
  console.log("\n▶ Parrilla Bingo");
  for (const diff of DIFFS) {
    for (const date of testDates()) {
      const key = dateKey(date);
      const puzzle = buildBingo(diff, date);
      assert(
        verifyChallenge("parrilla-bingo", diff, key, { grid: puzzle.solution }).won === true,
        `[${diff} ${key}] solución canónica (9 distintos, cumplen fila/columna) gana`,
      );
      const repeated = [...puzzle.solution.slice(0, 8), puzzle.solution[0]!];
      assert(
        verifyChallenge("parrilla-bingo", diff, key, { grid: repeated }).won === false,
        `[${diff} ${key}] grid con piloto repetido pierde`,
      );
      const tooShort = puzzle.solution.slice(0, 8);
      assert(
        verifyChallenge("parrilla-bingo", diff, key, { grid: tooShort }).won === false,
        `[${diff} ${key}] grid incompleto (8 elementos) pierde`,
      );
    }
  }
}

function gpResultado() {
  console.log("\n▶ GP Resultado");
  for (const diff of DIFFS) {
    for (const date of testDates()) {
      const key = dateKey(date);
      const gp = buildGPChallenge(diff, date);
      const names = gp.t.map(([n]) => n);
      assert(
        verifyChallenge("gp-resultado", diff, key, { grid: names }).won === true,
        `[${diff} ${key}] top 10 exacto (${gp.y} ${gp.g}) gana`,
      );
      if (names[0] !== names[1]) {
        const swapped = [names[1]!, names[0]!, ...names.slice(2)];
        assert(
          verifyChallenge("gp-resultado", diff, key, { grid: swapped }).won === false,
          `[${diff} ${key}] P1/P2 invertidos pierde`,
        );
      }
      const incomplete = [...names.slice(0, 9), null];
      assert(
        verifyChallenge("gp-resultado", diff, key, { grid: incomplete }).won === false,
        `[${diff} ${key}] última posición vacía pierde`,
      );
    }
  }
}

function top10Standings() {
  console.log("\n▶ Top 10 Standings");
  for (const diff of DIFFS) {
    for (const date of testDates()) {
      const key = dateKey(date);
      const challenge = buildTop10Challenge(diff, date);
      const names = challenge.top10.map((e) => e.name);
      assert(
        verifyChallenge("top10-standings", diff, key, { grid: names }).won === true,
        `[${diff} ${key}] top 10 acumulado exacto (${challenge.startYear}-${challenge.endYear}) gana`,
      );
      if (names[0] !== names[names.length - 1]) {
        const swapped = [...names];
        [swapped[0], swapped[swapped.length - 1]] = [swapped[swapped.length - 1]!, swapped[0]!];
        assert(
          verifyChallenge("top10-standings", diff, key, { grid: swapped }).won === false,
          `[${diff} ${key}] P1/P10 invertidos pierde`,
        );
      }
    }
  }
}

function unknownGame() {
  console.log("\n▶ Juego desconocido");
  const key = dateKey(new Date());
  const r = verifyChallenge("juego-que-no-existe", "medio", key, { driverId: "x" } as any);
  assert(r.won === false, "gameId desconocido nunca gana");
}

(async () => {
  console.log("═══ TEST VERIFY SOLUTION (verifyChallenge real, src/api/verify.ts) ═══");
  pitTexto();
  poleWordle();
  elIntruso();
  parrillaBingo();
  gpResultado();
  top10Standings();
  unknownGame();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
