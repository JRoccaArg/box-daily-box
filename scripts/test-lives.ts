/**
 * Test del sistema de VIDAS EXTRA por referido (src/api/lives.ts).
 *
 * Corre la lógica REAL de producción (`creditReferralLives`, `consumeLife`,
 * `getLivesState`) contra Postgres en memoria (PGlite), aprovechando que
 * lives.ts recibe el ejecutor de queries por parámetro — mismo patrón que
 * test-achievements.ts y test-badges.ts. No hay SQL duplicado acá: si una query
 * de lives.ts se rompe, este test se entera.
 *
 * El esquema de abajo SÍ es una réplica del de `initializeDatabase` (db.ts),
 * porque esa función está atada al pool `pg` real. Si cambian las tablas
 * `users`/`attempts`/`sessions`/`referrals`, hay que reflejarlo acá.
 *
 * Buena parte de los casos son de ABUSO: el saldo de vidas se traduce en poder
 * re-jugar un reto perdido y que cuente para el ranking, así que cada regla que
 * se relaja tiene que estar respaldada por una prueba que diga exactamente qué
 * sigue estando cerrado.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-lives.ts
 */
process.env.TOKEN_SECRET = "test-only-secret-lives";
process.env.ADMIN_SECRET = "test-only-secret-lives";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://unused/unused";

import { PGlite } from "@electric-sql/pglite";
import type { CreditRejection } from "@/api/lives";

// Import DINÁMICO (no estático) a propósito: en ESM los `import` se evalúan
// antes que cualquier línea del módulo, así que con un import normal `lives.ts`
// —vía `secrets.ts`— leería TOKEN_SECRET antes de que las asignaciones de
// arriba corrieran, y el proceso abortaría. Mismo patrón que test-duels.ts.
const { creditReferralLives, consumeLife, getLivesState, hashIp, isUsableIp, LIFE_RULES } =
  await import("@/api/lives");

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

const ALICE = "anon-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; // referidora
const BOB = "anon-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";   // amigo 1
const CARA = "anon-cccccccc-cccc-4ccc-8ccc-cccccccccccc";  // amiga 2
const DAVE = "anon-dddddddd-dddd-4ddd-8ddd-dddddddddddd";  // Bob tras borrar el navegador

const HOY = "2026-09-24";
const MANANA = "2026-09-25";

const IP_ALICE = "200.10.0.1";
const IP_BOB = "190.20.0.2";
const IP_CARA = "181.30.0.3";

async function schema() {
  await db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      country_code TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      current_streak INT NOT NULL DEFAULT 0,
      best_streak INT NOT NULL DEFAULT 0,
      last_win_date DATE,
      friend_code TEXT,
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
      created_at TIMESTAMPTZ DEFAULT now()
    );

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

    CREATE TABLE referrals (
      id BIGSERIAL PRIMARY KEY,
      referrer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_ip_hash TEXT,
      game_id TEXT NOT NULL,
      date_key DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      CHECK (referrer_id <> referred_user_id)
    );
    CREATE UNIQUE INDEX idx_referrals_unique_ip_day
      ON referrals (referrer_id, referred_ip_hash, date_key)
      WHERE referred_ip_hash IS NOT NULL;
    CREATE UNIQUE INDEX idx_referrals_unique_user_day
      ON referrals (referrer_id, referred_user_id, date_key);
    CREATE INDEX idx_referrals_referrer_day ON referrals (referrer_id, date_key);
    CREATE INDEX idx_referrals_referred_day ON referrals (referred_user_id, date_key);
  `);
}

/** Deja la base en el estado de partida de cada bloque. */
async function reset() {
  await db.exec("DELETE FROM referrals; DELETE FROM attempts; DELETE FROM sessions; DELETE FROM users;");
  for (const id of [ALICE, BOB, CARA, DAVE]) {
    await db.query("INSERT INTO users (id) VALUES ($1)", [id]);
  }
  // Alice jugó hoy desde SU conexión: es lo que define "la IP del referidor".
  await db.query(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ip_address)
     VALUES ($1, 'polewordle', $2::date, 'medio', true, 40, 100, $3)`,
    [ALICE, HOY, IP_ALICE],
  );
}

