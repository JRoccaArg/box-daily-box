// src/api/lives.ts
//
// Sistema de VIDAS EXTRA por referido (Etapa 2 del plan de vidas/referidos).
//
// Qué es una vida: un permiso para volver a jugar UN reto diario que perdiste
// ese día, con el puzzle regenerado (Etapa 4). El saldo NO vence y NO tiene
// tope, pero solo se puede gastar 1 por día.
//
// Cómo se gana: alguien abre tu link de desafío desde OTRA conexión y cierra
// un reto. Ahí se acredita +1 a cada lado (al que compartió y al que jugó).
//
// ─── Por qué este módulo existe aparte de routes.ts ──────────────────
// Mismo patrón que `streak.ts`, `badges.ts` y `achievements.ts`: toda la lógica
// recibe un ejecutor de queries (`QueryFn`) en vez de importar el pool `pg`.
// Eso permite correr el SQL REAL de producción contra PGlite en los tests
// (scripts/test-lives.ts) en lugar de mantener una copia paralela del SQL que
// se desincroniza. En un sistema donde el saldo se traduce en ventaja de
// ranking, tener los tests sobre el código real no es un lujo.
//
// ─── Nota de seguridad (leer antes de tocar LIFE_RULES) ──────────────
// Las reglas de abajo las eligió el dueño del producto de forma explícita e
// informada, priorizando crecimiento sobre blindaje. Con la configuración
// actual el sistema es DELIBERADAMENTE permisivo y existe un abuso conocido:
// abrir el propio link desde una segunda conexión (datos móviles, VPN) y
// cerrar el reto al instante acredita una vida a ambos lados. Ver el comentario
// de cada constante para saber exactamente qué perilla cierra qué.
//
// Toda la lógica de abuso está concentrada en `LIFE_RULES` justamente para que
// endurecer el sistema sea cambiar números acá y no reescribir el flujo.

import { createHmac } from "crypto";
import { TOKEN_SECRET } from "./secrets";
import { toDateKey } from "./streak";

/** Ejecutor de queries mínimo, compatible con `pg` (Pool/Client) y con PGlite. */
export type QueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;

// ─── Perillas del sistema ────────────────────────────────────────────

export type LifeRules = {
  REFERRAL_COOLDOWN_DAYS: number;
  DAILY_CREDIT_CAP: number | null;
  REQUIRE_REAL_PLAY: boolean;
  MIN_PLAY_SECONDS: number;
  REFERRER_IP_LOOKBACK_DAYS: number;
};

/**
 * Objeto mutable y no `as const` a propósito: los tests necesitan encender las
 * perillas que en producción están apagadas (tope diario, exigir juego real)
 * para verificar que ESOS caminos funcionan. Si solo probáramos la
 * configuración actual, el día que haya que endurecer el sistema en caliente se
 * estaría activando código nunca ejecutado. En producción nadie lo escribe.
 */
export const LIFE_RULES: LifeRules = {
  /**
   * Cuántos DÍAS tienen que pasar para que la MISMA persona te vuelva a dar una
   * vida. 1 = puede darte una todos los días.
   *
   * Es la perilla que decide si dos amigos pueden sostener un intercambio
   * diario de vidas entre ellos. Subirlo a 7 o 30 obliga a que el círculo se
   * amplíe para seguir ganando.
   */
  REFERRAL_COOLDOWN_DAYS: 1,

  /**
   * Tope de vidas acreditables a un mismo usuario en un día. `null` = sin tope.
   *
   * No es un límite de producto sino un cortacircuitos: si aparece un abuso que
   * no previmos, acota el daño a N por día en vez de dejarlo crecer sin techo.
   * Poner un número acá es el cambio de una línea más barato si algún día hay
   * que frenar algo en caliente.
   */
  DAILY_CREDIT_CAP: null as number | null,

  /**
   * Si el referido tiene que haber JUGADO de verdad (y no entrar y salir).
   *
   * En `false` alcanza con que el reto quede cerrado, incluido el abandono
   * inmediato. Es la perilla que más abarata el abuso: con `true`, fabricar una
   * vida cuesta jugar una partida entera en vez de dos segundos.
   */
  REQUIRE_REAL_PLAY: false,

  /** Segundos mínimos jugados cuando `REQUIRE_REAL_PLAY` está en `true`. */
  MIN_PLAY_SECONDS: 15,

  /**
   * Cuántos días hacia atrás se miran las conexiones del REFERIDOR para decidir
   * si el referido viene "de afuera".
   *
   * No puede ser 1 (solo hoy). El link se comparte un día y se abre otro, y si
   * ese día el referidor no jugó, la lista de sus IP queda vacía: la comparación
   * pasa sin comparar nada y la defensa principal del sistema se apaga sola,
   * justo en el escenario en que alguien abre su propio link desde otro
   * navegador de su misma casa. Con una ventana, la conexión del referidor
   * sigue siendo conocida aunque ese día no haya jugado.
   */
  REFERRER_IP_LOOKBACK_DAYS: 7,
};

