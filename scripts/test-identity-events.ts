/**
 * Test de IDENTITY_ESTABLISHED (src/lib/identity.ts + src/lib/events.ts).
 *
 * Cubre el fix de los hooks de polling "dormidos" (useLives.ts,
 * friendsPolling.ts): ambos arman su poll DENTRO de un useEffect que corta
 * temprano si getIdentityToken() === null, y como el Header está montado
 * desde la primera carga de la página, un visitante sin identityToken hace
 * que ese efecto corra una vez y no se vuelva a ejecutar solo. El fix es que
 * setIdentityToken() emita Events.IDENTITY_ESTABLISHED la primera vez que
 * aparece un token en la sesión, para que esos hooks puedan escucharlo y
 * rearmar su efecto sin depender de un recargue de página.
 *
 * Lo que valida este test (a nivel de identity.ts/events.ts, sin React
 * porque el proyecto no tiene @testing-library/react):
 *   - No se emite nada mientras no hay token.
 *   - Se emite UNA vez cuando aparece el primer token de la sesión.
 *   - NO se re-emite en llamadas posteriores a setIdentityToken/
 *     getIdentityToken con la sesión ya "armada" (evita que los hooks
 *     rearmen su poll en cada request, que es lo que haría getIdentityToken()
 *     al re-sincronizar capas si emitiéramos sin este guard).
 *   - clearIdentityToken() rearma el flag: un logout + login nuevo durante la
 *     misma sesión también debe emitir el evento de nuevo.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-identity-events.ts
 */
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "https://box-daily-box-staging.vercel.app/",
});
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).localStorage = dom.window.localStorage;
(globalThis as any).sessionStorage = dom.window.sessionStorage;
(globalThis as any).location = dom.window.location;

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

async function main() {
  const { on, Events } = await import("../src/lib/events");
  const { setIdentityToken, getIdentityToken, clearIdentityToken } = await import(
    "../src/lib/identity"
  );

  console.log("═══ TEST IDENTITY_ESTABLISHED (jsdom + localStorage/cookie/sessionStorage reales) ═══");

  let emitCount = 0;
  const unsubscribe = on(Events.IDENTITY_ESTABLISHED, () => {
    emitCount++;
  });

  console.log("\n▶ Sin token todavía: nadie emite nada");
  assert(getIdentityToken() === null, "getIdentityToken() da null antes de jugar un reto");
  assert(emitCount === 0, "IDENTITY_ESTABLISHED no se emitió (no hay token que establecer)");

  console.log("\n▶ Primer token de la sesión (ej: termina su primer reto)");
  setIdentityToken("token-primer-reto");
  assert(emitCount === 1, "IDENTITY_ESTABLISHED se emitió UNA vez al establecerse el primer token");
  assert(getIdentityToken() === "token-primer-reto", "el token queda disponible para el resto de la app");

  console.log("\n▶ Llamadas posteriores NO vuelven a emitir (evita rearmar el poll en cada request)");
  setIdentityToken("token-refresh-server"); // ej: el server rota el token en un request posterior
  assert(emitCount === 1, "un segundo setIdentityToken() en la misma sesión no reemite el evento");
  // getIdentityToken() re-sincroniza cookie/sessionStorage desde localStorage en CADA llamada
  // (así es como casi todos los requests de api.ts la invocan) — no debe emitir tampoco.
  for (let i = 0; i < 5; i++) getIdentityToken();
  assert(emitCount === 1, "5 llamadas más a getIdentityToken() (resync interno) no reemiten el evento");

  console.log("\n▶ Logout + login nuevo SÍ vuelve a emitir (re-arma los hooks)");
  clearIdentityToken();
  assert(getIdentityToken() === null, "tras clearIdentityToken() no queda token");
  assert(emitCount === 1, "clearIdentityToken() por sí sola no emite (todavía no hay token nuevo)");
  setIdentityToken("token-segunda-cuenta");
  assert(emitCount === 2, "el primer token DESPUÉS de un logout vuelve a emitir IDENTITY_ESTABLISHED");

  console.log("\n▶ unsubscribe corta la suscripción");
  unsubscribe();
  clearIdentityToken();
  setIdentityToken("token-tercera-cuenta");
  assert(emitCount === 2, "tras unsubscribe(), nuevas emisiones ya no llegan a este listener");

  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
