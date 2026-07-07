/**
 * Test REAL del motor de puntaje: src/lib/scoring.ts (computeScore).
 *
 * Es la MISMA función que usa el backend (src/api/routes.ts) para calcular
 * puntos server-side — nunca se confía en el puntaje que mande el cliente.
 * Cubre:
 *   - Perder u abandonar = 0 puntos, sin importar el resto.
 *   - Puntos base correctos por dificultad.
 *   - Bonus de velocidad: baja a medida que se usa más tiempo.
 *   - Multiplicador de riesgo: elegir menos tiempo (vs. el máximo disponible
 *     del juego) sube el techo del bonus de velocidad.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-scoring.ts
 */
import type { Difficulty } from "@/types";
import { computeScore, BASE_POINTS, MAX_SPEED_BONUS } from "@/lib/scoring";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

const DIFFS: Difficulty[] = ["facil", "medio", "dificil", "leyenda"];

function testLostOrAbandoned() {
  console.log("\n▶ Perder/abandonar siempre da 0, sin importar el resto");
  for (const difficulty of DIFFS) {
    assert(
      computeScore({ won: false, difficulty, timeSeconds: 0, timeLimit: 100, maxTimeOption: 200 }) === 0,
      `[${difficulty}] perder con tiempo mínimo = 0`,
    );
  }
  assert(computeScore({ won: false, difficulty: "leyenda" }) === 0, "perder sin datos de tiempo = 0");
}

function testBasePoints() {
  console.log("\n▶ Puntos base por dificultad (sin datos de tiempo → sin bonus)");
  for (const difficulty of DIFFS) {
    const score = computeScore({ won: true, difficulty });
    assert(score === BASE_POINTS[difficulty], `[${difficulty}] ${score} === base ${BASE_POINTS[difficulty]}`);
  }
}

function testSpeedBonusDecreasesWithTime() {
  console.log("\n▶ Bonus de velocidad: a menos tiempo usado, más puntos");
  const timeLimit = 120;
  const early = computeScore({ won: true, difficulty: "medio", timeSeconds: 5, timeLimit });
  const mid = computeScore({ won: true, difficulty: "medio", timeSeconds: 60, timeLimit });
  const late = computeScore({ won: true, difficulty: "medio", timeSeconds: 119, timeLimit });
  assert(early > mid, `resolver rápido (5s) da más que a mitad de tiempo (60s): ${early} > ${mid}`);
  assert(mid > late, `a mitad de tiempo (60s) da más que casi al límite (119s): ${mid} > ${late}`);
  assert(late >= BASE_POINTS.medio, `resolver casi sin tiempo restante nunca baja del puntaje base: ${late} >= ${BASE_POINTS.medio}`);
  // Al límite exacto, no queda tiempo restante: bonus = 0.
  const atLimit = computeScore({ won: true, difficulty: "medio", timeSeconds: timeLimit, timeLimit });
  assert(atLimit === BASE_POINTS.medio, `agotar el tiempo completo da bonus 0 (solo base): ${atLimit} === ${BASE_POINTS.medio}`);
}

function testRiskMultiplier() {
  console.log("\n▶ Multiplicador de riesgo: elegir MENOS tiempo (vs. el máximo del juego) sube el techo");
  // Mismo juego, dos jugadores resuelven "al instante" (timeSeconds ínfimo),
  // pero uno eligió el tiempo máximo (90s de 90s -> riesgo 1x) y otro el
  // mínimo (90s siendo el máximo disponible, eligió 30s -> riesgo 3x).
  const maxTimeOption = 180;
  const chooseMax = computeScore({ won: true, difficulty: "facil", timeSeconds: 1, timeLimit: 180, maxTimeOption });
  const chooseMin = computeScore({ won: true, difficulty: "facil", timeSeconds: 1, timeLimit: 60, maxTimeOption });
  assert(
    chooseMin > chooseMax,
    `elegir 60s (de un máximo de 180s) puntúa más que elegir 180s, a igual velocidad real: ${chooseMin} > ${chooseMax}`,
  );

  // El máximo posible de bonus con timeLimit=60 y maxTimeOption=180 es
  // MAX_SPEED_BONUS * (180/60) = 3x, pero el bonus real se calcula sobre el
  // Math.round, así que solo verificamos que sea estrictamente mayor al bonus
  // sin multiplicador (riskMultiplier=1, i.e. maxTimeOption===timeLimit).
  const noRisk = computeScore({ won: true, difficulty: "facil", timeSeconds: 1, timeLimit: 60, maxTimeOption: 60 });
  assert(chooseMin > noRisk, `el mismo timeLimit=60 con maxTimeOption=180 puntúa más que sin riesgo (maxTimeOption=60): ${chooseMin} > ${noRisk}`);

  // maxTimeOption MENOR al timeLimit elegido no tiene sentido (el jugador no
  // pudo elegir más tiempo que el máximo real) — el código lo trata como
  // "sin multiplicador" (cae a timeLimit), no como riesgo negativo/inflado.
  const inconsistent = computeScore({ won: true, difficulty: "facil", timeSeconds: 1, timeLimit: 90, maxTimeOption: 30 });
  const consistent = computeScore({ won: true, difficulty: "facil", timeSeconds: 1, timeLimit: 90, maxTimeOption: 90 });
  assert(inconsistent === consistent, `maxTimeOption menor al timeLimit se ignora (no infla ni penaliza): ${inconsistent} === ${consistent}`);
}

function testMissingTimeData() {
  console.log("\n▶ Sin timeSeconds o timeLimit → sin bonus, solo base");
  assert(
    computeScore({ won: true, difficulty: "dificil", timeLimit: 120 }) === BASE_POINTS.dificil,
    "sin timeSeconds: solo base",
  );
  assert(
    computeScore({ won: true, difficulty: "dificil", timeSeconds: 10 }) === BASE_POINTS.dificil,
    "sin timeLimit: solo base",
  );
  assert(
    computeScore({ won: true, difficulty: "dificil", timeSeconds: 10, timeLimit: 0 }) === BASE_POINTS.dificil,
    "timeLimit=0 (juego sin límite): solo base, no revienta con división por cero",
  );
}

function testDeterminism() {
  console.log("\n▶ Determinismo: mismas entradas → mismo puntaje siempre");
  const input = { won: true, difficulty: "leyenda" as Difficulty, timeSeconds: 42, timeLimit: 180, maxTimeOption: 180 };
  const a = computeScore(input);
  const b = computeScore({ ...input });
  assert(a === b, `computeScore es puro: ${a} === ${b}`);
  assert(a <= BASE_POINTS.leyenda + MAX_SPEED_BONUS * 3, "el resultado nunca excede una cota razonable (base + bonus máx con riesgo 3x)");
}

(async () => {
  console.log("═══ TEST SCORING (computeScore real, src/lib/scoring.ts) ═══");
  testLostOrAbandoned();
  testBasePoints();
  testSpeedBonusDecreasesWithTime();
  testRiskMultiplier();
  testMissingTimeData();
  testDeterminism();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
