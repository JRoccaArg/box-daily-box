/**
 * Test del evento puntual de puntos dobles (src/lib/gpEvent.ts).
 *
 * Es la MISMA función que usa el backend para multiplicar los puntos que se
 * persisten (src/api/routes.ts finishChallenge, src/api/auth.ts
 * importLocalAttempts), así que los bordes de la ventana son un asunto de
 * seguridad, no de cosmética: un borde mal puesto regala puntos dobles fuera
 * del evento y contamina el ranking mensual.
 *
 * Cubre:
 *   - La ventana dura EXACTAMENTE 48 h.
 *   - Inicio inclusivo, fin exclusivo (nada de un segundo de propina).
 *   - Fuera de la ventana el multiplicador es 1, adentro es 2.
 *   - La ventana es un INSTANTE ABSOLUTO: el mismo momento da el mismo
 *     resultado sin importar el huso horario desde el que se lo exprese.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-gp-event.ts
 */
import {
  gpEventPhase,
  gpEventMultiplier,
  isGpEventActive,
  gpEventMsUntilNextMilestone,
  GP_EVENT_START_MS,
  GP_EVENT_END_MS,
  GP_EVENT_MULTIPLIER,
  GP_EVENT_TEASER_MS,
} from "@/lib/gpEvent";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

const at = (ms: number) => new Date(ms);
const SECOND = 1000;
const HOUR = 60 * 60 * 1000;

function testWindowLength() {
  console.log("\n▶ La ventana dura exactamente 48 horas");
  assert(GP_EVENT_END_MS - GP_EVENT_START_MS === 48 * HOUR, "duracion == 48 h");
  assert(GP_EVENT_START_MS < GP_EVENT_END_MS, "el inicio es anterior al fin");
}

function testBoundaries() {
  console.log("\n▶ Bordes: inicio inclusivo, fin exclusivo");
  assert(!isGpEventActive(at(GP_EVENT_START_MS - 1)), "1 ms antes del inicio: NO activo");
  assert(isGpEventActive(at(GP_EVENT_START_MS)), "exactamente en el inicio: activo");
  assert(isGpEventActive(at(GP_EVENT_END_MS - 1)), "1 ms antes del fin: activo");
  assert(!isGpEventActive(at(GP_EVENT_END_MS)), "exactamente en el fin: NO activo (exclusivo)");
  assert(!isGpEventActive(at(GP_EVENT_END_MS + SECOND)), "1 s despues del fin: NO activo");
}

function testMultiplier() {
  console.log("\n▶ Multiplicador: 1 fuera, 2 adentro");
  assert(gpEventMultiplier(at(GP_EVENT_START_MS - HOUR)) === 1, "una hora antes: x1");
  assert(gpEventMultiplier(at(GP_EVENT_START_MS)) === GP_EVENT_MULTIPLIER, "en el inicio: x2");
  assert(gpEventMultiplier(at(GP_EVENT_START_MS + 24 * HOUR)) === GP_EVENT_MULTIPLIER, "a mitad del evento: x2");
  assert(gpEventMultiplier(at(GP_EVENT_END_MS)) === 1, "en el fin: x1");
  assert(gpEventMultiplier(at(GP_EVENT_END_MS + 24 * HOUR)) === 1, "un dia despues: x1");
  // Un evento pasado o futuro lejano nunca debe multiplicar.
  assert(gpEventMultiplier(new Date("2020-01-01T00:00:00Z")) === 1, "2020: x1");
  assert(gpEventMultiplier(new Date("2030-01-01T00:00:00Z")) === 1, "2030: x1");
}

function testPhases() {
  console.log("\n▶ Fases: off -> soon -> active -> off");
  assert(gpEventPhase(at(GP_EVENT_START_MS - GP_EVENT_TEASER_MS - SECOND)) === "off",
    "antes del teaser: off");
  assert(gpEventPhase(at(GP_EVENT_START_MS - GP_EVENT_TEASER_MS)) === "soon",
    "justo al abrir el teaser: soon");
  assert(gpEventPhase(at(GP_EVENT_START_MS - SECOND)) === "soon", "1 s antes del inicio: soon");
  assert(gpEventPhase(at(GP_EVENT_START_MS)) === "active", "en el inicio: active");
  assert(gpEventPhase(at(GP_EVENT_END_MS)) === "off", "en el fin: off");
}

