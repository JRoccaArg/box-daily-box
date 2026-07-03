// scripts/test-migration.mjs
//
// Test de integración REAL de la lógica de migración de attempts y perfil.
// Usa PGlite (Postgres en memoria) para ejecutar SQL de verdad, no mocks.
//
// Ejecuta: node scripts/test-migration.mjs

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${msg}`);
  }
}

async function q(sql, params) {
  return db.query(sql, params);
}

// ─── Setup: crear schema ───────────────────────────────────────────
async function setupSchema() {
  await q(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      country_code TEXT,
      name_changed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await q(`
    CREATE TABLE google_accounts (
      google_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT,
      picture_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      last_login TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id)
    );
  `);
  await q(`
    CREATE TABLE attempts (
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
      UNIQUE(user_id, game_id, date_key)
    );
  `);
  await q(`
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      game_id TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      date_key DATE NOT NULL,
      started_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL,
      consumed BOOLEAN DEFAULT false,
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

// ─── Réplica de migrateAnonymousAttempts ATÓMICA (de auth.ts) ───────
async function migrateAnonymousAttempts(fromUserId, toUserId) {
  // Simula la transacción (PGlite no necesita BEGIN explícito para el test,
  // pero replicamos la lógica: migrar attempts + borrar sesiones + borrar user).
  const anonAttempts = await q(
    "SELECT id, game_id, date_key FROM attempts WHERE user_id = $1",
    [fromUserId],
  );
  let migrated = 0;
  for (const row of anonAttempts.rows) {
    const conflict = await q(
      "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3",
      [toUserId, row.game_id, row.date_key],
    );
    if (conflict.rows.length > 0) {
      await q("DELETE FROM attempts WHERE id = $1", [row.id]);
    } else {
      await q("UPDATE attempts SET user_id = $1 WHERE id = $2", [toUserId, row.id]);
      migrated++;
    }
  }
  // Borrado del usuario anónimo (ahora parte de la misma operación atómica)
  await q("DELETE FROM sessions WHERE user_id = $1", [fromUserId]);
  await q("DELETE FROM users WHERE id = $1", [fromUserId]);
  return migrated;
}

const TODAY = "2026-07-01";
const UUID_A = "0e7d408b-e7cf-42d1-87eb-4a431fc2e4c6"; // anónimo
const UUID_G = "11111111-2222-3333-4444-555555555555"; // Google

async function insertUser(id, name = null, country = null) {
  await q(
    "INSERT INTO users (id, display_name, country_code) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
    [id, name, country],
  );
}

