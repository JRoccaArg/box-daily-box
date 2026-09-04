// Escenarios de logros SOLO para staging. Las victorias sintéticas quedan
// marcadas en attempts.ip_address y pueden limpiarse sin tocar las partidas
// reales del usuario.
//
// `ranked = true` (auditoría 2026-09): antes se insertaban con `ranked = false`
// para no tocar ningún ranking, pero desde que los logros EXIGEN `ranked`
// (ver achievements.ts) esos intentos dejarían de otorgar nada y el panel de
// staging no probaría nada. No distorsionan ranking real porque van con
// `points = 0` y en fechas de 1980-1999, que ningún mes vivo consulta.

import {
  ACHIEVEMENTS,
  DAILY_GAME_IDS,
  awardAchievements,
  getAchievementProgress,
  isAchievementType,
  type AchievementProgress,
  type AchievementType,
  type QueryFn,
} from "./achievements";
import { toDateKey } from "./streak";

export const DEBUG_ACHIEVEMENT_PREFIX = "__debug_achievement__:";
export const MAX_DEBUG_STREAK = 9999;

export type DebugAchievementAction =
  | { action: "status" }
  | { action: "apply"; achievementType: AchievementType }
  | { action: "remove"; achievementType: AchievementType }
  | { action: "set_streak"; streak: number }
  | { action: "reset" };

export type DebugAchievementState = {
  activeScenarios: AchievementType[];
  streak: { current: number; best: number; lastWinDate: string | null };
  achievements: AchievementProgress[];
};

export class DebugAchievementInputError extends Error {}

const DAILY_SQL = `ARRAY[${DAILY_GAME_IDS.map((gameId) => `'${gameId}'`).join(", ")}]`;

function marker(type: AchievementType): string {
  return `${DEBUG_ACHIEVEMENT_PREFIX}${type}`;
}

/**
 * Fechas antiguas y separadas por escenario para no chocar entre sí ni con
 * partidas reales. ranked=false evita alterar cualquier ranking histórico.
 */
async function insertScenario(q: QueryFn, userId: string, type: AchievementType): Promise<void> {
  const commonColumns =
    "(user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ranked, ip_address)";

  if (type === "ach_legend_10" || type === "ach_legend_50") {
    const count = type === "ach_legend_10" ? 10 : 50;
    const start = type === "ach_legend_10" ? "1980-01-01" : "1983-01-01";
    await q(
      `INSERT INTO attempts ${commonColumns}
       SELECT $1, 'pittexto', $2::date + g::int, 'leyenda', true, 30, 0, false, true, $3
       FROM generate_series(0, $4::int - 1) AS g
       ON CONFLICT (user_id, game_id, date_key) WHERE duel_id IS NULL DO NOTHING`,
      [userId, start, marker(type), count],
    );
    return;
  }

  if (type === "ach_wins_100" || type === "ach_wins_500") {
    const count = type === "ach_wins_100" ? 100 : 500;
    const start = type === "ach_wins_100" ? "1986-01-01" : "1989-01-01";
    await q(
      `INSERT INTO attempts ${commonColumns}
       SELECT $1,
              (${DAILY_SQL})[1 + (g::int % ${DAILY_GAME_IDS.length})],
              $2::date + g::int,
              'medio', true, 30, 0, false, true, $3
       FROM generate_series(0, $4::int - 1) AS g
       ON CONFLICT (user_id, game_id, date_key) WHERE duel_id IS NULL DO NOTHING`,
      [userId, start, marker(type), count],
    );
    return;
  }

  if (type === "ach_specialist_50") {
    await q(
      `INSERT INTO attempts ${commonColumns}
       SELECT $1, 'polewordle', '1993-01-01'::date + g::int,
              'medio', true, 30, 0, false, true, $2
       FROM generate_series(0, 49) AS g
       ON CONFLICT (user_id, game_id, date_key) WHERE duel_id IS NULL DO NOTHING`,
      [userId, marker(type)],
    );
    return;
  }

  if (type === "ach_perfect_day") {
    await q(
      `INSERT INTO attempts ${commonColumns}
       SELECT $1, game_id, '1996-06-15'::date, 'medio', true, 30, 0, false, true, $2
       FROM unnest(${DAILY_SQL}) AS game_id
       ON CONFLICT (user_id, game_id, date_key) WHERE duel_id IS NULL DO NOTHING`,
      [userId, marker(type)],
    );
    return;
  }

  // Piloto Completo: los 8 juegos en días diferentes, para no regalar también
  // Gran Premio Perfecto (ese sí exige los 8 en una misma fecha).
  await q(
    `INSERT INTO attempts ${commonColumns}
     SELECT $1, game_id, '1999-01-01'::date + (ordinality::int - 1),
            'medio', true, 30, 0, false, true, $2
     FROM unnest(${DAILY_SQL}) WITH ORDINALITY AS games(game_id, ordinality)
     ON CONFLICT (user_id, game_id, date_key) WHERE duel_id IS NULL DO NOTHING`,
    [userId, marker(type)],
  );
}

