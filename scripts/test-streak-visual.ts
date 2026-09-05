/** Verifica los límites visuales de la racha, sin depender del navegador. */
import { getStreakVisual } from "../src/lib/streakVisual";

let failed = 0;
let passed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${message}`);
  }
}

console.log("═══ TEST PRESENTACIÓN DE RACHA ═══");

for (const [days, tier] of [
  [0, "base"], [1, "base"], [6, "base"],
  [7, "amber"], [14, "amber"],
  [15, "red"], [29, "red"],
  [30, "blue"], [59, "blue"],
  [60, "violet"], [99, "violet"],
  [100, "gold"], [500, "gold"],
] as const) {
  assert(getStreakVisual(days).tier === tier, `${days} días → ${tier}`);
}

assert(
  getStreakVisual(60).flameClass.includes("animate-flame-live"),
  "violeta anima sutilmente la llama",
);
assert(
  getStreakVisual(100).flameClass.includes("animate-flame-live"),
  "dorado anima sutilmente la llama",
);
assert(
  !getStreakVisual(59).flameClass.includes("animate-flame-live"),
  "azul permanece estático",
);

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
process.exit(failed > 0 ? 1 : 0);
