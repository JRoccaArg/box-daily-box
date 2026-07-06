/**
 * Motor de estadisticas y progreso.
 *
 * Modelo de almacenamiento:
 *   results: { [dateKey]: { [gameId]: DailyGameResult } }
 *
 * Todo lo demas (ganados, perdidos, rachas) se DERIVA de `results`, asi que
 * no hay riesgo de que los agregados queden desincronizados. El mapa es
 * pequeno (una entrada por dia), por lo que recalcular es barato.
 */

import { storage } from "./storage";
import { dateKey } from "./seed";
import { computeScore } from "./scoring";
import { emit, Events } from "./events";
import type { DailyGameResult, GameStatus, StatsSummary, Difficulty } from "@/types";

type ResultsMap = Record<string, Record<string, DailyGameResult>>;

/** Lock DURABLE de retos jugados (no se borra al reiniciar progreso). */
type PlayedLock = Record<string, Record<string, { status: "won" | "lost"; finishedAt: number }>>;

const RESULTS_KEY = "results";
const PLAYED_KEY = "played";

function loadResults(): ResultsMap {
  return storage.get<ResultsMap>(RESULTS_KEY, {});
}

function loadPlayed(): PlayedLock {
  return storage.get<PlayedLock>(PLAYED_KEY, {});
}

/** Resultado guardado de un juego para una fecha, o null si no se jugo. */
export function getResult(gameId: string, date: Date = new Date()): DailyGameResult | null {
  const day = loadResults()[dateKey(date)];
  return day?.[gameId] ?? null;
}

/** Todos los resultados de un dia, indexados por gameId. */
export function getDayResults(date: Date = new Date()): Record<string, DailyGameResult> {
  return loadResults()[dateKey(date)] ?? {};
}

/**
 * Registra el resultado de un juego para el dia.
 *
 * Idempotente y con LOCK DURABLE: si ese reto ya se jugó hoy, no se vuelve a
 * registrar ni a puntuar, AUNQUE el usuario haya reiniciado su progreso. El
 * registro va a dos lugares:
 *   - `results`: reseteable (alimenta estadísticas y puntos).
 *   - `played`:  durable, NO se borra al reiniciar (impide rejugar un reto cuyas
 *               respuestas ya se conocen; solo se desbloquea al día siguiente).
 */
export function recordResult(
  gameId: string,
  status: Extract<GameStatus, "won" | "lost">,
  meta?: DailyGameResult["meta"],
  date: Date = new Date(),
): DailyGameResult {
  const key = dateKey(date);
  const played = loadPlayed();
  const playedDay = played[key] ?? {};

  // Ya jugado hoy (segun el lock durable): respetar el primero, no re-sumar.
  if (playedDay[gameId]) {
    const existing = (loadResults()[key] ?? {})[gameId];
    if (existing) return existing;
    const lock = playedDay[gameId];
    return { status: lock.status, date: key, finishedAt: lock.finishedAt };
  }

  const result: DailyGameResult = {
    status,
    date: key,
    finishedAt: Date.now(),
    ...(meta ? { meta } : {}),
  };

  // results (reseteable): alimenta stats y puntos.
  const results = loadResults();
  results[key] = { ...(results[key] ?? {}), [gameId]: result };
  storage.set(RESULTS_KEY, results);

  // played (durable): lock que sobrevive al reinicio de progreso.
  played[key] = { ...playedDay, [gameId]: { status, finishedAt: result.finishedAt } };
  storage.set(PLAYED_KEY, played);

  return result;
}

/**
 * Estado de juego de un reto HOY segun el lock durable (sobrevive al reinicio).
 * Se usa para bloquear el reto hasta el día siguiente.
 */
export function getPlayedStatus(
  gameId: string,
  date: Date = new Date(),
): "won" | "lost" | null {
  const day = loadPlayed()[dateKey(date)];
  return day?.[gameId]?.status ?? null;
}

/* --------------------------------------------------------------------- */
/* Agregados                                                              */
/* --------------------------------------------------------------------- */

function previousKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  const prev = new Date(y, m - 1, d - 1);
  return dateKey(prev);
}

/** Dias (keys) en los que se gano al menos un juego. */
function wonDays(results: ResultsMap): Set<string> {
  const days = new Set<string>();
  for (const [day, games] of Object.entries(results)) {
    if (Object.values(games).some((r) => r.status === "won")) days.add(day);
  }
  return days;
}

/** Longitud de la racha consecutiva que termina en `endKey` (inclusive). */
function streakEndingAt(endKey: string, days: Set<string>): number {
  let count = 0;
  let cursor = endKey;
  while (days.has(cursor)) {
    count++;
    cursor = previousKey(cursor);
  }
  return count;
}

