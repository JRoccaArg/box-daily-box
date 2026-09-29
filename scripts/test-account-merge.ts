/**
 * Test de la FUSIÓN de la cuenta anónima en la de Google para lo que agregaron
 * las etapas de vidas y desafíos (src/api/accountMerge.ts).
 *
 * Corre la lógica REAL contra Postgres en memoria (PGlite). El esquema de
 * abajo es una réplica del de `initializeDatabase` (db.ts): si cambian
 * `users`/`challenges`/`challenge_plays`/`referrals`/`second_chances`,
 * reflejarlo acá.
 *
 * Qué protege, en criollo: entrar con Google no te hace perder las vidas que
 * juntaste sin cuenta, no rompe los links de desafío que ya compartiste, y no
 * te regala una segunda vida el mismo día ni una segunda partida del mismo link.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-account-merge.ts
 */
process.env.TOKEN_SECRET = "test-only-secret-account-merge";
process.env.ADMIN_SECRET = "test-only-secret-account-merge";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://unused/unused";

import { PGlite } from "@electric-sql/pglite";

const { mergeAnonymousExtras } = await import("@/api/accountMerge");

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${msg}`);
  }
}

const db = new PGlite();
const q = async (sql: string, params?: unknown[]) =>
  (await db.query(sql, params as any[])) as { rows: unknown[] };

const ANON = "anon-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const GOOGLE = "11111111-1111-4111-8111-111111111111";
const OTRO = "anon-cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const HOY = "2026-09-29";

async function schema() {
  await db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      extra_lives_balance INT NOT NULL DEFAULT 0,
      last_life_used_date DATE,
      CONSTRAINT users_lives_non_negative CHECK (extra_lives_balance >= 0)
    );
    CREATE TABLE challenges (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      game_id TEXT NOT NULL,
      date_key DATE NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'medio',
      time_limit INT,
      untimed BOOLEAN NOT NULL DEFAULT false,
      won BOOLEAN NOT NULL DEFAULT true,
      points INT NOT NULL DEFAULT 100,
      time_seconds INT,
      grid JSONB,
      UNIQUE (owner_id, game_id, date_key)
    );
    CREATE TABLE challenge_plays (
      challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seed TEXT NOT NULL DEFAULT 'ch-X',
      counts_as_daily BOOLEAN NOT NULL DEFAULT false,
      PRIMARY KEY (challenge_id, user_id)
    );
    CREATE TABLE referrals (
      id BIGSERIAL PRIMARY KEY,
      referrer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_ip_hash TEXT,
      game_id TEXT NOT NULL DEFAULT 'polewordle',
      date_key DATE NOT NULL,
      CHECK (referrer_id <> referred_user_id)
    );
    CREATE UNIQUE INDEX idx_referrals_unique_ip_day
      ON referrals (referrer_id, referred_ip_hash, date_key) WHERE referred_ip_hash IS NOT NULL;
    CREATE UNIQUE INDEX idx_referrals_unique_user_day
      ON referrals (referrer_id, referred_user_id, date_key);
    CREATE TABLE second_chances (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date_key DATE NOT NULL,
      game_id TEXT NOT NULL,
      seed TEXT NOT NULL DEFAULT 'lf-X',
      difficulty TEXT NOT NULL DEFAULT 'medio',
      ranked BOOLEAN NOT NULL DEFAULT true,
      PRIMARY KEY (user_id, date_key)
    );
  `);
}

async function reset() {
  await db.exec(`
    DELETE FROM second_chances; DELETE FROM referrals; DELETE FROM challenge_plays;
    DELETE FROM challenges; DELETE FROM users;
  `);
  for (const id of [ANON, GOOGLE, OTRO]) await db.query("INSERT INTO users (id) VALUES ($1)", [id]);
}

/** Lo que hace migrateAnonymousAttempts alrededor: fusionar y borrar al anónimo. */
async function mergeAndDelete() {
  await db.transaction(async (tx) => {
    const tq = async (sql: string, params?: unknown[]) =>
      (await tx.query(sql, params as any[])) as { rows: unknown[] };
    await mergeAnonymousExtras(tq, ANON, GOOGLE);
    await tx.query("DELETE FROM users WHERE id = $1", [ANON]);
  });
}

