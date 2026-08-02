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
    forfeitDuel,
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

  console.log("\n▶ POST /duels/:id/forfeit");
  {
    const r = mockReply();
    await forfeitDuel({ params: { id: "corto" }, body: { userId: CREATOR, identityToken: myToken } } as any, r);
    assert(r._state.code === 422, `duelId con formato inválido → 422 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await forfeitDuel({ params: { id: DUEL_ID }, body: { userId: CREATOR } } as any, r);
    assert(r._state.code === 403, `sin identityToken → 403 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await forfeitDuel({ params: { id: DUEL_ID }, body: { userId: CREATOR, identityToken: otherToken } } as any, r);
    assert(r._state.code === 403, `identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ GET /duels/:id (getDuel) y /duels/pending");
  {
    // Validación de formato corre ANTES de tocar la DB (a diferencia de la
    // autorización de ownership, que desde el "preview de link abierto"
    // depende de leer el duelo primero — ver Parte B para esos casos).
    const r = mockReply();
    await getDuel({ params: { id: "corto" }, query: { userId: CREATOR } } as any, r);
    assert(r._state.code === 422, `duelId con formato inválido → 422 (recibido: ${r._state.code})`);
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

  // ─── getDuel: preview de link abierto vs ownership estricto ─────────
  // Réplica de la lógica de autorización agregada a getDuel (Etapa 3):
  // un duelo 'pending' con opponent_id NULL (link abierto, sin reclamar)
  // es legible por cualquiera SIN identityToken; cualquier otro caso exige
  // ser participante.
  console.log("\n[getDuel: preview de link abierto vs ownership]");
  await resetData();
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
     VALUES ('DUELOPEN', $1, NULL, 'pittexto', 'medio', 'DUELOPEN', 'pending', now() + interval '60 seconds')`,
    [CREATOR],
  );
  const THIRD_PARTY = "anon-99999999-9999-9999-9999-999999999999";
  await q("INSERT INTO users (id) VALUES ($1) ON CONFLICT DO NOTHING", [THIRD_PARTY]);
  // Otro creador (OPPONENT) para no chocar con el índice "1 activo" de CREATOR.
  await q(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
     VALUES ('DUELDIR1', $1, $2, 'pittexto', 'medio', 'DUELDIR1', 'active', now() + interval '15 minutes')`,
    [OPPONENT, CREATOR],
  );
  function canPreview(status: string, opponentId: string | null): boolean {
    return status === "pending" && opponentId === null;
  }
  function canRead(viewerId: string | null, status: string, creatorId: string, opponentId: string | null): boolean {
    const isParticipant = !!viewerId && (viewerId === creatorId || viewerId === opponentId);
    return isParticipant || canPreview(status, opponentId);
  }
  assert(
    canRead(null, "pending", CREATOR, null),
    "duelo pending + link abierto: legible SIN identityToken (preview antes de aceptar)",
  );
  assert(
    !canRead(null, "active", OPPONENT, CREATOR),
    "duelo active y dirigido: NO legible sin ser participante (ownership estricto se mantiene)",
  );
  assert(
    !canRead(THIRD_PARTY, "active", OPPONENT, CREATOR),
    "duelo active: un tercero ajeno tampoco puede leerlo",
  );
  assert(
    canRead(CREATOR, "active", OPPONENT, CREATOR),
    "duelo active: el propio oponente sí puede leerlo",
  );
}

/**
 * PARTE D: walkover por abandono. A diferencia del resto de la Parte B (que
 * replica SQL), esta sección importa y ejercita las funciones REALES de
 * `src/api/routes.ts` (`lockDuelForSettle` / `writeDuelSideResult` /
 * `walkoverResult`) pasándoles PGlite como cliente de transacción — su firma
 * `TxClient` es estructural justamente para permitir esto. Mismo enfoque que
 * `scripts/test-badges.ts`, que testea la lógica real con un ejecutor
 * inyectable en vez de duplicar el SQL.
 */
async function partD() {
  console.log("\n═══ PARTE D: walkover por abandono (funciones REALES de routes.ts) ═══");
  const { lockDuelForSettle, writeDuelSideResult, walkoverResult } = await import("@/api/routes");

  // La Parte B deja duelos activos; el índice parcial "1 duelo activo por
  // usuario" impediría crear los de esta sección. Se arranca de cero.
  await q("DELETE FROM duels");

  const NOW = Date.parse("2026-08-10T12:00:00Z");
  const realResult = (won: boolean, points: number) => ({
    won,
    points,
    timeSeconds: 30,
    finishedAt: new Date(NOW).toISOString(),
  });

  /** Crea un duelo activo limpio entre CREATOR y OPPONENT. */
  async function freshActiveDuel(id: string) {
    await q("DELETE FROM duels WHERE id = $1", [id]);
    await q(
      `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, seed, status, expires_at)
       VALUES ($1, $2, $3, 'pittexto', 'medio', $1, 'active', now() + interval '5 minutes')`,
      [id, CREATOR, OPPONENT],
    );
  }
  const readDuel = async (id: string) =>
    (await q("SELECT * FROM duels WHERE id = $1", [id])).rows[0] as any;

  // ─── Abandono con el rival sin jugar → walkover ─────────────────────
  console.log("\n[Abandono y el rival no jugó → walkover]");
  await freshActiveDuel("DUELWO01");
  {
    const lock = await lockDuelForSettle(db as any, "DUELWO01", CREATOR);
    assert(lock.ok && lock.side === "creator", "el creador puede cerrar su lado");
    if (lock.ok) {
      // isAbandon = true y el rival no tenía resultado → se otorga walkover.
      await writeDuelSideResult(db as any, {
        duelId: "DUELWO01",
        side: lock.side,
        result: realResult(false, 0),
        walkoverForOther: lock.otherHadResult ? null : walkoverResult(NOW),
        finished: true,
      });
    }
    const d = await readDuel("DUELWO01");
    assert(d.status === "finished", "el duelo se cierra en el acto ('finished')");
    assert(d.creator_result?.won === false, "el que abandonó queda como perdedor");
    assert(d.opponent_result?.won === true, "el rival gana sin haber jugado");
    assert(d.opponent_result?.walkover === true, "el resultado del rival viene marcado como walkover");
    assert(d.opponent_result?.points === 0, "el ganador por walkover no recibe puntos inventados");
  }

  // ─── Abandono con el rival YA jugado → comparación normal ───────────
  console.log("\n[Abandono pero el rival ya jugó → sin walkover, gana por puntaje real]");
  await freshActiveDuel("DUELWO02");
  {
    // El oponente juega de verdad primero.
    const lockB = await lockDuelForSettle(db as any, "DUELWO02", OPPONENT);
    if (lockB.ok) {
      await writeDuelSideResult(db as any, {
        duelId: "DUELWO02",
        side: lockB.side,
        result: realResult(true, 480),
        walkoverForOther: null,
        finished: false,
      });
    }
    const mid = await readDuel("DUELWO02");
    assert(mid.status === "active", "tras jugar uno solo, el duelo sigue activo");

    // Ahora el creador abandona: el rival YA tiene resultado → NO hay walkover.
    const lockA = await lockDuelForSettle(db as any, "DUELWO02", CREATOR);
    assert(lockA.ok && lockA.otherHadResult === true, "se detecta que el rival ya tenía resultado");
    if (lockA.ok) {
      await writeDuelSideResult(db as any, {
        duelId: "DUELWO02",
        side: lockA.side,
        result: realResult(false, 0),
        walkoverForOther: lockA.otherHadResult ? null : walkoverResult(NOW),
        finished: true,
      });
    }
    const d = await readDuel("DUELWO02");
    assert(d.status === "finished", "el duelo se cierra cuando ambos tienen resultado");
    assert(
      d.opponent_result?.points === 480 && d.opponent_result?.walkover === undefined,
      "el puntaje real del rival se conserva intacto (no se pisa con un walkover)",
    );
  }

  // ─── Doble cierre del mismo lado → rechazado ────────────────────────
  // Es el desenlace que garantiza el `FOR UPDATE` ante dos abandonos
  // simultáneos: el segundo en tomar el lock ve su lado ya resuelto y aborta,
  // en vez de otorgar un segundo walkover y dejar dos ganadores.
  console.log("\n[Segundo cierre del mismo lado → already_played]");
  {
    const again = await lockDuelForSettle(db as any, "DUELWO01", CREATOR);
    assert(
      !again.ok && again.reason === "already_played",
      "cerrar dos veces el mismo lado se rechaza (base del anti-doble-walkover)",
    );
    const d = await readDuel("DUELWO01");
    assert(
      d.creator_result?.walkover === undefined,
      "el que abandonó NUNCA termina marcado como ganador por walkover",
    );
  }

  // ─── Ajeno al duelo / duelo inexistente ─────────────────────────────
  console.log("\n[Validaciones de participación]");
  {
    const stranger = await lockDuelForSettle(db as any, "DUELWO01", "anon-99999999-9999-9999-9999-999999999999");
    assert(!stranger.ok && stranger.reason === "not_participant", "un tercero no puede cerrar el duelo");
    const missing = await lockDuelForSettle(db as any, "NOEXISTE", CREATOR);
    assert(!missing.ok && missing.reason === "gone", "un duelo inexistente devuelve 'gone'");
  }

  // ─── REGRESIÓN: los intentos de duelo no entran al historial personal ─
  // `getUserAttempts` alimenta `syncFromServer`, que escribe el lock durable
  // `played[dia][juego]`. Sin `AND duel_id IS NULL`, jugar un duelo bloqueaba
  // el reto diario del mismo juego al recargar o entrar desde otro dispositivo.
  console.log("\n[Regresión: el historial personal excluye intentos de duelo]");
  {
    await q("DELETE FROM attempts");
    await q(
      `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, ranked, duel_id)
       VALUES ($1, 'pittexto', '2026-08-10', 'medio', true, 300, true, NULL)`,
      [CREATOR],
    );
    await q(
      `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, ranked, duel_id)
       VALUES ($1, 'pittexto', '2026-08-10', 'medio', true, 480, false, 'DUELWO01')`,
      [CREATOR],
    );
    const rows = await q(
      `SELECT game_id, points FROM attempts
       WHERE user_id = $1 AND date_key BETWEEN $2::date AND $3::date
         AND duel_id IS NULL
       ORDER BY date_key DESC, created_at DESC`,
      [CREATOR, "2026-08-01", "2026-08-31"],
    );
    assert(rows.rows.length === 1, "solo vuelve el intento del reto diario, no el del duelo");
    assert(
      Number((rows.rows[0] as any).points) === 300,
      "y es el del reto diario (300 pts), no el del duelo (480)",
    );
  }
}

/**
 * PARTE E: desenlace justo de un duelo (fix del bug "gana el AFK").
 *
 * Ejercita el SQL REAL de `settleExpiredDuels` (exportado con ejecutor
 * inyectable, mismo patrón que `badges.ts`) contra PGlite, más las funciones
 * reales de cierre de la Parte D.
 *
 * Regla que se valida:
 *  - quedarse sin tiempo / no jugar  → derrota de 0 puntos, NO regala la victoria;
 *  - abandono explícito (forfeit)    → el que se va pierde, el rival gana;
 *  - dos lados en 0                  → EMPATE.
 */
async function partE() {
  console.log("\n═══ PARTE E: desenlace justo del duelo (SQL real de settleExpiredDuels) ═══");
  const { settleExpiredDuels, lockDuelForSettle, writeDuelSideResult, walkoverResult, duelClosurePlan } =
    await import("@/api/routes");

  // ─── LA REGLA EN SÍ (función pura) ──────────────────────────────────
  // Es el test que de verdad detecta el bug reportado: antes la condición era
  // `isAbandon && !otherHadResult`, y como el cliente manda `solution: null`
  // tanto al abandonar como al agotarse el timer, terminar sin tiempo le
  // regalaba la victoria a un rival AUSENTE.
  console.log("\n[Regla de desenlace: quién puede ganar por walkover]");
  {
    const timeout = duelClosurePlan({ reason: "played", otherHadResult: false });
    assert(
      timeout.grantWalkover === false,
      "REGRESIÓN: terminar sin completar el reto NO le regala la victoria al rival ausente",
    );
    assert(
      timeout.finished === false,
      "y el duelo queda abierto: el rival todavía puede jugar antes de que venza el plazo",
    );

    const played = duelClosurePlan({ reason: "played", otherHadResult: true });
    assert(played.grantWalkover === false, "jugar nunca otorga walkover");
    assert(played.finished === true, "con ambos resultados el duelo se cierra");

    const forfeit = duelClosurePlan({ reason: "forfeit", otherHadResult: false });
    assert(
      forfeit.grantWalkover === true,
      "el abandono EXPLÍCITO sí le da la victoria al rival (irse siempre es derrota)",
    );
    assert(forfeit.finished === true, "y cierra el duelo en el acto");

    const forfeitLate = duelClosurePlan({ reason: "forfeit", otherHadResult: true });
    assert(
      forfeitLate.grantWalkover === false,
      "si el rival ya había jugado, se respeta su puntaje real en vez de pisarlo con un walkover",
    );
  }

  await q("DELETE FROM duels");

  const exec = ((sql: string, params?: any[]) => db.query(sql, params as any[])) as any;
  const NOW = Date.parse("2026-08-10T12:00:00Z");
  const played = (won: boolean, points: number) => ({
    won,
    points,
    timeSeconds: 42,
    finishedAt: new Date(NOW).toISOString(),
  });
  const readDuel = async (id: string) =>
    (await q("SELECT * FROM duels WHERE id = $1", [id])).rows[0] as any;

  /** Duelo activo cuyo plazo YA venció (nadie lo barrió todavía). */
  async function expiredActiveDuel(id: string) {
    await q("DELETE FROM duels WHERE id = $1", [id]);
    await q(
      `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status, expires_at)
       VALUES ($1, $2, $3, 'pittexto', 'medio', 120, $1, 'active', now() - interval '1 minute')`,
      [id, CREATOR, OPPONENT],
    );
  }

  /** Réplica de la regla de desenlace del cliente (DuelResultScreen.tsx). */
  const isTie = (a: any, b: any) => a.won === b.won && a.points === b.points;
  const winnerIsCreator = (c: any, o: any) => (c.won !== o.won ? c.won : c.points > o.points);

  // ─── BUG REPORTADO (a): uno se queda sin tiempo, el otro nunca jugó ──
  // Antes: el cliente manda `solution: null` al agotarse el timer, el backend
  // lo leía como abandono y le daba el walkover al AUSENTE. Ahora es 0-0.
  console.log("\n[Se acaba el tiempo de uno + rival ausente → EMPATE]");
  await expiredActiveDuel("DUELTO01");
  {
    // El creador jugó y no llegó a completarlo: derrota de 0 puntos, sin walkover.
    const lock = await lockDuelForSettle(db as any, "DUELTO01", CREATOR);
    if (lock.ok) {
      await writeDuelSideResult(db as any, {
        duelId: "DUELTO01",
        side: lock.side,
        result: played(false, 0),
        walkoverForOther: null,
        finished: lock.otherHadResult,
      });
    }
    const mid = await readDuel("DUELTO01");
    assert(mid.status === "active", "tras terminar uno solo, el duelo sigue abierto");
    assert(mid.opponent_result === null, "el rival ausente NO recibe un walkover regalado");

    await settleExpiredDuels({ duelId: "DUELTO01" }, exec);
    const d = await readDuel("DUELTO01");
    assert(d.status === "finished", "al vencer el plazo el duelo se cierra (ya no queda en 'expired')");
    assert(d.opponent_result?.timedOut === true, "al ausente se le asigna una derrota por no jugar");
    assert(d.opponent_result?.won === false, "el ausente NO gana");
    assert(d.opponent_result?.points === 0, "el ausente queda en 0 puntos");
    assert(
      isTie(d.creator_result, d.opponent_result),
      "REGRESIÓN: ninguno completó el reto → EMPATE (antes ganaba el ausente)",
    );
  }

  // ─── BUG REPORTADO (b): los dos se quedan AFK ───────────────────────
  console.log("\n[Los dos AFK hasta agotar el plazo → EMPATE]");
  await expiredActiveDuel("DUELTO02");
  {
    await settleExpiredDuels({ duelId: "DUELTO02" }, exec);
    const d = await readDuel("DUELTO02");
    assert(d.status === "finished", "un duelo que nadie jugó igual se cierra con desenlace");
    assert(
      d.creator_result?.timedOut === true && d.opponent_result?.timedOut === true,
      "ambos lados quedan marcados como 'no jugó'",
    );
    assert(
      isTie(d.creator_result, d.opponent_result),
      "REGRESIÓN: nadie jugó → EMPATE (antes no se daba ningún desenlace)",
    );
  }

  // ─── El que sí jugó y ganó no pierde su victoria ────────────────────
  // Agujero viejo: el duelo quedaba 'active' → 'expired', y `serializeDuel`
  // nunca revela resultados de un 'expired', así que el ganador no veía nada.
  console.log("\n[Uno gana con puntos + rival ausente → gana el que jugó]");
  await expiredActiveDuel("DUELTO03");
  {
    const lock = await lockDuelForSettle(db as any, "DUELTO03", CREATOR);
    if (lock.ok) {
      await writeDuelSideResult(db as any, {
        duelId: "DUELTO03",
        side: lock.side,
        result: played(true, 480),
        walkoverForOther: null,
        finished: lock.otherHadResult,
      });
    }
    await settleExpiredDuels({ duelId: "DUELTO03" }, exec);
    const d = await readDuel("DUELTO03");
    assert(d.status === "finished", "el duelo termina en 'finished', no en 'expired'");
    assert(d.creator_result?.points === 480, "el puntaje real del que jugó se conserva intacto");
    assert(!isTie(d.creator_result, d.opponent_result), "no es empate: uno hizo puntos");
    assert(
      winnerIsCreator(d.creator_result, d.opponent_result),
      "gana el que completó el reto, aunque el rival nunca haya aparecido",
    );
  }

  // ─── El abandono explícito SÍ sigue dando la victoria al rival ──────
  console.log("\n[Abandono explícito con rival en 0 → gana el rival (walkover intacto)]");
  await expiredActiveDuel("DUELTO04");
  {
    const lock = await lockDuelForSettle(db as any, "DUELTO04", CREATOR);
    if (lock.ok) {
      // Lo que hace forfeitDuel: mi derrota marcada + walkover al rival.
      await writeDuelSideResult(db as any, {
        duelId: "DUELTO04",
        side: lock.side,
        result: { won: false, points: 0, timeSeconds: 0, forfeit: true, finishedAt: new Date(NOW).toISOString() },
        walkoverForOther: lock.otherHadResult ? null : walkoverResult(NOW),
        finished: true,
      });
    }
    const d = await readDuel("DUELTO04");
    assert(d.creator_result?.forfeit === true, "queda registrado que abandonó explícitamente");
    assert(d.opponent_result?.walkover === true, "el rival gana por abandono aunque no haya jugado");
    assert(
      !isTie(d.creator_result, d.opponent_result) && !winnerIsCreator(d.creator_result, d.opponent_result),
      "irse a propósito SIEMPRE es derrota, aunque el rival tampoco haya hecho puntos",
    );
  }

  // ─── Un finish tardío no puede resucitar un duelo ya cerrado ────────
  console.log("\n[Finish tardío sobre un duelo ya cerrado → bloqueado]");
  {
    // DUELTO02 quedó 'finished' con ambos lados completados por el vencimiento.
    const lateCreator = await lockDuelForSettle(db as any, "DUELTO02", CREATOR);
    const lateOpponent = await lockDuelForSettle(db as any, "DUELTO02", OPPONENT);
    assert(
      !lateCreator.ok && lateCreator.reason === "already_played",
      "el lado ya resuelto rechaza una finalización tardía",
    );
    assert(
      !lateOpponent.ok && lateOpponent.reason === "already_played",
      "y el otro lado también",
    );

    // Además, el guard de estado: un duelo cancelado reporta su status para que
    // `finishDuelChallenge` lo rechace en vez de escribirle encima.
    await q("DELETE FROM duels WHERE id = $1", ["DUELTO05"]);
    await q(
      `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status, expires_at)
       VALUES ($1, $2, $3, 'pittexto', 'medio', 120, $1, 'cancelled', now() + interval '5 minutes')`,
      ["DUELTO05", CREATOR, OPPONENT],
    );
    const onCancelled = await lockDuelForSettle(db as any, "DUELTO05", CREATOR);
    assert(
      onCancelled.ok && onCancelled.status === "cancelled",
      "sobre un duelo cancelado el lock reporta el estado (el handler responde 409 con eso)",
    );
  }

  // ─── El cierre libera la regla "1 duelo activo" ─────────────────────
  // Los índices `idx_duels_*_active` solo miran `status`, así que una fila
  // muerta pero no barrida bloqueaba crear un duelo nuevo con un 409 engañoso.
  console.log("\n[Duelo vencido no barrido → deja de bloquear la creación de otro]");
  {
    await q("DELETE FROM duels");
    await expiredActiveDuel("DUELTO06");
    let blocked = false;
    try {
      await q(
        `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status, expires_at)
         VALUES ('DUELTO07', $1, NULL, 'pittexto', 'medio', 120, 'DUELTO07', 'pending', now() + interval '60 seconds')`,
        [CREATOR],
      );
    } catch {
      blocked = true;
    }
    assert(blocked, "sin barrer, la fila muerta bloquea el INSERT (origen del 409 falso)");

    await settleExpiredDuels({ userId: CREATOR }, exec);
    let blockedAfter = false;
    try {
      await q(
        `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status, expires_at)
         VALUES ('DUELTO07', $1, NULL, 'pittexto', 'medio', 120, 'DUELTO07', 'pending', now() + interval '60 seconds')`,
        [CREATOR],
      );
    } catch {
      blockedAfter = true;
    }
    assert(!blockedAfter, "tras el cierre automático, crear un duelo nuevo funciona (fix del 409 falso)");
  }

  // ─── Plazo derivado de la duración de la partida ────────────────────
  // Réplica fiel (estilo Parte B) del SQL de `acceptDuel` y de la extensión de
  // `startDuelChallenge`: son statements nuevos con aritmética de intervalos, y
  // sin esto un error de sintaxis recién aparecería en producción.
  console.log("\n[Plazo = duración de la partida + margen]");
  {
    await q("DELETE FROM duels");
    await q(
      `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status, expires_at)
       VALUES ('DUELTTL1', $1, NULL, 'pittexto', 'medio', 120, 'DUELTTL1', 'pending', now() + interval '60 seconds')`,
      [CREATOR],
    );

    // SQL de acceptDuel: expires_at = now + (time_limit + margen) segundos.
    const accepted = await q(
      `UPDATE duels
       SET opponent_id = $1, status = 'active',
           expires_at = now() + ((COALESCE(time_limit, 180) + $2::int) * INTERVAL '1 second')
       WHERE id = $3 AND status = 'pending' AND expires_at > now()
         AND creator_id <> $1
         AND (opponent_id IS NULL OR opponent_id = $1)
       RETURNING EXTRACT(EPOCH FROM (expires_at - now()))::int AS secs`,
      [OPPONENT, 30, "DUELTTL1"],
    );
    const secs = Number((accepted.rows[0] as any)?.secs ?? 0);
    assert(
      secs >= 145 && secs <= 151,
      `al aceptar, el plazo queda en 120s de partida + 30s de margen (obtenido: ${secs}s)`,
    );

    // Quien arranca tarde estira el plazo para no perder su partida entera.
    await q("UPDATE duels SET expires_at = now() + interval '10 seconds' WHERE id = 'DUELTTL1'");
    await q(
      `UPDATE duels
       SET expires_at = GREATEST(expires_at, now() + ($2::int * INTERVAL '1 second'))
       WHERE id = $1 AND status = 'active'`,
      ["DUELTTL1", 150],
    );
    const after = await q(
      "SELECT EXTRACT(EPOCH FROM (expires_at - now()))::int AS secs FROM duels WHERE id = 'DUELTTL1'",
    );
    assert(
      Number((after.rows[0] as any).secs) >= 145,
      "arrancar tarde EXTIENDE el plazo (nadie pierde su partida por una carga lenta)",
    );

    // Pero nunca lo acorta: si el rival ya lo había estirado más, se respeta.
    await q("UPDATE duels SET expires_at = now() + interval '600 seconds' WHERE id = 'DUELTTL1'");
    await q(
      `UPDATE duels
       SET expires_at = GREATEST(expires_at, now() + ($2::int * INTERVAL '1 second'))
       WHERE id = $1 AND status = 'active'`,
      ["DUELTTL1", 150],
    );
    const kept = await q(
      "SELECT EXTRACT(EPOCH FROM (expires_at - now()))::int AS secs FROM duels WHERE id = 'DUELTTL1'",
    );
    assert(
      Number((kept.rows[0] as any).secs) > 500,
      "GREATEST nunca ACORTA un plazo mayor ya fijado",
    );
  }

  // ─── Un 'pending' vencido NO inventa un empate ──────────────────────
  console.log("\n[Invitación vencida sin aceptar → 'expired', no un empate inventado]");
  {
    await q("DELETE FROM duels");
    await q(
      `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status, expires_at)
       VALUES ('DUELTO08', $1, $2, 'pittexto', 'medio', 120, 'DUELTO08', 'pending', now() - interval '1 minute')`,
      [CREATOR, OPPONENT],
    );
    await settleExpiredDuels({ duelId: "DUELTO08" }, exec);
    const d = await readDuel("DUELTO08");
    assert(d.status === "expired", "una invitación que nadie aceptó expira (no hubo duelo)");
    assert(
      d.creator_result === null && d.opponent_result === null,
      "y no se le inventan resultados a nadie",
    );
  }
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
  await partD();
  await partE();
  await partC();
  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} fallidos`);
  await db.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Error inesperado en el test:", err);
  process.exit(1);
});
