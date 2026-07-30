// scripts/test-friends-anon.mjs
//
// Migración de amigos/duelos al pasar de cuenta anónima a Google (Roadmap §4).
// Réplica fiel (misma técnica que scripts/test-migration-scenarios.mjs) de la
// sección "2. Amigos y duelos" de migrateAnonymousAttempts (src/api/auth.ts),
// corrida contra PGlite. Si esa sección cambia en auth.ts, hay que reflejarlo
// acá para que el test siga siendo representativo.
//
// Cubre:
//  - Amistades del anónimo se migran al destino (par reordenado), salvo que
//    el "otro" sea el propio destino (evita auto-amistad).
//  - Duelo entre anónimo y destino se BORRA (post-merge sería auto-duelo).
//  - Duelos pending/active del anónimo con un tercero se EXPIRAN.
//  - Duelos ya finished/expired/cancelled del anónimo se RE-APUNTAN (no
//    generan conflicto porque no están en los índices de "1 activo").
//  - Attempts de duelo (duel_id no nulo) migran SIEMPRE, sin importar
//    conflicto de (game_id, date_key) con el reto diario del destino.

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}
async function q(sql, params) { return db.query(sql, params); }

const ANON = "anon-11111111-1111-1111-1111-111111111111";
const DEST = "22222222-2222-2222-2222-222222222222"; // cuenta Google
const THIRD = "anon-33333333-3333-3333-3333-333333333333";

