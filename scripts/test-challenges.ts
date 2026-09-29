/**
 * Test de los DESAFÍOS POR LINK (src/api/challenges.ts).
 *
 * Corre la lógica REAL de producción contra Postgres en memoria (PGlite),
 * igual que test-lives.ts: challenges.ts recibe el ejecutor de queries por
 * parámetro, así que acá no hay SQL duplicado de la lógica.
 *
 * El esquema de abajo SÍ es una réplica del de `initializeDatabase` (db.ts).
 * Si cambian `users`/`attempts`/`challenges`/`challenge_plays`, reflejarlo acá.
 *
 * Qué protege, en criollo:
 *  - El resultado que se muestra en la invitación sale del server, no del
 *    navegador de quien comparte.
 *  - Quien acepta juega UNA vez por link, y si reabre recibe el MISMO reto (no
 *    puede ir probando hasta que le toque uno fácil).
 *  - La partida del desafío pasa a ser su reto oficial solo si todavía no lo
 *    había jugado; si ya lo había jugado, su resultado previo no cambia.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-challenges.ts
 */
process.env.TOKEN_SECRET = "test-only-secret-challenges";
process.env.ADMIN_SECRET = "test-only-secret-challenges";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://unused/unused";

import { PGlite } from "@electric-sql/pglite";

// Import dinámico: ver la nota en test-lives.ts (en ESM los imports estáticos
// se evalúan antes de las asignaciones de process.env de arriba).
const {
  compareOutcome,
  createOrGetChallenge,
  getChallenge,
  getPlay,
  isChallengeId,
  newChallengeId,
  recordChallengePlay,
  sanitizeGrid,
  startChallengePlay,
  CHALLENGE_ID_LEN,
} = await import("@/api/challenges");

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

const ANA = "anon-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; // comparte
const BRUNO = "anon-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"; // acepta, no jugó hoy
const CELE = "anon-cccccccc-cccc-4ccc-8ccc-cccccccccccc"; // acepta, YA jugó hoy

const HOY = "2026-09-25";
const GAME = "polewordle";

async function schema() {
  await db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      country_code TEXT,
      current_streak INT NOT NULL DEFAULT 0,
      best_streak INT NOT NULL DEFAULT 0,
      last_win_date DATE
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
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE UNIQUE INDEX idx_attempts_unique_daily
      ON attempts (user_id, game_id, date_key) WHERE duel_id IS NULL;

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
      PRIMARY KEY (challenge_id, user_id)
    );
  `);
}

async function reset() {
  await db.exec(
    "DELETE FROM challenge_plays; DELETE FROM challenges; DELETE FROM attempts; DELETE FROM users;",
  );
  for (const id of [ANA, BRUNO, CELE]) await db.query("INSERT INTO users (id) VALUES ($1)", [id]);
}

/** Un reto diario ya jugado (con el tiempo guardado, como tras este cambio). */
async function dailyAttempt(
  userId: string,
  opts: { won?: boolean; points?: number; untimed?: boolean | null; timeLimit?: number | null; date?: string } = {},
) {
  await db.query(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, time_limit, untimed)
     VALUES ($1, $2, $3::date, 'dificil', $4, 48, $5, $6, $7)`,
    [
      userId,
      GAME,
      opts.date ?? HOY,
      opts.won ?? true,
      opts.points ?? 312,
      opts.timeLimit === undefined ? 90 : opts.timeLimit,
      opts.untimed === undefined ? false : opts.untimed,
    ],
  );
}

async function anaChallenge(grid: string[] | null = null) {
  await dailyAttempt(ANA);
  const res = await createOrGetChallenge(q, { ownerId: ANA, gameId: GAME, todayKey: HOY, grid });
  if (!res.ok) throw new Error("no se pudo crear el desafío de prueba");
  return res.challenge;
}

function finishInput(challengeId: string, userId: string, over: Record<string, unknown> = {}) {
  return {
    challengeId,
    userId,
    gameId: GAME,
    difficulty: "dificil",
    dateKey: HOY,
    won: true,
    points: 400,
    timeSeconds: 30,
    timeLimit: 90,
    untimed: false,
    ranked: true,
    ip: "190.1.1.1",
    ...over,
  };
}

// ─── 1. Formatos ─────────────────────────────────────────────────────

