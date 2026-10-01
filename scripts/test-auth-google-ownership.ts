/**
 * Test de la prueba de identidad en el login con Google (src/api/auth.ts).
 *
 * El agujero: `POST /auth/google` aceptaba un `currentUserId` cualquiera. Como
 * el userId es público (sale en el ranking), con el de otro jugador:
 *  - un Google NUEVO quedaba vinculado a esa cuenta y recibía su identityToken
 *    (toma de cuenta), y
 *  - un Google EXISTENTE le absorbía el historial y BORRABA la cuenta ajena.
 *
 * Parte A: `resolveClaimableUserId` REAL contra Postgres en memoria (PGlite).
 * Parte B: guarda de código — el handler tiene que decidir con ese helper y
 *          nunca vincular/fusionar el `currentUserId` crudo.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-auth-google-ownership.ts
 */
process.env.TOKEN_SECRET = "test-only-secret-auth-google";
process.env.ADMIN_SECRET = "test-only-secret-auth-google";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://unused/unused";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const { resolveClaimableUserId } = await import("@/api/auth");
const { signIdentityToken } = await import("@/api/identity-token");

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${msg}`);
  }
}

const db = new PGlite();
const q = async (sql: string, params?: unknown[]) =>
  (await db.query(sql, params as any[])) as { rows: unknown[] };

const VICTIMA = "11111111-1111-4111-8111-111111111111"; // existe, sin Google
const PROPIO = "22222222-2222-4222-8222-222222222222"; // existe, el cliente tiene su token
const NUEVO = "33333333-3333-4333-8333-333333333333"; // no existe todavía

console.log("═══ TEST LOGIN GOOGLE: prueba de identidad del currentUserId ═══");

await db.exec(`CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT);`);
await db.query("INSERT INTO users (id) VALUES ($1), ($2)", [VICTIMA, PROPIO]);

console.log("\n▶ Parte A: resolveClaimableUserId (real, PGlite)");

assert(
  (await resolveClaimableUserId(q, VICTIMA, undefined)) === null,
  "userId ajeno existente SIN token → se ignora (null)",
);
assert(
  (await resolveClaimableUserId(q, VICTIMA, signIdentityToken(PROPIO))) === null,
  "userId ajeno existente con el token de OTRA cuenta → se ignora (null)",
);
assert(
  (await resolveClaimableUserId(q, VICTIMA, "basura-que-no-es-un-token-valido")) === null,
  "userId ajeno existente con token malformado → se ignora (null)",
);
assert(
  (await resolveClaimableUserId(q, PROPIO, signIdentityToken(PROPIO))) === PROPIO,
  "userId existente con SU token → se acepta",
);
assert(
  (await resolveClaimableUserId(q, NUEVO, undefined)) === NUEVO,
  "userId que todavía no existe (nunca jugó) → se acepta sin token: no hay nada que proteger",
);
assert(
  (await resolveClaimableUserId(q, "anon-no-uuid", signIdentityToken("anon-no-uuid"))) === null,
  "userId con formato inválido → null",
);
assert(
  (await resolveClaimableUserId(q, undefined, undefined)) === null,
  "sin currentUserId → null",
);
assert(
  (await resolveClaimableUserId(q, 12345, undefined)) === null,
  "currentUserId que no es string → null",
);

console.log("\n▶ Parte B: el handler decide con resolveClaimableUserId");

const src = readFileSync(new URL("../src/api/auth.ts", import.meta.url), "utf8");
const handler = src.slice(
  src.indexOf("export async function googleAuthCallback"),
  src.indexOf("async function migrateAnonymousAttempts"),
);
assert(handler.length > 0, "se encontró googleAuthCallback en auth.ts");
assert(
  /resolveClaimableUserId\(/.test(handler),
  "googleAuthCallback llama a resolveClaimableUserId",
);
assert(
  /currentIdentityToken/.test(handler),
  "googleAuthCallback lee currentIdentityToken del body",
);
assert(
  !/migrateAnonymousAttempts\(\s*currentUserId/.test(handler),
  "nunca fusiona el currentUserId crudo (sin verificar)",
);
assert(
  !/userId\s*=\s*currentUserId\b/.test(handler),
  "nunca vincula el currentUserId crudo (sin verificar)",
);

const clientSrc = readFileSync(new URL("../src/lib/auth.ts", import.meta.url), "utf8");
assert(
  /currentIdentityToken:\s*getIdentityToken\(\)/.test(clientSrc),
  "el cliente manda su identityToken junto al currentUserId",
);
assert(/\bstate\b/.test(clientSrc) && /consumeOAuthState/.test(clientSrc), "el cliente usa state en el OAuth");

const callbackSrc = readFileSync(new URL("../src/pages/AuthCallback.tsx", import.meta.url), "utf8");
assert(
  /consumeOAuthState\(/.test(callbackSrc),
  "AuthCallback verifica el state antes de mandar el code",
);

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
process.exit(failed > 0 ? 1 : 0);
