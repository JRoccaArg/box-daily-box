/**
 * Test del sistema de AMIGOS (Roadmap §4, Etapa 1) — src/api/routes.ts.
 *
 * Misma estructura de dos partes que scripts/test-duels.ts (ver ese archivo
 * para la justificación completa):
 *
 *  PARTE A — Handlers reales con DATABASE_URL falso: solo autorización y
 *  validación de formato (ownership, formato de código).
 *
 *  PARTE B — Réplica fiel de las queries SQL (copiadas de routes.ts/db.ts)
 *  contra PGlite: generación/unicidad de friend_code, solicitudes (envío,
 *  duplicados, auto-aceptación recíproca, aceptar/rechazar), unfriend, y los
 *  CHECK/UNIQUE que garantizan la integridad a nivel DB.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-friends.ts
 */
process.env.TOKEN_SECRET = "test-only-secret-friends";
process.env.ADMIN_SECRET = "test-only-secret-friends";
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

const A = "anon-11111111-1111-1111-1111-111111111111";
const B = "anon-22222222-2222-2222-2222-222222222222";

async function partA() {
  console.log("\n═══ PARTE A: autorización/validación de los handlers REALES ═══");

  const {
    getMyFriendCode,
    resolveFriendByCode,
    sendFriendRequest,
    respondFriendRequest,
    getFriends,
    getFriendRequests,
    removeFriend,
  } = await import("@/api/routes");
  const { signIdentityToken } = await import("@/api/identity-token");

  const tokenA = signIdentityToken(A);
  const tokenB = signIdentityToken(B);

  console.log("\n▶ GET /me/friend-code");
  {
    const r = mockReply();
    await getMyFriendCode({ query: { userId: A, identityToken: tokenB } } as any, r);
    assert(r._state.code === 403, `identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ GET /friends/by-code/:code (público, pero valida formato)");
  {
    const r = mockReply();
    await resolveFriendByCode({ params: { code: "abc" } } as any, r);
    assert(r._state.code === 422, `código con formato inválido → 422 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ POST /friends/request");
  {
    const r = mockReply();
    await sendFriendRequest({ body: { userId: A, targetCode: "ABCDEF" } } as any, r);
    assert(r._state.code === 403, `sin identityToken → 403 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await sendFriendRequest({ body: { userId: A, targetCode: "abc", identityToken: tokenA } } as any, r);
    assert(r._state.code === 422, `targetCode con formato inválido → 422 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ POST /friends/respond");
  {
    const r = mockReply();
    await respondFriendRequest({ body: { userId: A, requestId: 1, accept: true, identityToken: tokenB } } as any, r);
    assert(r._state.code === 403, `identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await respondFriendRequest({ body: { userId: A, requestId: "no-numero", accept: true, identityToken: tokenA } } as any, r);
    assert(r._state.code === 422, `requestId no numérico → 422 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ POST /friends/remove");
  {
    const r = mockReply();
    await removeFriend({ body: { userId: A, friendUserId: B, identityToken: tokenB } } as any, r);
    assert(r._state.code === 403, `identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await removeFriend({ body: { userId: A, friendUserId: "no-es-un-id-valido", identityToken: tokenA } } as any, r);
    assert(r._state.code === 422, `friendUserId con formato inválido → 422 (recibido: ${r._state.code})`);
  }

  console.log("\n▶ GET /friends y /friends/requests");
  {
    const r = mockReply();
    await getFriends({ query: { userId: A, identityToken: tokenB } } as any, r);
    assert(r._state.code === 403, `getFriends con identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }
  {
    const r = mockReply();
    await getFriendRequests({ query: { userId: A, identityToken: tokenB } } as any, r);
    assert(r._state.code === 403, `getFriendRequests con identityToken ajeno → 403 (recibido: ${r._state.code})`);
  }
}

// ─── PARTE B: réplica SQL contra PGlite ──────────────────────────────

const db = new PGlite();
const q = (sql: string, params?: unknown[]) => db.query(sql, params as any[]);

async function setupSchema() {
  await q(`CREATE TABLE users (
    id TEXT PRIMARY KEY, display_name TEXT, country_code TEXT, friend_code TEXT,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
  await q(`CREATE UNIQUE INDEX idx_users_friend_code ON users (friend_code) WHERE friend_code IS NOT NULL;`);

  await q(`CREATE TABLE friendships (
    user_a TEXT NOT NULL, user_b TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_a, user_b), CHECK (user_a < user_b)
  );`);
  await q(`CREATE TABLE friend_requests (
    id BIGSERIAL PRIMARY KEY,
    from_user TEXT NOT NULL, to_user TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(), resolved_at TIMESTAMPTZ,
    CHECK (from_user <> to_user)
  );`);
  await q(`CREATE UNIQUE INDEX idx_friend_requests_pending ON friend_requests (from_user, to_user) WHERE status = 'pending';`);
}

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

async function resetData() {
  await q("DELETE FROM friend_requests");
  await q("DELETE FROM friendships");
  await q("UPDATE users SET friend_code = NULL");
}

async function partB() {
  console.log("\n═══ PARTE B: invariantes de DB (réplica SQL contra PGlite) ═══");
  await setupSchema();
  const C = "anon-33333333-3333-3333-3333-333333333333";
  await q("INSERT INTO users (id) VALUES ($1), ($2), ($3)", [A, B, C]);

  // ─── friend_code: único ─────────────────────────────────────────────
  console.log("\n[friend_code único]");
  await resetData();
  await q("UPDATE users SET friend_code = 'ABC234' WHERE id = $1", [A]);
  let codeCollision = false;
  try {
    await q("UPDATE users SET friend_code = 'ABC234' WHERE id = $1", [B]);
  } catch (e: any) {
    codeCollision = e.code === "23505";
  }
  assert(codeCollision, "dos usuarios no pueden compartir el mismo friend_code (índice único)");

  // ─── Solicitud de amistad: pendiente única por par ──────────────────
  console.log("\n[Solicitud única pendiente por par]");
  await resetData();
  await q("INSERT INTO friend_requests (from_user, to_user) VALUES ($1, $2)", [A, B]);
  let dupRequest = false;
  try {
    await q("INSERT INTO friend_requests (from_user, to_user) VALUES ($1, $2)", [A, B]);
  } catch (e: any) {
    dupRequest = e.code === "23505";
  }
  assert(dupRequest, "no se puede duplicar una solicitud pendiente A→B");

  // ─── CHECK: no auto-solicitud ────────────────────────────────────────
  console.log("\n[CHECK anti-auto-solicitud]");
  let selfCheck = false;
  try {
    await q("INSERT INTO friend_requests (from_user, to_user) VALUES ($1, $1)", [A]);
  } catch (e: any) {
    selfCheck = true;
  }
  assert(selfCheck, "from_user = to_user viola el CHECK (no autosolicitud)");

  // ─── Aceptar solicitud → crea friendship ordenada ───────────────────
  console.log("\n[Aceptar solicitud]");
  await resetData();
  const reqIns = await q("INSERT INTO friend_requests (from_user, to_user) VALUES ($1, $2) RETURNING id", [A, B]);
  const reqId = reqIns.rows[0].id;
  const [pa, pb] = orderedPair(A, B);
  await q("UPDATE friend_requests SET status = 'accepted', resolved_at = now() WHERE id = $1", [reqId]);
  await q("INSERT INTO friendships (user_a, user_b) VALUES ($1, $2) ON CONFLICT DO NOTHING", [pa, pb]);
  const friendship = await q("SELECT * FROM friendships WHERE user_a = $1 AND user_b = $2", [pa, pb]);
  assert(friendship.rows.length === 1, "aceptar la solicitud crea la friendship (par ordenado)");

  // ─── CHECK: friendships siempre ordenada (user_a < user_b) ──────────
  console.log("\n[CHECK orden de friendships]");
  await resetData();
  let orderCheck = false;
  const [oa, ob] = A < B ? [B, A] : [A, B]; // invertido a propósito
  try {
    await q("INSERT INTO friendships (user_a, user_b) VALUES ($1, $2)", [oa, ob]);
  } catch (e: any) {
    orderCheck = true;
  }
  assert(orderCheck, "insertar friendships con user_a > user_b viola el CHECK");

  // ─── Rechazar solicitud → no crea friendship ────────────────────────
  console.log("\n[Rechazar solicitud]");
  await resetData();
  const reqIns2 = await q("INSERT INTO friend_requests (from_user, to_user) VALUES ($1, $2) RETURNING id", [A, C]);
  await q("UPDATE friend_requests SET status = 'rejected', resolved_at = now() WHERE id = $1", [reqIns2.rows[0].id]);
  const noFriendship = await q("SELECT 1 FROM friendships WHERE (user_a = $1 OR user_b = $1) AND (user_a = $2 OR user_b = $2)", [A, C]);
  assert(noFriendship.rows.length === 0, "rechazar la solicitud NO crea friendship");

  // ─── Solicitud recíproca → auto-aceptación (réplica de sendFriendRequest) ──
  console.log("\n[Auto-aceptación recíproca]");
  await resetData();
  // B ya le había pedido amistad a A (pendiente).
  await q("INSERT INTO friend_requests (from_user, to_user) VALUES ($1, $2)", [B, A]);
  // Ahora A le pide a B: la réplica de sendFriendRequest detecta la recíproca y auto-acepta.
  const reverse = await q(
    "SELECT id FROM friend_requests WHERE from_user = $1 AND to_user = $2 AND status = 'pending'",
    [B, A],
  );
  assert(reverse.rows.length === 1, "se detecta la solicitud recíproca pendiente (B→A)");
  const [ra, rb] = orderedPair(A, B);
  await q("UPDATE friend_requests SET status = 'accepted', resolved_at = now() WHERE id = $1", [reverse.rows[0].id]);
  await q("INSERT INTO friendships (user_a, user_b) VALUES ($1, $2) ON CONFLICT DO NOTHING", [ra, rb]);
  const autoFriendship = await q("SELECT 1 FROM friendships WHERE user_a = $1 AND user_b = $2", [ra, rb]);
  assert(autoFriendship.rows.length === 1, "la solicitud recíproca se auto-acepta y crea friendship sin doble solicitud pendiente");

  // ─── Unfriend ────────────────────────────────────────────────────────
  console.log("\n[Unfriend]");
  await q("DELETE FROM friendships WHERE user_a = $1 AND user_b = $2", [ra, rb]);
  const afterRemove = await q("SELECT 1 FROM friendships WHERE user_a = $1 AND user_b = $2", [ra, rb]);
  assert(afterRemove.rows.length === 0, "removeFriend borra la friendship");

  await presencia(C);
}

/**
 * Presencia online/offline: réplica del SQL de `touchLastSeen` y del SELECT
 * de `getFriends` (src/api/routes.ts). Verifica las dos propiedades que
 * hacen que la feature no sea ni cara ni mentirosa:
 *  - el latido escribe como mucho 1 vez por minuto por usuario (si no, cada
 *    pestaña abierta escribiría 20 veces por minuto: el poll es cada 3s);
 *  - la ventana de 2 minutos decide bien quién aparece conectado, y los
 *    conectados salen primero.
 */
async function presencia(C: string) {
  console.log("\n[Presencia online/offline]");
  const WINDOW = 120; // PRESENCE_WINDOW_SECONDS en routes.ts

  const touch = (uid: string) =>
    q(
      `UPDATE users SET last_seen = now()
       WHERE id = $1 AND (last_seen IS NULL OR last_seen < now() - interval '60 seconds')`,
      [uid],
    );

  const listFriends = (uid: string) =>
    q(
      `SELECT (CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END) AS friend_id,
              u.display_name, u.country_code,
              (u.last_seen IS NOT NULL AND u.last_seen > now() - ($2 * interval '1 second')) AS online
       FROM friendships f
       JOIN users u ON u.id = (CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END)
       WHERE f.user_a = $1 OR f.user_b = $1
       ORDER BY online DESC, f.created_at DESC`,
      [uid, WINDOW],
    );

  // Estado inicial: nadie tuvo la web abierta nunca.
  await q("UPDATE users SET last_seen = NULL");
  await q("DELETE FROM friendships");

  // Primer latido: escribe (last_seen era NULL).
  await touch(A);
  const first = await q("SELECT last_seen FROM users WHERE id = $1", [A]);
  assert(first.rows[0].last_seen !== null, "el primer latido escribe last_seen");
  const t1 = new Date(first.rows[0].last_seen).getTime();

  // Segundo latido inmediato: NO debe escribir (bump condicional).
  await touch(A);
  const second = await q("SELECT last_seen FROM users WHERE id = $1", [A]);
  const t2 = new Date(second.rows[0].last_seen).getTime();
  assert(t1 === t2, "un segundo latido dentro del minuto NO reescribe (evita 20 writes/min por pestaña)");

  // Pasado el minuto sí se refresca.
  await q("UPDATE users SET last_seen = now() - interval '90 seconds' WHERE id = $1", [A]);
  await touch(A);
  const third = await q("SELECT last_seen FROM users WHERE id = $1", [A]);
  const t3 = new Date(third.rows[0].last_seen).getTime();
  assert(t3 > t2, "pasado el minuto, el latido sí refresca last_seen");

  // Ventana de presencia: A recién visto, B hace 5 min, C nunca.
  const [pa, pb] = orderedPair(A, B);
  const [qa, qb] = orderedPair(A, C);
  await q("INSERT INTO friendships (user_a, user_b) VALUES ($1, $2)", [pa, pb]);
  await q("INSERT INTO friendships (user_a, user_b) VALUES ($1, $2)", [qa, qb]);
  await q("UPDATE users SET last_seen = now() - interval '5 minutes' WHERE id = $1", [B]);
  await q("UPDATE users SET last_seen = NULL WHERE id = $1", [C]);

  let rows = (await listFriends(A)).rows as { friend_id: string; online: boolean }[];
  assert(rows.length === 2, "A ve a sus 2 amigos");
  assert(rows.find((r) => r.friend_id === B)?.online === false, "visto hace 5 min → desconectado");
  assert(rows.find((r) => r.friend_id === C)?.online === false, "nunca abrió la web → desconectado");

  // B abre la web: pasa a conectado Y sube al tope de la lista.
  await touch(B);
  rows = (await listFriends(A)).rows as { friend_id: string; online: boolean }[];
  assert(rows.find((r) => r.friend_id === B)?.online === true, "tras el latido → conectado");
  assert(rows[0]?.friend_id === B, "los conectados aparecen primero en la lista");

  // Justo en el borde de la ventana sigue contando como conectado.
  await q("UPDATE users SET last_seen = now() - interval '119 seconds' WHERE id = $1", [B]);
  rows = (await listFriends(A)).rows as { friend_id: string; online: boolean }[];
  assert(rows.find((r) => r.friend_id === B)?.online === true, "a 119s (dentro de la ventana de 2 min) sigue conectado");

  await q("UPDATE users SET last_seen = now() - interval '121 seconds' WHERE id = $1", [B]);
  rows = (await listFriends(A)).rows as { friend_id: string; online: boolean }[];
  assert(rows.find((r) => r.friend_id === B)?.online === false, "a 121s (fuera de la ventana) pasa a desconectado");

  // El timestamp crudo NUNCA sale del server: el SELECT solo expone el booleano.
  assert(
    !Object.keys(rows[0] ?? {}).includes("last_seen"),
    "getFriends no expone last_seen crudo (solo el booleano `online`)",
  );
}

(async () => {
  await partA();
  await partB();
  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} fallidos`);
  await db.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Error inesperado en el test:", err);
  process.exit(1);
});
