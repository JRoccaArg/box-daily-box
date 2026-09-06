/**
 * Test del armado del mensaje de compartir (src/lib/share.ts buildShareText).
 *
 * Verifica el formato del texto "estilo Wordle" que se comparte: encabezado
 * (nombre + fecha), grilla del juego cuando la hay, línea de tiempo/puntaje
 * con emojis, y la firma. No prueba el ENVÍO (Web Share API / clipboard), que
 * depende del navegador.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-share.ts
 */
import { buildShareText } from "@/lib/share";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

console.log("═══ Test del mensaje de compartir ═══");

// ── Ganó, con grilla (PoleWordle) ──
const won = buildShareText({
  gameName: "PoleWordle",
  dateLabel: "6 sept 2026",
  won: true,
  timeSeconds: 42,
  points: 120,
  grid: { rows: ["🟩🟨⬛⬛⬛", "🟩🟩🟩🟩🟩"] },
});
console.log("\n▶ Ganó con grilla");
{
  const lines = won.split("\n");
  assert(lines[0] === "🏁 PoleWordle · 6 sept 2026", "encabezado = 🏁 nombre · fecha");
  assert(won.includes("🟩🟨⬛⬛⬛\n🟩🟩🟩🟩🟩"), "incluye las filas de la grilla en orden");
  assert(won.includes("✅"), "muestra ✅ al ganar");
  assert(won.includes("⏱ 0:42"), "muestra el tiempo en m:ss");
  assert(won.includes("🏆 120"), "muestra el puntaje al ganar");
  assert(won.trim().endsWith("boxdailybox.com"), "termina con la firma");
}

// ── Perdió, con grilla: sin puntaje, con ❌ ──
console.log("\n▶ Perdió con grilla");
{
  const lost = buildShareText({
    gameName: "PitTexto",
    dateLabel: "6 sept 2026",
    won: false,
    timeSeconds: 90,
    points: 0,
    grid: { rows: ["🟥", "🟥", "🟥"] },
  });
  assert(lost.includes("❌"), "muestra ❌ al perder");
  assert(!lost.includes("🏆"), "NO muestra puntaje al perder");
  assert(lost.includes("⏱ 1:30"), "el tiempo sigue apareciendo");
  assert(lost.includes("🟥\n🟥\n🟥"), "incluye la grilla de intentos");
}

// ── Sin grilla (formato uniforme: El Intruso / TeamRadio) ──
console.log("\n▶ Sin grilla (uniforme)");
{
  const uniform = buildShareText({
    gameName: "El Intruso",
    dateLabel: "6 sept 2026",
    won: true,
    timeSeconds: 15,
    points: 80,
    grid: null,
  });
  const lines = uniform.split("\n").filter((l) => l.length > 0);
  // encabezado, línea de stats, firma → 3 líneas no vacías, sin filas de grilla
  assert(lines.length === 3, `sin grilla son 3 líneas no vacías (fueron ${lines.length})`);
  assert(uniform.includes("✅ · ⏱ 0:15 · 🏆 80"), "línea de stats compacta sin grilla");
}

// ── Modo Sin Tiempo: no muestra reloj ──
console.log("\n▶ Sin Tiempo (timeSeconds null)");
{
  const untimed = buildShareText({
    gameName: "PoleWordle",
    dateLabel: "6 sept 2026",
    won: true,
    timeSeconds: null,
    points: 50,
    grid: { rows: ["🟩🟩🟩🟩🟩"] },
  });
  assert(!untimed.includes("⏱"), "NO muestra reloj en modo Sin Tiempo");
  assert(untimed.includes("✅") && untimed.includes("🏆 50"), "sí muestra resultado y puntaje");
}

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} asserts OK, ${failed} fallos`);
process.exit(failed === 0 ? 0 : 1);