function testFormatos() {
  console.log("\n▶ Id del desafío y grilla");
  const id = newChallengeId();
  assert(id.length === CHALLENGE_ID_LEN && isChallengeId(id), "el id generado tiene el formato válido");
  assert(!isChallengeId("abc"), "rechaza ids cortos");
  assert(!isChallengeId("ABCDEFGHI0"), "rechaza caracteres ambiguos (0)");
  assert(!isChallengeId("ABCDEFGH'I"), "rechaza caracteres fuera del alfabeto");
  assert(newChallengeId() !== newChallengeId(), "dos ids seguidos son distintos");

  assert(sanitizeGrid(["🟩🟨⬛⬛⬛", "🟩🟩🟩🟩🟩"]) !== null, "acepta una grilla de cuadrados");
  assert(sanitizeGrid(["🟩 🟨 ⬛ 🟩 ⬛"]) !== null, "acepta filas con espacios (PitTexto)");
  assert(sanitizeGrid(["🟥", "🟩"]) !== null, "acepta 🟥/🟩 (CareerPath)");
  assert(sanitizeGrid(["hola"]) === null, "rechaza texto: no se puede colar un mensaje");
  assert(sanitizeGrid(["🟩<script>"]) === null, "rechaza HTML");
  assert(sanitizeGrid(["😀"]) === null, "rechaza otros emojis");
  assert(sanitizeGrid(new Array(11).fill("🟩")) === null, "rechaza más de 10 filas");
  assert(sanitizeGrid(["🟩".repeat(25)]) === null, "rechaza filas larguísimas");
  assert(sanitizeGrid([]) === null && sanitizeGrid("🟩") === null, "rechaza vacío y no-arrays");
}

// ─── 2. Crear el desafío ─────────────────────────────────────────────

async function testCrear() {
  console.log("\n▶ Crear un desafío");
  await reset();

  const sin = await createOrGetChallenge(q, { ownerId: ANA, gameId: GAME, todayKey: HOY, grid: null });
  assert(!sin.ok && sin.reason === "no_attempt", "sin reto jugado hoy no hay desafío");

  await dailyAttempt(ANA, { untimed: null, timeLimit: null });
  const viejo = await createOrGetChallenge(q, { ownerId: ANA, gameId: GAME, todayKey: HOY, grid: null });
  assert(
    !viejo.ok && viejo.reason === "legacy_attempt",
    "un intento sin el tiempo guardado (anterior al cambio) no se puede desafiar",
  );

  await reset();
  await dailyAttempt(ANA, { points: 312 });
  const res = await createOrGetChallenge(q, {
    ownerId: ANA, gameId: GAME, todayKey: HOY, grid: ["🟩🟩🟩🟩🟩"],
  });
  assert(res.ok, "con un reto jugado se crea");
  if (!res.ok) return;
  const c = res.challenge;
  assert(c.points === 312 && c.won && c.timeSeconds === 48, "copia el resultado REAL del intento guardado");
  assert(c.difficulty === "dificil" && c.timeLimit === 90 && !c.untimed, "copia dificultad y tiempo");
  assert(c.grid?.[0] === "🟩🟩🟩🟩🟩", "guarda la grilla");

  const otra = await createOrGetChallenge(q, { ownerId: ANA, gameId: GAME, todayKey: HOY, grid: null });
  assert(otra.ok && otra.challenge.id === c.id, "pedirlo de nuevo devuelve EL MISMO link");

  const pisar = await createOrGetChallenge(q, {
    ownerId: ANA, gameId: GAME, todayKey: HOY, grid: ["🟥"],
  });
  assert(pisar.ok && pisar.challenge.grid?.[0] === "🟩🟩🟩🟩🟩", "una grilla guardada no se pisa");
}

async function testGrillaTardia() {
  console.log("\n▶ La grilla llega después del primer pedido");
  await reset();
  const c = await anaChallenge(null);
  assert(c.grid === null, "arranca sin grilla");
  const conGrilla = await createOrGetChallenge(q, {
    ownerId: ANA, gameId: GAME, todayKey: HOY, grid: ["🟩🟨"],
  });
  assert(conGrilla.ok && conGrilla.challenge.grid?.[0] === "🟩🟨", "se completa si faltaba");
  assert((await getChallenge(q, c.id))?.grid?.[0] === "🟩🟨", "y queda guardada");
}

async function testSinTiempo() {
  console.log("\n▶ Desafío de un reto jugado en 'Sin Tiempo'");
  await reset();
  await dailyAttempt(ANA, { untimed: true, timeLimit: null, points: 60 });
  const res = await createOrGetChallenge(q, { ownerId: ANA, gameId: GAME, todayKey: HOY, grid: null });
  assert(res.ok && res.challenge.untimed && res.challenge.timeLimit === null, "queda en Sin Tiempo");
}