async function rebuildAchievements(q: QueryFn, userId: string): Promise<void> {
  await q("DELETE FROM badges WHERE user_id = $1 AND badge_type LIKE 'ach\\_%' ESCAPE '\\'", [userId]);
  await awardAchievements(q, userId);
}

/** Reconstruye la racha real después de quitar el override de staging. */
async function rebuildRealStreak(q: QueryFn, userId: string): Promise<void> {
  const result = await q(
    `SELECT DISTINCT date_key FROM attempts
     WHERE user_id = $1 AND won AND NOT flagged AND duel_id IS NULL
       AND (ip_address IS NULL OR ip_address NOT LIKE $2)
     ORDER BY date_key ASC`,
    [userId, `${DEBUG_ACHIEVEMENT_PREFIX}%`],
  );
  const days = result.rows
    .map((row) => toDateKey((row as { date_key: Date | string }).date_key))
    .filter((day): day is string => day !== null);

  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    const currentMs = Date.parse(`${day}T00:00:00.000Z`);
    const previousMs = previous ? Date.parse(`${previous}T00:00:00.000Z`) : NaN;
    run = previous && currentMs - previousMs === 86_400_000 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  await q(
    `UPDATE users SET current_streak = $2, best_streak = $3, last_win_date = $4::date
     WHERE id = $1`,
    [userId, run, best, previous],
  );
}

async function getState(q: QueryFn, userId: string): Promise<DebugAchievementState> {
  const [scenarioRows, userRows, achievements] = await Promise.all([
    q(
      `SELECT DISTINCT REPLACE(ip_address, $2, '') AS type
       FROM attempts WHERE user_id = $1 AND ip_address LIKE $3`,
      [userId, DEBUG_ACHIEVEMENT_PREFIX, `${DEBUG_ACHIEVEMENT_PREFIX}%`],
    ),
    q("SELECT current_streak, best_streak, last_win_date FROM users WHERE id = $1", [userId]),
    getAchievementProgress(q, userId),
  ]);
  const found = new Set(
    scenarioRows.rows
      .map((row) => (row as { type: unknown }).type)
      .filter(isAchievementType),
  );
  const user = (userRows.rows[0] ?? {}) as {
    current_streak?: number;
    best_streak?: number;
    last_win_date?: Date | string | null;
  };
  return {
    activeScenarios: ACHIEVEMENTS.map((item) => item.type).filter((type) => found.has(type)),
    streak: {
      current: Number(user.current_streak ?? 0),
      best: Number(user.best_streak ?? 0),
      lastWinDate: toDateKey(user.last_win_date),
    },
    achievements,
  };
}

export function parseDebugAchievementAction(body: unknown): DebugAchievementAction {
  if (!body || typeof body !== "object") throw new DebugAchievementInputError("Acción inválida");
  const value = body as Record<string, unknown>;
  if (value.action === "status" || value.action === "reset") return { action: value.action };
  if (value.action === "apply" || value.action === "remove") {
    if (!isAchievementType(value.achievementType)) {
      throw new DebugAchievementInputError("Logro inválido");
    }
    return { action: value.action, achievementType: value.achievementType };
  }
  if (value.action === "set_streak") {
    const streak = value.streak;
    if (typeof streak !== "number" || !Number.isInteger(streak) || streak < 0 || streak > MAX_DEBUG_STREAK) {
      throw new DebugAchievementInputError(`La racha debe ser un entero entre 0 y ${MAX_DEBUG_STREAK}`);
    }
    return { action: "set_streak", streak };
  }
  throw new DebugAchievementInputError("Acción inválida");
}

export async function runDebugAchievementAction(
  q: QueryFn,
  userId: string,
  action: DebugAchievementAction,
  todayKey: string,
): Promise<DebugAchievementState> {
  if (action.action === "apply") {
    await q("DELETE FROM attempts WHERE user_id = $1 AND ip_address = $2", [userId, marker(action.achievementType)]);
    await insertScenario(q, userId, action.achievementType);
    await rebuildAchievements(q, userId);
  } else if (action.action === "remove") {
    await q("DELETE FROM attempts WHERE user_id = $1 AND ip_address = $2", [userId, marker(action.achievementType)]);
    await rebuildAchievements(q, userId);
  } else if (action.action === "set_streak") {
    await q(
      `UPDATE users
       SET current_streak = $2,
           best_streak = GREATEST(best_streak, $2),
           last_win_date = CASE WHEN $2 > 0 THEN $3::date ELSE NULL END
       WHERE id = $1`,
      [userId, action.streak, todayKey],
    );
  } else if (action.action === "reset") {
    await q("DELETE FROM attempts WHERE user_id = $1 AND ip_address LIKE $2", [
      userId,
      `${DEBUG_ACHIEVEMENT_PREFIX}%`,
    ]);
    await rebuildAchievements(q, userId);
    await rebuildRealStreak(q, userId);
  }
  return getState(q, userId);
}
