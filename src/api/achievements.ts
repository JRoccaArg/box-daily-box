// src/api/achievements.ts
//
// Motor de LOGROS (achievements). Hermano de badges.ts (podio mensual) y
// streak.ts (racha): misma filosofía — lógica aislada, `QueryFn` inyectable,
// idempotente, y SQL único que corre igual contra Postgres (prod) y PGlite (tests).
//
// Diseño (decidido con el usuario):
//  - Los logros se GUARDAN en la misma tabla `badges`, con `badge_type` con
//    prefijo `ach_` y `reference_month = NULL` (no pertenecen a un mes). El podio
//    sigue usando reference_month; dos índices únicos parciales separan ambos
//    mundos (ver db.ts). Así el ranking, los destacados y la galería ya existentes
//    los tratan sin duplicar infraestructura.
//  - El award es IDEMPOTENTE y SOLO-AGREGA (nunca revoca), igual que el podio:
//    `ON CONFLICT DO NOTHING` sobre el índice parcial de logros.
//  - RETROACTIVO: los logros se calculan desde TODO el historial de `attempts`.
//    Un jugador que ya cumplió una condición recibe el badge al primer barrido
//    (ver backfill en db.ts). El mismo motor, con `userId`, corre en cada finish.
//  - Qué victoria CUENTA: `won AND NOT flagged AND duel_id IS NULL` — la misma
//    definición que la racha (streak.ts). Los duelos no cuentan; las partidas
//    flaggeadas tampoco. NO se exige `ranked` (a diferencia del podio): un logro
//    es un mérito PERSONAL, no una posición en el ranking global, así que una
//    victoria real cuenta aunque otra cuenta de la misma IP haya jugado ese día.

/** Ejecutor de queries mínimo, compatible con `pg` (Pool/Client) y con PGlite. */
export type QueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;

/**
 * Juegos diarios que cuentan para los logros de "completitud" (día perfecto /
 * piloto completo). Es la lista del registro de juegos (src/components/games/
 * registry.ts). Se mantiene acá como constante del servidor porque el backend no
 * importa el registro del frontend. ACTUALIZAR al agregar/quitar un juego diario.
 *
 * Nota: `career-path` y `team-radio` no tienen dificultad "leyenda", pero sí
 * cuentan como juegos diarios para día-perfecto y piloto-completo.
 */
export const DAILY_GAME_IDS = [
  "pittexto",
  "polewordle",
  "el-intruso",
  "parrilla-bingo",
  "gp-resultado",
  "top10-standings",
  "career-path",
  "team-radio",
] as const;

// Literal SQL `ARRAY['pittexto', ...]`. Los ids son slugs de nuestro propio
// registro (solo [a-z0-9-]), no entrada de usuario: interpolarlos es seguro.
const DAILY_SQL = `ARRAY[${DAILY_GAME_IDS.map((g) => `'${g}'`).join(", ")}]`;

/** Victoria que cuenta para un logro (misma definición que la racha). */
const WIN_FILTER = "won AND NOT flagged AND duel_id IS NULL";

/** Métrica de la que depende un logro (cómo se mide el progreso). */
export type AchievementMetric =
  | "totalWins" // victorias totales
  | "legendWins" // victorias en dificultad "leyenda"
  | "maxSingleGame" // victorias del juego más jugado
  | "distinctDailyGames" // juegos distintos ganados alguna vez
  | "bestDayDistinct"; // juegos distintos ganados en el mejor día

/**
 * Catálogo de logros. El ORDEN de este array ES la prioridad de exhibición
 * (índice 0 = más difícil/prestigioso = se muestra primero entre los logros,
 * después del podio). No reordenar sin querer: cambia qué badge se muestra
 * cuando el jugador tiene más de las que entran en el ranking.
 */
export const ACHIEVEMENTS = [
  { type: "ach_legend_50", metric: "legendWins", target: 50 },
  { type: "ach_wins_500", metric: "totalWins", target: 500 },
  { type: "ach_legend_10", metric: "legendWins", target: 10 },
  { type: "ach_wins_100", metric: "totalWins", target: 100 },
  { type: "ach_specialist_50", metric: "maxSingleGame", target: 50 },
  { type: "ach_perfect_day", metric: "bestDayDistinct", target: DAILY_GAME_IDS.length },
  { type: "ach_complete", metric: "distinctDailyGames", target: DAILY_GAME_IDS.length },
] as const satisfies ReadonlyArray<{
  type: string;
  metric: AchievementMetric;
  target: number;
}>;

export type AchievementType = (typeof ACHIEVEMENTS)[number]["type"];

/** Prioridad de exhibición (menor = más difícil = va primero). */
export const ACHIEVEMENT_PRIORITY: Record<string, number> = Object.fromEntries(
  ACHIEVEMENTS.map((a, i) => [a.type, i]),
);

export function isAchievementType(v: unknown): v is AchievementType {
  return typeof v === "string" && ACHIEVEMENTS.some((a) => a.type === v);
}

/**
 * SELECT que devuelve los `user_id` que CALIFICAN para una métrica/umbral.
 * `uf` es el filtro opcional de usuario (`" AND user_id = $1"` o `""`).
 * `target` sale del catálogo (número constante): interpolarlo es seguro.
 */
