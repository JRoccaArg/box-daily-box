// scripts/test-game-registry.mjs
//
// Test de COMPLETITUD del registro de juegos. Un juego nuevo debe aparecer
// en 6 listas distintas (frontend + 5 backend); si falta en una, ese juego
// queda roto de forma silenciosa y dificil de diagnosticar (ej: no se puede
// jugar, no se puede importar al loguearse, o se rechaza en start/finish).
// Este test lee los archivos como texto y compara los sets de ids — asi
// falla `npm test` si alguien agrega un juego al registry.ts sin propagarlo
// a todas las listas backend.
//
// Ejecuta: node scripts/test-game-registry.mjs

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

function read(relPath) {
  return readFileSync(join(root, relPath), "utf-8");
}

// ─── Extraer el set de ids "canonico" desde el registry del frontend ───
const registrySrc = read("src/components/games/registry.ts");
// Cada entrada del array GAMES tiene una linea `id: "slug",`.
const registryIds = [...registrySrc.matchAll(/id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);

if (registryIds.length === 0) {
  console.log("  ❌ FALLO: no se pudo extraer ningun id de registry.ts (regex rota?)");
  process.exit(1);
}

console.log(`\n▶ Juegos encontrados en registry.ts: ${registryIds.join(", ")}\n`);

// ─── Listas a validar: [nombre, archivo, regex de extraccion] ───
const routesSrc = read("src/api/routes.ts");
const verifySrc = read("src/api/verify.ts");
const authSrc = read("src/api/auth.ts");

function idsFromArrayLiteral(src, varName) {
  // const VALID_GAMES = ["a", "b", ...]; o new Set(["a", "b", ...])
  const re = new RegExp(`${varName}\\s*=\\s*(?:new Set\\()?\\[([^\\]]*)\\]`, "s");
  const match = src.match(re);
  if (!match) return null;
  return [...match[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

function idsFromObjectKeys(src, varName) {
  // const XYZ: Record<...> = { "a": ..., "b": ... };
  const re = new RegExp(`${varName}[^={]*=\\s*\\{([^}]*)\\}`, "s");
  const match = src.match(re);
  if (!match) return null;
  return [...match[1].matchAll(/"([a-z0-9-]+)"\s*:/g)].map((m) => m[1]);
}

function idsFromSwitchCases(src, fnName) {
  const fnStart = src.indexOf(`function ${fnName}`);
  if (fnStart === -1) return null;
  // Cortar hasta el cierre de la funcion (heuristica: hasta la proxima "// ───" o el default).
  const slice = src.slice(fnStart, fnStart + 3000);
  return [...slice.matchAll(/case\s+"([a-z0-9-]+)"\s*:/g)].map((m) => m[1]);
}

const lists = [
  { name: "VALID_GAMES (routes.ts)", ids: idsFromArrayLiteral(routesSrc, "VALID_GAMES") },
  { name: "GAME_TIME_OPTIONS (routes.ts)", ids: idsFromObjectKeys(routesSrc, "GAME_TIME_OPTIONS") },
  { name: "TIME_LIMITS (routes.ts)", ids: idsFromObjectKeys(routesSrc, "TIME_LIMITS") },
  { name: "verifyChallenge switch (verify.ts)", ids: idsFromSwitchCases(verifySrc, "verifyChallenge") },
  { name: "VALID_GAME_IDS (auth.ts)", ids: idsFromArrayLiteral(authSrc, "VALID_GAME_IDS") },
  { name: "IMPORT_TIME_LIMITS (auth.ts)", ids: idsFromObjectKeys(authSrc, "IMPORT_TIME_LIMITS") },
];

console.log("▶ Completitud: cada juego del registry debe estar en las 6 listas backend\n");

for (const { name, ids } of lists) {
  assert(ids !== null, `${name}: se pudo extraer la lista (regex encontro la variable)`);
  if (ids === null) continue;

  for (const gameId of registryIds) {
    assert(ids.includes(gameId), `${name}: incluye "${gameId}"`);
  }

  // Tambien detectar entradas HUERFANAS (en la lista backend pero no en el registry:
  // juego eliminado del frontend pero olvidado en el backend). Es una advertencia,
  // no un fallo — no rompe funcionalidad, solo indica limpieza pendiente.
  const orphans = ids.filter((id) => !registryIds.includes(id));
  if (orphans.length > 0) {
    console.log(`  ⚠️  ${name}: ids sin juego correspondiente en registry.ts: ${orphans.join(", ")}`);
  }
}

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
process.exit(failed > 0 ? 1 : 0);
