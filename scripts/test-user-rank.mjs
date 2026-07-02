// scripts/test-user-rank.mjs
//
// Test REAL del cálculo de posición del usuario en el ranking diario global.
// Valida las reglas de negocio:
//  - Sin puntos ganados → rank = null
//  - Con puntos → posición correcta según cuántos usuarios tienen más
//  - Attempts perdidos o flagged NO cuentan
//  - Empates: mismo puntaje = mismo rank (según implementación: STRICTLY greater)

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}
async function q(sql, params) { return db.query(sql, params); }

const TODAY = "2026-07-01";

async function setup() {
  await q(`CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT, country_code TEXT);`);
  await q(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    date_key DATE NOT NULL,
    difficulty TEXT NOT NULL,
    won BOOLEAN NOT NULL,
    time_seconds INTEGER,
    points INTEGER NOT NULL,
    flagged BOOLEAN DEFAULT false,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, game_id, date_key));`);
}

async function insertUser(id, name = "U") {
  await q("INSERT INTO users (id, display_name) VALUES ($1, $2)", [id, name]);
}

async function insertAttempt(userId, gameId, points, won = true, flagged = false) {
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ip_address)
     VALUES ($1, $2, $3, 'medio', $4, 60, $5, $6, '1.1.1.1')`,
    [userId, gameId, TODAY, won, points, flagged],
  );
}

async function reset() {
  await q("DELETE FROM attempts");
  await q("DELETE FROM users");
}