async function testZonaHoraria() {
  console.log("\n▶ Tolerancia de zona horaria (±1 día)");
  await reset();
  await dailyAttempt(ANA, { date: "2026-09-24" });
  const ayer = await createOrGetChallenge(q, { ownerId: ANA, gameId: GAME, todayKey: HOY, grid: null });
  assert(ayer.ok && ayer.challenge.dateKey === "2026-09-24", "acepta el intento de ayer (otro huso)");

  await reset();
  await dailyAttempt(ANA, { date: "2026-09-20" });
  const viejo = await createOrGetChallenge(q, { ownerId: ANA, gameId: GAME, todayKey: HOY, grid: null });
  assert(!viejo.ok, "no acepta un intento de hace días");
}

// ─── 3. Aceptar el desafío ───────────────────────────────────────────

async function testPropio() {
  console.log("\n▶ Abrir tu propio desafío");
  await reset();
  const c = await anaChallenge();
  const r = await startChallengePlay(q, { challenge: c, userId: ANA, todayKey: HOY });
  assert(r.kind === "own", "no podés jugar tu propio desafío");
  assert((await getPlay(q, c.id, ANA)) === null, "y no se reserva ninguna partida");
}

async function testCuentaComoReto() {
  console.log("\n▶ Quien no jugó hoy: la partida es su reto oficial");
  await reset();
  const c = await anaChallenge();

  const r = await startChallengePlay(q, { challenge: c, userId: BRUNO, todayKey: HOY });
  assert(r.kind === "ok" && r.countsAsDaily && !r.resumed, "cuenta como su reto del día");

  const rec = await recordChallengePlay(q, finishInput(c.id, BRUNO));
  assert(rec.recorded && rec.countedAsDaily, "al terminar se registra como reto oficial");

  const att = await db.query(
    "SELECT won, points, ranked, challenge_id, time_limit, untimed FROM attempts WHERE user_id = $1",
    [BRUNO],
  );
  const a = att.rows[0] as any;
  assert(att.rows.length === 1, "aparece un intento diario");
  assert(a.points === 400 && a.won === true, "con su resultado");
  assert(a.challenge_id === c.id, "marcado como jugado desde el desafío");
  assert(a.time_limit === 90 && a.untimed === false, "con el tiempo fijado por el desafío");

  const u = await db.query("SELECT current_streak FROM users WHERE id = $1", [BRUNO]);
  assert((u.rows[0] as any).current_streak === 1, "ganar su reto oficial le suma racha");
}

async function testRankedRespetaIp() {
  console.log("\n▶ El ranking respeta la regla de IP");
  await reset();
  const c = await anaChallenge();
  await startChallengePlay(q, { challenge: c, userId: BRUNO, todayKey: HOY });
  // `ranked` lo calcula routes.ts con la misma regla de IP del reto diario y
  // viaja firmado en el token; acá se verifica que se guarda tal cual.
  await recordChallengePlay(q, finishInput(c.id, BRUNO, { ranked: false }));
  const a = await db.query("SELECT ranked FROM attempts WHERE user_id = $1", [BRUNO]);
  assert((a.rows[0] as any).ranked === false, "un intento no rankeable por IP queda fuera del ranking");
}

async function testYaJugo() {
  console.log("\n▶ Quien YA jugó hoy: juega, pero su resultado no cambia");
  await reset();
  const c = await anaChallenge();
  await dailyAttempt(CELE, { won: false, points: 0 });

  const r = await startChallengePlay(q, { challenge: c, userId: CELE, todayKey: HOY });
  assert(r.kind === "ok" && !r.countsAsDaily, "puede jugar, pero no cuenta como reto del día");

  const rec = await recordChallengePlay(q, finishInput(c.id, CELE, { won: true, points: 999 }));
  assert(rec.recorded && !rec.countedAsDaily, "la partida se registra solo en el desafío");

  const att = await db.query("SELECT won, points FROM attempts WHERE user_id = $1", [CELE]);
  assert(att.rows.length === 1, "no aparece un segundo intento diario");
  assert((att.rows[0] as any).points === 0 && (att.rows[0] as any).won === false, "su resultado previo NO cambia");

  const play = await getPlay(q, c.id, CELE);
  assert(play?.finished === true && play.points === 999, "el desafío guarda lo que hizo, para la comparación");
}

async function testCarreraConRetoOficial() {
  console.log("\n▶ Terminó el reto oficial en otra pestaña antes que el desafío");
  await reset();
  const c = await anaChallenge();
  const r = await startChallengePlay(q, { challenge: c, userId: BRUNO, todayKey: HOY });
  assert(r.kind === "ok" && r.countsAsDaily, "al empezar, iba a contar como reto del día");

  await dailyAttempt(BRUNO, { won: false, points: 0 }); // la otra pestaña llegó primero
  const rec = await recordChallengePlay(q, finishInput(c.id, BRUNO, { won: true, points: 500 }));
  assert(rec.recorded && !rec.countedAsDaily, "el desafío ya no cuenta: el oficial llegó primero");
  const att = await db.query("SELECT points FROM attempts WHERE user_id = $1", [BRUNO]);
  assert(att.rows.length === 1 && (att.rows[0] as any).points === 0, "y el oficial queda intacto");
}

