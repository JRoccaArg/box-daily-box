// src/api/secondChance.ts
//
// SEGUNDA OPORTUNIDAD (Etapa 4 del plan de vidas/referidos): gastar una vida
// extra para volver a jugar el reto diario que se PERDIÓ hoy.
//
// Reglas decididas con el dueño del producto:
//  - Solo sobre el reto diario perdido de ese día (no duelos, no uno ganado).
//  - Una vida por día en total, sumando los 8 juegos.
//  - La vida se descuenta al EMPEZAR: abandonar la segunda oportunidad es
//    perderla, igual que cualquier reto.
//  - El reto es NUEVO (semilla del server), con la MISMA dificultad y el MISMO
//    tiempo que la partida perdida.
//  - Si se gana, vale como una partida normal: puntos completos, racha y
//    logros. El resultado nuevo REEMPLAZA al perdido.
//  - La regla de IP se mantiene: si la partida perdida no rankeaba, la segunda
//    oportunidad tampoco; y si hoy la conexión ya la usó otra cuenta, tampoco.
//  - El link de desafío pasa a mostrar el resultado nuevo, pero quien ya lo
//    jugó conserva su comparación (ver `owner_*` en challenge_plays).
//
// Igual que lives.ts y challenges.ts, todo recibe el ejecutor de queries por
// parámetro, así scripts/test-second-chance.ts corre este SQL real contra
// PGlite. Las funciones de escritura DEBEN correr dentro de una transacción.

import { randomInt } from "crypto";
import { consumeLife, type QueryFn } from "./lives";
import { bumpStreakOnWin } from "./streak";

const SEED_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Semilla del reto de la segunda oportunidad. Sale de `crypto` y nunca del
 * cliente: si pudiera elegirla, probaría semillas hasta dar con un reto fácil.
 */
export function newLifeSeed(): string {
  let s = "lf-";
  for (let i = 0; i < 16; i++) s += SEED_ALPHABET[randomInt(SEED_ALPHABET.length)];
  return s;
}

// ─── Empezar ─────────────────────────────────────────────────────────

export type SecondChanceGame = {
  seed: string;
  difficulty: string;
  /** Segundos de la partida perdida; null si fue "Sin Tiempo" o no se sabe. */
  timeLimit: number | null;
  /** true = "Sin Tiempo"; null = intento anterior a esa columna. */
  untimed: boolean | null;
  ranked: boolean;
  /** Epoch ms del arranque ORIGINAL (al retomar, el reloj no vuelve a cero). */
  startedAt: number;
};

export type StartSecondChanceResult =
  | ({ kind: "ok"; resumed: boolean } & SecondChanceGame)
  /** Ya usó la vida del día (en este juego o en otro). */
  | { kind: "used_today" }
  /** No tiene un reto diario de ese juego ese día. */
  | { kind: "no_attempt" }
  /** El reto de ese día lo ganó: no hay nada que recuperar. */
  | { kind: "not_lost" }
  | { kind: "no_lives" };

type RawSecondChance = {
  game_id: string;
  seed: string;
  difficulty: string;
  time_limit: number | null;
  untimed: boolean | null;
  ranked: boolean;
  started_at: Date | string;
  finished_at: Date | string | null;
};

function toMs(v: Date | string): number {
  return v instanceof Date ? v.getTime() : new Date(v).getTime();
}

/**
 * Gasta la vida del día y reserva la segunda oportunidad de un juego.
 *
 * Si ya estaba reservada para ESE juego, sin terminar y todavía dentro de la
 * vida de la sesión, la retoma: misma semilla, mismo reloj y sin cobrar otra
 * vida. Es lo que cubre el caso "el server la arrancó pero la respuesta se
 * perdió en la red": el reintento del cliente no puede costar una segunda vida
 * ni darle un reto distinto (que sería una forma de pescar uno fácil).
 *
 * `ipAllowsRanking`: la regla de IP evaluada AHORA por el llamador. Se combina
 * con la de la partida perdida: rankea solo si las dos lo permiten.
 */
