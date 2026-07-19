// scripts/test-ranked-by-ip.mjs
//
// Valida la regla CORRECTA de IP:
//  - Todas las cuentas pueden JUGAR desde la misma IP.
//  - En el ranking, solo la PRIMERA cuenta por (juego + IP + día) cuenta.
//  - Hasta 4 cuentas pueden rankear desde una IP (una por cada juego distinto).
//  - Los attempts no-rankeables se guardan igual (historial) pero se excluyen
//    del ranking y de la posición global.

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}
async function q(sql, params) { return db.query(sql, params); }

const TODAY = "2026-07-02";
const IP1 = "190.1.1.1";
const IP2 = "190.2.2.2";
const A = "aaaaaaaa-0000-0000-0000-000000000001";
const B = "bbbbbbbb-0000-0000-0000-000000000002";
const C = "cccccccc-0000-0000-0000-000000000003";

async function setup() {
  await q(`CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT, country_code TEXT);`);
  await q(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT, game_id TEXT NOT NULL,
    date_key DATE NOT NULL, difficulty TEXT NOT NULL, won BOOLEAN NOT NULL,
    time_seconds INTEGER, points INTEGER NOT NULL, flagged BOOLEAN DEFAULT false,
    ranked BOOLEAN DEFAULT true, ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, game_id, date_key));`);
  await q("INSERT INTO users (id, display_name) VALUES ($1,'A'),($2,'B'),($3,'C')", [A, B, C]);
}
async function reset() { await q("DELETE FROM attempts"); }

// Réplica del cálculo de ranked en startChallenge
async function computeRanked(uid, gameId, ip, today) {
  const ipAttempt = await q(
    `SELECT 1 FROM attempts WHERE ip_address = $1 AND game_id = $2 AND date_key = $3::date
     AND user_id != $4 AND ranked LIMIT 1`,
    [ip, gameId, today, uid],
  );
  return ipAttempt.rows.length === 0;
}

// Simula jugar un juego (calcula ranked + inserta)
async function play(uid, gameId, ip, won = true, points = 100) {
  const ranked = await computeRanked(uid, gameId, ip, TODAY);
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ranked, ip_address)
     VALUES ($1, $2, $3::date, 'medio', $4, 60, $5, $6, $7)`,
    [uid, gameId, TODAY, won, points, ranked, ip],
  );
  return ranked;
}

// Réplica de getUserRank (con filtro ranked).
// Nuevo criterio: aparece en el ranking si tiene ≥1 intento rankeable
// (ganado o perdido). Solo se excluye si NO tiene ningún intento rankeable.
async function getUserRank(userId, dateKey) {
  const up = await q(
    `SELECT COALESCE(SUM(points),0) as points, COUNT(*) as attempts FROM attempts
     WHERE user_id=$1 AND date_key=$2::date AND NOT flagged AND ranked`,
    [userId, dateKey]);
  const userPoints = Number(up.rows[0].points);
  const userAttempts = Number(up.rows[0].attempts);
  if (userAttempts === 0) return { rank: null, points: 0, totalPlayers: 0 };
  const ahead = await q(
    `SELECT COUNT(*) as ahead FROM (
       SELECT user_id, SUM(points) as total FROM attempts
       WHERE date_key=$1::date AND NOT flagged AND ranked
       GROUP BY user_id HAVING SUM(points) > $2) t`,
    [dateKey, userPoints]);
  const total = await q(
    `SELECT COUNT(DISTINCT user_id) as total FROM attempts
     WHERE date_key=$1::date AND NOT flagged AND ranked`, [dateKey]);
  return { rank: Number(ahead.rows[0].ahead) + 1, points: userPoints, totalPlayers: Number(total.rows[0].total) };
}

// ═══════════════════════════════════════════════════════════════════

