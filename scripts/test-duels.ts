/**
 * Test del sistema de DUELOS (Roadmap §4, Etapa 1) — src/api/routes.ts.
 *
 * Dos partes, seaparate porque los handlers reales (createDuel, acceptDuel,
 * etc.) usan `query`/`transaction` de src/api/db.ts, que están atados a un
 * pool `pg` real (no son inyectables) — mismo patrón que
 * scripts/test-idor-protection.ts y scripts/test-migration-scenarios.mjs:
 *
 *  PARTE A — Handlers REALES (import directo desde src/api/routes.ts) con un
 *  DATABASE_URL falso: solo se ejercita la autorización/validación que corre
 *  ANTES de tocar la base (ownership, formato de duelId, gameId/dificultad
 *  válidos). Es exactamente lo que hace test-idor-protection.ts.
 *
 *  PARTE B — Réplica fiel de las queries SQL (copiadas de routes.ts/db.ts)
 *  corriendo contra PGlite (Postgres real en memoria), para probar los
 *  invariantes que dependen de la base: índices únicos parciales ("1 duelo
 *  activo", "1 intento por duelo"), la carrera de aceptación, el modo a
 *  ciegas, que un duelo no bloquea el reto diario, y que sus attempts no
 *  entran al ranking. Cualquier cambio a esas queries en routes.ts/db.ts
 *  debe reflejarse acá para que el test siga siendo representativo.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-duels.ts
 */
process.env.TOKEN_SECRET = "test-only-secret-duels";
process.env.ADMIN_SECRET = "test-only-secret-duels";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://unused/unused";

import { PGlite } from "@electric-sql/pglite";

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

function mockReply() {
  const state: { code?: number; body?: unknown } = {};
  return {
    code(c: number) {
      state.code = c;
      return this;
    },
    send(b: unknown) {
      state.body = b;
      return this;
    },
    _state: state,
  } as any;
}

const CREATOR = "anon-11111111-1111-1111-1111-111111111111";
const OPPONENT = "anon-22222222-2222-2222-2222-222222222222";
const DUEL_ID = "ABCDEFGH"; // 8 chars, formato válido