/** Vidas que se pueden GASTAR por día, sin importar el saldo acumulado. */
export const LIVES_USABLE_PER_DAY = 1;

// ─── IP del referido: se guarda hasheada ─────────────────────────────

/**
 * Huella irreversible de una IP, para la tabla `referrals`.
 *
 * Por qué hasheada y no en claro: la IP acá se usa con un único fin, comparar
 * "¿esta conexión ya le dio una vida a este usuario?". Para eso alcanza con una
 * huella; guardar la IP legible sería acumular un dato personal identificable
 * sin necesidad, justo lo que la Política de Privacidad promete no hacer más
 * allá de los 12 meses de `attempts`.
 *
 * Por qué HMAC y no un SHA256 pelado: el espacio de IPv4 tiene 4.300 millones
 * de valores, así que una tabla de hashes sin secreto se revierte por fuerza
 * bruta en minutos. Con HMAC, sin `TOKEN_SECRET` la huella no dice nada.
 *
 * Consecuencia de rotar `TOKEN_SECRET`: las huellas viejas dejan de coincidir y
 * el historial de referidos arranca de cero (nadie pierde vidas ya acreditadas;
 * solo se olvida quién refirió a quién). Es aceptable y preferible a mantener
 * un segundo secreto que habría que rotar en paralelo.
 */
export function hashIp(ip: string): string {
  return createHmac("sha256", TOKEN_SECRET).update(`referral-ip::${ip}`).digest("hex");
}

/** true si la IP sirve para comparar (hay casos de proxy raro sin IP real). */
export function isUsableIp(ip: string | null | undefined): ip is string {
  return typeof ip === "string" && ip.length > 0 && ip !== "unknown";
}

// ─── Lectura del estado ──────────────────────────────────────────────

export type LivesState = {
  /** Vidas acumuladas. No vencen y no tienen tope. */
  balance: number;
  /** Si hoy todavía se puede gastar una (hay saldo y no se usó ninguna hoy). */
  usableToday: boolean;
  /** Si ya se gastó la vida del día. */
  usedToday: boolean;
};

/**
 * Estado de vidas de un usuario. Devuelve el estado vacío si el usuario no
 * existe: un userId desconocido no es un error, simplemente no tiene vidas.
 */
export async function getLivesState(
  q: QueryFn,
  userId: string,
  todayKey: string,
): Promise<LivesState> {
  const res = await q(
    "SELECT extra_lives_balance, last_life_used_date FROM users WHERE id = $1",
    [userId],
  );
  const row = res.rows[0] as
    | { extra_lives_balance?: number | string; last_life_used_date?: Date | string | null }
    | undefined;
  if (!row) return { balance: 0, usableToday: false, usedToday: false };

  const balance = Number(row.extra_lives_balance ?? 0);
  const usedToday = toDateKey(row.last_life_used_date ?? null) === todayKey;
  return { balance, usableToday: balance > 0 && !usedToday, usedToday };
}

// ─── Gasto de una vida ───────────────────────────────────────────────

