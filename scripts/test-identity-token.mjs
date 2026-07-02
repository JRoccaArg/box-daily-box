// scripts/test-identity-token.mjs
//
// Test REAL de la lógica de identity tokens (HMAC) y autorización de perfil.
// Replica exactamente la lógica de src/api/identity-token.ts y verifica que:
//  - Un token válido prueba posesión del userId correcto
//  - Un token de OTRO userId NO autoriza
//  - Un token manipulado (firma inválida) NO autoriza
//  - Basura no autoriza
//
// Ejecuta: node scripts/test-identity-token.mjs

import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_SECRET = "test-secret-123";

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

// ─── Réplica EXACTA de identity-token.ts ────────────────────────────
function signIdentityToken(userId) {
  const payload = { userId, iat: Date.now() };
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64");
  const sig = createHmac("sha256", TOKEN_SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

function verifyIdentityToken(token) {
  if (typeof token !== "string") return null;
  if (token.length < 20 || token.length > 4096) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const data = token.substring(0, dot);
  const sig = token.substring(dot + 1);
  const expected = createHmac("sha256", TOKEN_SECRET).update(data).digest("hex");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64").toString());
    if (typeof payload.userId !== "string") return null;
    return payload.userId;
  } catch {
    return null;
  }
}

function ownsIdentity(token, expectedUserId) {
  const tokenUserId = verifyIdentityToken(token);
  if (!tokenUserId) return false;
  return tokenUserId === expectedUserId;
}

const USER_A = "0e7d408b-e7cf-42d1-87eb-4a431fc2e4c6";
const USER_B = "11111111-2222-3333-4444-555555555555";

function test1_ValidToken() {
  console.log("\n▶ Test 1: token válido prueba posesión del userId correcto");
  const token = signIdentityToken(USER_A);
  assert(verifyIdentityToken(token) === USER_A, "verifyIdentityToken devuelve el userId correcto");
  assert(ownsIdentity(token, USER_A) === true, "ownsIdentity(token_A, USER_A) = true");
}

function test2_WrongUser() {
  console.log("\n▶ Test 2: token de USER_A NO autoriza modificar USER_B");
  const tokenA = signIdentityToken(USER_A);
  assert(ownsIdentity(tokenA, USER_B) === false, "ownsIdentity(token_A, USER_B) = false (ataque bloqueado)");
}

function test3_TamperedSignature() {
  console.log("\n▶ Test 3: token con firma manipulada NO autoriza");
  const token = signIdentityToken(USER_A);
  const dot = token.lastIndexOf(".");
  const data = token.substring(0, dot);
  // Cambiar la firma
  const tampered = `${data}.deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef`;
  assert(ownsIdentity(tampered, USER_A) === false, "firma inválida rechazada");
}

function test4_TamperedPayload() {
  console.log("\n▶ Test 4: token con payload cambiado (userId de otro) NO autoriza");
  // Atacante intenta: tomar la estructura pero meter USER_B en el payload
  // sin la firma correcta.
  const fakePayload = Buffer.from(JSON.stringify({ userId: USER_B, iat: Date.now() })).toString("base64");
  const tokenA = signIdentityToken(USER_A);
  const sigA = tokenA.substring(tokenA.lastIndexOf(".") + 1);
  // Pegar payload de B con firma de A
  const forged = `${fakePayload}.${sigA}`;
  assert(ownsIdentity(forged, USER_B) === false, "payload forjado con firma ajena rechazado");
}

function test5_Garbage() {
  console.log("\n▶ Test 5: basura no autoriza");
  assert(ownsIdentity(null, USER_A) === false, "null rechazado");
  assert(ownsIdentity(undefined, USER_A) === false, "undefined rechazado");
  assert(ownsIdentity("", USER_A) === false, "string vacío rechazado");
  assert(ownsIdentity("xxx", USER_A) === false, "string corto rechazado");
  assert(ownsIdentity("a".repeat(5000), USER_A) === false, "string gigante rechazado");
  assert(ownsIdentity("no-dot-here-but-long-enough-string", USER_A) === false, "sin punto rechazado");
}

(async () => {
  console.log("═══ TEST IDENTITY TOKEN (HMAC real) ═══");
  test1_ValidToken();
  test2_WrongUser();
  test3_TamperedSignature();
  test4_TamperedPayload();
  test5_Garbage();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
