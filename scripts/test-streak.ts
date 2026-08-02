/**
 * Test de la racha diaria server-side — src/api/streak.ts (Roadmap #3).
 *
 * Corre la lógica REAL (bumpStreakOnWin, displayStreak, backfillStreaks) contra
 * una Postgres en memoria (PGlite), con el MISMO SQL que producción vía el
 * ejecutor inyectable. Sin duplicar SQL, sin DB externa.
 *
 * Cubre:
 *  - Bump: gana día 1 y día 2 → racha 2; hueco de un día → reinicia a 1.
 *  - Varios juegos ganados el MISMO día → la racha sube 1 sola vez (no por juego).
 *  - Death-check de displayStreak: racha viva solo si el último día ganado es
 *    hoy o ayer; si quedó vieja, muestra 0 (sin tocar la columna).
 *  - best_streak conserva el récord histórico aunque la actual se reinicie.
 *  - Backfill idempotente desde el historial (gaps-and-islands), incluye una
 *    racha con hueco y una que ya murió.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-streak.ts
 */
import { PGlite } from "@electric-sql/pglite";
import {
  bumpStreakOnWin,
  displayStreak,
  backfillStreaks,
  toDateKey,
  previousDateKey,
} from "../src/api/streak";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${msg}`);
  }
}

const db = new PGlite();
const q = (sql: string, params?: unknown[]) => db.query(sql, params as any[]);

const U1 = "11111111-1111-1111-1111-111111111111";
const U2 = "22222222-2222-2222-2222-222222222222";
const U3 = "33333333-3333-3333-3333-333333333333";

async function setupSchema() {
  await db.query(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    current_streak INT NOT NULL DEFAULT 0,
    best_streak INT NOT NULL DEFAULT 0,
    last_win_date DATE
  );`);
  await db.query(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, game_id TEXT NOT NULL,
    date_key DATE NOT NULL, difficulty TEXT NOT NULL, won BOOLEAN NOT NULL,
    time_seconds INTEGER, points INTEGER NOT NULL, flagged BOOLEAN DEFAULT false,
    ranked BOOLEAN DEFAULT true, duel_id TEXT, ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now());`);
}

async function resetUsers() {
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM attempts");
}

async function insertUser(id: string) {
  await db.query("INSERT INTO users (id, display_name) VALUES ($1, $2)", [id, "U"]);
}

async function getUser(id: string) {
  const r = await db.query<{
    current_streak: number;
    best_streak: number;
    last_win_date: Date | null;
  }>("SELECT current_streak, best_streak, last_win_date FROM users WHERE id = $1", [id]);
  return r.rows[0]!;
}

// ═══════════════════════════════════════════════════════════════════
// PARTE A: helpers puros (displayStreak / previousDateKey)
// ═══════════════════════════════════════════════════════════════════

function testPureHelpers() {
  console.log("\n▶ Helpers puros (displayStreak, previousDateKey)");

  assert(previousDateKey("2026-07-01") === "2026-06-30", "previousDateKey cruza fin de mes");
  assert(previousDateKey("2026-01-01") === "2025-12-31", "previousDateKey cruza fin de año");
  assert(previousDateKey("2026-03-01") === "2026-02-28", "previousDateKey respeta febrero (no bisiesto)");

  const TODAY = "2026-07-15";
  assert(displayStreak(5, "2026-07-15", TODAY) === 5, "racha viva si el último día ganado es HOY");
  assert(displayStreak(5, "2026-07-14", TODAY) === 5, "racha viva si el último día ganado es AYER");
  assert(displayStreak(5, "2026-07-13", TODAY) === 0, "racha MUERTA si el último día es anteayer");
  assert(displayStreak(9, "2026-07-01", TODAY) === 0, "racha vieja (2 semanas) → 0");
  assert(displayStreak(0, "2026-07-15", TODAY) === 0, "streak 0 → 0 aunque last_win sea hoy");
  assert(displayStreak(5, null, TODAY) === 0, "sin last_win_date → 0");
}

// ═══════════════════════════════════════════════════════════════════
// PARTE B: bumpStreakOnWin (write path real)
// ═══════════════════════════════════════════════════════════════════

async function testBumpConsecutive() {
  console.log("\n▶ Bump: días consecutivos suman");
  await resetUsers();
  await insertUser(U1);

  await bumpStreakOnWin(q, U1, "2026-07-10");
  let u = await getUser(U1);
  assert(u.current_streak === 1, "primer día ganado → racha 1");
  assert(toDateKey(u.last_win_date) === "2026-07-10", "last_win_date = día 1");

  await bumpStreakOnWin(q, U1, "2026-07-11");
  u = await getUser(U1);
  assert(u.current_streak === 2, "día siguiente ganado → racha 2");

  await bumpStreakOnWin(q, U1, "2026-07-12");
  u = await getUser(U1);
  assert(u.current_streak === 3, "tercer día consecutivo → racha 3");
  assert(u.best_streak === 3, "best_streak sigue a la racha actual");
}

async function testBumpSameDayNoDouble() {
  console.log("\n▶ Bump: varios juegos el MISMO día no cuentan doble");
  await resetUsers();
  await insertUser(U1);

  await bumpStreakOnWin(q, U1, "2026-07-10");
  await bumpStreakOnWin(q, U1, "2026-07-10"); // segundo juego, mismo día
  await bumpStreakOnWin(q, U1, "2026-07-10"); // tercer juego, mismo día
  const u = await getUser(U1);
  assert(u.current_streak === 1, "ganar 3 juegos el mismo día → racha sigue 1 (no 3)");
}

async function testBumpGapResets() {
  console.log("\n▶ Bump: un hueco de un día reinicia la racha");
  await resetUsers();
  await insertUser(U1);

  await bumpStreakOnWin(q, U1, "2026-07-10");
  await bumpStreakOnWin(q, U1, "2026-07-11");
  await bumpStreakOnWin(q, U1, "2026-07-12"); // racha 3
  // No juega el 13. Vuelve a ganar el 14 → hueco → reinicia.
  await bumpStreakOnWin(q, U1, "2026-07-14");
  const u = await getUser(U1);
  assert(u.current_streak === 1, "tras saltarse un día, la racha reinicia a 1");
  assert(u.best_streak === 3, "best_streak conserva el récord anterior (3)");
}

async function testBumpDisplayIntegration() {
  console.log("\n▶ Bump + displayStreak: la racha se muestra correcta según 'hoy'");
  await resetUsers();
  await insertUser(U1);
  await bumpStreakOnWin(q, U1, "2026-07-10");
  await bumpStreakOnWin(q, U1, "2026-07-11"); // racha 2, last_win=11
  const u = await getUser(U1);

  // Si "hoy" es el 11 → viva. Si es el 12 → viva (ayer). Si es el 13 → murió.
  assert(displayStreak(u.current_streak, toDateKey(u.last_win_date), "2026-07-11") === 2,
    "hoy=11 (ganó hoy) → muestra 2");
  assert(displayStreak(u.current_streak, toDateKey(u.last_win_date), "2026-07-12") === 2,
    "hoy=12 (ganó ayer) → muestra 2 (sigue viva, muere mañana)");
  assert(displayStreak(u.current_streak, toDateKey(u.last_win_date), "2026-07-13") === 0,
    "hoy=13 (no ganó ni hoy ni ayer) → muestra 0 aunque la columna diga 2");
}

// ═══════════════════════════════════════════════════════════════════
// PARTE C: backfill desde historial (gaps-and-islands)
// ═══════════════════════════════════════════════════════════════════

async function insertWin(userId: string, dateKey: string, opts: { flagged?: boolean; duelId?: string | null; won?: boolean } = {}) {
  await db.query(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, duel_id)
     VALUES ($1, 'pittexto', $2::date, 'medio', $3, 60, 100, $4, $5)`,
    [userId, dateKey, opts.won ?? true, opts.flagged ?? false, opts.duelId ?? null],
  );
}