export async function startSecondChance(
  q: QueryFn,
  args: {
    userId: string;
    gameId: string;
    dateKey: string;
    ipAllowsRanking: boolean;
    ip: string;
    nowMs: number;
    sessionTtlMs: number;
  },
): Promise<StartSecondChanceResult> {
  const { userId, gameId, dateKey, ipAllowsRanking, ip, nowMs, sessionTtlMs } = args;

  // FOR UPDATE: dos arranques simultáneos se serializan acá, y el segundo ve
  // la fila que creó el primero en vez de intentar gastar otra vida.
  const prev = await q(
    `SELECT game_id, seed, difficulty, time_limit, untimed, ranked, started_at, finished_at
       FROM second_chances WHERE user_id = $1 AND date_key = $2::date
       FOR UPDATE`,
    [userId, dateKey],
  );
  const p = prev.rows[0] as RawSecondChance | undefined;
  if (p) {
    const startedAt = toMs(p.started_at);
    const resumable =
      p.game_id === gameId && p.finished_at === null && startedAt + sessionTtlMs > nowMs;
    if (!resumable) return { kind: "used_today" };
    return {
      kind: "ok",
      resumed: true,
      seed: p.seed,
      difficulty: p.difficulty,
      timeLimit: p.time_limit === null ? null : Number(p.time_limit),
      untimed: p.untimed,
      ranked: Boolean(p.ranked),
      startedAt,
    };
  }

  const att = await q(
    `SELECT won, difficulty, time_limit, untimed, ranked
       FROM attempts
      WHERE user_id = $1 AND game_id = $2 AND date_key = $3::date AND duel_id IS NULL
      FOR UPDATE`,
    [userId, gameId, dateKey],
  );
  const a = att.rows[0] as
    | { won: boolean; difficulty: string; time_limit: number | null; untimed: boolean | null; ranked: boolean | null }
    | undefined;
  if (!a) return { kind: "no_attempt" };
  if (a.won) return { kind: "not_lost" };

  if (!(await consumeLife(q, userId, dateKey))) {
    // consumeLife falla por saldo 0 o por vida ya usada ese día. La segunda
    // causa no debería llegar acá (la fila de arriba la cubre), salvo que la
    // vida del día se haya gastado por otra vía: se informa como ya usada.
    const u = await q(
      "SELECT extra_lives_balance, last_life_used_date = $2::date AS used FROM users WHERE id = $1",
      [userId, dateKey],
    );
    const row = u.rows[0] as { extra_lives_balance?: number; used?: boolean } | undefined;
    return row?.used ? { kind: "used_today" } : { kind: "no_lives" };
  }

  // `ranked` de la partida perdida puede venir NULL en filas muy viejas: la
  // columna nació con DEFAULT true, así que NULL se lee como true.
  const ranked = (a.ranked ?? true) && ipAllowsRanking;
  const seed = newLifeSeed();
  await q(
    `INSERT INTO second_chances
       (user_id, date_key, game_id, seed, difficulty, time_limit, untimed, ranked, ip_address, started_at)
     VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8, $9, to_timestamp($10::double precision / 1000))`,
    [userId, dateKey, gameId, seed, a.difficulty, a.time_limit, a.untimed, ranked, ip, nowMs],
  );

  return {
    kind: "ok",
    resumed: false,
    seed,
    difficulty: a.difficulty,
    timeLimit: a.time_limit === null ? null : Number(a.time_limit),
    untimed: a.untimed,
    ranked,
    startedAt: nowMs,
  };
}

// ─── Terminar ────────────────────────────────────────────────────────

export type FinishSecondChanceInput = {
  userId: string;
  gameId: string;
  dateKey: string;
  won: boolean;
  points: number;
  timeSeconds: number;
};

export type FinishSecondChanceResult =
  | { recorded: false }
  | { recorded: true; ranked: boolean };

/**
 * Guarda el resultado de la segunda oportunidad y REEMPLAZA con él la partida
 * perdida del día.
 *
 * `WHERE finished_at IS NULL` hace que solo el PRIMER cierre cuente aunque haya
 * dos sesiones (al retomar se firma otra): el segundo no toca nada.
 *
 * El `ranked` que se escribe es el de la fila de second_chances (decidido al
 * empezar con la regla de IP), nunca uno que venga de afuera.
 */
