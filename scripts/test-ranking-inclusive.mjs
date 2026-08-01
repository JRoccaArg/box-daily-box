// scripts/test-ranking-inclusive.mjs
//
// Test REAL del ranking global INCLUSIVO (getRankingDaily/getRankingMonthly).
// Valida las reglas de negocio del cambio (Roadmap #2):
//  - Un usuario que PERDIÓ (won=false, ranked=true, NOT flagged) aparece en el
//    ranking con 0 puntos, en vez de quedar excluido.
//  - attempts flagged o no-rankeados (ranked=false) siguen SIN aparecer.
//  - "gamesWon" cuenta SOLO attempts ganados, aunque el usuario tenga además
//    attempts perdidos (no se cuentan como "juegos ganados").
//  - Los ganadores siguen ordenados antes que los perdedores (ORDER BY points DESC).
//  - La regla de IP (solo la primera cuenta rankea por juego) sigue intacta.

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}
async function q(sql, params) { return db.query(sql, params); }

const TODAY = "2026-07-31";
const MONTH_START = "2026-07-01";

async function setup() {
  await q(`CREATE TABLE users (
    id TEXT PRIMARY KEY, display_name TEXT, country_code TEXT,
    role TEXT NOT NULL DEFAULT 'user', featured_badges JSONB
  );`);
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
    ranked BOOLEAN DEFAULT true,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now());`);
}

async function insertUser(id, name = "U") {
  await q(
    "INSERT INTO users (id, display_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
    [id, name],
  );
}

async function insertAttempt(
  userId,
  gameId,
  dateKey,
  points,
  { won = true, flagged = false, ranked = true } = {},
) {
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ranked, ip_address)
     VALUES ($1, $2, $3, 'medio', $4, 60, $5, $6, $7, '1.1.1.1')`,
    [userId, gameId, dateKey, won, points, flagged, ranked],
  );
}

async function reset() {
  await q("DELETE FROM attempts");
  await q("DELETE FROM users");
}

// ─── Réplica EXACTA de la query de getRankingDaily (routes.ts) ─────────
async function rankingDaily(dateKey) {
  const res = await q(
    `SELECT u.id, u.display_name,
            SUM(a.points) as points,
            COUNT(*) FILTER (WHERE a.won) as games_won
     FROM attempts a
     JOIN users u ON a.user_id = u.id
     WHERE NOT a.flagged AND a.ranked
     AND a.date_key = $1::date
     GROUP BY u.id, u.display_name
     ORDER BY points DESC, u.id ASC
     LIMIT 50`,
    [dateKey],
  );
  return res.rows.map((r, idx) => ({
    rank: idx + 1,
    userId: r.id,
    displayName: r.display_name,
    points: Number(r.points ?? 0),
    gamesWon: Number(r.games_won ?? 0),
  }));
}

