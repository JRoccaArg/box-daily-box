// scripts/test-session-token.mjs
//
// Test REAL de la forja del sessionToken (HMAC-SHA256) que protege
// /challenges/:gameId/start y /finish. Replica EXACTAMENTE signToken/
// verifyToken de src/api/routes.ts (funciones privadas del módulo, no
// exportadas — mismo patrón que test-identity-token.mjs para identity-token).
//
// Qué protege este token: el cliente NO puede modificar `ranked` (si el
// intento entra al ranking global) ni `timeLimit` (usado para el
// multiplicador de riesgo del puntaje) sin invalidar la firma, porque ambos
// viajan DENTRO del payload firmado, generado enteramente por el servidor en
// /start.
//
// Ejecuta: node scripts/test-session-token.mjs

import { createHmac, timingSafeEqual, randomUUID } from "crypto";

const TOKEN_SECRET = "test-secret-session-123";

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

// ─── Réplica EXACTA de signToken/verifyToken (src/api/routes.ts) ────
function signToken(payload, secret = TOKEN_SECRET) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64");
  const sig = createHmac("sha256", secret).update(data).digest("hex");
  return `${data}.${sig}`;
}

function verifyToken(token, secret = TOKEN_SECRET) {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const data = token.substring(0, dot);
  const sig = token.substring(dot + 1);
  const expected = createHmac("sha256", secret).update(data).digest("hex");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64").toString());
  } catch {
    return null;
  }
}

function basePayload(overrides = {}) {
  return {
    sessionId: randomUUID(),
    uid: "anon-aaaaaaaa-0000-0000-0000-000000000001",
    gameId: "pittexto",
    difficulty: "medio",
    today: "2026-07-06",
    startedAt: Date.now(),
    timeLimit: 180,
    ranked: true,
    ...overrides,
  };
}

function test1_ValidRoundTrip() {
  console.log("\n▶ Test 1: token válido se firma y verifica correctamente");
  const payload = basePayload();
  const token = signToken(payload);
  const decoded = verifyToken(token);
  assert(decoded !== null, "el token válido decodifica");
  assert(decoded.ranked === true, "ranked viaja intacto");
  assert(decoded.timeLimit === 180, "timeLimit viaja intacto");
  assert(decoded.gameId === "pittexto", "gameId viaja intacto");
}

function test2_TamperRanked() {
  console.log("\n▶ Test 2: forjar ranked=false→true (colarse en el ranking) invalida la firma");
  const payload = basePayload({ ranked: false });
  const token = signToken(payload);
  const dot = token.lastIndexOf(".");
  const data = token.substring(0, dot);
  const sig = token.substring(dot + 1);

  // Atacante decodifica, cambia ranked a true, re-codifica el payload, pero
  // NO puede recalcular la firma correcta sin conocer TOKEN_SECRET.
  const decodedPayload = JSON.parse(Buffer.from(data, "base64").toString());
  decodedPayload.ranked = true;
  const forgedData = Buffer.from(JSON.stringify(decodedPayload)).toString("base64");
  const forgedToken = `${forgedData}.${sig}`; // firma vieja, payload nuevo

  assert(verifyToken(forgedToken) === null, "ranked forjado (false→true) es rechazado");
}

function test3_TamperTimeLimit() {
  console.log("\n▶ Test 3: inflar timeLimit (para inflar el multiplicador de riesgo) invalida la firma");
  const payload = basePayload({ timeLimit: 60 });
  const token = signToken(payload);
  const dot = token.lastIndexOf(".");
  const sig = token.substring(dot + 1);

  const decodedPayload = JSON.parse(Buffer.from(token.substring(0, dot), "base64").toString());
  decodedPayload.timeLimit = 999; // atacante quiere un multiplicador de riesgo gigante
  const forgedData = Buffer.from(JSON.stringify(decodedPayload)).toString("base64");
  const forgedToken = `${forgedData}.${sig}`;

  assert(verifyToken(forgedToken) === null, "timeLimit inflado es rechazado");
}

function test4_SignatureSubstitution() {
  console.log("\n▶ Test 4: pegar la firma de OTRO token válido (distinto payload) es rechazado");
  const tokenA = signToken(basePayload({ ranked: true, timeLimit: 90 }));
  const tokenB = signToken(basePayload({ ranked: false, timeLimit: 180 }));
  const dataA = tokenA.substring(0, tokenA.lastIndexOf("."));
  const sigB = tokenB.substring(tokenB.lastIndexOf(".") + 1);
  const forged = `${dataA}.${sigB}`;

  assert(verifyToken(forged) === null, "payload de A + firma de B es rechazado");
}

function test5_WrongSecret() {
  console.log("\n▶ Test 5: token firmado con OTRO secreto no valida contra el secreto real");
  const token = signToken(basePayload(), "otro-secreto-distinto");
  assert(verifyToken(token, TOKEN_SECRET) === null, "token de un TOKEN_SECRET distinto se rechaza");
}

function test6_Garbage() {
  console.log("\n▶ Test 6: tokens malformados no revientan y se rechazan");
  assert(verifyToken("") === null, "string vacío rechazado");
  assert(verifyToken("sin-punto-ni-firma") === null, "sin punto rechazado");
  assert(verifyToken("a.b") === null, "firma demasiado corta rechazada");
  assert(verifyToken(`${Buffer.from("no-es-json").toString("base64")}.deadbeef`) === null, "payload no-JSON rechazado");
}

(async () => {
  console.log("═══ TEST SESSION TOKEN (HMAC real, réplica de src/api/routes.ts) ═══");
  test1_ValidRoundTrip();
  test2_TamperRanked();
  test3_TamperTimeLimit();
  test4_SignatureSubstitution();
  test5_WrongSecret();
  test6_Garbage();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
