/**
 * Test de contrato de la CSP en vercel.json (incidente 2026-09-05, ver
 * docs/decisiones.md).
 *
 * El síntoma que motivó esto: staging usa un backend de Railway DISTINTO al
 * de producción (`box-daily-box-staging-production...` vs
 * `box-daily-box-production...`), y la CSP de `connect-src` solo whitelisteaba
 * el de producción. El navegador bloqueaba en silencio cada fetch del
 * frontend de staging (ranking, duelos, amigos, login) sin ningún error
 * visible en pantalla — GameShell cae a modo local-first cuando una llamada
 * falla.
 *
 * El arreglo separa la CSP en dos bloques de `headers` sobre el mismo
 * `source`, discriminados por `has`/`missing` de host (mismo mecanismo que ya
 * usa el redirect de boxdailybox.com en este archivo). Este test fija ese
 * contrato para que un cambio futuro a vercel.json no lo rompa en silencio:
 *
 *   1. Los dos bloques matchean por host de forma EXCLUYENTE (mismo `value`
 *      en el `has` de uno y el `missing` del otro) — si dejaran de serlo,
 *      un mismo request podría matchear los dos a la vez, y el navegador
 *      aplicaría la INTERSECCION de ambos CSP (no la unión), rompiendo
 *      staging otra vez de forma silenciosa.
 *   2. El bloque de producción (el del `missing`) NO menciona ningún dominio
 *      de Railway que no sea el de producción — la superficie de red de
 *      producción no debe ensancharse para acomodar infraestructura interna
 *      de staging.
 *   3. El bloque de staging SÍ incluye su propio backend en `connect-src`.
 *   4. Las cabeceras de seguridad no-CSP (X-Content-Type-Options,
 *      Referrer-Policy, Permissions-Policy) están presentes en AMBOS
 *      bloques — si solo se duplicara el CSP y no el resto, un host
 *      quedaría sin esas cabeceras.
 *
 * Ejecuta: node scripts/test-vercel-csp.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vercelJson = JSON.parse(
  readFileSync(join(__dirname, "..", "vercel.json"), "utf8"),
);

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

console.log("═══ Test del contrato de CSP en vercel.json ═══");

const headerBlocks = vercelJson.headers.filter(
  (b) => b.source === "/(.*)" && (b.has || b.missing),
);
assert(headerBlocks.length === 2, `hay exactamente 2 bloques host-scoped en headers (encontrados: ${headerBlocks.length})`);

const stagingBlock = headerBlocks.find((b) => Array.isArray(b.has));
const defaultBlock = headerBlocks.find((b) => Array.isArray(b.missing));
assert(!!stagingBlock, "existe el bloque con `has` (staging)");
assert(!!defaultBlock, "existe el bloque con `missing` (por defecto / produccion)");

if (stagingBlock && defaultBlock) {
  const hasHost = stagingBlock.has.find((h) => h.type === "host")?.value;
  const missingHost = defaultBlock.missing.find((h) => h.type === "host")?.value;

  console.log("\n▶ Exclusividad: mismo host en `has` y `missing`");
  assert(!!hasHost, "el bloque `has` trae un matcher de tipo host");
  assert(!!missingHost, "el bloque `missing` trae un matcher de tipo host");
  assert(hasHost === missingHost,
    `has.host (${hasHost}) === missing.host (${missingHost}) -- si difieren, un mismo request puede matchear los dos bloques a la vez`);

  const cspOf = (block) =>
    block.headers.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
  const stagingCsp = cspOf(stagingBlock);
  const defaultCsp = cspOf(defaultBlock);

  console.log("\n▶ El bloque por defecto (produccion) no conoce infraestructura de staging");
  assert(defaultCsp.length > 0, "el bloque por defecto trae CSP");
  assert(!/staging/i.test(defaultCsp),
    "la CSP por defecto no menciona 'staging' en ningun dominio de connect-src");

  console.log("\n▶ El bloque de staging incluye su propio backend");
  assert(stagingCsp.length > 0, "el bloque de staging trae CSP");
  assert(/staging/i.test(stagingCsp),
    "la CSP de staging menciona un dominio 'staging' en connect-src");

  console.log("\n▶ Ambos bloques traen las cabeceras de seguridad no-CSP");
  for (const key of ["X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy"]) {
    assert(stagingBlock.headers.some((h) => h.key === key), `bloque de staging trae ${key}`);
    assert(defaultBlock.headers.some((h) => h.key === key), `bloque por defecto trae ${key}`);
  }

  console.log("\n▶ Ninguno de los dos bloques tiene una propiedad `//` (Vercel valida el schema estricto)");
  assert(!("//" in stagingBlock), "el bloque de staging no tiene la clave '//'");
  assert(!("//" in defaultBlock), "el bloque por defecto no tiene la clave '//'");
}

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} asserts OK, ${failed} fallos`);
process.exit(failed === 0 ? 0 : 1);