function testAbsoluteInstant() {
  console.log("\n▶ La ventana es un instante absoluto (independiente del huso)");
  // El inicio es medianoche UTC del sabado 05/09/2026. El MISMO instante,
  // expresado desde husos distintos, tiene que dar el mismo veredicto: es lo
  // que garantiza que el evento empiece a la vez para todo el mundo.
  const startUtc = new Date("2026-09-05T00:00:00.000Z");
  const startInBuenosAires = new Date("2026-09-04T21:00:00.000-03:00"); // mismo instante
  const startInTokyo = new Date("2026-09-05T09:00:00.000+09:00");       // mismo instante
  assert(startUtc.getTime() === GP_EVENT_START_MS, "el inicio es medianoche UTC del 05/09/2026");
  assert(startInBuenosAires.getTime() === startUtc.getTime(), "premisa: mismo instante (AR)");
  assert(startInTokyo.getTime() === startUtc.getTime(), "premisa: mismo instante (JP)");
  assert(isGpEventActive(startInBuenosAires), "activo visto desde Argentina");
  assert(isGpEventActive(startInTokyo), "activo visto desde Japon");

  // Un segundo antes, tambien desde cualquier huso, sigue sin estar activo.
  assert(!isGpEventActive(new Date("2026-09-04T20:59:59.000-03:00")), "1 s antes desde Argentina: NO activo");
  assert(!isGpEventActive(new Date("2026-09-05T08:59:59.000+09:00")), "1 s antes desde Japon: NO activo");

  // El fin cae en la medianoche UTC del lunes 07/09.
  assert(new Date("2026-09-07T00:00:00.000Z").getTime() === GP_EVENT_END_MS,
    "el fin es medianoche UTC del 07/09/2026");
}

function testVisualTestsUnaffected() {
  console.log("\n▶ El cartel no aparece en los tests visuales de Playwright");
  // tests/visual/fixtures.ts congela `Date` en FIXED_DATE_ISO para que los
  // puzzles diarios (deterministas por fecha) no muevan los snapshots. Si esa
  // fecha cayera dentro de la ventana del evento, el cartel se dibujaria arriba
  // del header y correria TODAS las capturas hacia abajo, obligando a
  // regenerar el baseline entero. Esta asercion deja el vinculo explicito: si
  // alguien mueve la ventana del evento sobre la fecha congelada, falla aca y
  // no con 60 diffs visuales incomprensibles.
  const FIXED_DATE_ISO = "2026-01-15T12:00:00.000Z"; // debe seguir a fixtures.ts
  assert(gpEventPhase(new Date(FIXED_DATE_ISO)) === "off",
    `la fecha congelada de los tests visuales (${FIXED_DATE_ISO}) cae fuera del evento`);
}

function testCountdown() {
  console.log("\n▶ Cuenta regresiva hacia el proximo hito");
  assert(gpEventMsUntilNextMilestone(at(GP_EVENT_START_MS - HOUR)) === HOUR,
    "antes del evento: cuenta hasta el inicio");
  assert(gpEventMsUntilNextMilestone(at(GP_EVENT_START_MS)) === 48 * HOUR,
    "en el inicio: cuenta las 48 h hasta el fin");
  assert(gpEventMsUntilNextMilestone(at(GP_EVENT_END_MS - HOUR)) === HOUR,
    "ultima hora: cuenta hasta el fin");
  assert(gpEventMsUntilNextMilestone(at(GP_EVENT_END_MS)) === 0, "terminado: 0");
  assert(gpEventMsUntilNextMilestone(at(GP_EVENT_END_MS + 99 * HOUR)) === 0, "muy terminado: 0");
}

console.log("═══ Test del evento de puntos dobles (GP de Monza 2026) ═══");
testWindowLength();
testBoundaries();
testMultiplier();
testPhases();
testAbsoluteInstant();
testVisualTestsUnaffected();
testCountdown();

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} asserts OK, ${failed} fallos`);
process.exit(failed === 0 ? 0 : 1);