async function testBackfill() {
  console.log("\n▶ Backfill: reconstruye la racha desde el historial");
  await resetUsers();
  await insertUser(U1);
  await insertUser(U2);
  await insertUser(U3);

  // U1: racha de 3 consecutivos que termina el 12 (10,11,12).
  await insertWin(U1, "2026-07-10");
  await insertWin(U1, "2026-07-11");
  await insertWin(U1, "2026-07-11", { won: true }); // segundo juego mismo día (no cuenta doble)
  await insertWin(U1, "2026-07-12");

  // U2: dos islas — (01,02,03) y (10,11). La actual (más reciente) es la de 10-11 = 2.
  //     El mejor histórico es 3.
  await insertWin(U2, "2026-07-01");
  await insertWin(U2, "2026-07-02");
  await insertWin(U2, "2026-07-03");
  await insertWin(U2, "2026-07-10");
  await insertWin(U2, "2026-07-11");

  // U3: solo attempts que NO deben contar (flagged + duelo + perdido).
  await insertWin(U3, "2026-07-10", { flagged: true });
  await insertWin(U3, "2026-07-11", { duelId: "DUELXXXX" });
  await insertWin(U3, "2026-07-12", { won: false });

  await backfillStreaks(q);

  const u1 = await getUser(U1);
  assert(u1.current_streak === 3, "U1: racha actual 3 (10-11-12, sin doble por día repetido)");
  assert(u1.best_streak === 3, "U1: best 3");
  assert(toDateKey(u1.last_win_date) === "2026-07-12", "U1: last_win_date = 12");

  const u2 = await getUser(U2);
  assert(u2.current_streak === 2, "U2: racha actual 2 (isla más reciente 10-11)");
  assert(u2.best_streak === 3, "U2: best 3 (isla vieja 01-02-03)");
  assert(toDateKey(u2.last_win_date) === "2026-07-11", "U2: last_win_date = 11 (día más reciente ganado)");

  const u3 = await getUser(U3);
  assert(u3.current_streak === 0, "U3: sin victorias válidas → racha 0");
  assert(u3.last_win_date === null, "U3: sin last_win_date (flagged/duelo/perdido no cuentan)");
}

