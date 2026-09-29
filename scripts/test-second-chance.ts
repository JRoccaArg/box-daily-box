/**
 * Test de la SEGUNDA OPORTUNIDAD (src/api/secondChance.ts): gastar una vida
 * para volver a jugar el reto diario perdido hoy.
 *
 * Corre la lógica REAL de producción contra Postgres en memoria (PGlite),
 * igual que test-lives.ts y test-challenges.ts.
 *
 * El esquema de abajo SÍ es una réplica del de `initializeDatabase` (db.ts).
 * Si cambian `users`/`attempts`/`second_chances`/`challenges`/
 * `challenge_plays`, reflejarlo acá.
 *
 * Qué protege, en criollo:
 *  - Solo se puede recuperar un reto PERDIDO, y una sola vez por día sumando
 *    todos los juegos.
 *  - Nadie gasta dos vidas por apretar dos veces ni por reintentar tras un corte.
 *  - Reintentar da EL MISMO reto (no se puede ir pescando uno fácil).
 *  - Una partida que no rankeaba por IP no pasa a rankear por usar una vida.
 *  - El resultado nuevo reemplaza al perdido (puntos, racha) una sola vez.
 *  - Quien ya jugó el link del dueño conserva su comparación.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-second-chance.ts
 */
process.env.TOKEN_SECRET = "test-only-secret-second-chance";
process.env.ADMIN_SECRET = "test-only-secret-second-chance";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://unused/unused";

import { PGlite } from "@electric-sql/pglite";

// Import dinámico: ver la nota en test-lives.ts (en ESM los imports estáticos
// se evalúan antes de las asignaciones de process.env de arriba).
const {
  finishSecondChance,
  newLifeSeed,
  otherRankedSecondChanceAtIp,
  pendingSecondChance,
  startSecondChance,
} = await import("@/api/secondChance");
const { createOrGetChallenge, getPlay, opponentOf, recordChallengePlay, startChallengePlay, getChallenge } =
  await import("@/api/challenges");

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

const ANA = "anon-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const BRUNO = "anon-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const HOY = "2026-09-29";
const AYER = "2026-09-28";
const GAME = "polewordle";
const OTRO = "pittexto";
const IP = "190.1.1.1";
const TTL = 15 * 60 * 1000;
const NOW = Date.parse("2026-09-29T15:00:00Z");

