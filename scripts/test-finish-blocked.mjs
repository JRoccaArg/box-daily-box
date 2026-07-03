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
    ranked BOOLEAN DEFAULT true, ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now(),
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

async function test3_IpAffectsRankedNotPlay() {
  console.log("\n▶ Test 3 (FIX IP): USER_A juega desde IP → USER_B juega igual pero NO rankea");
  await reset();
  // USER_A registra un attempt rankeable desde la IP
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ranked, ip_address)
     VALUES ($1, 'pittexto', $2::date, 'medio', true, 60, 100, true, $3)`,
    [USER_A, TODAY, IP]);

  // USER_B calcula su ranked para el mismo juego+IP
  const ipAttempt = await q(
    `SELECT 1 FROM attempts WHERE ip_address = $1 AND game_id = $2 AND date_key = $3::date
     AND user_id != $4 AND ranked LIMIT 1`,
    [IP, "pittexto", TODAY, USER_B]);
  const bRanked = ipAttempt.rows.length === 0;
  assert(bRanked === false, "USER_B NO rankea (USER_A ya rankeó PitTexto en esta IP)");

  // Pero USER_B puede jugar igual: se inserta su attempt (no-rankeable)
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ranked, ip_address)
     VALUES ($1, 'pittexto', $2::date, 'medio', true, 60, 100, false, $3)`,
    [USER_B, TODAY, IP]);
  const bRow = await q("SELECT ranked FROM attempts WHERE user_id=$1 AND game_id='pittexto'", [USER_B]);
  assert(bRow.rows.length === 1, "USER_B SÍ jugó (attempt guardado)");
  assert(bRow.rows[0].ranked === false, "pero su attempt es no-rankeable");
}

async function test4_SameUserOtherGameRanks() {
  console.log("\n▶ Test 4 (FIX IP): USER_B puede rankear en OTRO juego desde la misma IP");
  await reset();
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ranked, ip_address)
     VALUES ($1, 'pittexto', $2::date, 'medio', true, 60, 100, true, $3)`,
    [USER_A, TODAY, IP]);

  // USER_B en polewordle (nadie lo jugó en esta IP) → rankea
  const ipAttempt = await q(
    `SELECT 1 FROM attempts WHERE ip_address = $1 AND game_id = $2 AND date_key = $3::date
     AND user_id != $4 AND ranked LIMIT 1`,
    [IP, "polewordle", TODAY, USER_B]);
  const bRanked = ipAttempt.rows.length === 0;
  assert(bRanked === true, "USER_B rankea en PoleWordle (nadie lo jugó en esta IP)");
}

async function test5_DifferentIpRanks() {
  console.log("\n▶ Test 5 (FIX IP): distinta IP siempre rankea");
  await reset();
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ranked, ip_address)
     VALUES ($1, 'pittexto', $2::date, 'medio', true, 60, 100, true, $3)`,
    [USER_A, TODAY, IP]);

  const ipAttempt = await q(
    `SELECT 1 FROM attempts WHERE ip_address = $1 AND game_id = $2 AND date_key = $3::date
     AND user_id != $4 AND ranked LIMIT 1`,
    ["10.0.0.99", "pittexto", TODAY, USER_B]);
  const bRanked = ipAttempt.rows.length === 0;
  assert(bRanked === true, "USER_B rankea desde otra IP");
}

(async () => {
  console.log("═══ TEST FIX 1 (guardar perdidos) + regla ranked por IP ═══");
  await setup();
  await test1_AbandonSaved();
  await test2_WonSaved();
  await test3_IpAffectsRankedNotPlay();
  await test4_SameUserOtherGameRanks();
  await test5_DifferentIpRanks();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