async function one<T>(sql: string, params: unknown[] = []): Promise<T> {
  return (await q(sql, params)).rows[0] as T;
}

async function testVidas() {
  console.log("\n▶ Vidas");
  await reset();
  await db.query("UPDATE users SET extra_lives_balance = 3 WHERE id = $1", [ANON]);
  await db.query("UPDATE users SET extra_lives_balance = 2 WHERE id = $1", [GOOGLE]);
  await mergeAndDelete();
  const g = await one<{ extra_lives_balance: number }>("SELECT extra_lives_balance FROM users WHERE id = $1", [GOOGLE]);
  assert(g.extra_lives_balance === 5, "las vidas se suman (3 + 2 = 5), no se pierden");

  await reset();
  await db.query("UPDATE users SET extra_lives_balance = 1, last_life_used_date = $2::date WHERE id = $1", [ANON, HOY]);
  await mergeAndDelete();
  const g2 = await one<{ d: string | null }>("SELECT last_life_used_date::text AS d FROM users WHERE id = $1", [GOOGLE]);
  assert(g2.d === HOY, "si el anónimo ya gastó la vida de hoy, la cuenta de Google también figura con la de hoy usada");

  await reset();
  await db.query("UPDATE users SET last_life_used_date = $2::date WHERE id = $1", [GOOGLE, HOY]);
  await mergeAndDelete();
  const g3 = await one<{ d: string | null }>("SELECT last_life_used_date::text AS d FROM users WHERE id = $1", [GOOGLE]);
  assert(g3.d === HOY, "y si la usó la cuenta de Google, fusionar no la borra");
}

async function testDesafios() {
  console.log("\n▶ Links de desafío");
  await reset();
  await db.query("INSERT INTO challenges (id, owner_id, game_id, date_key) VALUES ('LINKANON01', $1, 'polewordle', $2)", [ANON, HOY]);
  await mergeAndDelete();
  const c = await one<{ owner_id: string } | undefined>("SELECT owner_id FROM challenges WHERE id = 'LINKANON01'");
  assert(c?.owner_id === GOOGLE, "el link compartido sin cuenta sigue existiendo y pasa a la cuenta de Google");

  await reset();
  await db.query("INSERT INTO challenges (id, owner_id, game_id, date_key) VALUES ('LINKANON02', $1, 'polewordle', $2)", [ANON, HOY]);
  await db.query("INSERT INTO challenges (id, owner_id, game_id, date_key) VALUES ('LINKGOOG02', $1, 'polewordle', $2)", [GOOGLE, HOY]);
  await mergeAndDelete();
  const kept = await one<{ owner_id: string } | undefined>("SELECT owner_id FROM challenges WHERE id = 'LINKGOOG02'");
  assert(kept?.owner_id === GOOGLE, "si los dos tenían link del mismo juego y día, queda el de la cuenta de Google");

  await reset();
  await db.query("INSERT INTO challenges (id, owner_id, game_id, date_key) VALUES ('LINKOTRO03', $1, 'polewordle', $2)", [OTRO, HOY]);
  await db.query("INSERT INTO challenge_plays (challenge_id, user_id) VALUES ('LINKOTRO03', $1)", [ANON]);
  await mergeAndDelete();
  const p = await one<{ c: number }>("SELECT COUNT(*)::int AS c FROM challenge_plays WHERE challenge_id = 'LINKOTRO03' AND user_id = $1", [GOOGLE]);
  assert(p.c === 1, "la partida en el link de otro pasa a la cuenta de Google (no se puede volver a jugar ese link)");

  await reset();
  await db.query("INSERT INTO challenges (id, owner_id, game_id, date_key) VALUES ('LINKOTRO04', $1, 'polewordle', $2)", [OTRO, HOY]);
  await db.query("INSERT INTO challenge_plays (challenge_id, user_id) VALUES ('LINKOTRO04', $1), ('LINKOTRO04', $2)", [ANON, GOOGLE]);
  await mergeAndDelete();
  const p2 = await one<{ c: number }>("SELECT COUNT(*)::int AS c FROM challenge_plays WHERE challenge_id = 'LINKOTRO04'");
  assert(p2.c === 1, "si los dos lo habían jugado, queda una sola partida");
}