/**
 * Gasta una vida de forma ATÓMICA. Devuelve `true` solo si efectivamente la
 * descontó.
 *
 * Todo el control vive en el `WHERE` de un único UPDATE, a propósito: si en vez
 * de esto leyéramos el saldo y después descontáramos, dos requests simultáneos
 * podrían leer ambos "saldo 1" y gastar dos veces la misma vida (y, en la Etapa
 * 4, regenerar dos veces el mismo reto perdido). Con la condición dentro del
 * UPDATE, Postgres serializa la fila y el segundo request no toca ninguna.
 *
 * `last_life_used_date IS DISTINCT FROM` en vez de `<>`: con `<>`, un
 * `last_life_used_date` NULL (usuario que nunca gastó una vida) haría que la
 * comparación diera NULL y el UPDATE no matcheara NUNCA.
 */
export async function consumeLife(
  q: QueryFn,
  userId: string,
  todayKey: string,
): Promise<boolean> {
  const res = await q(
    `UPDATE users
        SET extra_lives_balance = extra_lives_balance - 1,
            last_life_used_date = $2::date
      WHERE id = $1
        AND extra_lives_balance > 0
        AND last_life_used_date IS DISTINCT FROM $2::date
      RETURNING id`,
    [userId, todayKey],
  );
  return res.rows.length > 0;
}

// ─── Acreditación por referido ───────────────────────────────────────

/** Motivo por el que NO se acreditó. Sirve para diagnóstico y tests. */
export type CreditRejection =
  | "no_code"           // la partida no venía de un link de desafío
  | "unknown_code"      // el código no corresponde a ningún usuario
  | "self_referral"     // el referido y el referidor son la misma cuenta
  | "no_ip"             // no pudimos determinar la IP del referido
  | "same_ip"           // el referido juega desde una conexión del referidor
  | "cooldown"          // esa persona ya le dio una vida dentro del período
  | "daily_cap"         // se alcanzó el cortacircuitos diario
  | "not_played_enough" // no jugó lo suficiente (si REQUIRE_REAL_PLAY)
  | "race";             // otro request idéntico ganó la carrera

export type CreditResult =
  | { credited: true; referrerId: string }
  | { credited: false; reason: CreditRejection };

export type CreditInput = {
  /** Código del referidor, leído del sessionToken FIRMADO (nunca del body). */
  referralCode: string | null | undefined;
  referredUserId: string;
  /** IP del referido en ESTE momento (`req.ip` del finish). */
  referredIp: string | null | undefined;
  gameId: string;
  /** 'YYYY-MM-DD' del reto (`session.today`, firmado). */
  dateKey: string;
  /** Segundos jugados. Solo se mira si `REQUIRE_REAL_PLAY` está activo. */
  playedSeconds: number;
};

/**
 * Acredita +1 vida al referidor y +1 al referido, si se cumplen las reglas.
 *
 * Debe llamarse DESPUÉS de que el attempt del referido esté confirmado, y en su
 * propia transacción — no dentro de la del finish. Es el mismo criterio que ya
 * usa `awardAchievements` en `finishChallenge`: un problema acreditando una
 * vida jamás puede hacer rollback del resultado de una partida ya jugada.
 *
 * El orden de las validaciones va de lo más barato a lo más caro (comparaciones
 * en memoria antes que queries) para no pagar trabajo de más en el caso normal,
 * que es "esta partida no viene de ningún link".
 */