export async function finishSecondChance(
  q: QueryFn,
  input: FinishSecondChanceInput,
): Promise<FinishSecondChanceResult> {
  const upd = await q(
    `UPDATE second_chances
        SET won = $4, points = $5, time_seconds = $6, finished_at = now()
      WHERE user_id = $1 AND date_key = $2::date AND game_id = $3 AND finished_at IS NULL
      RETURNING ranked`,
    [input.userId, input.dateKey, input.gameId, input.won, input.points, input.timeSeconds],
  );
  const row = upd.rows[0] as { ranked: boolean } | undefined;
  if (!row) return { recorded: false };

  // Se reemplaza la partida perdida (misma fila: el índice único del reto
  // diario no admite una segunda). `won = false` en el WHERE: si por algún
  // camino ya figura ganada, no se toca.
  await q(
    `UPDATE attempts
        SET won = $4, points = $5, time_seconds = $6, ranked = $7, flagged = false, life_used = true
      WHERE user_id = $1 AND game_id = $2 AND date_key = $3::date AND duel_id IS NULL
        AND won = false`,
    [input.userId, input.gameId, input.dateKey, input.won, input.points, input.timeSeconds, row.ranked],
  );

  // Misma regla que el reto diario: la racha sube al GANAR (idempotente si ese
  // día ya había ganado otro juego).
  if (input.won) await bumpStreakOnWin(q, input.userId, input.dateKey);

  // El desafío por link de ese juego pasa a mostrar el resultado nuevo. La
  // grilla se borra: la vieja es de la partida perdida, y el cliente manda la
  // nueva al pedir el link. Quien ya jugó el desafío no se ve afectado: su
  // comparación usa la foto guardada en challenge_plays.
  await q(
    `UPDATE challenges SET won = $4, points = $5, time_seconds = $6, grid = NULL
      WHERE owner_id = $1 AND game_id = $2 AND date_key = $3::date`,
    [input.userId, input.gameId, input.dateKey, input.won, input.points, input.timeSeconds],
  );

  return { recorded: true, ranked: Boolean(row.ranked) };
}

// ─── Lecturas ────────────────────────────────────────────────────────

/**
 * Juego con una segunda oportunidad empezada y sin terminar ese día (para
 * ofrecer "Continuar"), o null.
 */
export async function pendingSecondChance(
  q: QueryFn,
  userId: string,
  dateKey: string,
  nowMs: number,
  sessionTtlMs: number,
): Promise<string | null> {
  const r = await q(
    `SELECT game_id, started_at FROM second_chances
      WHERE user_id = $1 AND date_key = $2::date AND finished_at IS NULL`,
    [userId, dateKey],
  );
  const row = r.rows[0] as { game_id: string; started_at: Date | string } | undefined;
  if (!row) return null;
  return toMs(row.started_at) + sessionTtlMs > nowMs ? row.game_id : null;
}

/**
 * Regla de IP: ¿otra cuenta jugó una segunda oportunidad RANKEADA de este juego
 * este día desde esta conexión?
 *
 * Hace falta porque la segunda oportunidad reemplaza la partida perdida en su
 * misma fila, que conserva la IP ORIGINAL. Si alguien la juega desde otra
 * conexión, sin esta consulta esa conexión quedaría "libre" para una segunda
 * cuenta y las dos rankearían desde el mismo lugar.
 */
export async function otherRankedSecondChanceAtIp(
  q: QueryFn,
  ip: string,
  gameId: string,
  dateKey: string,
  userId: string,
): Promise<boolean> {
  const r = await q(
    `SELECT 1 FROM second_chances
      WHERE ip_address = $1 AND game_id = $2 AND date_key = $3::date
        AND user_id <> $4 AND ranked
      LIMIT 1`,
    [ip, gameId, dateKey, userId],
  );
  return r.rows.length > 0;
}