async function insertAttempt(userId, gameId, won = true, points = 100) {
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ip_address)
     VALUES ($1, $2, $3, 'medio', $4, 42, $5, '1.2.3.4')`,
    [userId, gameId, TODAY, won, points],
  );
}

async function reset() {
  await q("DELETE FROM attempts");
  await q("DELETE FROM google_accounts");
  await q("DELETE FROM sessions");
  await q("DELETE FROM users");
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

async function testCase1_MigrateNoConflict() {
  console.log("\n▶ Caso 1: Anónimo jugó PitTexto, Google NO tiene → migra");
  await reset();
  await insertUser(UUID_A);
  await insertUser(UUID_G, "Rocket", "AR");
  await insertAttempt(UUID_A, "pittexto");

  const migrated = await migrateAnonymousAttempts(UUID_A, UUID_G);

  assert(migrated === 1, "migró 1 attempt");

  const gAttempts = await q("SELECT game_id FROM attempts WHERE user_id = $1", [UUID_G]);
  assert(gAttempts.rows.length === 1, "Google ahora tiene 1 attempt");
  assert(gAttempts.rows[0].game_id === "pittexto", "el attempt es pittexto");

  const anonAttempts = await q("SELECT * FROM attempts WHERE user_id = $1", [UUID_A]);
  assert(anonAttempts.rows.length === 0, "anónimo ya no tiene attempts");

  const anonUser = await q("SELECT * FROM users WHERE id = $1", [UUID_A]);
  assert(anonUser.rows.length === 0, "usuario anónimo eliminado");
}

async function testCase2_MigrateWithConflict() {
  console.log("\n▶ Caso 2: Ambos jugaron PitTexto → descarta local, queda server");
  await reset();
  await insertUser(UUID_A);
  await insertUser(UUID_G, "Rocket", "AR");
  await insertAttempt(UUID_A, "pittexto", true, 50); // anónimo: 50 pts
  await insertAttempt(UUID_G, "pittexto", true, 200); // Google: 200 pts

  const migrated = await migrateAnonymousAttempts(UUID_A, UUID_G);

  assert(migrated === 0, "no migró nada (había conflicto)");

  const gAttempts = await q("SELECT points FROM attempts WHERE user_id = $1 AND game_id = 'pittexto'", [UUID_G]);
  assert(gAttempts.rows.length === 1, "Google tiene 1 solo attempt de pittexto");
  assert(gAttempts.rows[0].points === 200, "se mantuvo el del server (200 pts), no el local (50)");

  const anonAttempts = await q("SELECT * FROM attempts WHERE user_id = $1", [UUID_A]);
  assert(anonAttempts.rows.length === 0, "attempt local descartado");
}

async function testCase3_MixedMigration() {
  console.log("\n▶ Caso 3: Anónimo jugó 3 juegos, Google tiene 1 (conflicto en ese)");
  await reset();
  await insertUser(UUID_A);
  await insertUser(UUID_G, "Rocket", "AR");
  // Anónimo: polewordle, el-intruso, parrilla-bingo
  await insertAttempt(UUID_A, "polewordle");
  await insertAttempt(UUID_A, "el-intruso");
  await insertAttempt(UUID_A, "parrilla-bingo", true, 30);
  // Google: parrilla-bingo (conflicto)
  await insertAttempt(UUID_G, "parrilla-bingo", true, 300);

  const migrated = await migrateAnonymousAttempts(UUID_A, UUID_G);

  assert(migrated === 2, "migró 2 (polewordle, el-intruso), descartó 1 (bingo conflicto)");

  const gAttempts = await q("SELECT game_id, points FROM attempts WHERE user_id = $1 ORDER BY game_id", [UUID_G]);
  assert(gAttempts.rows.length === 3, "Google tiene 3 attempts");
  const bingo = gAttempts.rows.find((r) => r.game_id === "parrilla-bingo");
  assert(bingo && bingo.points === 300, "bingo mantiene puntos del server (300)");
  const games = gAttempts.rows.map((r) => r.game_id);
  assert(games.includes("polewordle") && games.includes("el-intruso"), "polewordle y el-intruso migrados");
}

async function testCase4_SessionsCleanup() {
  console.log("\n▶ Caso 4: migración borra sesiones del usuario anónimo");
  await reset();
  await insertUser(UUID_A);
  await insertUser(UUID_G, "Rocket", "AR");
  await insertAttempt(UUID_A, "pittexto");
  await q(
    `INSERT INTO sessions (id, user_id, game_id, difficulty, date_key, started_at, expires_at, ip_address)
     VALUES ('sess1', $1, 'pittexto', 'medio', $2, 0, 9999999999999, '1.2.3.4')`,
    [UUID_A, TODAY],
  );

  // La migración atómica borra attempts migrados + sesiones + usuario
  await migrateAnonymousAttempts(UUID_A, UUID_G);

  const sessions = await q("SELECT * FROM sessions WHERE user_id = $1", [UUID_A]);
  assert(sessions.rows.length === 0, "sesiones del anónimo eliminadas en la migración");
  const anonUser = await q("SELECT * FROM users WHERE id = $1", [UUID_A]);
  assert(anonUser.rows.length === 0, "usuario anónimo eliminado");
}

// ─── Test de reglas de perfil (canChangeNameThisMonth) ──────────────
function canChangeNameThisMonth(nameChangedAt) {
  if (!nameChangedAt) return true;
  const now = new Date();
  const changed = new Date(nameChangedAt);
  return (
    changed.getUTCFullYear() !== now.getUTCFullYear() ||
    changed.getUTCMonth() !== now.getUTCMonth()
  );
}

function testCase5_NameChangeRule() {
  console.log("\n▶ Caso 5: Regla de cambio de nombre mensual");
  assert(canChangeNameThisMonth(null) === true, "nunca cambió → puede");

  const now = new Date();
  assert(canChangeNameThisMonth(now) === false, "cambió hoy → NO puede");

  const lastMonth = new Date();
  lastMonth.setUTCMonth(lastMonth.getUTCMonth() - 1);
  assert(canChangeNameThisMonth(lastMonth) === true, "cambió el mes pasado → puede");
}

// ─── Runner ─────────────────────────────────────────────────────────
(async () => {
  console.log("═══ TEST DE MIGRACIÓN Y PERFIL (PGlite real) ═══");
  await setupSchema();

  await testCase1_MigrateNoConflict();
  await testCase2_MigrateWithConflict();
  await testCase3_MixedMigration();
  await testCase4_SessionsCleanup();
  testCase5_NameChangeRule();

  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