async function partA() {
  console.log("\n═══ PARTE A: autorización/validación de los handlers REALES ═══");

  const {
    createDuel,
    acceptDuel,
    declineDuel,
    cancelDuel,
    getDuel,
    getPendingDuels,
  } = await import("@/api/routes");
  const { signIdentityToken } = await import("@/api/identity-token");

  const myToken = signIdentityToken(CREATOR);
  const otherToken = signIdentityToken(OPPONENT);

  console.log("\n▶ POST /duels (createDuel)");
  {
    const r = mockReply();
    await createDuel({ body: { gameId: "pittexto", difficulty: "medio", identityToken: myToken } } as any, r);
    assert(r._state.code === 422, `sin userId → 422 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await createDuel({ body: { userId: CREATOR, gameId: "pittexto", difficulty: "medio" } } as any, r);
    assert(r._state.code === 403, `sin identityToken → 403 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await createDuel(
      { body: { userId: CREATOR, gameId: "juego-inventado", difficulty: "medio", identityToken: myToken } } as any,
      r,
    );
    assert(r._state.code === 422, `gameId inválido → 422 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await createDuel(
      { body: { userId: CREATOR, gameId: "pittexto", difficulty: "imposible", identityToken: myToken } } as any,
      r,
    );
    assert(r._state.code === 422, `dificultad inválida → 422 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ POST /duels/:id/accept (acceptDuel)");
  {
    const r = mockReply();
    await acceptDuel({ params: { id: "corto" }, body: { userId: OPPONENT, identityToken: otherToken } } as any, r);
    assert(r._state.code === 422, `duelId con formato inválido → 422 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await acceptDuel({ params: { id: DUEL_ID }, body: { userId: OPPONENT, identityToken: myToken } } as any, r);
    assert(r._state.code === 403, `identityToken de otro usuario → 403 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ POST /duels/:id/decline y /cancel");
  {
    const r = mockReply();
    await declineDuel({ params: { id: DUEL_ID }, body: { userId: OPPONENT, identityToken: myToken } } as any, r);
    assert(r._state.code === 403, `decline con identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await cancelDuel({ params: { id: DUEL_ID }, body: { userId: CREATOR, identityToken: otherToken } } as any, r);
    assert(r._state.code === 403, `cancel con identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ GET /duels/:id (getDuel) y /duels/pending");
  {
    const r = mockReply();
    await getDuel({ params: { id: DUEL_ID }, query: { userId: CREATOR } } as any, r);
    assert(r._state.code === 403, `sin identityToken → 403 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await getPendingDuels({ query: { userId: CREATOR, identityToken: otherToken } } as any, r);
    assert(r._state.code === 403, `identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }
}

// ─── PARTE B: réplica SQL contra PGlite ──────────────────────────────

const db = new PGlite();
const q = (sql: string, params?: unknown[]) => db.query(sql, params as any[]);

async function setupSchema() {
  await q(`CREATE TABLE users (
    id TEXT PRIMARY KEY, display_name TEXT, country_code TEXT, created_at TIMESTAMPTZ DEFAULT now()
  );`);
  await q(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, game_id TEXT NOT NULL,
    date_key DATE NOT NULL, difficulty TEXT NOT NULL, won BOOLEAN NOT NULL,
    time_seconds INTEGER, points INTEGER NOT NULL, flagged BOOLEAN DEFAULT false,
    ranked BOOLEAN DEFAULT true, ip_address TEXT, duel_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
  await q(`CREATE UNIQUE INDEX idx_attempts_unique_daily ON attempts (user_id, game_id, date_key) WHERE duel_id IS NULL;`);
  await q(`CREATE UNIQUE INDEX idx_attempts_unique_duel ON attempts (duel_id, user_id) WHERE duel_id IS NOT NULL;`);

  await q(`CREATE TABLE duels (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    opponent_id TEXT,
    game_id TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    time_limit INT,
    seed TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'active', 'finished', 'expired', 'cancelled')),
    creator_result JSONB,
    opponent_result JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ,
    CHECK (opponent_id IS NULL OR opponent_id <> creator_id)
  );`);
  await q(`CREATE UNIQUE INDEX idx_duels_creator_active ON duels (creator_id) WHERE status IN ('pending', 'active');`);
  await q(`CREATE UNIQUE INDEX idx_duels_opponent_active ON duels (opponent_id) WHERE status IN ('pending', 'active') AND opponent_id IS NOT NULL;`);

  await q("INSERT INTO users (id) VALUES ($1), ($2)", [CREATOR, OPPONENT]);
}

async function resetData() {
  await q("DELETE FROM duels");
  await q("DELETE FROM attempts");
}

/** Réplica de finishDuelChallenge: guarda el attempt y actualiza el resultado del lado que jugó. */
async function playDuelSide(
  duelId: string,
  side: "creator" | "opponent",
  userId: string,
  won: boolean,
  points: number,
) {
  const dueRow = (await q("SELECT creator_result, opponent_result FROM duels WHERE id = $1", [duelId])).rows[0] as any;
  const otherHadResult = (side === "creator" ? dueRow.opponent_result : dueRow.creator_result) != null;
  const resultJson = JSON.stringify({ won, points, timeSeconds: 30, finishedAt: new Date().toISOString() });

  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ranked, duel_id)
     VALUES ($1, 'pittexto', '2026-08-10', 'medio', $2, 30, $3, false, false, $4)`,
    [userId, won, points, duelId],
  );
  await q(
    `UPDATE duels
     SET creator_result  = CASE WHEN $2 = 'creator'  THEN $3::jsonb ELSE creator_result  END,
         opponent_result = CASE WHEN $2 = 'opponent' THEN $3::jsonb ELSE opponent_result END,
         status = CASE WHEN $4 THEN 'finished' ELSE status END,
         finished_at = CASE WHEN $4 THEN now() ELSE finished_at END
     WHERE id = $1`,
    [duelId, side, resultJson, otherHadResult],
  );
}

/** Réplica de serializeDuel: aplica el modo a ciegas. */
function serializeDuelReplica(d: any, viewerId: string) {
  const isCreator = viewerId === d.creator_id;
  const bothFinished = d.status === "finished";
  const otherResultRaw = isCreator ? d.opponent_result : d.creator_result;
  return {
    myResult: isCreator ? d.creator_result : d.opponent_result,
    opponentResult: bothFinished ? otherResultRaw ?? null : null,
    opponentFinished: otherResultRaw != null,
    status: d.status,
  };
}

async function partB() {
  console.log("\n═══ PARTE B: invariantes de DB (réplica SQL contra PGlite) ═══");
  await setupSchema();

  // ─── 1 duelo activo por usuario ────────────────────────────────────
  console.log("\n[1 duelo activo por usuario]");
  await resetData();
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
     VALUES ('DUEL0001', $1, NULL, 'pittexto', 'medio', 'DUEL0001', 'pending', now() + interval '60 seconds')`,
    [CREATOR],
  );
  let violated = false;
  try {
    await q(
      `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
       VALUES ('DUEL0002', $1, NULL, 'pittexto', 'facil', 'DUEL0002', 'pending', now() + interval '60 seconds')`,
      [CREATOR],
    );
  } catch (e: any) {
    violated = e.message?.includes("duplicate key") || e.code === "23505";
  }
  assert(violated, "segundo duelo pending del mismo creador viola el índice único parcial");

  // El mismo usuario NO puede ser oponente de dos duelos activos tampoco.
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
     VALUES ('DUEL0003', $1, $2, 'el-intruso', 'medio', 'DUEL0003', 'active', now() + interval '60 seconds')`,
    [OPPONENT, CREATOR],
  );
  let opponentViolated = false;
  try {
    await q(
      `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
       VALUES ('DUEL0004', $1, $2, 'gp-resultado', 'medio', 'DUEL0004', 'active', now() + interval '60 seconds')`,
      [OPPONENT, CREATOR],
    );
  } catch (e: any) {
    opponentViolated = e.message?.includes("duplicate key") || e.code === "23505";
  }
  assert(opponentViolated, "segundo duelo activo con el mismo oponente viola el índice único parcial");

  // ─── CHECK: no auto-duelo ───────────────────────────────────────────
  console.log("\n[CHECK anti-auto-duelo]");
  await resetData();
  let checkViolated = false;
  try {
    await q(
      `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
       VALUES ('DUELSELF', $1, $1, 'pittexto', 'medio', 'DUELSELF', 'active', now() + interval '60 seconds')`,
      [CREATOR],
    );
  } catch (e: any) {
    checkViolated = true;
  }
  assert(checkViolated, "creator_id = opponent_id viola el CHECK (no se puede auto-duelar)");

  // ─── Carrera de aceptación: gana el primero, el segundo ve 0 filas ──
  console.log("\n[Carrera de aceptación]");
  await resetData();
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
     VALUES ('DUELRACE', $1, NULL, 'pittexto', 'medio', 'DUELRACE', 'pending', now() + interval '60 seconds')`,
    [CREATOR],
  );
  const THIRD = "anon-33333333-3333-3333-3333-333333333333";
  await q("INSERT INTO users (id) VALUES ($1) ON CONFLICT DO NOTHING", [THIRD]);
  // Primer "accept" (OPPONENT) — debe ganar.
  const accept1 = await q(
    `UPDATE duels SET opponent_id = $1, status = 'active', expires_at = now() + interval '15 minutes'
     WHERE id = 'DUELRACE' AND status = 'pending' AND expires_at > now()
       AND creator_id <> $1 AND (opponent_id IS NULL OR opponent_id = $1)
     RETURNING id`,
    [OPPONENT],
  );
  assert(accept1.rows.length === 1, "el primer accept gana la carrera (1 fila afectada)");
  // Segundo "accept" (THIRD) sobre el MISMO duelo, ya no está 'pending'.
  const accept2 = await q(
    `UPDATE duels SET opponent_id = $1, status = 'active', expires_at = now() + interval '15 minutes'
     WHERE id = 'DUELRACE' AND status = 'pending' AND expires_at > now()
       AND creator_id <> $1 AND (opponent_id IS NULL OR opponent_id = $1)
     RETURNING id`,
    [THIRD],
  );
  assert(accept2.rows.length === 0, "el segundo accept pierde la carrera (0 filas, → 409 en el handler)");

  // ─── Flujo completo: modo a ciegas + consolidación ──────────────────
  console.log("\n[Flujo completo + modo a ciegas]");
  await resetData();
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
     VALUES ('DUELFULL', $1, $2, 'pittexto', 'medio', 'DUELFULL', 'active', now() + interval '15 minutes')`,
    [CREATOR, OPPONENT],
  );
  await playDuelSide("DUELFULL", "creator", CREATOR, true, 500);
  const mid = (await q("SELECT * FROM duels WHERE id = 'DUELFULL'")).rows[0] as any;
  assert(mid.status === "active", "el duelo sigue 'active' tras jugar solo un lado");
  const midView = serializeDuelReplica(mid, OPPONENT);
  assert(midView.opponentResult === null, "el oponente NO ve mi resultado hasta que él también termine (a ciegas)");
  assert(midView.opponentFinished === true, "pero el server sabe internamente que ya terminé (opponentFinished=true)");

  await playDuelSide("DUELFULL", "opponent", OPPONENT, false, 200);
  const final = (await q("SELECT * FROM duels WHERE id = 'DUELFULL'")).rows[0] as any;
  assert(final.status === "finished", "el duelo pasa a 'finished' cuando ambos jugaron");
  const finalViewCreator = serializeDuelReplica(final, CREATOR);
  assert(
    finalViewCreator.opponentResult != null && finalViewCreator.opponentResult.points === 200,
    "una vez ambos terminaron, cada uno ve el resultado del otro",
  );

  // ─── 1 intento por duelo por usuario ────────────────────────────────
  console.log("\n[1 intento por duelo por usuario]");
  let duelAttemptViolated = false;
  try {
    await q(
      `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, ranked, duel_id)
       VALUES ($1, 'pittexto', '2026-08-10', 'medio', true, 999, false, 'DUELFULL')`,
      [CREATOR],
    );
  } catch (e: any) {
    duelAttemptViolated = e.code === "23505";
  }
  assert(duelAttemptViolated, "un segundo attempt del mismo usuario en el mismo duelo viola el índice único");

  // ─── Un duelo NO bloquea el reto diario del mismo juego/día ─────────
  console.log("\n[Duelo no bloquea el reto diario]");
  const dailyInsert = await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, ranked, duel_id)
     VALUES ($1, 'pittexto', '2026-08-10', 'medio', true, 300, true, NULL) RETURNING id`,
    [CREATOR],
  );
  assert(dailyInsert.rows.length === 1, "el reto diario se puede jugar el mismo día que un duelo del mismo juego");

  // Pero un SEGUNDO reto diario (duel_id NULL) del mismo user/game/día sigue bloqueado.
  let secondDailyBlocked = false;
  try {
    await q(
      `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, ranked, duel_id)
       VALUES ($1, 'pittexto', '2026-08-10', 'medio', true, 111, true, NULL)`,
      [CREATOR],
    );
  } catch (e: any) {
    secondDailyBlocked = e.code === "23505";
  }
  assert(secondDailyBlocked, "un segundo reto diario del mismo juego/día sigue bloqueado (regla intacta)");

  // ─── Los attempts de duelo NO cuentan al ranking ────────────────────
  console.log("\n[Ranking excluye attempts de duelo]");
  const rankingRows = await q(
    `SELECT user_id, SUM(points) as points FROM attempts
     WHERE won AND NOT flagged AND ranked AND date_key = '2026-08-10'::date
     GROUP BY user_id`,
  );
  const creatorRanked = (rankingRows.rows as any[]).find((r) => r.user_id === CREATOR);
  assert(
    Number(creatorRanked?.points ?? 0) === 300,
    `el ranking solo cuenta el attempt diario (300 pts), no los 500+999 de duelo (obtenido: ${creatorRanked?.points})`,
  );
}

/** Determinismo del motor de seed para duelos (Roadmap §4, decisión #1). */
async function partC() {
  console.log("\n═══ PARTE C: motor determinista con seed de duelo (src/lib/daily.ts) ═══");
  const { dailyPick } = await import("@/lib/daily");

  const pool = Array.from({ length: 40 }, (_, i) => `item-${i}`);
  const date = new Date("2026-08-10T12:00:00Z");

  const pickA = dailyPick(pool, date, "test::salt", "DUELAAAA");
  const pickA2 = dailyPick(pool, date, "test::salt", "DUELAAAA");
  assert(pickA === pickA2, "mismo duel_id + mismo salt → mismo resultado (determinismo)");

  const pickB = dailyPick(pool, date, "test::salt", "DUELBBBB");
  assert(pickA !== pickB, "duel_id distinto → resultado distinto (la revancha no repite respuesta)");

  const dailyPickNoSeed1 = dailyPick(pool, date, "test::salt");
  const dailyPickNoSeed2 = dailyPick(pool, date, "test::salt");
  assert(dailyPickNoSeed1 === dailyPickNoSeed2, "sin seed (reto diario normal), el comportamiento sigue intacto");
}

(async () => {
  await partA();
  await partB();
  await partC();
  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} fallidos`);
  await db.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Error inesperado en el test:", err);
  process.exit(1);
});
