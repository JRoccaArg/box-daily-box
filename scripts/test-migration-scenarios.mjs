// scripts/test-migration-scenarios.mjs
//
// Reproduce los escenarios EXACTOS que Juan Cruz reportó:
//
// Bug A: cuenta anónima X con Wordle perdido + PitTexto ganado.
//        Login con Google NUEVA → attempts deben aparecer bajo la cuenta.
//
// Bug B: cuenta Google G ya tiene attempts (del bug A).
//        Nueva sesión anónima Z gana El Intruso.
//        Login con la misma G → El Intruso debe migrar sin conflicto.

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}
async function q(sql, params) { return db.query(sql, params); }

const TODAY = "2026-07-02";
const X = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"; // anónimo primera sesión
const Z = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"; // anónimo segunda sesión
const G_GOOGLE_ID = "google-sub-12345";
const G_EMAIL = "juan@example.com";

async function setup() {
  await q(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    country_code TEXT,
    name_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
  await q(`CREATE TABLE google_accounts (
    google_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    picture_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_login TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
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
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, game_id, date_key)
  );`);
  await q(`CREATE TABLE sessions (
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
  );`);
}

// ─── Réplica EXACTA de las funciones del backend ────────────────────

async function insertAttempt(userId, gameId, won, points, ip = "1.1.1.1") {
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ip_address)
     VALUES ($1, $2, $3, 'medio', $4, 60, $5, $6)`,
    [userId, gameId, TODAY, won, points, ip],
  );
}

// Réplica de startChallenge (parte relevante): upsert del usuario
async function upsertUserOnStart(userId) {
  await q(
    `INSERT INTO users (id, display_name, country_code)
     VALUES ($1, NULL, NULL)
     ON CONFLICT (id) DO UPDATE SET id = users.id`,
    [userId],
  );
}

// Réplica de migrateAnonymousAttempts (auth.ts)
async function migrateAnonymousAttempts(fromUserId, toUserId) {
  const anon = await q(
    "SELECT id, game_id, date_key FROM attempts WHERE user_id = $1",
    [fromUserId],
  );
  let migrated = 0;
  for (const row of anon.rows) {
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
  await q("DELETE FROM sessions WHERE user_id = $1", [fromUserId]);
  await q("DELETE FROM users WHERE id = $1", [fromUserId]);
  return migrated;
}

// Réplica de googleAuthCallback (auth.ts) simplificada
async function googleAuthCallback(currentUserId) {
  const existing = await q(
    "SELECT user_id FROM google_accounts WHERE google_id = $1",
    [G_GOOGLE_ID],
  );

  let userId;
  let migratedCount = 0;

  if (existing.rows.length > 0) {
    // Google YA existe
    userId = existing.rows[0].user_id;
    if (currentUserId && currentUserId !== userId) {
      const anonHasGoogle = await q(
        "SELECT google_id FROM google_accounts WHERE user_id = $1",
        [currentUserId],
      );
      if (anonHasGoogle.rows.length === 0) {
        migratedCount = await migrateAnonymousAttempts(currentUserId, userId);
      }
    }
  } else {
    // Google NUEVA
    if (currentUserId) {
      const alreadyLinked = await q(
        "SELECT google_id FROM google_accounts WHERE user_id = $1",
        [currentUserId],
      );
      if (alreadyLinked.rows.length > 0) {
        throw new Error("already linked");
      }
      await q(
        `INSERT INTO users (id, display_name) VALUES ($1, 'Juan')
         ON CONFLICT (id) DO NOTHING`,
        [currentUserId],
      );
      userId = currentUserId;
    } else {
      userId = "generated-" + Math.random();
      await q("INSERT INTO users (id, display_name) VALUES ($1, 'Juan')", [userId]);
    }
    await q(
      `INSERT INTO google_accounts (google_id, user_id, email, name)
       VALUES ($1, $2, $3, 'Juan')`,
      [G_GOOGLE_ID, userId, G_EMAIL],
    );
  }

  return { userId, migratedCount };
}

// Réplica de getUserAttempts (routes.ts) — SIN ::date cast
async function getUserAttempts_currentImpl(userId, dateKey) {
  const rows = await q(
    `SELECT game_id, won, points, created_at
     FROM attempts
     WHERE user_id = $1 AND date_key = $2
     ORDER BY created_at DESC`,
    [userId, dateKey],
  );
  return rows.rows;
}

// Réplica de getUserAttempts CON el cast ::date
async function getUserAttempts_withCast(userId, dateKey) {
  const rows = await q(
    `SELECT game_id, won, points, created_at
     FROM attempts
     WHERE user_id = $1 AND date_key = $2::date
     ORDER BY created_at DESC`,
    [userId, dateKey],
  );
  return rows.rows;
}

async function reset() {
  await q("DELETE FROM attempts");
  await q("DELETE FROM google_accounts");
  await q("DELETE FROM sessions");
  await q("DELETE FROM users");
}

// ═══════════════════════════════════════════════════════════════════
// ESCENARIO A: reproducir el bug del Wordle
// ═══════════════════════════════════════════════════════════════════

async function scenarioA() {
  console.log("\n▶ ESCENARIO A: cuenta local X con Wordle perdido + PitTexto ganado");
  console.log("               → Login con Google NUEVA → deben aparecer AMBOS attempts");

  await reset();
  await upsertUserOnStart(X);
  await insertAttempt(X, "polewordle", false, 0);     // Wordle perdido
  await insertAttempt(X, "pittexto", true, 100);      // PitTexto ganado

  // Login con Google NUEVA
  const { userId, migratedCount } = await googleAuthCallback(X);
  assert(userId === X, "userId sigue siendo X (rama 'Google nueva' → vincula al mismo)");
  assert(migratedCount === 0, "no hubo migración porque no había conflicto");

  // Frontend hace GET /user/X/attempts?date=hoy
  // El bug real: ¿los recibe todos?
  const attemptsCurrent = await getUserAttempts_currentImpl(userId, TODAY);
  console.log(`     getUserAttempts (SIN cast ::date) devolvió ${attemptsCurrent.length} attempts`);

  const attemptsWithCast = await getUserAttempts_withCast(userId, TODAY);
  console.log(`     getUserAttempts (CON cast ::date) devolvió ${attemptsWithCast.length} attempts`);

  // La query DEBE devolver los 2 attempts (Wordle + PitTexto)
  assert(attemptsCurrent.length === 2, "SIN cast: devuelve los 2 attempts");
  assert(attemptsWithCast.length === 2, "CON cast: devuelve los 2 attempts");

  const gameIds = attemptsCurrent.map(a => a.game_id).sort();
  assert(gameIds.includes("polewordle"), "incluye polewordle (perdido)");
  assert(gameIds.includes("pittexto"), "incluye pittexto (ganado)");
}

// ═══════════════════════════════════════════════════════════════════
// ESCENARIO B: cuenta Google ya existe + nueva sesión anónima
// ═══════════════════════════════════════════════════════════════════

async function scenarioB() {
  console.log("\n▶ ESCENARIO B: Google G ya tiene X vinculado. Nueva sesión Z gana El Intruso.");
  console.log("               → Login con misma G → El Intruso debe migrar (server no tiene conflicto)");

  // Estado inicial: G tiene X con Wordle perdido + PitTexto ganado (del escenario A)
  // Simular esto sin correr el escenario A:
  await reset();
  await q("INSERT INTO users (id, display_name) VALUES ($1, 'Juan')", [X]);
  await q(
    `INSERT INTO google_accounts (google_id, user_id, email, name)
     VALUES ($1, $2, $3, 'Juan')`,
    [G_GOOGLE_ID, X, G_EMAIL],
  );
  await insertAttempt(X, "polewordle", false, 0);
  await insertAttempt(X, "pittexto", true, 100);

  // Nueva sesión anónima Z (después de borrar storage)
  await upsertUserOnStart(Z);
  await insertAttempt(Z, "el-intruso", true, 90);

  // Login con la misma Google G
  const { userId, migratedCount } = await googleAuthCallback(Z);

  assert(userId === X, "userId es X (Google G ya estaba vinculada a X)");
  assert(migratedCount === 1, `debe migrar 1 attempt (el-intruso), migró ${migratedCount}`);

  // El Intruso debe estar bajo X ahora
  const attempts = await getUserAttempts_currentImpl(X, TODAY);
  const gameIds = attempts.map(a => a.game_id).sort();

  console.log(`     Attempts finales bajo X: ${gameIds.join(", ")}`);

  assert(gameIds.includes("el-intruso"), "el-intruso está bajo X (se migró)");
  assert(gameIds.includes("polewordle"), "polewordle sigue bajo X (no se tocó)");
  assert(gameIds.includes("pittexto"), "pittexto sigue bajo X (no se tocó)");
  assert(gameIds.length === 3, "hay exactamente 3 attempts");

  // Z ya no existe
  const zUser = await q("SELECT id FROM users WHERE id = $1", [Z]);
  assert(zUser.rows.length === 0, "usuario Z fue borrado");
}

// ═══════════════════════════════════════════════════════════════════
// ESCENARIO C: bug de startChallenge sobreescribiendo el user
// ═══════════════════════════════════════════════════════════════════

async function scenarioC() {
  console.log("\n▶ ESCENARIO C: startChallenge NO debe borrar la vinculación de Google");
  // Hipótesis: cuando Z juega un nuevo juego, ¿startChallenge upsertea el user
  // y borra algo? Verificar que el upsert es seguro.

  await reset();
  await q("INSERT INTO users (id, display_name) VALUES ($1, 'Juan')", [X]);
  await q(
    `INSERT INTO google_accounts (google_id, user_id, email, name)
     VALUES ($1, $2, $3, 'Juan')`,
    [G_GOOGLE_ID, X, G_EMAIL],
  );

  // Simular startChallenge con el mismo X
  await upsertUserOnStart(X);

  const googleStillLinked = await q("SELECT google_id FROM google_accounts WHERE user_id = $1", [X]);
  assert(googleStillLinked.rows.length === 1, "google_accounts sigue vinculada tras upsert");
}

(async () => {
  console.log("═══ TEST ESCENARIOS DE MIGRACIÓN (bugs A y B reales) ═══");
  await setup();
  await scenarioA();
  await scenarioB();
  await scenarioC();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
