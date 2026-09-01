/** Prueba el simulador persistente de logros/racha contra Postgres en memoria. */
import { PGlite } from "@electric-sql/pglite";
import {
  DEBUG_ACHIEVEMENT_PREFIX,
  DebugAchievementInputError,
  parseDebugAchievementAction,
  runDebugAchievementAction,
} from "../src/api/debugAchievements";
import { isStagingDebugEnabled } from "../src/api/debugDate";

const db = new PGlite();
const q = (sql: string, params?: unknown[]) => db.query(sql, params as any[]);
const USER = "11111111-1111-4111-8111-111111111111";
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${message}`);
  }
}

async function setup() {
  await q(`CREATE TABLE users (
    id TEXT PRIMARY KEY, current_streak INT NOT NULL DEFAULT 0,
    best_streak INT NOT NULL DEFAULT 0, last_win_date DATE
  )`);
  await q(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, game_id TEXT NOT NULL,
    date_key DATE NOT NULL, difficulty TEXT NOT NULL, won BOOLEAN NOT NULL,
    time_seconds INT, points INT NOT NULL, flagged BOOLEAN DEFAULT false,
    ranked BOOLEAN DEFAULT true, ip_address TEXT, duel_id TEXT
  )`);
  await q(`CREATE UNIQUE INDEX idx_attempts_unique_daily
    ON attempts (user_id, game_id, date_key) WHERE duel_id IS NULL`);
  await q(`CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, badge_type TEXT NOT NULL,
    reference_month DATE, awarded_at TIMESTAMPTZ DEFAULT now()
  )`);
  await q(`CREATE UNIQUE INDEX idx_badges_achievement_unique
    ON badges (user_id, badge_type) WHERE reference_month IS NULL`);
  await q("INSERT INTO users (id) VALUES ($1)", [USER]);
  // Dos victorias REALES consecutivas: deben sobrevivir a "Limpiar" y
  // reconstruir la racha correcta.
  await q(`INSERT INTO attempts
    (user_id, game_id, date_key, difficulty, won, points, flagged, ranked, ip_address)
    VALUES ($1, 'pittexto', '2026-08-31', 'medio', true, 100, false, true, 'real'),
           ($1, 'polewordle', '2026-09-01', 'medio', true, 100, false, true, 'real')`, [USER]);
}

function progress(state: Awaited<ReturnType<typeof runDebugAchievementAction>>, type: string) {
  return state.achievements.find((item) => item.type === type)!;
}

async function run() {
  console.log("═══ TEST DEBUG DE LOGROS ═══");
  await setup();

  const previousGate = process.env.STAGING_DEBUG;
  delete process.env.STAGING_DEBUG;
  assert(!isStagingDebugEnabled(), "el backend de producción mantiene cerrado el endpoint");
  process.env.STAGING_DEBUG = "true";
  assert(isStagingDebugEnabled(), "el endpoint solo se habilita con STAGING_DEBUG=true");
  if (previousGate === undefined) delete process.env.STAGING_DEBUG;
  else process.env.STAGING_DEBUG = previousGate;

  let invalidRejected = false;
  try {
    parseDebugAchievementAction({ action: "set_streak", streak: 1.5 });
  } catch (error) {
    invalidRejected = error instanceof DebugAchievementInputError;
  }
  assert(invalidRejected, "rechaza rachas decimales");

  let state = await runDebugAchievementAction(
    q,
    USER,
    { action: "apply", achievementType: "ach_legend_10" },
    "2026-09-01",
  );
  assert(progress(state, "ach_legend_10").unlocked, "10 victorias Leyenda desbloquean Leyenda Viviente");
  assert(state.activeScenarios.includes("ach_legend_10"), "el escenario queda persistido como activo");
  let debugRows = await q("SELECT COUNT(*)::int AS c FROM attempts WHERE ip_address = $1", [
    `${DEBUG_ACHIEVEMENT_PREFIX}ach_legend_10`,
  ]);
  assert((debugRows.rows[0] as { c: number }).c === 10, "crea exactamente 10 victorias sintéticas marcadas");

  state = await runDebugAchievementAction(
    q,
    USER,
    { action: "remove", achievementType: "ach_legend_10" },
    "2026-09-01",
  );
  assert(!progress(state, "ach_legend_10").unlocked, "quitar escenario recalcula y vuelve a bloquear el logro");
  assert(state.activeScenarios.length === 0, "quitar escenario borra su marca activa");

  state = await runDebugAchievementAction(
    q,
    USER,
    { action: "apply", achievementType: "ach_complete" },
    "2026-09-01",
  );
  assert(progress(state, "ach_complete").unlocked, "Piloto Completo gana los 8 juegos");
  assert(!progress(state, "ach_perfect_day").unlocked, "Piloto Completo reparte fechas y no regala Día Perfecto");

  state = await runDebugAchievementAction(
    q,
    USER,
    { action: "apply", achievementType: "ach_perfect_day" },
    "2026-09-01",
  );
  assert(progress(state, "ach_perfect_day").unlocked, "Día Perfecto crea los 8 juegos en una fecha");

  // Separar el escenario de volumen para comprobar que no fabrica un día
  // perfecto por cómo distribuye las victorias.
  await runDebugAchievementAction(q, USER, { action: "reset" }, "2026-09-01");

  state = await runDebugAchievementAction(
    q,
    USER,
    { action: "apply", achievementType: "ach_wins_500" },
    "2026-09-01",
  );
  assert(progress(state, "ach_wins_500").unlocked, "500 Vueltas crea suficientes victorias");
  assert(progress(state, "ach_specialist_50").unlocked, "500 victorias desbloquean también el logro más fácil inevitable");
  assert(!progress(state, "ach_perfect_day").unlocked, "500 victorias se reparten en días distintos y no regalan Día Perfecto");

  state = await runDebugAchievementAction(q, USER, { action: "set_streak", streak: 100 }, "2026-09-01");
  assert(state.streak.current === 100, "simula una racha exacta de 100 días");
  assert(state.streak.lastWinDate === "2026-09-01", "la racha simulada queda viva en la fecha de debug");

  state = await runDebugAchievementAction(q, USER, { action: "reset" }, "2026-09-01");
  assert(state.activeScenarios.length === 0, "Limpiar elimina todos los escenarios de debug");
  assert(state.streak.current === 2 && state.streak.best === 2, "Limpiar reconstruye la racha desde victorias reales");
  const realRows = await q("SELECT COUNT(*)::int AS c FROM attempts WHERE ip_address = 'real'");
  assert((realRows.rows[0] as { c: number }).c === 2, "Limpiar conserva las partidas reales");
  debugRows = await q("SELECT COUNT(*)::int AS c FROM attempts WHERE ip_address LIKE $1", [
    `${DEBUG_ACHIEVEMENT_PREFIX}%`,
  ]);
  assert((debugRows.rows[0] as { c: number }).c === 0, "no quedan victorias sintéticas tras limpiar");

  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
}

void run();
