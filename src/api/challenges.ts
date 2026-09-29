// src/api/challenges.ts
//
// DESAFÍOS POR LINK (Etapa 3 del plan de vidas/referidos).
//
// Flujo: al terminar su reto del día, un jugador obtiene un link
// (`/reto/<id>`). Quien lo abre juega el MISMO minijuego, con la MISMA
// dificultad y el MISMO tiempo, pero con un reto GENERADO en el momento (una
// semilla nueva, como los duelos) — así quien compartió no le puede soplar la
// respuesta. Al terminar se comparan los dos resultados y, si se cumplen las
// reglas de lives.ts, ambos ganan una vida.
//
// Reglas decididas con el dueño del producto:
//  - La partida del desafío ES el reto oficial del día de ese juego para quien
//    lo acepta, si todavía no lo había jugado (suma al ranking con la regla de
//    IP de siempre). Si ya lo había jugado, puede jugar igual, pero su
//    resultado previo no cambia.
//  - Una sola partida por link y por persona.
//  - El link no vence.
//
// Igual que lives.ts, todo recibe el ejecutor de queries por parámetro, así
// scripts/test-challenges.ts corre este SQL real contra PGlite. Acá no hay nada
// de HTTP: la firma de tokens y la prueba de identidad viven en routes.ts.

import { randomInt } from "crypto";
import type { QueryFn } from "./lives";
import { bumpStreakOnWin, toDateKey } from "./streak";

/** Alfabeto sin ambigüedad (mismo criterio que los códigos de amigo/duelo). */
const ID_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Largo del id del desafío. Más largo que el de amigo (6) a propósito: el id
 * de un desafío es público y va escrito en posts, así que no debe poder
 * adivinarse recorriendo combinaciones. 31^10 ≈ 8×10^14.
 */
export const CHALLENGE_ID_LEN = 10;

export function newChallengeId(): string {
  let s = "";
  for (let i = 0; i < CHALLENGE_ID_LEN; i++) s += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  return s;
}

export function isChallengeId(v: unknown): v is string {
  return (
    typeof v === "string" &&
    v.length === CHALLENGE_ID_LEN &&
    [...v].every((c) => ID_ALPHABET.includes(c))
  );
}

/**
 * Semilla del reto generado para quien acepta el desafío. Sale de `crypto`
 * (no de Math.random) y nunca del cliente: si el cliente pudiera elegirla,
 * podría probar semillas hasta dar con un reto fácil.
 */
export function newChallengeSeed(): string {
  let s = "ch-";
  for (let i = 0; i < 16; i++) s += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  return s;
}

// ─── Grilla de emojis (cosmética) ────────────────────────────────────

/** Solo los cuadrados que generan los juegos, más el espacio que separa columnas. */
const GRID_ROW_RE = /^[\u{1F7E9}\u{1F7E8}\u{1F7E5}⬛⬜ ]+$/u;
const GRID_MAX_ROWS = 10;
const GRID_MAX_ROW_LEN = 40;

/**
 * Valida la grilla que manda el cliente al crear un desafío.
 *
 * La grilla es DECORATIVA: la dibuja el navegador de quien compartió y se
 * muestra en la invitación. No decide nada (puntos y resultado salen del
 * intento guardado en el server). Aun así se valida estricto — solo cuadrados
 * de colores, pocas filas y cortas — porque se le muestra a terceros: sin esto
 * serviría para colar texto arbitrario en la pantalla de otra persona.
 */
export function sanitizeGrid(grid: unknown): string[] | null {
  if (!Array.isArray(grid)) return null;
  if (grid.length === 0 || grid.length > GRID_MAX_ROWS) return null;
  for (const row of grid) {
    if (typeof row !== "string") return null;
    if (row.length === 0 || row.length > GRID_MAX_ROW_LEN) return null;
    if (!GRID_ROW_RE.test(row)) return null;
  }
  return grid as string[];
}

// ─── Tipos ───────────────────────────────────────────────────────────

export type ChallengeRow = {
  id: string;
  ownerId: string;
  gameId: string;
  dateKey: string;
  difficulty: string;
  /** Segundos elegidos; null si jugó en "Sin Tiempo". */
  timeLimit: number | null;
  untimed: boolean;
  won: boolean;
  points: number;
  timeSeconds: number | null;
  grid: string[] | null;
};

export type PlayRow = {
  seed: string;
  countsAsDaily: boolean;
  finished: boolean;
  won: boolean | null;
  points: number | null;
  timeSeconds: number | null;
  /**
   * Resultado del dueño cuando ESTA persona empezó a jugar (la foto contra la
   * que compite). null en filas anteriores a esa columna: usar el desafío.
   */
  owner: OwnerResult | null;
};