// ─── Réplica EXACTA de la query de getRankingMonthly (routes.ts) ───────
async function rankingMonthly(monthStart) {
  const res = await q(
    `SELECT u.id, u.display_name,
            SUM(a.points) as points,
            COUNT(*) FILTER (WHERE a.won) as games_won,
            COUNT(DISTINCT a.date_key) as days_played
     FROM attempts a
     JOIN users u ON a.user_id = u.id
     WHERE NOT a.flagged AND a.ranked
     AND a.date_key >= $1::date
     AND a.date_key < ($1::date + INTERVAL '1 month')
     GROUP BY u.id, u.display_name
     ORDER BY points DESC, u.id ASC
     LIMIT 50`,
    [monthStart],
  );
  return res.rows.map((r, idx) => ({
    rank: idx + 1,
    userId: r.id,
    displayName: r.display_name,
    points: Number(r.points ?? 0),
    gamesWon: Number(r.games_won ?? 0),
    daysPlayed: Number(r.days_played ?? 0),
  }));
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

async function test1_LoserAppearsWithZeroPoints() {
  console.log("\n▶ Test 1: usuario que perdió aparece con 0 puntos");
  await reset();
  await insertUser("u1", "Ganador");
  await insertAttempt("u1", "pittexto", TODAY, 100, { won: true });
  await insertUser("u2", "Perdedor");
  await insertAttempt("u2", "polewordle", TODAY, 0, { won: false });

  const top = await rankingDaily(TODAY);
  assert(top.length === 2, "ambos usuarios aparecen (antes solo aparecía 1)");
  const loser = top.find((e) => e.userId === "u2");
  assert(loser !== undefined, "el perdedor aparece en el ranking");
  assert(loser.points === 0, "el perdedor tiene 0 puntos");
  assert(loser.gamesWon === 0, "el perdedor tiene 0 juegos ganados");
}

async function test2_WinnersOrderedBeforeLosers() {
  console.log("\n▶ Test 2: ganadores siempre antes que perdedores (orden por puntos)");
  await reset();
  await insertUser("u1", "A"); await insertAttempt("u1", "pittexto", TODAY, 50, { won: true });
  await insertUser("u2", "B"); await insertAttempt("u2", "pittexto", TODAY, 0, { won: false });
  await insertUser("u3", "C"); await insertAttempt("u3", "pittexto", TODAY, 200, { won: true });

  const top = await rankingDaily(TODAY);
  assert(top[0].userId === "u3", "u3 (200 pts) es #1");
  assert(top[1].userId === "u1", "u1 (50 pts) es #2");
  assert(top[2].userId === "u2", "u2 (0 pts, perdió) queda al fondo, #3");
}

async function test3_FlaggedStillExcluded() {
  console.log("\n▶ Test 3: attempts flagged siguen SIN aparecer (anti-cheat intacto)");
  await reset();
  await insertUser("u1", "Sospechoso");
  await insertAttempt("u1", "pittexto", TODAY, 500, { won: true, flagged: true });

  const top = await rankingDaily(TODAY);
  assert(top.length === 0, "el usuario flagged NO aparece, ni ganando ni perdiendo");
}

async function test4_NotRankedStillExcluded() {
  console.log("\n▶ Test 4: attempts no-rankeados (ranked=false, regla de IP) siguen SIN aparecer");
  await reset();
  await insertUser("u1", "SegundaCuentaMismaIP");
  await insertAttempt("u1", "pittexto", TODAY, 300, { won: true, ranked: false });
  // Perdedor con ranked=false tampoco debería aparecer
  await insertUser("u2", "PerdedorNoRankeado");
  await insertAttempt("u2", "polewordle", TODAY, 0, { won: false, ranked: false });

  const top = await rankingDaily(TODAY);
  assert(top.length === 0, "ninguno de los dos aparece (ranked=false, ganando o perdiendo)");
}

async function test5_GamesWonExcludesLosses() {
  console.log("\n▶ Test 5: gamesWon cuenta solo victorias, no la mezcla con derrotas");
  await reset();
  await insertUser("u1", "Mixto");
  await insertAttempt("u1", "pittexto", TODAY, 100, { won: true });
  await insertAttempt("u1", "polewordle", TODAY, 0, { won: false });
  await insertAttempt("u1", "el-intruso", TODAY, 80, { won: true });

  const top = await rankingDaily(TODAY);
  const entry = top.find((e) => e.userId === "u1");
  assert(entry.points === 180, "suma 100+0+80 = 180 puntos");
  assert(entry.gamesWon === 2, "gamesWon = 2 (no 3): solo cuenta las victorias");
}

async function test6_MonthlyInclusiveSameRules() {
  console.log("\n▶ Test 6: el ranking mensual aplica las mismas reglas");
  await reset();
  await insertUser("u1", "GanadorMes");
  await insertAttempt("u1", "pittexto", "2026-07-05", 100, { won: true });
  await insertUser("u2", "PerdedorMes");
  await insertAttempt("u2", "polewordle", "2026-07-10", 0, { won: false });
  await insertUser("u3", "FueraDeMes");
  await insertAttempt("u3", "pittexto", "2026-06-30", 500, { won: true }); // mes anterior

  const top = await rankingMonthly(MONTH_START);
  assert(top.length === 2, "solo los 2 usuarios de julio aparecen (u3 es de junio)");
  const loser = top.find((e) => e.userId === "u2");
  assert(loser !== undefined && loser.points === 0, "perdedor de julio aparece con 0 puntos");
}

async function test7_AllZeroStillListed() {
  console.log("\n▶ Test 7: si TODOS perdieron, todos aparecen igual con 0 puntos");
  await reset();
  await insertUser("u1", "A"); await insertAttempt("u1", "pittexto", TODAY, 0, { won: false });
  await insertUser("u2", "B"); await insertAttempt("u2", "polewordle", TODAY, 0, { won: false });

  const top = await rankingDaily(TODAY);
  assert(top.length === 2, "ambos perdedores aparecen (nadie queda oculto)");
  assert(top.every((e) => e.points === 0), "ambos con 0 puntos");
}

(async () => {
  console.log("═══ TEST RANKING INCLUSIVO (perdedores visibles, PGlite real) ═══");
  await setup();
  await test1_LoserAppearsWithZeroPoints();
  await test2_WinnersOrderedBeforeLosers();
  await test3_FlaggedStillExcluded();
  await test4_NotRankedStillExcluded();
  await test5_GamesWonExcludesLosses();
  await test6_MonthlyInclusiveSameRules();
  await test7_AllZeroStillListed();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