/** Calcula el resumen global a partir del almacenamiento. */
export function getStats(today: Date = new Date()): StatsSummary {
  const results = loadResults();

  let won = 0;
  let lost = 0;
  for (const games of Object.values(results)) {
    for (const r of Object.values(games)) {
      if (r.status === "won") won++;
      else lost++;
    }
  }

  const days = wonDays(results);

  // Racha actual: vive solo si el ultimo dia ganado es hoy o ayer.
  const todayKey = dateKey(today);
  const yesterdayKey = previousKey(todayKey);
  let currentStreak = 0;
  if (days.has(todayKey)) currentStreak = streakEndingAt(todayKey, days);
  else if (days.has(yesterdayKey)) currentStreak = streakEndingAt(yesterdayKey, days);

  // Mejor racha historica.
  let bestStreak = 0;
  for (const day of days) {
    // Solo medir desde el inicio de cada racha (dia sin predecesor ganado).
    if (!days.has(previousKey(day))) {
      let len = 0;
      let cursor = day;
      while (days.has(cursor)) {
        len++;
        const [y, m, d] = cursor.split("-").map(Number) as [number, number, number];
        cursor = dateKey(new Date(y, m - 1, d + 1));
      }
      if (len > bestStreak) bestStreak = len;
    }
  }

  const allDays = Object.keys(results).sort();
  const lastPlayed = allDays.length ? (allDays[allDays.length - 1] as string) : null;

  return { won, lost, currentStreak, bestStreak, lastPlayed };
}

/** Borra todo el progreso (boton "reiniciar progreso"). */
/**
 * Borra el progreso (boton "reiniciar progreso"): estadísticas y puntos.
 * NO borra el lock `played`, así que los retos ya jugados hoy siguen
 * bloqueados (reiniciar no permite rejugarlos conociendo las respuestas).
 */
export function resetAllProgress(): void {
  storage.remove(RESULTS_KEY);
}

/**
 * Reset COMPLETO para cambio de cuenta (login/logout).
 * A diferencia de resetAllProgress, borra TAMBIÉN el lock `played`, porque
 * al cambiar de identidad el estado de "qué jugué hoy" cambia por completo
 * y debe reconstruirse desde el servidor (fuente de verdad).
 */
export function resetForAccountSwitch(): void {
  storage.remove(RESULTS_KEY);
  storage.remove(PLAYED_KEY);
  emit(Events.STATS_CHANGED);
}

/**
 * Sincroniza resultados locales con attempts del servidor.
 *
 * Uso: se llama al cargar la home si el usuario está logueado, y después
 * del login OAuth (para reflejar attempts migrados desde el anónimo o
 * previos desde otros dispositivos).
 *
 * Comportamiento:
 *  - Escribe TANTO en `results` (para stats/puntos) como en `played` (lock durable)
 *  - Si un attempt del server ya existe localmente, no lo pisa (idempotente)
 *  - Si un attempt del server NO existe localmente, lo agrega y bloquea el juego
 *
 * @param serverAttempts Attempts recibidos del server para una fecha
 * @param dateKey_ Fecha (YYYY-MM-DD) — normalmente hoy
 */
export function syncFromServer(
  serverAttempts: Array<{
    gameId: string;
    won: boolean;
    timeSeconds: number;
    points: number;
    finishedAt: string;
    difficulty?: string;
  }>,
  dateKey_: string,
): void {
  if (serverAttempts.length === 0) return;

  const results = loadResults();
  const played = loadPlayed();

  const resultsDay = results[dateKey_] ?? {};
  const playedDay = played[dateKey_] ?? {};

  for (const att of serverAttempts) {
    const status: "won" | "lost" = att.won ? "won" : "lost";
    const finishedAt = new Date(att.finishedAt).getTime();

    // Escribir en played (lock durable) si no existe
    if (!playedDay[att.gameId]) {
      playedDay[att.gameId] = { status, finishedAt };
    }

    // Escribir en results (para stats) si no existe
    if (!resultsDay[att.gameId]) {
      resultsDay[att.gameId] = {
        status,
        date: dateKey_,
        finishedAt,
        meta: {
          serverPoints: att.points,
          timeSeconds: att.timeSeconds,
          ...(att.difficulty ? { difficulty: att.difficulty } : {}),
        },
      };
    }
  }

  results[dateKey_] = resultsDay;
  played[dateKey_] = playedDay;
  storage.set(RESULTS_KEY, results);
  storage.set(PLAYED_KEY, played);

  // Notificar a React que los datos locales cambiaron.
  emit(Events.STATS_CHANGED);
}

/* --------------------------------------------------------------------- */
/* Puntaje y ranking mensual (PERSONAL y local)                          */
/* --------------------------------------------------------------------- */

const DIFFS: Difficulty[] = ["facil", "medio", "dificil", "leyenda"];

/** Puntos de un resultado guardado. Usa serverPoints si el servidor los informó,
 *  sino calcula localmente (fallback offline). */
export function scoreOfResult(r: DailyGameResult): number {
  const meta = r.meta ?? {};
  // Si el servidor ya validó y devolvió puntos, son la fuente de verdad.
  if (typeof meta.serverPoints === "number") return meta.serverPoints;
  // Fallback: calcular localmente (mismo algoritmo que el server).
  const difficulty = (DIFFS as string[]).includes(String(meta.difficulty))
    ? (meta.difficulty as Difficulty)
    : "medio";
  const timeSeconds = typeof meta.timeSeconds === "number" ? meta.timeSeconds : null;
  const timeLimit = typeof meta.timeLimit === "number" ? meta.timeLimit : null;
  return computeScore({ won: r.status === "won", difficulty, timeSeconds, timeLimit });
}