async function testMismaSemillaAlRetomar() {
  console.log("\n▶ Reabrir el link no da un reto nuevo");
  await reset();
  const c = await anaChallenge();
  const a = await startChallengePlay(q, { challenge: c, userId: BRUNO, todayKey: HOY });
  const b = await startChallengePlay(q, { challenge: c, userId: BRUNO, todayKey: HOY });
  assert(a.kind === "ok" && b.kind === "ok", "las dos veces arranca");
  if (a.kind !== "ok" || b.kind !== "ok") return;
  assert(a.seed === b.seed, "recibe EXACTAMENTE el mismo reto (no puede pescar uno fácil)");
  assert(b.resumed, "y se marca como retomado");

  const cele = await startChallengePlay(q, { challenge: c, userId: CELE, todayKey: HOY });
  assert(cele.kind === "ok" && cele.seed !== a.seed, "otra persona recibe otro reto");
  assert(a.seed !== c.id && a.seed.startsWith("ch-"), "la semilla no es el id público del link");
}

async function testUnaSolaVez() {
  console.log("\n▶ Una sola partida por link");
  await reset();
  const c = await anaChallenge();
  await startChallengePlay(q, { challenge: c, userId: BRUNO, todayKey: HOY });
  await recordChallengePlay(q, finishInput(c.id, BRUNO, { won: false, points: 0 }));

  const otra = await startChallengePlay(q, { challenge: c, userId: BRUNO, todayKey: HOY });
  assert(otra.kind === "finished", "después de terminar, no se puede volver a jugar");

  const segundo = await recordChallengePlay(q, finishInput(c.id, BRUNO, { won: true, points: 999 }));
  assert(!segundo.recorded, "un segundo resultado (otra sesión) no pisa el primero");
  const play = await getPlay(q, c.id, BRUNO);
  assert(play?.points === 0 && play.won === false, "vale el primer resultado");

  let dup = false;
  try {
    await db.query(
      "INSERT INTO challenge_plays (challenge_id, user_id, seed, counts_as_daily) VALUES ($1, $2, 'x', false)",
      [c.id, BRUNO],
    );
  } catch {
    dup = true;
  }
  assert(dup, "la base misma impide una segunda partida (clave primaria)");
}

// ─── 4. Comparación ──────────────────────────────────────────────────

function testComparacion() {
  console.log("\n▶ Comparación (regla de duelos)");
  const ana = { won: true, points: 312 };
  assert(compareOutcome({ won: true, points: 100 }, { won: false, points: 0 }) === "won", "acertar le gana a fallar");
  assert(compareOutcome({ won: false, points: 0 }, ana) === "lost", "fallar pierde contra acertar");
  assert(compareOutcome({ won: true, points: 400 }, ana) === "won", "si los dos aciertan, más puntos gana");
  assert(compareOutcome({ won: true, points: 200 }, ana) === "lost", "menos puntos pierde");
  assert(compareOutcome({ won: true, points: 312 }, ana) === "tied", "mismos puntos es empate");
  assert(compareOutcome({ won: false, points: 0 }, { won: false, points: 0 }) === "tied", "los dos fallan: empate");
}

// ─── 5. Borrado de cuenta ────────────────────────────────────────────

async function testBorradoDeCuenta() {
  console.log("\n▶ Si quien compartió borra su cuenta");
  await reset();
  const c = await anaChallenge();
  await startChallengePlay(q, { challenge: c, userId: BRUNO, todayKey: HOY });
  await db.query("DELETE FROM users WHERE id = $1", [ANA]);
  assert((await getChallenge(q, c.id)) === null, "el desafío desaparece con la cuenta");
  assert((await getPlay(q, c.id, BRUNO)) === null, "y las partidas asociadas también");
}

async function main() {
  console.log("═══ Test de desafíos por link ═══");
  await schema();

  testFormatos();
  await testCrear();
  await testGrillaTardia();
  await testSinTiempo();
  await testZonaHoraria();
  await testPropio();
  await testCuentaComoReto();
  await testRankedRespetaIp();
  await testYaJugo();
  await testCarreraConRetoOficial();
  await testMismaSemillaAlRetomar();
  await testUnaSolaVez();
  testComparacion();
  await testBorradoDeCuenta();

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} asserts OK, ${failed} fallos`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