/** El resultado de quien compartió, tal como se compara. */
export type OwnerResult = { won: boolean; points: number; timeSeconds: number | null };

type RawChallenge = {
  id: string;
  owner_id: string;
  game_id: string;
  date_key: Date | string;
  difficulty: string;
  time_limit: number | null;
  untimed: boolean;
  won: boolean;
  points: number | string;
  time_seconds: number | null;
  grid: unknown;
};

function mapChallenge(r: RawChallenge): ChallengeRow {
  return {
    id: r.id,
    ownerId: r.owner_id,
    gameId: r.game_id,
    dateKey: toDateKey(r.date_key) ?? "",
    difficulty: r.difficulty,
    timeLimit: r.time_limit === null ? null : Number(r.time_limit),
    untimed: Boolean(r.untimed),
    won: Boolean(r.won),
    points: Number(r.points),
    timeSeconds: r.time_seconds === null ? null : Number(r.time_seconds),
    // Se re-valida al leer: si alguna vez entró algo raro, no llega a la pantalla.
    grid: sanitizeGrid(r.grid),
  };
}

type RawPlay = {
  seed: string;
  counts_as_daily: boolean;
  finished_at: Date | string | null;
  won: boolean | null;
  points: number | string | null;
  time_seconds: number | null;
  owner_won: boolean | null;
  owner_points: number | string | null;
  owner_time_seconds: number | null;
};

function mapPlay(r: RawPlay): PlayRow {
  return {
    seed: r.seed,
    countsAsDaily: Boolean(r.counts_as_daily),
    finished: r.finished_at !== null,
    won: r.won === null ? null : Boolean(r.won),
    points: r.points === null ? null : Number(r.points),
    timeSeconds: r.time_seconds === null ? null : Number(r.time_seconds),
    owner:
      r.owner_won === null || r.owner_won === undefined
        ? null
        : {
            won: Boolean(r.owner_won),
            points: Number(r.owner_points ?? 0),
            timeSeconds: r.owner_time_seconds === null ? null : Number(r.owner_time_seconds),
          },
  };
}

/**
 * Contra qué resultado del dueño se compara esta partida: la foto tomada al
 * empezar, o el desafío actual si la partida es anterior a la foto (o todavía
 * no empezó).
 */
export function opponentOf(play: PlayRow | null, challenge: ChallengeRow): OwnerResult {
  return (
    play?.owner ?? { won: challenge.won, points: challenge.points, timeSeconds: challenge.timeSeconds }
  );
}

// ─── Crear el desafío (quien comparte) ───────────────────────────────

export type CreateResult =
  | { ok: true; challenge: ChallengeRow }
  | { ok: false; reason: "no_attempt" | "legacy_attempt" };

/**
 * Devuelve el desafío del intento de hoy del usuario en ese juego, creándolo
 * la primera vez. Idempotente: pedirlo dos veces devuelve el mismo link.
 *
 * El resultado que se muestra en la invitación es una COPIA del intento
 * guardado en el server, nunca lo que diga el cliente: si no, cualquiera
 * podría "desafiar" con 9999 puntos que nunca hizo.
 *
 * `todayKey` es el día del server; se acepta un intento de ±1 día por la misma
 * tolerancia de zona horaria que ya usa `startChallenge`.
 */