async function balance(userId: string): Promise<number> {
  const r = await db.query("SELECT extra_lives_balance FROM users WHERE id = $1", [userId]);
  return Number((r.rows[0] as any)?.extra_lives_balance ?? 0);
}

/** Atajo: un referido normal (Bob juega con el link de Alice, desde su IP). */
function credit(overrides: Partial<Parameters<typeof creditReferralLives>[1]> = {}) {
  return creditReferralLives(q, {
    referrerId: ALICE,
    referredUserId: BOB,
    referredIp: IP_BOB,
    gameId: "pittexto",
    dateKey: HOY,
    playedSeconds: 60,
    ...overrides,
  });
}

function rejectedFor(res: Awaited<ReturnType<typeof credit>>): CreditRejection | "credited" {
  return res.credited ? "credited" : res.reason;
}

// ─── 1. Estado inicial y lectura ─────────────────────────────────────

async function testEstadoInicial() {
  console.log("\n▶ Estado inicial");
  await reset();

  const st = await getLivesState(q, BOB, HOY);
  assert(st.balance === 0, "un usuario nuevo arranca con 0 vidas");
  assert(!st.usableToday, "sin saldo no hay vida usable hoy");
  assert(!st.usedToday, "sin saldo tampoco figura como usada");

  const ghost = await getLivesState(q, "anon-99999999-9999-4999-8999-999999999999", HOY);
  assert(ghost.balance === 0, "un userId inexistente devuelve estado vacío, no rompe");
}

// ─── 2. Acreditación válida ──────────────────────────────────────────

async function testAcreditacionFeliz() {
  console.log("\n▶ Acreditación válida (el caso que tiene que funcionar)");
  await reset();

  const res = await credit();
  assert(res.credited, "un amigo desde otra conexión acredita la vida");
  assert(res.credited && res.referrerId === ALICE, "identifica correctamente al referidor");
  assert((await balance(ALICE)) === 1, "el que compartió gana +1");
  assert((await balance(BOB)) === 1, "el que jugó por el link también gana +1");

  const st = await getLivesState(q, ALICE, HOY);
  assert(st.usableToday, "la vida recién ganada se puede usar hoy mismo");

  const row = await db.query("SELECT referred_ip_hash, game_id FROM referrals");
  assert(row.rows.length === 1, "queda registrada una sola fila de referido");
  assert(
    (row.rows[0] as any).referred_ip_hash === hashIp(IP_BOB),
    "la IP se guarda hasheada, no en claro",
  );
  assert(
    (row.rows[0] as any).referred_ip_hash !== IP_BOB,
    "la IP en claro NO aparece en la tabla",
  );
  assert((row.rows[0] as any).game_id === "pittexto", "registra con qué juego se acreditó");
}

async function testPerderTambienAcredita() {
  console.log("\n▶ Perder o abandonar también acredita (regla elegida por el dueño)");
  await reset();

  // `playedSeconds: 1` = entró y salió. Con REQUIRE_REAL_PLAY apagado, cuenta.
  const res = await credit({ playedSeconds: 1 });
  assert(res.credited, "con la configuración actual, abandonar al instante acredita igual");
  assert((await balance(BOB)) === 1, "el referido cobra su vida aunque no haya jugado");
}

// ─── 3. Defensas que SIGUEN activas ──────────────────────────────────

async function testAutoReferido() {
  console.log("\n▶ Auto-referido");
  await reset();

  const res = await credit({ referredUserId: ALICE, referredIp: IP_BOB });
  assert(rejectedFor(res) === "self_referral", "usar el propio link con la misma cuenta no acredita");
  assert((await balance(ALICE)) === 0, "y no toca el saldo");
}

async function testMismaIp() {
  console.log("\n▶ Misma conexión que el referidor");
  await reset();

  const res = await credit({ referredIp: IP_ALICE });
  assert(rejectedFor(res) === "same_ip", "otra cuenta desde la MISMA IP no acredita");
  assert((await balance(ALICE)) === 0, "y no toca el saldo");
}