function qualifierSelect(metric: AchievementMetric, target: number, uf: string): string {
  switch (metric) {
    case "totalWins":
      return `SELECT user_id FROM attempts WHERE ${WIN_FILTER}${uf}
              GROUP BY user_id HAVING COUNT(*) >= ${target}`;
    case "legendWins":
      return `SELECT user_id FROM attempts WHERE ${WIN_FILTER} AND difficulty = 'leyenda'${uf}
              GROUP BY user_id HAVING COUNT(*) >= ${target}`;
    case "maxSingleGame":
      return `SELECT user_id FROM (
                SELECT user_id, COUNT(*) AS c FROM attempts WHERE ${WIN_FILTER}${uf}
                GROUP BY user_id, game_id
              ) t WHERE c >= ${target} GROUP BY user_id`;
    case "distinctDailyGames":
      return `SELECT user_id FROM attempts
              WHERE ${WIN_FILTER} AND game_id = ANY(${DAILY_SQL})${uf}
              GROUP BY user_id HAVING COUNT(DISTINCT game_id) >= ${target}`;
    case "bestDayDistinct":
      return `SELECT user_id FROM (
                SELECT user_id, date_key, COUNT(DISTINCT game_id) AS c FROM attempts
                WHERE ${WIN_FILTER} AND game_id = ANY(${DAILY_SQL})${uf}
                GROUP BY user_id, date_key
              ) t WHERE c >= ${target} GROUP BY user_id`;
  }
}

/**
 * Entrega (idempotente, solo-agrega) los logros a quien los merezca.
 *
 *  - `userId` presente  → evalúa SOLO ese usuario (uso en cada finish, block 2).
 *  - `userId` null/omit → evalúa a TODOS los usuarios (backfill retroactivo del
 *    lanzamiento, o una re-corrida manual). Set-based: una query por logro.
 *
 * `ON CONFLICT ... DO NOTHING` sobre el índice parcial de logros hace que dos
 * corridas concurrentes no dupliquen. Devuelve los badges NUEVOS (para poder
 * notificar al usuario en el finish).
 */
export async function awardAchievements(
  q: QueryFn,
  userId: string | null = null,
): Promise<Array<{ userId: string; type: AchievementType }>> {
  const uf = userId ? " AND user_id = $1" : "";
  const params = userId ? [userId] : [];
  const awarded: Array<{ userId: string; type: AchievementType }> = [];

  for (const a of ACHIEVEMENTS) {
    const sel = qualifierSelect(a.metric, a.target, uf);
    const ins = await q(
      `INSERT INTO badges (user_id, badge_type, reference_month)
       SELECT s.uid, '${a.type}', NULL FROM (${sel}) AS s(uid)
       ON CONFLICT (user_id, badge_type) WHERE reference_month IS NULL DO NOTHING
       RETURNING user_id`,
      params,
    );
    for (const r of ins.rows) {
      awarded.push({ userId: (r as { user_id: string }).user_id, type: a.type });
    }
  }
  return awarded;
}

/** Progreso de un logro para la galería "Mis Logros" (block 5). */
export type AchievementProgress = {
  type: AchievementType;
  /** Valor actual del usuario en la métrica, tope al target (para barras). */
  current: number;
  /** Valor crudo sin topear (por si se quiere mostrar "120/100"). */
  rawCurrent: number;
  /** Umbral para desbloquear. */
  target: number;
  /** Porcentaje 0..100 (topeado). */
  percent: number;
  unlocked: boolean;
};

/**
 * Calcula el progreso de TODOS los logros para un usuario, en una sola query.
 * Alimenta la galería de logros (obtenidos + faltantes con % y detalle).
 * El orden del resultado respeta la prioridad del catálogo.
 */
export async function getAchievementProgress(
  q: QueryFn,
  userId: string,
): Promise<AchievementProgress[]> {
  const res = await q(
    `WITH w AS (
       SELECT game_id, date_key, difficulty FROM attempts
       WHERE ${WIN_FILTER} AND user_id = $1
     )
     SELECT
       (SELECT COUNT(*) FROM w)::int AS "totalWins",
       (SELECT COUNT(*) FROM w WHERE difficulty = 'leyenda')::int AS "legendWins",
       (SELECT COALESCE(MAX(c), 0) FROM (
          SELECT COUNT(*) AS c FROM w GROUP BY game_id
        ) x)::int AS "maxSingleGame",
       (SELECT COUNT(DISTINCT game_id) FROM w WHERE game_id = ANY(${DAILY_SQL}))::int AS "distinctDailyGames",
       (SELECT COALESCE(MAX(c), 0) FROM (
          SELECT COUNT(DISTINCT game_id) AS c FROM w
          WHERE game_id = ANY(${DAILY_SQL}) GROUP BY date_key
        ) y)::int AS "bestDayDistinct"`,
    [userId],
  );

  const m = (res.rows[0] ?? {}) as Record<AchievementMetric, number>;
  return ACHIEVEMENTS.map((a) => {
    const raw = Number(m[a.metric] ?? 0);
    const current = Math.min(raw, a.target);
    return {
      type: a.type,
      current,
      rawCurrent: raw,
      target: a.target,
      percent: Math.min(100, Math.round((raw / a.target) * 100)),
      unlocked: raw >= a.target,
    };
  });
}