/**
 * Actualiza los puntos de un resultado con los que devolvió el servidor.
 * Esto sincroniza "Mi Progreso" (local) con el ranking global (server).
 */
export function updateServerPoints(
  gameId: string,
  serverPoints: number,
  date: Date = new Date(),
): void {
  const key = dateKey(date);
  const results = loadResults();
  const dayResults = results[key] ?? {};
  const existing = dayResults[gameId];
  if (!existing) return; // No hay resultado local: nada que actualizar.
  existing.meta = { ...existing.meta, serverPoints };
  dayResults[gameId] = existing;
  results[key] = dayResults;
  storage.set(RESULTS_KEY, results);
}

export type MonthlyScore = {
  /** Mes en formato "YYYY-MM". */
  month: string;
  total: number;
  gamesWon: number;
  /** Puntos por juego (gameId -> puntos). */
  byGame: Record<string, number>;
  /** Puntos por dificultad. */
  byDifficulty: Record<Difficulty, number>;
  /** Serie diaria (1..N del mes) con puntos de ese dia. */
  daily: { day: number; points: number }[];
  /** Mejor dia del mes (puntos). */
  bestDay: { day: number; points: number } | null;
};

/** Clave "YYYY-MM" de una fecha. */
export function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Agrega el puntaje del mes a partir de `results` (fuente de verdad). Es un
 * ranking PERSONAL: se recalcula siempre desde los resultados, asi que no
 * puede quedar desincronizado.
 */
export function getMonthlyScore(date: Date = new Date()): MonthlyScore {
  const month = monthKey(date);
  const results = loadResults();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const byGame: Record<string, number> = {};
  const byDifficulty: Record<Difficulty, number> = {
    facil: 0,
    medio: 0,
    dificil: 0,
    leyenda: 0,
  };
  const perDay = new Array<number>(daysInMonth + 1).fill(0);
  let total = 0;
  let gamesWon = 0;

  for (const [dayKey, games] of Object.entries(results)) {
    if (!dayKey.startsWith(month + "-")) continue;
    const dayNum = Number(dayKey.split("-")[2]);
    for (const [gameId, r] of Object.entries(games)) {
      const pts = scoreOfResult(r);
      if (pts <= 0) continue;
      total += pts;
      gamesWon += 1;
      byGame[gameId] = (byGame[gameId] ?? 0) + pts;
      const diff = (DIFFS as string[]).includes(String(r.meta?.difficulty))
        ? (r.meta!.difficulty as Difficulty)
        : "medio";
      byDifficulty[diff] += pts;
      if (dayNum >= 1 && dayNum <= daysInMonth) perDay[dayNum] = (perDay[dayNum] ?? 0) + pts;
    }
  }

  const daily = [];
  let bestDay: { day: number; points: number } | null = null;
  for (let d = 1; d <= daysInMonth; d++) {
    const points = perDay[d] ?? 0;
    daily.push({ day: d, points });
    if (points > 0 && (!bestDay || points > bestDay.points)) bestDay = { day: d, points };
  }

  return { month, total, gamesWon, byGame, byDifficulty, daily, bestDay };
}

/* --------------------------------------------------------------------- */
/* Solutions locales (para re-verificar al importar en login)            */
/* --------------------------------------------------------------------- */
//
// Cuando un juego se completa, guardamos la solution enviada. Sirve para que,
// al loguearse, el frontend pueda mandar esas solutions al server y este las
// re-verifique (no confiamos en puntos del cliente). Ver auth.ts importLocalAttempts.

const SOLUTIONS_KEY = "solutions";

type StoredSolution = {
  gameId: string;
  date: string;
  solution: Record<string, unknown> | null;
};

/** Guarda la solution de un juego para una fecha (para re-verificación futura). */
export function saveSolution(
  gameId: string,
  solution: Record<string, unknown> | null,
  date: Date = new Date(),
): void {
  const key = dateKey(date);
  const all = storage.get<Record<string, Record<string, StoredSolution>>>(SOLUTIONS_KEY, {});
  const day = all[key] ?? {};
  // No pisar una solution ya guardada (respeta el primer intento).
  if (day[gameId]) return;
  day[gameId] = { gameId, date: key, solution };
  all[key] = day;
  storage.set(SOLUTIONS_KEY, all);
}

/** Devuelve todas las solutions guardadas para una fecha. */
export function getSolutionsForDate(date: Date = new Date()): StoredSolution[] {
  const key = dateKey(date);
  const all = storage.get<Record<string, Record<string, StoredSolution>>>(SOLUTIONS_KEY, {});
  const day = all[key] ?? {};
  return Object.values(day);
}

/** Borra todas las solutions guardadas (ej: al cambiar de cuenta). */
export function clearSolutions(): void {
  storage.remove(SOLUTIONS_KEY);
}