async function testMismaIpPorSesionAbierta() {
  console.log("\n▶ Misma conexión detectada por una sesión sin terminar");
  await reset();
  // Alice empezó un reto desde otra conexión (datos móviles) y no lo terminó:
  // no hay `attempts` con esa IP, solo una sesión. Tiene que contar igual.
  await db.query(
    `INSERT INTO sessions (id, user_id, game_id, difficulty, date_key, started_at, expires_at, ip_address)
     VALUES ('s1', $1, 'polewordle', 'medio', $2::date, 0, 0, $3)`,
    [ALICE, HOY, "45.55.66.77"],
  );

  const res = await credit({ referredIp: "45.55.66.77" });
  assert(
    rejectedFor(res) === "same_ip",
    "una sesión abierta del referidor también delata la conexión",
  );
}

async function testMismaIpAunqueElReferidorNoJugoHoy() {
  console.log("\n▶ Misma conexión, con el referidor sin jugar ese día");
  await reset();
  // Alice compartió su link el día 24 y NO juega el 25. Si solo miráramos las
  // IP del día, ese día no habría con qué comparar y abrir el propio link desde
  // otro navegador de la misma casa acreditaría una vida.
  const res = await credit({ referredIp: IP_ALICE, dateKey: MANANA });
  assert(
    rejectedFor(res) === "same_ip",
    "la conexión del referidor se reconoce aunque ese día no haya jugado",
  );
  assert((await balance(ALICE)) === 0, "y no acredita nada");

  // Pasada la ventana, esa IP ya no se considera del referidor.
  const lejos = await credit({ referredIp: IP_ALICE, dateKey: "2026-10-30" });
  assert(
    lejos.credited,
    "fuera de la ventana de 7 días la IP vieja ya no bloquea (evita falsos positivos por IP dinámica)",
  );
}

async function testSinReferidor() {
  console.log("\n▶ Partida que no viene de un desafío, o referidor inexistente");
  await reset();

  assert(rejectedFor(await credit({ referrerId: null })) === "no_referrer", "sin referidor no acredita");
  assert(rejectedFor(await credit({ referrerId: "" })) === "no_referrer", "referidor vacío no acredita");

  // En producción el referidor sale de la fila del desafío (FK a users), así
  // que no puede ser inexistente; si lo fuera, la base rechaza el registro y
  // el finish lo atrapa sin tocar la partida.
  let rechazado = false;
  try {
    await credit({ referrerId: "anon-99999999-9999-4999-8999-999999999999" });
  } catch {
    rechazado = true;
  }
  assert(rechazado, "un referidor que no existe es rechazado por la base");
  assert((await balance(BOB)) === 0, "ninguno de esos casos toca el saldo");
}

async function testSinIp() {
  console.log("\n▶ Sin IP utilizable");
  await reset();

  assert(rejectedFor(await credit({ referredIp: null })) === "no_ip", "sin IP no acredita");
  assert(rejectedFor(await credit({ referredIp: "unknown" })) === "no_ip", "'unknown' no acredita");
  assert(rejectedFor(await credit({ referredIp: "" })) === "no_ip", "IP vacía no acredita");
  assert(!isUsableIp(undefined) && isUsableIp("1.2.3.4"), "isUsableIp distingue los dos casos");
}

// ─── 4. Cooldown: "una vida por persona por día" ─────────────────────

async function testCooldownMismoDia() {
  console.log("\n▶ El mismo amigo, dos veces el mismo día");
  await reset();

  assert((await credit()).credited, "la primera acredita");
  const segunda = await credit({ gameId: "el-intruso" });
  assert(rejectedFor(segunda) === "cooldown", "la segunda del mismo día NO acredita");
  assert((await balance(ALICE)) === 1, "el saldo queda en 1, no en 2");
}