export async function creditReferralLives(
  q: QueryFn,
  input: CreditInput,
): Promise<CreditResult> {
  const { referralCode, referredUserId, referredIp, gameId, dateKey, playedSeconds } = input;

  if (!referralCode) return { credited: false, reason: "no_code" };

  if (LIFE_RULES.REQUIRE_REAL_PLAY && playedSeconds < LIFE_RULES.MIN_PLAY_SECONDS) {
    return { credited: false, reason: "not_played_enough" };
  }

  // Sin IP no podemos verificar la única señal que separa "un amigo de verdad"
  // de "la misma persona en otra pestaña", así que no acreditamos. Es un caso
  // muy raro (proxy que borra la IP de origen) y preferimos perder una vida
  // legítima antes que regalar la validación entera.
  if (!isUsableIp(referredIp)) return { credited: false, reason: "no_ip" };

  const referrerRes = await q("SELECT id FROM users WHERE referral_code = $1", [referralCode]);
  const referrerId = (referrerRes.rows[0] as { id?: string } | undefined)?.id;
  if (!referrerId) return { credited: false, reason: "unknown_code" };

  if (referrerId === referredUserId) return { credited: false, reason: "self_referral" };

  // ── Señal principal: la conexión tiene que ser DISTINTA ──
  // Comparamos contra TODAS las IP que el referidor usó en la ventana reciente
  // (ver REFERRER_IP_LOOKBACK_DAYS), no solo las de hoy: el link se comparte un
  // día y se abre otro, y si el referidor no jugó ese día la lista quedaría
  // vacía y la comparación pasaría sin comparar nada.
  // Miramos `sessions` además de `attempts` porque una sesión empezada y no
  // terminada también delata la conexión.
  const referrerIps = await q(
    `SELECT ip_address FROM attempts
      WHERE user_id = $1 AND ip_address IS NOT NULL
        AND date_key > $2::date - $3::int AND date_key <= $2::date
      UNION
     SELECT ip_address FROM sessions
      WHERE user_id = $1 AND ip_address IS NOT NULL
        AND date_key > $2::date - $3::int AND date_key <= $2::date`,
    [referrerId, dateKey, LIFE_RULES.REFERRER_IP_LOOKBACK_DAYS],
  );
  const shared = referrerIps.rows.some(
    (r) => (r as { ip_address?: string }).ip_address === referredIp,
  );
  if (shared) return { credited: false, reason: "same_ip" };

  const ipHash = hashIp(referredIp);

  // ── Cooldown: esta persona ya te dio una vida hace poco ──
  // Se mira por huella de IP O por userId: si alguien borra el navegador para
  // aparecer como usuario nuevo, la IP lo delata; si cambia de red pero sigue
  // logueado, lo delata el userId.
  const recent = await q(
    `SELECT 1 FROM referrals
      WHERE referrer_id = $1
        AND (referred_ip_hash = $2 OR referred_user_id = $3)
        AND date_key > $4::date - $5::int
      LIMIT 1`,
    [referrerId, ipHash, referredUserId, dateKey, LIFE_RULES.REFERRAL_COOLDOWN_DAYS],
  );
  if (recent.rows.length > 0) return { credited: false, reason: "cooldown" };

  // ── Cortacircuitos diario (desactivado por defecto) ──
  // Se evalúa sobre los DOS lados: la vida se acredita a ambos, así que un tope
  // que mirara solo al referidor dejaría al otro lado sin techo.
  if (LIFE_RULES.DAILY_CREDIT_CAP !== null) {
    const cap = LIFE_RULES.DAILY_CREDIT_CAP;
    const counts = await q(
      `SELECT
         (SELECT COUNT(*) FROM referrals WHERE referrer_id = $1 AND date_key = $3::date) AS as_referrer,
         (SELECT COUNT(*) FROM referrals WHERE referred_user_id = $2 AND date_key = $3::date) AS as_referred`,
      [referrerId, referredUserId, dateKey],
    );
    const row = counts.rows[0] as { as_referrer?: number | string; as_referred?: number | string };
    if (Number(row?.as_referrer ?? 0) >= cap || Number(row?.as_referred ?? 0) >= cap) {
      return { credited: false, reason: "daily_cap" };
    }
  }

  // ── Registro + acreditación ──
  // `ON CONFLICT DO NOTHING` y no un try/catch del 23505: dentro de una
  // transacción, un error de Postgres la deja abortada y todo lo que siga
  // falla. Con ON CONFLICT no hay excepción, y "0 filas" ya significa que otro
  // request idéntico llegó primero (los índices únicos de `referrals` son el
  // respaldo real del cooldown ante dos finishes simultáneos).
  const inserted = await q(
    `INSERT INTO referrals (referrer_id, referred_user_id, referred_ip_hash, game_id, date_key)
     VALUES ($1, $2, $3, $4, $5::date)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [referrerId, referredUserId, ipHash, gameId, dateKey],
  );
  if (inserted.rows.length === 0) return { credited: false, reason: "race" };

  await q(
    `UPDATE users SET extra_lives_balance = extra_lives_balance + 1
      WHERE id = ANY($1::text[])`,
    [[referrerId, referredUserId]],
  );

  return { credited: true, referrerId };
}