// ─── Réplica de getUserRank (backend) ───────────────────────────────
async function getUserRank(userId, dateKey) {
  // 1. Puntos del usuario ese día
  const userRow = await q(
    `SELECT COALESCE(SUM(points), 0) as points
     FROM attempts
     WHERE user_id = $1 AND date_key = $2::date AND won AND NOT flagged`,
    [userId, dateKey],
  );
  const userPoints = Number(userRow.rows[0]?.points ?? 0);

  if (userPoints === 0) {
    return { rank: null, points: 0, totalPlayers: 0 };
  }

  // 2. Cuántos usuarios distintos tienen MÁS puntos
  const aheadRow = await q(
    `SELECT COUNT(*) as ahead FROM (
       SELECT user_id, SUM(points) as total
       FROM attempts
       WHERE date_key = $1::date AND won AND NOT flagged
       GROUP BY user_id
       HAVING SUM(points) > $2
     ) t`,
    [dateKey, userPoints],
  );
  const rank = Number(aheadRow.rows[0]?.ahead ?? 0) + 1;

  // 3. Total de jugadores rankeados
  const totalRow = await q(
    `SELECT COUNT(DISTINCT user_id) as total
     FROM attempts
     WHERE date_key = $1::date AND won AND NOT flagged`,
    [dateKey],
  );
  const totalPlayers = Number(totalRow.rows[0]?.total ?? 0);

  return { rank, points: userPoints, totalPlayers };
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

async function test1_NoPointsNoRank() {
  console.log("\n▶ Test 1: usuario sin attempts ganados → rank null");
  await reset();
  await insertUser("u1", "Nadie");
  const r = await getUserRank("u1", TODAY);
  assert(r.rank === null, "rank es null cuando no jugó");
  assert(r.points === 0, "puntos = 0");
  assert(r.totalPlayers === 0, "totalPlayers = 0 (nadie jugó todavía)");
}

async function test2_OnlyPlayerFirstPlace() {
  console.log("\n▶ Test 2: único jugador → puesto #1");
  await reset();
  await insertUser("u1");
  await insertAttempt("u1", "pittexto", 100);
  const r = await getUserRank("u1", TODAY);
  assert(r.rank === 1, "único jugador con puntos → #1");
  assert(r.points === 100, "puntos correctos");
  assert(r.totalPlayers === 1, "total = 1");
}

async function test3_ThreePlayersRanked() {
  console.log("\n▶ Test 3: 3 jugadores con distintos puntos → posiciones correctas");
  await reset();
  await insertUser("u1"); await insertAttempt("u1", "pittexto", 100);
  await insertUser("u2"); await insertAttempt("u2", "pittexto", 300);
  await insertUser("u3"); await insertAttempt("u3", "pittexto", 200);

  const r1 = await getUserRank("u1", TODAY);
  const r2 = await getUserRank("u2", TODAY);
  const r3 = await getUserRank("u3", TODAY);

  assert(r2.rank === 1, "u2 (300 pts) es #1");
  assert(r3.rank === 2, "u3 (200 pts) es #2");
  assert(r1.rank === 3, "u1 (100 pts) es #3");
  assert(r1.totalPlayers === 3 && r2.totalPlayers === 3 && r3.totalPlayers === 3, "total = 3 para todos");
}

async function test4_LostAttemptsDontCount() {
  console.log("\n▶ Test 4: attempts perdidos no cuentan");
  await reset();
  await insertUser("u1");
  await insertAttempt("u1", "pittexto", 100, false); // perdido
  const r = await getUserRank("u1", TODAY);
  assert(r.rank === null, "attempt perdido no rankea");
}

async function test5_FlaggedAttemptsDontCount() {
  console.log("\n▶ Test 5: attempts flagged (sospechosos) no cuentan");
  await reset();
  await insertUser("u1");
  await insertAttempt("u1", "pittexto", 500, true, true); // flagged
  const r = await getUserRank("u1", TODAY);
  assert(r.rank === null, "attempt flagged no rankea");
}

async function test6_TiedPlayers() {
  console.log("\n▶ Test 6: empate en puntos → mismo rank");
  await reset();
  await insertUser("u1"); await insertAttempt("u1", "pittexto", 200);
  await insertUser("u2"); await insertAttempt("u2", "pittexto", 200);
  await insertUser("u3"); await insertAttempt("u3", "pittexto", 100);

  const r1 = await getUserRank("u1", TODAY);
  const r2 = await getUserRank("u2", TODAY);
  const r3 = await getUserRank("u3", TODAY);

  // Con la implementación "cuántos tienen MÁS puntos + 1":
  // u1 y u2 tienen 200 → 0 tienen más → rank 1 (empate)
  // u3 tiene 100 → 2 tienen más (u1, u2) → rank 3
  assert(r1.rank === 1, "u1 empatado en 200 pts → #1");
  assert(r2.rank === 1, "u2 empatado en 200 pts → #1 (mismo puesto)");
  assert(r3.rank === 3, "u3 con 100 pts → #3 (saltea el #2 por empate)");
}

async function test7_MultipleGamesSameUser() {
  console.log("\n▶ Test 7: mismo usuario suma puntos de varios juegos");
  await reset();
  await insertUser("u1");
  await insertAttempt("u1", "pittexto", 50);
  await insertAttempt("u1", "polewordle", 80);
  await insertAttempt("u1", "el-intruso", 70);

  await insertUser("u2");
  await insertAttempt("u2", "pittexto", 100);
  await insertAttempt("u2", "polewordle", 90);

  const r1 = await getUserRank("u1", TODAY);
  const r2 = await getUserRank("u2", TODAY);
  assert(r1.points === 200, "u1 suma 50+80+70 = 200");
  assert(r2.points === 190, "u2 suma 100+90 = 190");
  assert(r1.rank === 1, "u1 (200) es #1");
  assert(r2.rank === 2, "u2 (190) es #2");
}

async function test8_OtherDayDoesntInterfere() {
  console.log("\n▶ Test 8: attempts de otras fechas no cuentan");
  await reset();
  await insertUser("u1"); await insertAttempt("u1", "pittexto", 100);
  await insertUser("u2");
  // u2 jugó ayer
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ip_address)
     VALUES ($1, 'pittexto', '2026-06-30', 'medio', true, 60, 999, false, '1.1.1.1')`,
    ["u2"],
  );

  const r1 = await getUserRank("u1", TODAY);
  assert(r1.rank === 1, "u1 es #1 hoy (u2 jugó ayer, no cuenta)");
  assert(r1.totalPlayers === 1, "solo 1 jugador hoy");
}

(async () => {
  console.log("═══ TEST getUserRank (PGlite real) ═══");
  await setup();
  await test1_NoPointsNoRank();
  await test2_OnlyPlayerFirstPlace();
  await test3_ThreePlayersRanked();
  await test4_LostAttemptsDontCount();
  await test5_FlaggedAttemptsDontCount();
  await test6_TiedPlayers();
  await test7_MultipleGamesSameUser();
  await test8_OtherDayDoesntInterfere();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