async function test1_FirstRanksSecondDoesnt() {
  console.log("\n▶ Test 1: A juega PitTexto primero (rankea), B después (NO rankea)");
  await reset();
  const aRanked = await play(A, "pittexto", IP1);
  const bRanked = await play(B, "pittexto", IP1);
  assert(aRanked === true, "A rankea (primera en jugar PitTexto en IP1)");
  assert(bRanked === false, "B NO rankea (A ya jugó PitTexto en IP1)");

  // Ambos attempts existen (se guardan igual)
  const all = await q("SELECT user_id, ranked FROM attempts WHERE game_id='pittexto' ORDER BY user_id");
  assert(all.rows.length === 2, "ambos attempts guardados (los dos jugaron)");
}

async function test2_UpToFourAccountsRank() {
  console.log("\n▶ Test 2: hasta 4 cuentas rankean desde 1 IP (una por juego)");
  await reset();
  // A es primera en PitTexto, B en PoleWordle, C en El Intruso
  const a = await play(A, "pittexto", IP1);
  const b = await play(B, "polewordle", IP1);
  const c = await play(C, "el-intruso", IP1);
  assert(a && b && c, "A, B y C rankean (cada uno primero en un juego distinto)");

  // Ahora B intenta PitTexto (A ya rankeó) → B NO rankea en PitTexto
  const bPit = await play(B, "pittexto", IP1);
  assert(bPit === false, "B no rankea PitTexto (A fue primero)");
}

async function test3_NonRankedExcludedFromRank() {
  console.log("\n▶ Test 3: attempts no-rankeables se excluyen de la posición");
  await reset();
  // A juega PitTexto (rankea, 100 pts)
  await play(A, "pittexto", IP1, true, 100);
  // B juega PitTexto (NO rankea, aunque haga 500 pts)
  await play(B, "pittexto", IP1, true, 500);

  const rankA = await getUserRank(A, TODAY);
  const rankB = await getUserRank(B, TODAY);

  assert(rankA.rank === 1, "A rankea en puesto #1");
  assert(rankA.points === 100, "A tiene 100 pts rankeables");
  assert(rankB.rank === null, "B NO rankea (rank null) pese a tener 500 pts locales");
  assert(rankB.points === 0, "B tiene 0 pts rankeables");
  assert(rankA.totalPlayers === 1, "solo 1 jugador rankeado (A)");
}

async function test4_DifferentIpBothRank() {
  console.log("\n▶ Test 4: misma cuenta-juego desde IPs distintas, ambas rankean");
  await reset();
  const a = await play(A, "pittexto", IP1, true, 100);
  const b = await play(B, "pittexto", IP2, true, 200); // otra IP
  assert(a === true, "A rankea desde IP1");
  assert(b === true, "B rankea desde IP2 (IP distinta, no hay conflicto)");

  const rankB = await getUserRank(B, TODAY);
  assert(rankB.rank === 1, "B es #1 (200 pts)");
  const rankA = await getUserRank(A, TODAY);
  assert(rankA.rank === 2, "A es #2 (100 pts)");
}

async function test5_PersonalHistoryKeepsNonRanked() {
  console.log("\n▶ Test 5: el historial personal incluye los no-rankeables");
  await reset();
  await play(A, "pittexto", IP1, true, 100);
  await play(B, "pittexto", IP1, true, 500); // B no rankea

  // El historial de B (todos sus attempts, sin filtro ranked) debe incluir PitTexto
  const bHistory = await q("SELECT game_id, won, points, ranked FROM attempts WHERE user_id=$1", [B]);
  assert(bHistory.rows.length === 1, "B tiene el attempt en su historial");
  assert(bHistory.rows[0].won === true, "B ganó (queda registrado, no puede volver a jugar)");
  assert(bHistory.rows[0].ranked === false, "pero marcado como no-rankeable");
}

(async () => {
  console.log("═══ TEST REGLA RANKED POR IP ═══");
  await setup();
  await test1_FirstRanksSecondDoesnt();
  await test2_UpToFourAccountsRank();
  await test3_NonRankedExcludedFromRank();
  await test4_DifferentIpBothRank();
  await test5_PersonalHistoryKeepsNonRanked();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
