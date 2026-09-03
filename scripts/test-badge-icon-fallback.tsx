/**
 * Test de regresión: un `badge_type` que este bundle NO reconoce no debe
 * romper el render de <BadgeIcon> ni de <AchievementGallery> (TONE).
 *
 * Por qué importa: los badges son solo-agrega y NUNCA se revocan (ver
 * badges.ts/achievements.ts), así que un despliegue escalonado (backend con
 * un logro nuevo antes de que el frontend redepliegue) o un rollback después
 * de que alguien ya ganó un logro retirado dejan en la DB un badge_type que
 * el bundle actual desconoce. Sin fallback, `SHAPE[type]`/`TONE[type]` son
 * `undefined` y React tira toda la fila — sin error boundary en la app, esto
 * puede tumbar el ranking entero (público, la pantalla más vista) para todos
 * los visitantes que vean esa fila, no solo al usuario dueño del badge.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-badge-icon-fallback.tsx
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BadgeIcon } from "../src/components/ui/BadgeIcon";
import type { BadgeType } from "../src/lib/api";

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

const UNKNOWN = "ach_this_type_does_not_exist_yet" as BadgeType;

console.log("\n[BadgeIcon con type desconocido]");
try {
  const html = renderToStaticMarkup(<BadgeIcon type={UNKNOWN} count={1} />);
  assert(true, "renderiza sin lanzar excepción");
  assert(html.includes("<svg"), "produce igual un ícono (fallback), no un elemento vacío");
} catch {
  assert(false, "renderiza sin lanzar excepción");
}

console.log("\n[Fila mixta: conocidos + uno desconocido, como en el ranking real]");
try {
  const html = renderToStaticMarkup(
    <span>
      <BadgeIcon type="monthly_gold" count={2} />
      <BadgeIcon type={UNKNOWN} count={1} />
      <BadgeIcon type="ach_complete" count={1} />
    </span>,
  );
  assert(true, "una fila con un badge desconocido en el medio no tira abajo a los demás");
  assert((html.match(/<svg/g) ?? []).length === 3, "los 3 íconos se renderizaron (2 conocidos + 1 fallback)");
} catch {
  assert(false, "una fila con un badge desconocido en el medio no tira abajo a los demás");
}

console.log("\n[Badges conocidos siguen usando su ícono real, no el fallback]");
const known = renderToStaticMarkup(<BadgeIcon type="ach_wins_100" count={1} />);
const unknown = renderToStaticMarkup(<BadgeIcon type={UNKNOWN} count={1} />);
assert(known !== unknown, "un tipo conocido y uno desconocido no producen el mismo SVG (el fallback no pisa a los reales)");

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} fallidos`);
process.exit(failed === 0 ? 0 : 1);