export async function createOrGetChallenge(
  q: QueryFn,
  args: { ownerId: string; gameId: string; todayKey: string; grid: string[] | null },
): Promise<CreateResult> {
  const { ownerId, gameId, todayKey, grid } = args;

  const att = await q(
    `SELECT date_key, difficulty, won, points, time_seconds, time_limit, untimed
       FROM attempts
      WHERE user_id = $1 AND game_id = $2 AND duel_id IS NULL
        AND date_key BETWEEN $3::date - 1 AND $3::date + 1
      ORDER BY created_at DESC
      LIMIT 1`,
    [ownerId, gameId, todayKey],
  );
  const a = att.rows[0] as
    | {
        date_key: Date | string;
        difficulty: string;
        won: boolean;
        points: number;
        time_seconds: number | null;
        time_limit: number | null;
        untimed: boolean | null;
      }
    | undefined;
  if (!a) return { ok: false, reason: "no_attempt" };
  // Intentos guardados antes de que existiera esta columna: no sabemos qué
  // tiempo eligió, y el desafío tiene que fijarle ESE tiempo al amigo.
  if (a.untimed === null) return { ok: false, reason: "legacy_attempt" };

  const dateKey = toDateKey(a.date_key) ?? todayKey;

  const existing = await q(
    "SELECT * FROM challenges WHERE owner_id = $1 AND game_id = $2 AND date_key = $3::date",
    [ownerId, gameId, dateKey],
  );
  if (existing.rows[0]) {
    // La grilla llega un instante después que el resultado; si el primer
    // pedido vino sin ella, se completa. Nunca se pisa una ya guardada.
    if (grid && (existing.rows[0] as RawChallenge).grid == null) {
      await q("UPDATE challenges SET grid = $2::jsonb WHERE id = $1 AND grid IS NULL", [
        (existing.rows[0] as RawChallenge).id,
        JSON.stringify(grid),
      ]);
      return { ok: true, challenge: { ...mapChallenge(existing.rows[0] as RawChallenge), grid } };
    }
    return { ok: true, challenge: mapChallenge(existing.rows[0] as RawChallenge) };
  }

  // Dos índices únicos pueden chocar: el id (colisión aleatoria, rarísima) y
  // (dueño, juego, día) (dos pedidos simultáneos del mismo jugador). ON
  // CONFLICT cubre ambos; al releer se distingue cuál fue.
  for (let i = 0; i < 6; i++) {
    const ins = await q(
      `INSERT INTO challenges
         (id, owner_id, game_id, date_key, difficulty, time_limit, untimed, won, points, time_seconds, grid)
       VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10, $11::jsonb)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [
        newChallengeId(),
        ownerId,
        gameId,
        dateKey,
        a.difficulty,
        a.untimed ? null : a.time_limit,
        a.untimed,
        a.won,
        a.points,
        a.time_seconds,
        grid ? JSON.stringify(grid) : null,
      ],
    );
    if (ins.rows[0]) return { ok: true, challenge: mapChallenge(ins.rows[0] as RawChallenge) };

    const raced = await q(
      "SELECT * FROM challenges WHERE owner_id = $1 AND game_id = $2 AND date_key = $3::date",
      [ownerId, gameId, dateKey],
    );
    if (raced.rows[0]) return { ok: true, challenge: mapChallenge(raced.rows[0] as RawChallenge) };
    // Si no, chocó el id: reintentar con otro.
  }
  throw new Error("No se pudo generar un id de desafío único");
}

export async function getChallenge(q: QueryFn, id: string): Promise<ChallengeRow | null> {
  const r = await q("SELECT * FROM challenges WHERE id = $1", [id]);
  return r.rows[0] ? mapChallenge(r.rows[0] as RawChallenge) : null;
}

export async function getPlay(
  q: QueryFn,
  challengeId: string,
  userId: string,
): Promise<PlayRow | null> {
  const r = await q(
    `SELECT seed, counts_as_daily, finished_at, won, points, time_seconds,
            owner_won, owner_points, owner_time_seconds
       FROM challenge_plays WHERE challenge_id = $1 AND user_id = $2`,
    [challengeId, userId],
  );
  return r.rows[0] ? mapPlay(r.rows[0] as RawPlay) : null;
}

/** true si el usuario ya tiene su reto OFICIAL de ese juego en ese día. */
export async function hasDailyAttempt(
  q: QueryFn,
  userId: string,
  gameId: string,
  dateKey: string,
): Promise<boolean> {
  const r = await q(
    `SELECT 1 FROM attempts
      WHERE user_id = $1 AND game_id = $2 AND date_key = $3::date AND duel_id IS NULL
      LIMIT 1`,
    [userId, gameId, dateKey],
  );
  return r.rows.length > 0;
}

// ─── Empezar a jugar (quien acepta) ──────────────────────────────────

export type StartPlayResult =
  | { kind: "own" }
  | { kind: "finished"; play: PlayRow }
  | { kind: "ok"; seed: string; countsAsDaily: boolean; resumed: boolean };

/**
 * Reserva (o retoma) la partida de este usuario en este desafío.
 *
 * La fila se crea al EMPEZAR, no al terminar, y guarda la semilla. Así, si el
 * jugador mira el reto, cierra la pestaña y vuelve a abrir el link, recibe EL
 * MISMO reto: no puede ir "pescando" semillas hasta que le toque uno fácil.
 *
 * `countsAsDaily` se decide acá, una vez: ¿tenía ya su reto oficial de ese
 * juego hoy? Si no, esta partida pasa a serlo.
 */
export async function startChallengePlay(
  q: QueryFn,
  args: { challenge: ChallengeRow; userId: string; todayKey: string },
): Promise<StartPlayResult> {
  const { challenge, userId, todayKey } = args;
  if (challenge.ownerId === userId) return { kind: "own" };

  const prev = await getPlay(q, challenge.id, userId);
  if (prev) {
    if (prev.finished) return { kind: "finished", play: prev };
    return { kind: "ok", seed: prev.seed, countsAsDaily: prev.countsAsDaily, resumed: true };
  }

  const countsAsDaily = !(await hasDailyAttempt(q, userId, challenge.gameId, todayKey));
  const seed = newChallengeSeed();
  const ins = await q(
    `INSERT INTO challenge_plays
       (challenge_id, user_id, seed, counts_as_daily, owner_won, owner_points, owner_time_seconds)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT DO NOTHING
     RETURNING seed`,
    [
      challenge.id,
      userId,
      seed,
      countsAsDaily,
      challenge.won,
      challenge.points,
      challenge.timeSeconds,
    ],
  );
  if (ins.rows[0]) return { kind: "ok", seed, countsAsDaily, resumed: false };

  // Dos pestañas empezaron a la vez: gana la primera y esta usa SU semilla.
  const raced = await getPlay(q, challenge.id, userId);
  if (!raced) throw new Error("challenge_plays: conflicto sin fila");
  if (raced.finished) return { kind: "finished", play: raced };
  return { kind: "ok", seed: raced.seed, countsAsDaily: raced.countsAsDaily, resumed: true };
}

// ─── Terminar (quien acepta) ─────────────────────────────────────────

export type FinishPlayInput = {
  challengeId: string;
  userId: string;
  gameId: string;
  difficulty: string;
  /** Día del reto (el de la sesión firmada), igual que un reto diario. */
  dateKey: string;
  won: boolean;
  points: number;
  timeSeconds: number;
  timeLimit: number | null;
  untimed: boolean;
  ranked: boolean;
  ip: string;
};

export type FinishPlayResult =
  | { recorded: false }
  | { recorded: true; countedAsDaily: boolean };

/**
 * Guarda el resultado de la partida del desafío. DEBE correr dentro de una
 * transacción (la del finish).
 *
 * `WHERE finished_at IS NULL` hace que solo el PRIMER resultado cuente aunque
 * existan dos sesiones de la misma partida (p. ej. si se retomó tras cerrar la
 * pestaña): la segunda no toca nada y devuelve `recorded: false`.
 *
 * Si la partida cuenta como reto oficial, además inserta el intento diario.
 * Ese INSERT usa ON CONFLICT: si mientras tanto el jugador terminó el reto
 * oficial en otra pestaña, ese queda (llegó primero) y el desafío deja de
 * contar para el ranking, sin abortar la transacción.
 */
export async function recordChallengePlay(
  q: QueryFn,
  input: FinishPlayInput,
): Promise<FinishPlayResult> {
  const upd = await q(
    `UPDATE challenge_plays
        SET won = $3, points = $4, time_seconds = $5, finished_at = now()
      WHERE challenge_id = $1 AND user_id = $2 AND finished_at IS NULL
      RETURNING counts_as_daily`,
    [input.challengeId, input.userId, input.won, input.points, input.timeSeconds],
  );
  const row = upd.rows[0] as { counts_as_daily: boolean } | undefined;
  if (!row) return { recorded: false };
  if (!row.counts_as_daily) return { recorded: true, countedAsDaily: false };

  const att = await q(
    `INSERT INTO attempts
       (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ranked,
        ip_address, time_limit, untimed, challenge_id)
     VALUES ($1, $2, $3::date, $4, $5, $6, $7, false, $8, $9, $10, $11, $12)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [
      input.userId,
      input.gameId,
      input.dateKey,
      input.difficulty,
      input.won,
      input.timeSeconds,
      input.points,
      input.ranked,
      input.ip,
      input.untimed ? null : input.timeLimit,
      input.untimed,
      input.challengeId,
    ],
  );
  const countedAsDaily = att.rows.length > 0;

  // Misma regla que el reto diario: la racha sube al GANAR un reto oficial.
  if (countedAsDaily && input.won) {
    await bumpStreakOnWin(q, input.userId, input.dateKey);
  }
  return { recorded: true, countedAsDaily };
}

// ─── Comparación ─────────────────────────────────────────────────────

export type Outcome = "won" | "lost" | "tied";

/**
 * Resultado de quien aceptó frente a quien compartió. Misma regla que los
 * duelos (DuelResultScreen): primero cuenta quién acertó su reto; si los dos
 * acertaron o los dos fallaron, desempatan los puntos (que ya incluyen la
 * rapidez). Empate solo si coinciden ambas cosas.
 */
export function compareOutcome(
  mine: { won: boolean; points: number },
  theirs: { won: boolean; points: number },
): Outcome {
  if (mine.won !== theirs.won) return mine.won ? "won" : "lost";
  if (mine.points === theirs.points) return "tied";
  return mine.points > theirs.points ? "won" : "lost";
}