async function testCooldownVenceAlDiaSiguiente() {
  console.log("\n▶ El mismo amigo al día siguiente");
  await reset();

  assert((await credit()).credited, "día 1 acredita");
  const otroDia = await credit({ dateKey: MANANA });
  assert(otroDia.credited, "al día siguiente el mismo amigo vuelve a acreditar");
  assert((await balance(ALICE)) === 2, "el saldo acumula (las vidas no vencen)");
}

async function testCooldownPorIpAunqueCambieDeCuenta() {
  console.log("\n▶ Misma conexión, cuenta nueva (borró el navegador)");
  await reset();

  assert((await credit()).credited, "Bob acredita");
  // Dave es una identidad nueva, pero sale por la misma conexión que Bob.
  const dave = await credit({ referredUserId: DAVE, referredIp: IP_BOB });
  assert(
    rejectedFor(dave) === "cooldown",
    "crear una identidad nueva desde la misma IP no da una segunda vida",
  );
  assert((await balance(ALICE)) === 1, "el saldo del referidor no se infla");
}

async function testCooldownPorUsuarioAunqueCambieDeIp() {
  console.log("\n▶ Misma cuenta, conexión nueva");
  await reset();

  assert((await credit()).credited, "Bob acredita desde su IP");
  const otraRed = await credit({ referredIp: "77.88.99.100" });
  assert(
    rejectedFor(otraRed) === "cooldown",
    "el mismo usuario cambiando de red tampoco da una segunda vida el mismo día",
  );
}

async function testLaFechaEsLaLlaveDelCooldown() {
  console.log("\n▶ El cooldown se apoya en la fecha (por eso la pone el servidor)");
  await reset();

  assert((await credit()).credited, "acredita el día 24");
  assert(rejectedFor(await credit()) === "cooldown", "el mismo día no repite");
  // Con OTRA fecha, la misma pareja vuelve a acreditar. Esto NO es un bug de
  // lives.ts: es la razón por la que `finishChallenge` tiene que pasar la fecha
  // del RELOJ DEL SERVIDOR y nunca `session.today`, que admite la fecha del
  // navegador a ±1 día. Si se pasara la del cliente, alguien podría declararse
  // en tres días distintos y cobrar tres veces la vida del mismo amigo.
  assert(
    (await credit({ dateKey: MANANA })).credited,
    "con otra fecha vuelve a acreditar (de ahí que la fecha no pueda venir del cliente)",
  );
  assert((await balance(ALICE)) === 2, "dos fechas, dos vidas");
}

async function testAmigosDistintosSiSuman() {
  console.log("\n▶ Dos amigos distintos el mismo día");
  await reset();

  assert((await credit()).credited, "Bob acredita");
  const cara = await credit({ referredUserId: CARA, referredIp: IP_CARA });
  assert(cara.credited, "Cara, otra persona desde otra conexión, también acredita");
  assert((await balance(ALICE)) === 2, "el referidor suma una vida por cada amigo real");
  assert((await balance(BOB)) === 1 && (await balance(CARA)) === 1, "cada amigo suma la suya");
}

async function testIndiceUnicoComoRespaldo() {
  console.log("\n▶ Respaldo de base ante dos finishes simultáneos");
  await reset();
  await credit();

  // Simula la carrera: dos requests que pasaron juntos la verificación previa
  // intentan insertar. El índice único deja entrar a uno solo, y ON CONFLICT
  // evita que el segundo aborte la transacción con un error.
  const dup = await db.query(
    `INSERT INTO referrals (referrer_id, referred_user_id, referred_ip_hash, game_id, date_key)
     VALUES ($1, $2, $3, 'gp-resultado', $4::date)
     ON CONFLICT DO NOTHING RETURNING id`,
    [ALICE, BOB, hashIp(IP_BOB), HOY],
  );
  assert(dup.rows.length === 0, "el índice único bloquea el duplicado sin lanzar error");

  // Y también bloquea al que viene con otra cuenta pero la misma huella de IP.
  const dupIp = await db.query(
    `INSERT INTO referrals (referrer_id, referred_user_id, referred_ip_hash, game_id, date_key)
     VALUES ($1, $2, $3, 'gp-resultado', $4::date)
     ON CONFLICT DO NOTHING RETURNING id`,
    [ALICE, DAVE, hashIp(IP_BOB), HOY],
  );
  assert(dupIp.rows.length === 0, "y también el duplicado por huella de IP");
}

