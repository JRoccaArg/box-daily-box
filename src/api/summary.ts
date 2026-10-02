// src/api/summary.ts
//
// Resumen PERSONAL del jugador para el perfil (GET /user/:userId/summary):
// victorias, derrotas, lo jugado hoy, racha actual, mejor racha y los últimos
// 7 días. Sale del historial COMPLETO del server, no del navegador.
//
// Qué cuenta: todos los intentos del reto diario del usuario (`duel_id IS
// NULL`), rankeados o no. Es lo personal — el mismo criterio que las stats
// locales (`getStats` en src/lib/stats.ts) —, no el ranking público.
//
// Mismo patrón que badges.ts: SQL con `QueryFn` inyectable (testeado contra
// PGlite) y el resto en funciones puras.

/** Ejecutor de queries mínimo, compatible con `pg` (Pool/Client) y con PGlite. */
export type QueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;

/** Partidas jugadas y ganadas en un día. */
export type DayCount = { dateKey: string; played: number; won: number };

export type UserSummary = {
  today: string;
  won: number;
  lost: number;
  todayWon: number;
  todayPlayed: number;
  currentStreak: number;
  bestStreak: number;
  /** Los últimos 7 días, del más viejo a hoy (días sin partidas en 0). */
  lastDays: DayCount[];
};

/** Cantidad de días que trae `lastDays` (hoy incluido). */
export const SUMMARY_LAST_DAYS = 7;

/** Corre una fecha 'YYYY-MM-DD' `delta` días (UTC, sin depender del huso del server). */
export function shiftDateKey(key: string, delta: number): string {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * Rachas a partir de los días con al menos una victoria.
 *
 *  - currentStreak: días consecutivos ganados que terminan HOY o AYER (si el
 *    último día ganado es anterior, la racha murió y vale 0). Misma regla que
 *    `displayStreak` (streak.ts) y que las stats locales.
 *  - bestStreak: la corrida de días consecutivos más larga de todo el historial.
 *
 * Días posteriores a `todayKey` (huso del cliente ±1) no sostienen la racha
 * actual, pero sí cuentan para la mejor.
 */
export function computeWinStreaks(
  wonDayKeys: Iterable<string>,
  todayKey: string,
): { currentStreak: number; bestStreak: number } {
  const days = new Set(wonDayKeys);
  if (days.size === 0) return { currentStreak: 0, bestStreak: 0 };

  let bestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of [...days].sort()) {
    run = prev !== null && shiftDateKey(prev, 1) === day ? run + 1 : 1;
    if (run > bestStreak) bestStreak = run;
    prev = day;
  }

  let cursor = days.has(todayKey) ? todayKey : shiftDateKey(todayKey, -1);
  let currentStreak = 0;
  while (days.has(cursor)) {
    currentStreak++;
    cursor = shiftDateKey(cursor, -1);
  }
  return { currentStreak, bestStreak };
}

/** Arma el resumen (función pura) a partir de los conteos por día. */
export function buildUserSummary(days: readonly DayCount[], todayKey: string): UserSummary {
  let won = 0;
  let played = 0;
  const byDay = new Map<string, DayCount>();
  for (const d of days) {
    won += d.won;
    played += d.played;
    byDay.set(d.dateKey, d);
  }

  const lastDays: DayCount[] = [];
  for (let i = SUMMARY_LAST_DAYS - 1; i >= 0; i--) {
    const dateKey = shiftDateKey(todayKey, -i);
    const d = byDay.get(dateKey);
    lastDays.push({ dateKey, played: d?.played ?? 0, won: d?.won ?? 0 });
  }

  const today = byDay.get(todayKey);
  const streaks = computeWinStreaks(
    days.filter((d) => d.won > 0).map((d) => d.dateKey),
    todayKey,
  );
  return {
    today: todayKey,
    won,
    lost: played - won,
    todayWon: today?.won ?? 0,
    todayPlayed: today?.played ?? 0,
    currentStreak: streaks.currentStreak,
    bestStreak: streaks.bestStreak,
    lastDays,
  };
}

/**
 * Conteo por día de TODO el historial del reto diario del usuario (una fila por
 * día jugado). Alcanza para el resumen entero: totales, hoy, los últimos 7
 * días y las rachas. `to_char` evita depender del huso horario del proceso al
 * convertir el DATE.
 */
export async function loadDayCounts(q: QueryFn, userId: string): Promise<DayCount[]> {
  const res = await q(
    `SELECT to_char(date_key, 'YYYY-MM-DD') AS date_key,
            COUNT(*)::int AS played,
            (COUNT(*) FILTER (WHERE won))::int AS won
       FROM attempts
      WHERE user_id = $1 AND duel_id IS NULL
      GROUP BY date_key
      ORDER BY date_key`,
    [userId],
  );
  return res.rows.map((r) => {
    const row = r as { date_key: string; played: number | string; won: number | string };
    return { dateKey: row.date_key, played: Number(row.played), won: Number(row.won) };
  });
}
