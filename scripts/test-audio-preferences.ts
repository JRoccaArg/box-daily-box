/**
 * Test de las preferencias de sonido/vibración — src/lib/audioPreferences.ts
 * (Roadmap #9). Importa el módulo REAL (jsdom provee localStorage), no una
 * réplica: valida el default (desactivado), el toggle, y que sonido y
 * vibración son independientes entre sí (decisión confirmada con el usuario).
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-audio-preferences.ts
 */
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "https://box-daily-box-staging.vercel.app/",
});
(globalThis as unknown as { localStorage: Storage }).localStorage = dom.window.localStorage;

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
  const { isSoundEnabled, toggleSound, isHapticsEnabled, toggleHaptics } = await import(
    "../src/lib/audioPreferences"
  );

  console.log("═══ TEST PREFERENCIAS DE SONIDO/VIBRACIÓN (jsdom + localStorage real) ═══");

  console.log("\n▶ Valores por defecto (sin preferencia previa guardada)");
  assert(isSoundEnabled() === false, "sonido desactivado por defecto");
  assert(isHapticsEnabled() === false, "vibración desactivada por defecto");

  console.log("\n▶ toggleSound activa y desactiva, sin afectar haptics");
  assert(toggleSound() === true, "primer toggle de sonido -> true");
  assert(isSoundEnabled() === true, "queda activado");
  assert(isHapticsEnabled() === false, "haptics sigue desactivado (independiente)");
  assert(toggleSound() === false, "segundo toggle de sonido -> false");
  assert(isSoundEnabled() === false, "vuelve a desactivado");

  console.log("\n▶ toggleHaptics es independiente de sound");
  assert(toggleHaptics() === true, "primer toggle de vibración -> true");
  assert(isHapticsEnabled() === true, "queda activado");
  assert(isSoundEnabled() === false, "sonido sigue desactivado (independiente)");
  assert(toggleHaptics() === false, "segundo toggle de vibración -> false");
  assert(isHapticsEnabled() === false, "vuelve a desactivado");

  console.log("\n▶ Persistencia real en localStorage (no solo en memoria)");
  toggleSound();
  assert(
    dom.window.localStorage.getItem("bdb_sound_enabled") === "true",
    "la clave de sonido se persiste en localStorage",
  );
  toggleHaptics();
  assert(
    dom.window.localStorage.getItem("bdb_haptics_enabled") === "true",
    "la clave de vibración se persiste en localStorage",
  );

  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
