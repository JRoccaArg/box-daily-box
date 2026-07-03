// scripts/test-finish-blocked.mjs
//
// Valida FIX 1 (guardar perdidos/abandonos) y FIX 2 (bloqueo IP).
//
// FIX 1: finishChallenge sin solution → registra perdido (won=false, 0 pts)
// FIX 2: startChallenge bloquea si otra cuenta ya jugó desde la IP hoy

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}
async function q(sql, params) { return db.query(sql, params); }

const TODAY = "2026-07-02";
const USER_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const IP = "200.100.50.25";

async function setup() {
  await q(`CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT);`);
  await q(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT, game_id TEXT NOT NULL,
    date_key DATE NOT NULL, difficulty TEXT NOT NULL, won BOOLEAN NOT NULL,
    time_seconds INTEGER, points INTEGER NOT NULL, flagged BOOLEAN DEFAULT false,
    ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, game_id, date_key));`);
  await q(`CREATE TABLE sessions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, game_id TEXT NOT NULL,
    difficulty TEXT NOT NULL, date_key DATE NOT NULL, started_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL, consumed BOOLEAN DEFAULT false, ip_address TEXT);`);
  await q("INSERT INTO users (id) VALUES ($1), ($2)", [USER_A, USER_B]);
}
async function reset() {
  await q("DELETE FROM attempts");
  await q("DELETE FROM sessions");
}

// ─── FIX 2: réplica del bloqueo IP de startChallenge ────────────────
async function checkIpBlock(uid, ip, today) {
  const ipCheck = await q(
    `SELECT user_id FROM attempts WHERE ip_address = $1 AND date_key = $2::date AND user_id != $3 LIMIT 1`,
    [ip, today, uid],
  );
  if (ipCheck.rows.length > 0) return { blocked: true };

  const sessionCheck = await q(
    `SELECT user_id FROM sessions WHERE ip_address = $1 AND date_key = $2::date
     AND user_id != $3 AND NOT consumed AND expires_at > $4 LIMIT 1`,
    [ip, today, uid, Date.now()],
  );
  if (sessionCheck.rows.length > 0) return { blocked: true };
  return { blocked: false };
}

// ─── FIX 1: réplica de finishChallenge (parte de guardado) ──────────
function fakeComputeScore({ won }) { return won ? 100 : 0; }

async function finishChallenge(uid, gameId, difficulty, solution, ip, today) {
  const isAbandon = solution === null || solution === undefined;
  // verifyResult: si abandono → perdido; si no, "gana" si solution.correct
  const won = isAbandon ? false : (solution.correct === true);
  const points = fakeComputeScore({ won });
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ip_address)
     VALUES ($1, $2, $3::date, $4, $5, 60, $6, $7)`,
    [uid, gameId, today, difficulty, won, points, ip],
  );
  return { won, points };
}

// ═══════════════════════════════════════════════════════════════════

async function test1_AbandonSaved() {
  console.log("\n▶ Test 1 (FIX 1): finish sin solution → perdido guardado en server");
  await reset();
  const res = await finishChallenge(USER_A, "polewordle", "medio", null, IP, TODAY);
  assert(res.won === false, "resultado es perdido");
  assert(res.points === 0, "0 puntos");

  const row = await q("SELECT won FROM attempts WHERE user_id = $1 AND game_id = 'polewordle'", [USER_A]);
  assert(row.rows.length === 1, "el attempt perdido SÍ quedó en el server");
  assert(row.rows[0].won === false, "guardado como perdido");
}

async function test2_WonSaved() {
  console.log("\n▶ Test 2 (FIX 1): finish con solution ganadora → guardado con puntos");
  await reset();
  const res = await finishChallenge(USER_A, "pittexto", "medio", { correct: true }, IP, TODAY);
  assert(res.won === true, "ganó");
  assert(res.points === 100, "100 puntos");
}

async function test3_IpBlockAfterAttempt() {
  console.log("\n▶ Test 3 (FIX 2): USER_A jugó desde IP → USER_B bloqueado desde misma IP");
  await reset();
  // USER_A registra un attempt desde la IP
  await finishChallenge(USER_A, "pittexto", "medio", { correct: true }, IP, TODAY);

  // USER_B intenta empezar desde la misma IP
  const check = await checkIpBlock(USER_B, IP, TODAY);
  assert(check.blocked === true, "USER_B bloqueado (USER_A ya jugó desde esta IP)");
}

async function test4_SameUserNotBlocked() {
  console.log("\n▶ Test 4 (FIX 2): el MISMO usuario no se bloquea a sí mismo");
  await reset();
  await finishChallenge(USER_A, "pittexto", "medio", { correct: true }, IP, TODAY);

  // USER_A intenta empezar OTRO juego desde la misma IP → NO bloqueado
  const check = await checkIpBlock(USER_A, IP, TODAY);
  assert(check.blocked === false, "USER_A puede jugar otro juego desde su propia IP");
}

async function test5_DifferentIpNotBlocked() {
  console.log("\n▶ Test 5 (FIX 2): distinta IP no se bloquea");
  await reset();
  await finishChallenge(USER_A, "pittexto", "medio", { correct: true }, IP, TODAY);

  const check = await checkIpBlock(USER_B, "10.0.0.1", TODAY);
  assert(check.blocked === false, "USER_B desde otra IP puede jugar");
}

async function test6_BlockedBySession() {
  console.log("\n▶ Test 6 (FIX 2): sesión activa de otro usuario también bloquea");
  await reset();
  // USER_A tiene una sesión activa (empezó pero no terminó)
  await q(
    `INSERT INTO sessions (id, user_id, game_id, difficulty, date_key, started_at, expires_at, ip_address)
     VALUES ('s1', $1, 'pittexto', 'medio', $2::date, 0, $3, $4)`,
    [USER_A, TODAY, Date.now() + 900000, IP],
  );

  const check = await checkIpBlock(USER_B, IP, TODAY);
  assert(check.blocked === true, "USER_B bloqueado por sesión activa de USER_A");
}

(async () => {
  console.log("═══ TEST FIX 1 (guardar perdidos) + FIX 2 (bloqueo IP) ═══");
  await setup();
  await test1_AbandonSaved();
  await test2_WonSaved();
  await test3_IpBlockAfterAttempt();
  await test4_SameUserNotBlocked();
  await test5_DifferentIpNotBlocked();
  await test6_BlockedBySession();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