async function testReferidos() {
  console.log("\n▶ Referidos");
  await reset();
  await db.query(
    "INSERT INTO referrals (referrer_id, referred_user_id, referred_ip_hash, date_key) VALUES ($1, $2, 'h1', $3)",
    [ANON, OTRO, HOY],
  );
  await db.query(
    "INSERT INTO referrals (referrer_id, referred_user_id, referred_ip_hash, date_key) VALUES ($1, $2, 'h2', $3)",
    [OTRO, ANON, HOY],
  );
  await mergeAndDelete();
  const a = await one<{ c: number }>("SELECT COUNT(*)::int AS c FROM referrals WHERE referrer_id = $1 AND referred_user_id = $2", [GOOGLE, OTRO]);
  const b = await one<{ c: number }>("SELECT COUNT(*)::int AS c FROM referrals WHERE referrer_id = $1 AND referred_user_id = $2", [OTRO, GOOGLE]);
  assert(a.c === 1 && b.c === 1, "el historial de referidos pasa a la cuenta de Google (sostiene 'una por persona por día')");

  await reset();
  await db.query("INSERT INTO referrals (referrer_id, referred_user_id, date_key) VALUES ($1, $2, $3)", [ANON, GOOGLE, HOY]);
  await db.query("INSERT INTO referrals (referrer_id, referred_user_id, date_key) VALUES ($1, $2, $3)", [GOOGLE, ANON, HOY]);
  let ok = true;
  try {
    await mergeAndDelete();
  } catch {
    ok = false;
  }
  assert(ok, "los referidos ENTRE las dos identidades no rompen la fusión (serían auto-referidos)");

  await reset();
  await db.query(
    "INSERT INTO referrals (referrer_id, referred_user_id, referred_ip_hash, date_key) VALUES ($1, $2, 'mismaip', $3)",
    [ANON, OTRO, HOY],
  );
  await db.query(
    "INSERT INTO referrals (referrer_id, referred_user_id, referred_ip_hash, date_key) VALUES ($1, $2, 'mismaip', $3)",
    [GOOGLE, OTRO, HOY],
  );
  ok = true;
  try {
    await mergeAndDelete();
  } catch {
    ok = false;
  }
  const c = await one<{ c: number }>("SELECT COUNT(*)::int AS c FROM referrals WHERE referrer_id = $1", [GOOGLE]);
  assert(ok && c.c === 1, "si los dos cobraron al mismo amigo el mismo día, queda uno solo (sin chocar los índices)");
}

async function testSegundaOportunidad() {
  console.log("\n▶ Segundas oportunidades");
  await reset();
  await db.query("INSERT INTO second_chances (user_id, date_key, game_id) VALUES ($1, $2, 'polewordle')", [ANON, HOY]);
  await mergeAndDelete();
  const s = await one<{ c: number }>("SELECT COUNT(*)::int AS c FROM second_chances WHERE user_id = $1 AND date_key = $2::date", [GOOGLE, HOY]);
  assert(s.c === 1, "la vida gastada hoy sin cuenta sigue contando para la cuenta de Google");

  await reset();
  await db.query("INSERT INTO second_chances (user_id, date_key, game_id) VALUES ($1, $2, 'polewordle')", [ANON, HOY]);
  await db.query("INSERT INTO second_chances (user_id, date_key, game_id) VALUES ($1, $2, 'pittexto')", [GOOGLE, HOY]);
  await mergeAndDelete();
  const s2 = await one<{ game_id: string }>("SELECT game_id FROM second_chances WHERE user_id = $1", [GOOGLE]);
  assert(s2.game_id === "pittexto", "si los dos usaron una ese día, queda la de la cuenta de Google");
}

await schema();
await testVidas();
await testDesafios();
await testReferidos();
await testSegundaOportunidad();

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} asserts OK, ${failed} fallos`);
process.exit(failed === 0 ? 0 : 1);