async function testBackfillIdempotent() {
  console.log("\n▶ Backfill idempotente: correrlo de nuevo no cambia nada");
  // Partimos del estado de testBackfill (U1=3, U2=2). Corremos otra vez.
  const before1 = await getUser(U1);
  const before2 = await getUser(U2);
  await backfillStreaks(q);
  const after1 = await getUser(U1);
  const after2 = await getUser(U2);
  assert(
    after1.current_streak === before1.current_streak && after1.best_streak === before1.best_streak,
    "U1 intacto tras re-backfill (last_win_date ya no es NULL → no se recalcula)",
  );
  assert(
    after2.current_streak === before2.current_streak,
    "U2 intacto tras re-backfill",
  );

  // Y si U1 gana un día nuevo DESPUÉS del backfill, el bump sigue funcionando
  // sobre el valor backfilleado (no lo pisa el backfill).
  await bumpStreakOnWin(q, U1, "2026-07-13"); // consecutivo al 12
  const u1 = await getUser(U1);
  assert(u1.current_streak === 4, "U1: gana el 13 (consecutivo al 12 backfilleado) → racha 4");
}

// ═══════════════════════════════════════════════════════════════════

(async () => {
  console.log("═══ TEST RACHA DIARIA (src/api/streak.ts, PGlite real) ═══");
  await setupSchema();
  testPureHelpers();
  await testBumpConsecutive();
  await testBumpSameDayNoDouble();
  await testBumpGapResets();
  await testBumpDisplayIntegration();
  await testBackfill();
  await testBackfillIdempotent();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