// ─── 5. Perillas hoy apagadas (tienen que funcionar al encenderlas) ──

async function testPerillaTopeDiario() {
  console.log("\n▶ Cortacircuitos diario (perilla apagada en producción)");
  await reset();
  const original = LIFE_RULES.DAILY_CREDIT_CAP;
  LIFE_RULES.DAILY_CREDIT_CAP = 1;
  try {
    assert((await credit()).credited, "la primera del día pasa");
    const segunda = await credit({ referredUserId: CARA, referredIp: IP_CARA });
    assert(
      rejectedFor(segunda) === "daily_cap",
      "con tope en 1, el segundo amigo del día ya no acredita",
    );
    assert((await balance(ALICE)) === 1, "el saldo queda contenido por el tope");
  } finally {
    LIFE_RULES.DAILY_CREDIT_CAP = original;
  }
  assert(LIFE_RULES.DAILY_CREDIT_CAP === null, "en producción el tope queda desactivado");
}

async function testPerillaJuegoReal() {
  console.log("\n▶ Exigir juego real (perilla apagada en producción)");
  await reset();
  const original = LIFE_RULES.REQUIRE_REAL_PLAY;
  LIFE_RULES.REQUIRE_REAL_PLAY = true;
  try {
    const corto = await credit({ playedSeconds: 2 });
    assert(
      rejectedFor(corto) === "not_played_enough",
      "con la perilla encendida, entrar y salir a los 2s NO acredita",
    );
    assert((await credit({ playedSeconds: 90 })).credited, "jugar de verdad sí acredita");
  } finally {
    LIFE_RULES.REQUIRE_REAL_PLAY = original;
  }
  assert(LIFE_RULES.REQUIRE_REAL_PLAY === false, "en producción la exigencia queda apagada");
}

async function testPerillaCooldownLargo() {
  console.log("\n▶ Cooldown de varios días (perilla en 1 en producción)");
  await reset();
  const original = LIFE_RULES.REFERRAL_COOLDOWN_DAYS;
  LIFE_RULES.REFERRAL_COOLDOWN_DAYS = 7;
  try {
    assert((await credit()).credited, "la primera acredita");
    assert(
      rejectedFor(await credit({ dateKey: MANANA })) === "cooldown",
      "con cooldown de 7 días, al día siguiente todavía no acredita",
    );
    assert(
      (await credit({ dateKey: "2026-10-02" })).credited,
      "pasados los 7 días, vuelve a acreditar",
    );
  } finally {
    LIFE_RULES.REFERRAL_COOLDOWN_DAYS = original;
  }
  assert(LIFE_RULES.REFERRAL_COOLDOWN_DAYS === 1, "en producción el cooldown es de 1 día");
}

// ─── 6. Gasto de la vida ─────────────────────────────────────────────

async function testGastoDeVida() {
  console.log("\n▶ Gastar una vida");
  await reset();
  await credit();
  await credit({ referredUserId: CARA, referredIp: IP_CARA });
  assert((await balance(ALICE)) === 2, "arranca con 2 vidas");

  assert(await consumeLife(q, ALICE, HOY), "gasta la primera");
  const st = await getLivesState(q, ALICE, HOY);
  assert(st.balance === 1, "el saldo baja a 1");
  assert(st.usedToday, "queda marcada como usada hoy");
  assert(!st.usableToday, "aunque tenga saldo, hoy ya no puede usar otra");

  assert(!(await consumeLife(q, ALICE, HOY)), "el segundo gasto del día se rechaza");
  assert((await balance(ALICE)) === 1, "y no descuenta de más");

  assert(await consumeLife(q, ALICE, MANANA), "al día siguiente sí puede gastar");
  assert((await balance(ALICE)) === 0, "el saldo llega a 0");
}