async function schema() {
  await db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      current_streak INT NOT NULL DEFAULT 0,
      best_streak INT NOT NULL DEFAULT 0,
      last_win_date DATE,
      extra_lives_balance INT NOT NULL DEFAULT 0,
      last_life_used_date DATE,
      CONSTRAINT users_lives_non_negative CHECK (extra_lives_balance >= 0)
    );
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
      ranked BOOLEAN DEFAULT true,
      ip_address TEXT,
      duel_id TEXT,
      time_limit INT,
      untimed BOOLEAN,
      challenge_id TEXT,
      life_used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE UNIQUE INDEX idx_attempts_unique_daily
      ON attempts (user_id, game_id, date_key) WHERE duel_id IS NULL;

    CREATE TABLE second_chances (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date_key DATE NOT NULL,
      game_id TEXT NOT NULL,
      seed TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      time_limit INT,
      untimed BOOLEAN,
      ranked BOOLEAN NOT NULL,
      ip_address TEXT,
      won BOOLEAN,
      points INT,
      time_seconds INT,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      finished_at TIMESTAMPTZ,
      PRIMARY KEY (user_id, date_key)
    );

    CREATE TABLE challenges (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      game_id TEXT NOT NULL,
      date_key DATE NOT NULL,
      difficulty TEXT NOT NULL,
      time_limit INT,
      untimed BOOLEAN NOT NULL,
      won BOOLEAN NOT NULL,
      points INT NOT NULL,
      time_seconds INT,
      grid JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (owner_id, game_id, date_key)
    );
    CREATE TABLE challenge_plays (
      challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seed TEXT NOT NULL,
      counts_as_daily BOOLEAN NOT NULL,
      won BOOLEAN,
      points INT,
      time_seconds INT,
      started_at TIMESTAMPTZ DEFAULT now(),
      finished_at TIMESTAMPTZ,
      owner_won BOOLEAN,
      owner_points INT,
      owner_time_seconds INT,
      PRIMARY KEY (challenge_id, user_id)
    );
  `);
}

async function reset(lives = 3) {
  await db.exec(`
    DELETE FROM challenge_plays; DELETE FROM challenges; DELETE FROM second_chances;
    DELETE FROM attempts; DELETE FROM users;
  `);
  for (const id of [ANA, BRUNO]) {
    await db.query("INSERT INTO users (id, extra_lives_balance) VALUES ($1, $2)", [id, lives]);
  }
}

async function attempt(
  userId: string,
  opts: { game?: string; won?: boolean; points?: number; ranked?: boolean; date?: string; duelId?: string } = {},
) {
  await db.query(
    `INSERT INTO attempts
       (user_id, game_id, date_key, difficulty, won, time_seconds, points, ranked, ip_address, duel_id, time_limit, untimed)
     VALUES ($1, $2, $3::date, 'dificil', $4, 90, $5, $6, $7, $8, 90, false)`,
    [
      userId,
      opts.game ?? GAME,
      opts.date ?? HOY,
      opts.won ?? false,
      opts.points ?? 0,
      opts.ranked ?? true,
      IP,
      opts.duelId ?? null,
    ],
  );
}

function start(userId: string, over: Record<string, unknown> = {}) {
  return startSecondChance(q, {
    userId,
    gameId: GAME,
    dateKey: HOY,
    ipAllowsRanking: true,
    ip: IP,
    nowMs: NOW,
    sessionTtlMs: TTL,
    ...over,
  });
}

function finish(userId: string, over: Record<string, unknown> = {}) {
  return finishSecondChance(q, {
    userId,
    gameId: GAME,
    dateKey: HOY,
    won: true,
    points: 200,
    timeSeconds: 40,
    ...over,
  });
}

async function balance(userId: string): Promise<number> {
  const r = await q("SELECT extra_lives_balance FROM users WHERE id = $1", [userId]);
  return Number((r.rows[0] as { extra_lives_balance: number }).extra_lives_balance);
}

async function dailyRow(userId: string, game = GAME) {
  const r = await q(
    `SELECT won, points, time_seconds, ranked, life_used, ip_address FROM attempts
      WHERE user_id = $1 AND game_id = $2 AND date_key = $3::date AND duel_id IS NULL`,
    [userId, game, HOY],
  );
  return r.rows[0] as
    | { won: boolean; points: number; time_seconds: number; ranked: boolean; life_used: boolean; ip_address: string }
    | undefined;
}

// ─── 1. Cuándo se puede ──────────────────────────────────────────────

async function testSoloRetoPerdido() {
  console.log("\n▶ Solo sobre un reto diario PERDIDO");
  await reset();

  const sin = await start(ANA);
  assert(sin.kind === "no_attempt", "sin haber jugado hoy, no hay nada que recuperar");
  assert((await balance(ANA)) === 3, "y no se gasta ninguna vida");

  await attempt(ANA, { won: true, points: 300 });
  const ganado = await start(ANA);
  assert(ganado.kind === "not_lost", "un reto GANADO no se vuelve a jugar");
  assert((await balance(ANA)) === 3, "tampoco se gasta vida");

  await reset();
  await attempt(ANA, { duelId: "DUEL1" });
  assert((await start(ANA)).kind === "no_attempt", "un duelo perdido no cuenta como reto diario");

  await reset();
  await attempt(ANA, { date: AYER });
  assert((await start(ANA)).kind === "no_attempt", "el reto de AYER no se puede recuperar hoy");
}

async function testSinVidas() {
  console.log("\n▶ Sin vidas");
  await reset(0);
  await attempt(ANA);
  const r = await start(ANA);
  assert(r.kind === "no_lives", "con saldo 0 no se puede");
  const sc = await q("SELECT 1 FROM second_chances WHERE user_id = $1", [ANA]);
  assert(sc.rows.length === 0, "y no queda reservada ninguna segunda oportunidad");
}

async function testGastaUnaVida() {
  console.log("\n▶ Gasta exactamente una vida y fija las condiciones");
  await reset(3);
  await attempt(ANA);
  const r = await start(ANA);
  assert(r.kind === "ok" && !r.resumed, "arranca");
  if (r.kind !== "ok") return;
  assert((await balance(ANA)) === 2, "descuenta UNA vida (3 → 2)");
  assert(r.difficulty === "dificil" && r.timeLimit === 90 && r.untimed === false,
    "misma dificultad y mismo tiempo que la partida perdida");
  assert(r.seed.startsWith("lf-") && r.seed.length === 19, "semilla propia generada por el server");
  assert(r.startedAt === NOW, "el reloj arranca ahora");
}

async function testUnaPorDia() {
  console.log("\n▶ Una vida por día, sumando todos los juegos");
  await reset(5);
  await attempt(ANA);
  await attempt(ANA, { game: OTRO });
  const r1 = await start(ANA);
  assert(r1.kind === "ok", "la primera del día sí");
  await finish(ANA, { won: false, points: 0 });

  const otroJuego = await start(ANA, { gameId: OTRO });
  assert(otroJuego.kind === "used_today", "en OTRO juego el mismo día, no");
  const mismoJuego = await start(ANA);
  assert(mismoJuego.kind === "used_today", "ni otra vez en el mismo juego tras perder la segunda oportunidad");
  assert((await balance(ANA)) === 4, "se gastó una sola vida en total");

  // Al otro día vuelve a poder.
  await attempt(ANA, { date: "2026-09-30" });
  const manana = await start(ANA, { dateKey: "2026-09-30", nowMs: NOW + 86_400_000 });
  assert(manana.kind === "ok", "al día siguiente se puede usar otra");
}

// ─── 2. Carreras y reintentos ────────────────────────────────────────

async function testReintentoNoCobraDeNuevo() {
  console.log("\n▶ Reintentar tras un corte retoma, no cobra otra vida");
  await reset(3);
  await attempt(ANA);
  const r1 = await start(ANA);
  const r2 = await start(ANA, { nowMs: NOW + 30_000 });
  assert(r1.kind === "ok" && r2.kind === "ok" && r2.resumed, "el segundo pedido retoma");
  if (r1.kind !== "ok" || r2.kind !== "ok") return;
  assert(r2.seed === r1.seed, "con EL MISMO reto (no se puede pescar uno fácil)");
  assert(r2.startedAt === r1.startedAt, "y el reloj sigue corriendo desde el arranque original");
  assert((await balance(ANA)) === 2, "sin cobrar otra vida");

  const vencida = await start(ANA, { nowMs: NOW + TTL + 1 });
  assert(vencida.kind === "used_today", "vencida la sesión ya no se retoma: la vida quedó gastada");

  assert(
    (await pendingSecondChance(q, ANA, HOY, NOW + 1000, TTL)) === GAME,
    "se informa como pendiente mientras se puede retomar",
  );
  assert(
    (await pendingSecondChance(q, ANA, HOY, NOW + TTL + 1, TTL)) === null,
    "y deja de informarse al vencer",
  );
}

async function testDosClicsSimultaneos() {
  console.log("\n▶ Dos pedidos a la vez (doble click, dos pestañas)");
  await reset(3);
  await attempt(ANA);
  // Cada pedido en su transacción, como en producción.
  const run = () =>
    db.transaction(async (tx) => {
      const tq = async (sql: string, params?: unknown[]) =>
        (await tx.query(sql, params as any[])) as { rows: unknown[] };
      try {
        return await startSecondChance(tq, {
          userId: ANA, gameId: GAME, dateKey: HOY, ipAllowsRanking: true, ip: IP, nowMs: NOW, sessionTtlMs: TTL,
        });
      } catch (err) {
        // Si la base rechazara el segundo por la PK, también es aceptable.
        return { kind: "error", err } as const;
      }
    });
  const [a, b] = await Promise.all([run(), run()]);
  const oks = [a, b].filter((x) => x.kind === "ok");
  assert(oks.length >= 1, "al menos uno arranca");
  assert((await balance(ANA)) === 2, "se descuenta UNA sola vida");
  const rows = await q("SELECT COUNT(*)::int AS c FROM second_chances WHERE user_id = $1", [ANA]);
  assert((rows.rows[0] as { c: number }).c === 1, "queda una sola segunda oportunidad");
  if (oks.length === 2 && a.kind === "ok" && b.kind === "ok") {
    assert(a.seed === b.seed, "si arrancan los dos, comparten el MISMO reto");
  }
}

// ─── 3. Regla de IP ──────────────────────────────────────────────────

async function testReglaDeIp() {
  console.log("\n▶ La regla de IP se mantiene");
  await reset(3);
  await attempt(ANA, { ranked: false });
  const r = await start(ANA, { ipAllowsRanking: true });
  assert(r.kind === "ok" && r.ranked === false,
    "si la partida perdida no rankeaba, la segunda oportunidad tampoco");
  await finish(ANA, { won: true, points: 200 });
  const row = await dailyRow(ANA);
  assert(row?.won === true && row.ranked === false, "gana, pero sigue sin entrar al ranking");

  await reset(3);
  await attempt(ANA, { ranked: true });
  const r2 = await start(ANA, { ipAllowsRanking: false });
  assert(r2.kind === "ok" && r2.ranked === false,
    "si HOY la conexión ya la usó otra cuenta, no rankea aunque la original sí");

  await reset(3);
  await attempt(ANA, { ranked: true });
  const r3 = await start(ANA, { ip: "200.9.9.9" });
  assert(r3.kind === "ok" && r3.ranked === true, "desde una conexión libre, rankea");
  assert(
    await otherRankedSecondChanceAtIp(q, "200.9.9.9", GAME, HOY, BRUNO),
    "esa conexión queda ocupada para OTRA cuenta (aunque el reto guardado tenga la IP original)",
  );
  assert(
    !(await otherRankedSecondChanceAtIp(q, "200.9.9.9", GAME, HOY, ANA)),
    "pero no para la misma cuenta",
  );
  assert(
    !(await otherRankedSecondChanceAtIp(q, "200.9.9.9", OTRO, HOY, BRUNO)),
    "ni para otro juego",
  );
}

// ─── 4. Resultado ────────────────────────────────────────────────────

async function testReemplazaAlPerdido() {
  console.log("\n▶ El resultado nuevo reemplaza al perdido");
  await reset(3);
  await attempt(ANA);
  await start(ANA);
  const f = await finish(ANA, { won: true, points: 200, timeSeconds: 40 });
  assert(f.recorded && f.ranked === true, "se registra");
  const row = await dailyRow(ANA);
  assert(row?.won === true && row.points === 200 && row.time_seconds === 40,
    "el reto del día pasa a GANADO con los puntos completos");
  assert(row?.life_used === true, "queda marcado que se usó una vida");
  assert(row?.ip_address === IP, "conserva la IP original");
  const count = await q("SELECT COUNT(*)::int AS c FROM attempts WHERE user_id = $1", [ANA]);
  assert((count.rows[0] as { c: number }).c === 1, "sigue habiendo UN solo reto del día (no se duplica)");

  const again = await finish(ANA, { won: true, points: 999 });
  assert(!again.recorded, "un segundo cierre no hace nada");
  assert((await dailyRow(ANA))?.points === 200, "los puntos no se pisan");
}

async function testPerderOtraVez() {
  console.log("\n▶ Perder (o abandonar) la segunda oportunidad");
  await reset(3);
  await attempt(ANA);
  await start(ANA);
  const f = await finish(ANA, { won: false, points: 0, timeSeconds: 5 });
  assert(f.recorded, "se registra la derrota");
  const row = await dailyRow(ANA);
  assert(row?.won === false && row.life_used === true, "queda perdido y con la vida usada");
  const u = await q("SELECT current_streak FROM users WHERE id = $1", [ANA]);
  assert((u.rows[0] as { current_streak: number }).current_streak === 0, "la racha no sube");
}

async function testRacha() {
  console.log("\n▶ Ganar la segunda oportunidad salva la racha");
  await reset(3);
  await db.query("UPDATE users SET current_streak = 4, best_streak = 4, last_win_date = $2::date WHERE id = $1", [
    ANA, AYER,
  ]);
  await attempt(ANA);
  await start(ANA);
  await finish(ANA, { won: true });
  const u = await q("SELECT current_streak, last_win_date::text AS d FROM users WHERE id = $1", [ANA]);
  const r = u.rows[0] as { current_streak: number; d: string };
  assert(r.current_streak === 5 && r.d === HOY, "la racha sigue: 4 → 5");

  // Si ese día ya había ganado otro juego, no cuenta doble.
  await reset(3);
  await db.query("UPDATE users SET current_streak = 5, last_win_date = $2::date WHERE id = $1", [ANA, HOY]);
  await attempt(ANA);
  await start(ANA);
  await finish(ANA, { won: true });
  const u2 = await q("SELECT current_streak FROM users WHERE id = $1", [ANA]);
  assert((u2.rows[0] as { current_streak: number }).current_streak === 5, "no suma dos veces el mismo día");
}

// ─── 5. El link de desafío ───────────────────────────────────────────

async function testLinkDelDueno() {
  console.log("\n▶ El link muestra el resultado nuevo sin cambiarle nada a quien ya jugó");
  await reset(3);
  await attempt(ANA, { won: false, points: 0 });
  const created = await createOrGetChallenge(q, {
    ownerId: ANA, gameId: GAME, todayKey: HOY, grid: ["🟥🟥🟥🟥🟥"],
  });
  if (!created.ok) {
    assert(false, "no se pudo crear el desafío de prueba");
    return;
  }
  const c0 = created.challenge;

  // Bruno juega el desafío contra la DERROTA de Ana y le gana.
  const s = await startChallengePlay(q, { challenge: c0, userId: BRUNO, todayKey: HOY });
  assert(s.kind === "ok", "Bruno arranca el desafío");
  await recordChallengePlay(q, {
    challengeId: c0.id, userId: BRUNO, gameId: GAME, difficulty: "dificil", dateKey: HOY,
    won: true, points: 150, timeSeconds: 50, timeLimit: 90, untimed: false, ranked: true, ip: "10.0.0.2",
  });

  // Ana usa una vida y gana con 200.
  await start(ANA);
  await finish(ANA, { won: true, points: 200, timeSeconds: 40 });

  const c1 = await getChallenge(q, c0.id);
  assert(c1?.won === true && c1.points === 200 && c1.timeSeconds === 40,
    "el link pasa a mostrar la victoria");
  assert(c1?.grid === null, "la grilla vieja (de la derrota) se borra");
  const withGrid = await createOrGetChallenge(q, {
    ownerId: ANA, gameId: GAME, todayKey: HOY, grid: ["🟩🟩🟩🟩🟩"],
  });
  assert(withGrid.ok && withGrid.challenge.id === c0.id && withGrid.challenge.grid?.[0] === "🟩🟩🟩🟩🟩",
    "el mismo link recibe la grilla nueva");

  const play = await getPlay(q, c0.id, BRUNO);
  const opp = opponentOf(play, c1!);
  assert(opp.won === false && opp.points === 0,
    "Bruno sigue comparado contra la derrota que vio al jugar (no le cambia de 'ganaste' a 'perdiste')");
  assert(opponentOf(null, c1!).won === true, "alguien que todavía no jugó compite contra la victoria");
}

// ─── 6. Semilla ──────────────────────────────────────────────────────

function testSemilla() {
  console.log("\n▶ Semilla");
  const a = newLifeSeed();
  const b = newLifeSeed();
  assert(a !== b, "dos semillas seguidas son distintas");
  assert(/^lf-[A-Z2-9]{16}$/.test(a), "formato lf- + 16 caracteres");
}

await schema();
testSemilla();
await testSoloRetoPerdido();
await testSinVidas();
await testGastaUnaVida();
await testUnaPorDia();
await testReintentoNoCobraDeNuevo();
await testDosClicsSimultaneos();
await testReglaDeIp();
await testReemplazaAlPerdido();
await testPerderOtraVez();
await testRacha();
await testLinkDelDueno();

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} asserts OK, ${failed} fallos`);
process.exit(failed === 0 ? 0 : 1);
