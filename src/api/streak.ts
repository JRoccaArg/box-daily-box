// src/api/streak.ts
//
// Racha diaria server-side (Roadmap #3). Una "racha" es la cantidad de días
// CONSECUTIVOS en los que el usuario ganó al menos un reto diario. Se muestra
// junto al nombre en el ranking público.
//
// Diseño (decidido con el usuario, prioridad = eficiencia a escala):
//  - Se CACHEA en dos columnas de `users`: `current_streak` y `last_win_date`.
//    Así el ranking la lee O(1) (dos columnas más en el SELECT que ya hace el
//    JOIN con users), sin una query extra por request ni window functions.
//  - El problema difícil de toda racha es saber cuándo MUERE (no jugar un día la
//    rompe, pero si el usuario no entra a la app no hay código corriendo para
//    "apagarla"). Se resuelve sin cron ni proceso de mantenimiento: se guarda
//    `last_win_date` y al LEER se aplica `displayStreak()` — si el último día
//    ganado no es hoy ni ayer, la racha ya murió y se muestra 0. La columna
//    puede quedar "vieja" pero la lectura siempre es correcta.
//  - Solo cuentan retos DIARIOS ganados y no-flaggeados (`duel_id IS NULL`,
//    `won`, `NOT flagged`). Los duelos (ranked=false, otra ruta de finish) nunca
//    tocan la racha — coincide con el invariante del sistema de juegos y con la
//    racha local (`getStats` en src/lib/stats.ts), para que el número que ve el
//    usuario en su panel coincida con el que ven los demás en el ranking.

/** Ejecutor de queries mínimo, compatible con `pg` (Pool/Client) y con PGlite. */
export type QueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;

/** 'YYYY-MM-DD' de una fecha (UTC), o null si la entrada es null. */
export function toDateKey(d: Date | string | null | undefined): string | null {
  if (d == null) return null;
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

/** Día anterior (UTC) a un 'YYYY-MM-DD', como 'YYYY-MM-DD'. */
export function previousDateKey(todayKey: string): string {
  const d = new Date(`${todayKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Racha a MOSTRAR, aplicando el "death-check" sobre el valor cacheado.
 *
 * Una racha vive solo si el último día ganado es hoy o ayer (misma regla que
 * `getStats` en el frontend). Si `last_win_date` quedó vieja (< ayer), la racha
 * ya murió y se muestra 0 — sin necesidad de haber actualizado la columna.
 *
 * @param currentStreak valor cacheado en `users.current_streak`.
 * @param lastWinKey    `users.last_win_date` como 'YYYY-MM-DD' (o null).
 * @param todayKey      "hoy" del server ('YYYY-MM-DD', honra X-Debug-Date).
 */
export function displayStreak(
  currentStreak: number,
  lastWinKey: string | null,
  todayKey: string,
): number {
  if (!lastWinKey || currentStreak <= 0) return 0;
  const yesterdayKey = previousDateKey(todayKey);
  if (lastWinKey === todayKey || lastWinKey === yesterdayKey) {
    return currentStreak;
  }
  return 0; // la racha murió (no ganó ni hoy ni ayer)
}

/**
 * Actualiza la racha cacheada tras GANAR un reto diario. Debe llamarse DENTRO de
 * la transacción que inserta el attempt (así, si el INSERT choca por duplicado
 * —doble submit— y la transacción hace ROLLBACK, la racha tampoco se bumpea).
 *
 * Lógica (idempotente para varios juegos ganados el mismo día):
 *  - Si `last_win_date` ya es hoy → no hace nada (ya se contó hoy).
 *  - Si `last_win_date` es ayer   → racha + 1 (día consecutivo).
 *  - En cualquier otro caso (null o hueco) → racha = 1 (arranca/reinicia).
 * `best_streak` se lleva con GREATEST para conservar el récord histórico.
 *
 * @param todayKey 'YYYY-MM-DD' del día del reto (session.today, firmado en el token).
 */
export async function bumpStreakOnWin(
  q: QueryFn,
  userId: string,
  todayKey: string,
): Promise<void> {
  await q(
    `UPDATE users
     SET current_streak = CASE
           WHEN last_win_date = $2::date - 1 THEN current_streak + 1
           ELSE 1
         END,
         best_streak = GREATEST(best_streak, CASE
           WHEN last_win_date = $2::date - 1 THEN current_streak + 1
           ELSE 1
         END),
         last_win_date = $2::date
     WHERE id = $1
       AND last_win_date IS DISTINCT FROM $2::date`,
    [userId, todayKey],
  );
}

/**
 * Backfill único para usuarios preexistentes (que ganaron ANTES de que
 * existieran las columnas). Calcula la racha real desde el historial con
 * gaps-and-islands. Idempotente: solo toca filas con `last_win_date IS NULL`
 * que tengan victorias — tras la primera corrida no queda ninguna, así que
 * re-ejecutarlo no actualiza nada. Igualmente se protege con un marcador en
 * `app_meta` (ver initializeDatabase) para no pagar el costo del scan en cada
 * arranque a escala.
 *
 * Guarda la longitud de la racha que TERMINA en el último día ganado; el
 * death-check de `displayStreak` la muestra como 0 si ese día ya quedó viejo.
 */
export async function backfillStreaks(q: QueryFn): Promise<void> {
  await q(
    `WITH won_days AS (
       SELECT user_id, date_key::date AS d
       FROM attempts
       WHERE won AND NOT flagged AND duel_id IS NULL
       GROUP BY user_id, date_key::date
     ),
     grp AS (
       SELECT user_id, d,
              (d - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY d))::int) AS island
       FROM won_days
     ),
     runs AS (
       SELECT user_id, island, COUNT(*)::int AS len, MAX(d) AS run_end
       FROM grp
       GROUP BY user_id, island
     ),
     agg AS (
       SELECT user_id,
              MAX(len) AS best,
              (ARRAY_AGG(len ORDER BY run_end DESC))[1] AS current_len,
              MAX(run_end) AS last_win
       FROM runs
       GROUP BY user_id
     )
     UPDATE users u
     SET current_streak = a.current_len,
         best_streak = a.best,
         last_win_date = a.last_win
     FROM agg a
     WHERE u.id = a.user_id
       AND u.last_win_date IS NULL`,
  );
}