async function testGastoSinSaldo() {
  console.log("\n▶ Gastar sin saldo");
  await reset();

  assert(!(await consumeLife(q, ALICE, HOY)), "sin vidas no se puede gastar");
  assert((await balance(ALICE)) === 0, "el saldo NO queda negativo");

  const st = await getLivesState(q, ALICE, HOY);
  assert(!st.usedToday, "un gasto fallido no marca el día como usado");
  assert(
    !(await consumeLife(q, "anon-99999999-9999-4999-8999-999999999999", HOY)),
    "un usuario inexistente no puede gastar",
  );
}

async function testSaldoNoNegativo() {
  console.log("\n▶ El saldo no puede quedar negativo (invariante de base)");
  await reset();

  let rechazado = false;
  try {
    await db.query("UPDATE users SET extra_lives_balance = -1 WHERE id = $1", [ALICE]);
  } catch {
    rechazado = true;
  }
  assert(rechazado, "la base rechaza un saldo negativo aunque el UPDATE venga de otro lado");
}

// ─── 7. Privacidad de la huella de IP ────────────────────────────────

async function testHuellaDeIp() {
  console.log("\n▶ Huella de IP");

  assert(hashIp(IP_BOB) === hashIp(IP_BOB), "la misma IP da siempre la misma huella");
  assert(hashIp(IP_BOB) !== hashIp(IP_CARA), "dos IP distintas dan huellas distintas");
  assert(!hashIp(IP_BOB).includes(IP_BOB), "la huella no contiene la IP");
  assert(/^[0-9a-f]{64}$/.test(hashIp(IP_BOB)), "la huella es un hex de 64 (SHA-256)");

  // Sin el secreto, el hash no se puede reproducir: es lo que impide revertirlo
  // por fuerza bruta recorriendo el espacio de IPv4.
  const { createHash } = await import("crypto");
  const pelado = createHash("sha256").update(IP_BOB).digest("hex");
  assert(hashIp(IP_BOB) !== pelado, "no es un SHA-256 pelado (lleva secreto)");
}

async function testPurgaDeHuellas() {
  console.log("\n▶ Purga de huellas a los 12 meses");
  await reset();
  await credit();

  await db.query(
    "UPDATE referrals SET created_at = now() - INTERVAL '13 months' WHERE referrer_id = $1",
    [ALICE],
  );
  // Misma sentencia que purgeOldIpAddresses (db.ts).
  await db.query(
    `UPDATE referrals SET referred_ip_hash = NULL
      WHERE referred_ip_hash IS NOT NULL
        AND created_at < now() - INTERVAL '12 months'`,
  );

  const r = await db.query("SELECT referred_ip_hash, referrer_id FROM referrals");
  assert((r.rows[0] as any).referred_ip_hash === null, "la huella vieja se borra");
  assert((r.rows[0] as any).referrer_id === ALICE, "el resto del historial se conserva");
  assert((await balance(ALICE)) === 1, "purgar no le quita vidas a nadie");
}

// ─── Runner ──────────────────────────────────────────────────────────

async function main() {
  console.log("═══ Test del sistema de vidas extra por referido ═══");
  await schema();

  await testEstadoInicial();
  await testAcreditacionFeliz();
  await testPerderTambienAcredita();
  await testAutoReferido();
  await testMismaIp();
  await testMismaIpPorSesionAbierta();
  await testMismaIpAunqueElReferidorNoJugoHoy();
  await testSinReferidor();
  await testSinIp();
  await testCooldownMismoDia();
  await testCooldownVenceAlDiaSiguiente();
  await testCooldownPorIpAunqueCambieDeCuenta();
  await testCooldownPorUsuarioAunqueCambieDeIp();
  await testLaFechaEsLaLlaveDelCooldown();
  await testAmigosDistintosSiSuman();
  await testIndiceUnicoComoRespaldo();
  await testPerillaTopeDiario();
  await testPerillaJuegoReal();
  await testPerillaCooldownLargo();
  await testGastoDeVida();
  await testGastoSinSaldo();
  await testSaldoNoNegativo();
  await testHuellaDeIp();
  await testPurgaDeHuellas();

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} asserts OK, ${failed} fallos`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