async function setup() {
  await q(`CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT, created_at TIMESTAMPTZ DEFAULT now());`);
  await q(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, game_id TEXT NOT NULL,
    date_key DATE NOT NULL, difficulty TEXT NOT NULL, won BOOLEAN NOT NULL,
    points INTEGER NOT NULL, ranked BOOLEAN DEFAULT true, duel_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now());`);
  await q(`CREATE TABLE friendships (
    user_a TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_a, user_b), CHECK (user_a < user_b));`);
  await q(`CREATE TABLE duels (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opponent_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    game_id TEXT NOT NULL, difficulty TEXT NOT NULL, seed TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', creator_result JSONB, opponent_result JSONB,
    expires_at TIMESTAMPTZ NOT NULL, finished_at TIMESTAMPTZ,
    CHECK (opponent_id IS NULL OR opponent_id <> creator_id));`);
  await q(`CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL);`);
  await q("INSERT INTO users (id) VALUES ($1), ($2), ($3)", [ANON, DEST, THIRD]);
}

async function resetData() {
  await q("DELETE FROM friendships");
  await q("DELETE FROM duels");
  await q("DELETE FROM attempts");
  await q("DELETE FROM sessions");
  // Algunos escenarios borran el usuario anónimo (paso 3 real de la migración,
  // simulado por deleteAnonUser); lo re-insertamos por si el test anterior lo borró.
  await q("INSERT INTO users (id) VALUES ($1), ($2), ($3) ON CONFLICT DO NOTHING", [ANON, DEST, THIRD]);
}

/** Réplica del paso 3 de migrateAnonymousAttempts: borra sesiones + usuario anónimo. */
async function deleteAnonUser(fromUserId) {
  await q("DELETE FROM sessions WHERE user_id = $1", [fromUserId]);
  await q("DELETE FROM users WHERE id = $1", [fromUserId]);
}

// ─── Réplica de la sección "2. Amigos y duelos" de migrateAnonymousAttempts ──
async function migrateFriendsAndDuels(fromUserId, toUserId) {
  const anonFriends = await q(
    `SELECT (CASE WHEN user_a = $1 THEN user_b ELSE user_a END) AS other
     FROM friendships WHERE user_a = $1 OR user_b = $1`,
    [fromUserId],
  );
  for (const f of anonFriends.rows) {
    const other = f.other;
    if (other === toUserId) continue;
    const [a, b] = other < toUserId ? [other, toUserId] : [toUserId, other];
    await q("INSERT INTO friendships (user_a, user_b) VALUES ($1, $2) ON CONFLICT DO NOTHING", [a, b]);
  }

  await q(
    `DELETE FROM duels
     WHERE (creator_id = $1 AND opponent_id = $2) OR (creator_id = $2 AND opponent_id = $1)`,
    [fromUserId, toUserId],
  );
  await q(
    `UPDATE duels SET status = 'expired'
     WHERE (creator_id = $1 OR opponent_id = $1) AND status IN ('pending', 'active')`,
    [fromUserId],
  );
  await q("UPDATE duels SET creator_id = $1 WHERE creator_id = $2", [toUserId, fromUserId]);
  await q("UPDATE duels SET opponent_id = $1 WHERE opponent_id = $2", [toUserId, fromUserId]);
}

// ─── Réplica de la migración de attempts (incluye la rama duel_id) ──────────
async function migrateAttempts(fromUserId, toUserId) {
  const anonAttempts = await q(
    "SELECT id, game_id, date_key, duel_id FROM attempts WHERE user_id = $1",
    [fromUserId],
  );
  let migrated = 0;
  for (const row of anonAttempts.rows) {
    if (row.duel_id != null) {
      await q("UPDATE attempts SET user_id = $1 WHERE id = $2", [toUserId, row.id]);
      migrated++;
      continue;
    }
    const conflict = await q(
      "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3 AND duel_id IS NULL",
      [toUserId, row.game_id, row.date_key],
    );
    if (conflict.rows.length > 0) {
      await q("DELETE FROM attempts WHERE id = $1", [row.id]);
    } else {
      await q("UPDATE attempts SET user_id = $1 WHERE id = $2", [toUserId, row.id]);
      migrated++;
    }
  }
  return migrated;
}

(async () => {
  await setup();

  // ─── Amistad del anónimo migra al destino ───────────────────────────
  console.log("\n[Amistad migra al destino]");
  await resetData();
  const [initA, initB] = ANON < THIRD ? [ANON, THIRD] : [THIRD, ANON];
  await q("INSERT INTO friendships (user_a, user_b) VALUES ($1, $2)", [initA, initB]);
  await migrateFriendsAndDuels(ANON, DEST);
  const [a, b] = THIRD < DEST ? [THIRD, DEST] : [DEST, THIRD];
  const migratedFriendship = await q("SELECT 1 FROM friendships WHERE user_a = $1 AND user_b = $2", [a, b]);
  assert(migratedFriendship.rows.length === 1, "la amistad anónimo↔tercero se re-apunta a destino↔tercero");

  // ─── Amistad anónimo↔destino (ya eran amigos) NO genera auto-amistad ─
  console.log("\n[Anónimo ya era amigo del destino → se descarta, no auto-amistad]");
  await resetData();
  const [pa, pb] = ANON < DEST ? [ANON, DEST] : [DEST, ANON];
  await q("INSERT INTO friendships (user_a, user_b) VALUES ($1, $2)", [pa, pb]);
  await migrateFriendsAndDuels(ANON, DEST);
  await deleteAnonUser(ANON); // paso 3 real: borra al anónimo, cascade limpia la friendship vieja
  const selfFriendship = await q("SELECT 1 FROM friendships WHERE user_a = $1 OR user_b = $1", [DEST]);
  assert(selfFriendship.rows.length === 0, "la amistad anónimo↔destino se descarta (evita auto-amistad tras el merge)");

  // ─── Duelo anónimo↔destino se borra ─────────────────────────────────
  console.log("\n[Duelo anónimo↔destino se borra]");
  await resetData();
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
     VALUES ('DUELAD01', $1, $2, 'pittexto', 'medio', 'DUELAD01', 'active', now() + interval '15 minutes')`,
    [ANON, DEST],
  );
  await migrateFriendsAndDuels(ANON, DEST);
  const goneDuel = await q("SELECT 1 FROM duels WHERE id = 'DUELAD01'");
  assert(goneDuel.rows.length === 0, "el duelo entre anónimo y destino se elimina (evita auto-duelo)");

  // ─── Duelo pending/active del anónimo con un tercero se expira ──────
  console.log("\n[Duelo con tercero se expira]");
  await resetData();
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
     VALUES ('DUELAT01', $1, $2, 'el-intruso', 'medio', 'DUELAT01', 'active', now() + interval '15 minutes')`,
    [ANON, THIRD],
  );
  await migrateFriendsAndDuels(ANON, DEST);
  const expired = await q("SELECT status, creator_id FROM duels WHERE id = 'DUELAT01'");
  assert(expired.rows[0].status === "expired", "el duelo activo con un tercero se marca 'expired' al migrar identidad");
  assert(expired.rows[0].creator_id === DEST, "pero el creator_id igual se re-apunta al destino (para el historial)");

  // ─── Duelo YA finished del anónimo se re-apunta sin conflicto ───────
  console.log("\n[Duelo finished se re-apunta]");
  await resetData();
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at, finished_at)
     VALUES ('DUELFI01', $1, $2, 'gp-resultado', 'medio', 'DUELFI01', 'finished', now() - interval '1 hour', now())`,
    [ANON, THIRD],
  );
  await migrateFriendsAndDuels(ANON, DEST);
  const refinished = await q("SELECT status, creator_id FROM duels WHERE id = 'DUELFI01'");
  assert(refinished.rows[0].status === "finished", "un duelo ya finished conserva su estado");
  assert(refinished.rows[0].creator_id === DEST, "y se re-apunta al destino (aparece en su historial)");

  // ─── Attempt de duelo migra siempre, aunque el destino tenga conflicto ──
  console.log("\n[Attempt de duelo migra pese a conflicto de fecha/juego]");
  await resetData();
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, ranked, duel_id)
     VALUES ($1, 'pittexto', '2026-08-10', 'medio', true, 300, true, NULL)`,
    [DEST],
  ); // el destino YA jugó el reto diario ese día
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, ranked, duel_id)
     VALUES ($1, 'pittexto', '2026-08-10', 'medio', true, 777, false, 'DUELFI01')`,
    [ANON],
  ); // el anónimo jugó un DUELO ese mismo día/juego
  const migratedCount = await migrateAttempts(ANON, DEST);
  assert(migratedCount === 1, "el attempt de duelo migra (no compite con el reto diario del destino)");
  const duelAttemptAfter = await q(
    "SELECT user_id FROM attempts WHERE duel_id = 'DUELFI01'",
  );
  assert(duelAttemptAfter.rows[0]?.user_id === DEST, "el attempt de duelo queda bajo el userId de destino");
  const dailyAttemptsAfter = await q(
    "SELECT COUNT(*)::int as c FROM attempts WHERE user_id = $1 AND duel_id IS NULL",
    [DEST],
  );
  assert(Number(dailyAttemptsAfter.rows[0].c) === 1, "el reto diario original del destino no se duplicó ni se tocó");

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} fallidos`);
  await db.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Error inesperado en el test:", err);
  process.exit(1);
});
