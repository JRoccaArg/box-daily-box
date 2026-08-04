// src/api/routes.ts
//
// Endpoints del backend de Box Daily Box.
// Verificación server-authoritative con tokens firmados HMAC.

import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID, createHmac, timingSafeEqual, randomInt } from "crypto";
import { query, transaction } from "./db";
import { verifyChallenge } from "./verify";
import { computeScore } from "../lib/scoring";
import type { Difficulty } from "../types";
import {
  isValidUserId,
  isValidDateKey,
  isValidMonth,
  isValidCountry,
  sanitizeDisplayName,
  isPlausibleToken,
  isPlausibleSolution,
} from "./validate";
import { signIdentityToken, ownsIdentity } from "./identity-token";
import { TOKEN_SECRET, ADMIN_SECRET } from "./secrets";
import {
  awardMonthlyPodium,
  MonthNotClosedError,
  deriveDisplayBadges,
  validateFeaturedSelection,
  previousMonthKey,
  type DisplayBadge,
  type FeaturedSlot,
} from "./badges";
import { resolveNow, isStagingDebugEnabled } from "./debugDate";
import { bumpStreakOnWin, displayStreak, toDateKey } from "./streak";

const SESSION_TTL = 15 * 60 * 1000; // 15 minutos

// Opciones de tiempo disponibles por juego (segundos). El backend las usa para:
// 1. Validar que el timeLimit enviado por el cliente es una opción legítima.
// 2. Calcular el multiplicador de riesgo: maxTimeOption / chosenTimeLimit.
// Juegos con timer fijo tienen una sola opción → multiplicador siempre 1×.
const GAME_TIME_OPTIONS: Record<string, number[]> = {
  "pittexto": [120, 180],
  "polewordle": [90, 120],
  "el-intruso": [45, 60],
  "parrilla-bingo": [150],
  "gp-resultado": [90, 120, 150, 180],
  "top10-standings": [90, 120, 150, 180],
  "career-path": [60, 90],
};

// Tiempo máximo por juego (para fallback de sesiones antiguas sin timeLimit guardado).
const TIME_LIMITS: Record<string, number> = {
  "pittexto": 180,
  "polewordle": 120,
  "el-intruso": 60,
  "parrilla-bingo": 150,
  "gp-resultado": 180,
  "top10-standings": 180,
  "career-path": 90,
};

const VALID_GAMES = ["pittexto", "polewordle", "el-intruso", "parrilla-bingo", "gp-resultado", "top10-standings", "career-path"];
const VALID_DIFFS = ["facil", "medio", "dificil", "leyenda"];

// ─── Token firmado (HMAC-SHA256) ────────────────────────────────────

type SessionPayload = {
  sessionId: string;
  uid: string;
  gameId: string;
  difficulty: Difficulty;
  today: string;
  startedAt: number;
  /**
   * Tiempo elegido por el jugador (segundos). Firmado para que no se pueda
   * inflar. `null` = modo "Sin Tiempo" (puntaje fijo, ver UNTIMED_SCORE en
   * scoring.ts). `undefined` solo puede darse en tokens viejos (pre-deploy)
   * que no tenian este campo — se trata como "con tiempo, usar fallback".
   */
  timeLimit: number | null;
  /** Si el attempt entrará al ranking global (false si otra cuenta de la IP
   *  ya jugó este juego hoy). Firmado en el token: no se puede falsificar. */
  ranked: boolean;
  /** Si la sesión es de un DUELO (Roadmap §4). Firmados para que el cliente no
   *  pueda inyectar un duelId/seed ajeno: se leen del token, no del body. */
  duelId?: string;
  duelSeed?: string;
};

function signToken(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64");
  const sig = createHmac("sha256", TOKEN_SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

function verifyToken(token: string): SessionPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const data = token.substring(0, dot);
  const sig = token.substring(dot + 1);
  const expected = createHmac("sha256", TOKEN_SECRET).update(data).digest("hex");
  // Comparación timing-safe con la primitiva nativa.
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64").toString()) as SessionPayload;
  } catch {
    return null;
  }
}

// ─── POST /challenges/:gameId/start ─────────────────────────────────

export async function startChallenge(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { gameId } = req.params as { gameId: string };
    const { difficulty, userId, displayName, countryCode, clientDateKey, timeLimit: rawTimeLimit, duelId, identityToken } = req.body as {
      difficulty: Difficulty;
      userId?: string;
      displayName?: string;
      countryCode?: string;
      clientDateKey?: string;
      /** number = tiempo elegido; null = modo "Sin Tiempo"; undefined = juego sin cronometro. */
      timeLimit?: number | null;
      duelId?: string;
      identityToken?: string;
    };

    // ─── Rama DUELO (Roadmap §4) ───────────────────────────────────────
    // Si viene duelId, es una partida de duelo: el juego/dificultad/tiempo y
    // la semilla salen de la fila `duels` (no se confía en el cliente), no
    // cuenta al ranking, no bloquea ni es bloqueada por el reto diario.
    if (duelId !== undefined) {
      await startDuelChallenge(req, reply, { gameId, duelId, userId, identityToken });
      return;
    }

    if (!difficulty || !VALID_DIFFS.includes(difficulty)) {
      reply.code(422).send({ error: "Dificultad inválida" });
      return;
    }
    if (!VALID_GAMES.includes(gameId)) {
      reply.code(422).send({ error: "Juego inválido" });
      return;
    }

    // Validar userId: si viene, debe ser UUID o anon-id válido. Si es basura,
    // lo tratamos como ausente (generamos uno nuevo) en vez de confiar en él.
    const safeUserId = isValidUserId(userId) ? userId : null;

    // Validar país (opcional).
    const country = isValidCountry(countryCode) ? countryCode : null;

    // Usar la fecha LOCAL del cliente si es valida (±1 dia de UTC).
    const utcToday = resolveNow(req).toISOString().substring(0, 10);
    let today = utcToday;
    if (isValidDateKey(clientDateKey)) {
      const clientMs = new Date(clientDateKey + "T12:00:00Z").getTime();
      const utcMs = new Date(utcToday + "T12:00:00Z").getTime();
      const diffDays = Math.abs(clientMs - utcMs) / 86_400_000;
      if (diffDays <= 1) {
        today = clientDateKey;
      }
    }
    const uid = safeUserId || `anon-${randomUUID()}`;
    const clientIp = req.ip || "unknown";
    // Solo aplicamos el bloqueo por IP si tenemos una IP real. Si es "unknown"
    // (proxy raro, etc.), no bloqueamos: es preferible permitir a bloquear
    // falsamente a muchos usuarios legítimos que caerían todos en "unknown".
    const ipUsable = clientIp !== "unknown" && clientIp.length > 0;

    // ─── ANTI MULTI-DISPOSITIVO ───
    // 1. Verificar que ESTE usuario no jugó ya hoy el RETO DIARIO.
    // Los intentos de duelo (duel_id no nulo) NO cuentan: un duelo no bloquea
    // el reto oficial del mismo juego/día.
    const existing = await query(
      "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3 AND duel_id IS NULL",
      [uid, gameId, today],
    );
    if (existing.rows.length > 0) {
      reply.code(409).send({ error: "Ya jugaste este reto hoy" });
      return;
    }

    // Regla de ranking por IP: se permite JUGAR siempre (para jugar con
    // amigos desde la misma red), pero en el ranking global solo cuenta la
    // PRIMERA cuenta que jugó CADA juego ese día desde esa IP.
    //
    // Calculamos si este attempt será rankeable: lo es si NINGUNA otra cuenta
    // jugó (o está jugando) ESTE juego hoy desde esta IP. El resultado se
    // guarda igual; solo cambia si entra al ranking.
    let ranked = true;
    if (ipUsable) {
      // ¿Otra cuenta ya tiene un attempt de ESTE juego hoy desde esta IP?
      const ipAttempt = await query(
        `SELECT 1 FROM attempts
         WHERE ip_address = $1 AND game_id = $2 AND date_key = $3::date
         AND user_id != $4 AND ranked
         LIMIT 1`,
        [clientIp, gameId, today, uid],
      );
      // ¿Otra cuenta tiene una sesión activa (empezó pero no terminó) de ESTE
      // juego hoy desde esta IP? (para evitar que dos empiecen a la vez y
      // ambos crean que rankean).
      const ipSession = await query(
        `SELECT 1 FROM sessions
         WHERE ip_address = $1 AND game_id = $2 AND date_key = $3::date
         AND user_id != $4 AND NOT consumed AND expires_at > $5
         LIMIT 1`,
        [clientIp, gameId, today, uid, Date.now()],
      );
      if (ipAttempt.rows.length > 0 || ipSession.rows.length > 0) {
        ranked = false;
      }
    }

    // Upsert usuario (nombre sanitizado, país ya validado arriba).
    // Si el display_name colisiona con el índice único (otro usuario ya lo
    // tiene), reintentamos sin tocarlo para no bloquear el juego. El usuario
    // conservará su nombre local anterior y podrá elegir uno único después
    // desde el modal de perfil.
    const name = sanitizeDisplayName(displayName);
    try {
      await query(
        `INSERT INTO users (id, display_name, country_code)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET
           display_name = COALESCE(NULLIF($2, ''), users.display_name),
           country_code = COALESCE($3, users.country_code)`,
        [uid, name, country],
      );
    } catch (err: any) {
      if (err.code === "23505" && String(err.constraint || "").includes("display_name")) {
        await query(
          `INSERT INTO users (id, country_code)
           VALUES ($1, $2)
           ON CONFLICT (id) DO UPDATE SET
             country_code = COALESCE($2, users.country_code)`,
          [uid, country],
        );
      } else {
        throw err;
      }
    }

    // Validar timeLimit: debe ser una opción reconocida para el juego, o
    // `null` explícito (modo "Sin Tiempo", válido para cualquier juego).
    const validOptions = GAME_TIME_OPTIONS[gameId] ?? [];
    const timeLimit: number | null =
      rawTimeLimit === null
        ? null
        : validOptions.includes(rawTimeLimit as number)
          ? (rawTimeLimit as number)
          : (validOptions.length > 0 ? Math.max(...validOptions) : TIME_LIMITS[gameId] ?? 180);

    // Crear sesión firmada (con IP)
    const startedAt = Date.now();
    const expiresAt = startedAt + SESSION_TTL;
    const sessionId = randomUUID();

    const payload: SessionPayload = {
      sessionId, uid, gameId, difficulty, today, startedAt, timeLimit, ranked,
    };
    const sessionToken = signToken(payload);

    await query(
      `INSERT INTO sessions (id, user_id, game_id, difficulty, date_key, started_at, expires_at, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [sessionId, uid, gameId, difficulty, today, startedAt, expiresAt, clientIp],
    );

    reply.code(200).send({
      puzzle: { gameId, difficulty, dateKey: today },
      sessionToken,
      serverNow: startedAt,
      // Emitir identityToken: al jugar, el usuario "reclama" su userId.
      // El frontend lo guarda para poder editar su perfil después.
      identityToken: signIdentityToken(uid),
    });
  } catch (err) {
    console.error("startChallenge error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── POST /challenges/:gameId/finish ────────────────────────────────

export async function finishChallenge(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { gameId } = req.params as { gameId: string };
    const { sessionToken, solution } = req.body as {
      sessionToken: string;
      solution?: Record<string, unknown> | null;
    };

    if (!isPlausibleToken(sessionToken)) {
      reply.code(422).send({ error: "sessionToken inválido" });
      return;
    }
    // solution puede venir null/ausente: significa abandono o timeout
    // (el usuario perdió sin enviar respuesta). En ese caso NO verificamos:
    // el resultado es directamente "perdido" con 0 puntos. Si viene solution,
    // debe ser plausible.
    const isAbandon = solution === null || solution === undefined;
    if (!isAbandon && !isPlausibleSolution(solution)) {
      reply.code(422).send({ error: "solution inválida" });
      return;
    }

    // Verificar firma HMAC del token
    const session = verifyToken(sessionToken);
    if (!session) {
      reply.code(403).send({ error: "Token inválido o manipulado" });
      return;
    }

    if (session.gameId !== gameId) {
      reply.code(403).send({ error: "Token no corresponde a este juego" });
      return;
    }

    // Expiración
    const now = Date.now();
    if (session.startedAt + SESSION_TTL < now) {
      reply.code(410).send({ error: "Sesión expirada (15 min)" });
      return;
    }

    // Sesión no consumida
    const sessionRow = await query(
      "SELECT consumed FROM sessions WHERE id = $1 AND user_id = $2 AND game_id = $3",
      [session.sessionId, session.uid, gameId],
    );
    if (sessionRow.rows.length === 0) {
      reply.code(403).send({ error: "Sesión no encontrada" });
      return;
    }
    if (sessionRow.rows[0]?.consumed) {
      reply.code(409).send({ error: "Sesión ya consumida" });
      return;
    }

    // ─── Rama DUELO (Roadmap §4) ───────────────────────────────────────
    if (session.duelId) {
      await finishDuelChallenge(req, reply, { session, solution, isAbandon });
      return;
    }

    // ─── VERIFICACIÓN REAL ───
    // Si es abandono/timeout (sin solution), el resultado es perdido sin verificar.
    // Si hay solution, se verifica normalmente server-side.
    const verifyResult = isAbandon
      ? { won: false, detail: "Abandono o tiempo agotado" }
      : verifyChallenge(
          gameId,
          session.difficulty,
          session.today,
          solution as any,
        );

    const timeSeconds = Math.round((now - session.startedAt) / 1000);
    // Sin tiempo mínimo: si la verificación server dice que es correcto, es válido.
    const flagged = false;

    // `null` explícito = modo "Sin Tiempo" (puntaje fijo). `undefined` solo
    // puede darse en tokens viejos (pre-deploy) sin este campo: se trata como
    // "con tiempo", con fallback al máximo del juego.
    const untimed = session.timeLimit === null;
    const sessionTimeLimit =
      session.timeLimit === undefined || session.timeLimit === null
        ? TIME_LIMITS[gameId] ?? 180
        : session.timeLimit;
    const gameOptions = GAME_TIME_OPTIONS[gameId] ?? [];
    const maxTimeOption = gameOptions.length > 0 ? Math.max(...gameOptions) : sessionTimeLimit;
    const points = computeScore({
      won: verifyResult.won,
      difficulty: session.difficulty,
      timeSeconds,
      timeLimit: sessionTimeLimit,
      maxTimeOption,
      untimed,
    });

    const uid = session.uid;
    const clientIp = req.ip || "unknown";

    // Guardar attempt (con IP para anti multi-dispositivo)
    let duplicated = false;
    try {
      await transaction(async (client) => {
        await client.query(
          "UPDATE sessions SET consumed = true WHERE id = $1",
          [session.sessionId],
        );
        await client.query(
          `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ranked, ip_address)
           VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8, $9, $10)`,
          [uid, gameId, session.today, session.difficulty, verifyResult.won, timeSeconds, points, flagged, session.ranked, clientIp],
        );
        // Racha diaria (Roadmap #3): solo al GANAR un reto diario y no-flaggeado.
        // Dentro de la MISMA transacción: si el INSERT choca por duplicado y hace
        // ROLLBACK, la racha no se bumpea (no cuenta doble un re-submit).
        if (verifyResult.won && !flagged) {
          await bumpStreakOnWin(
            (sql, params) => client.query(sql, params),
            uid,
            session.today,
          );
        }
      });
    } catch (err: any) {
      if (err.code === "23505") {
        // Ya existe un attempt para este user/game/día (doble submit o race).
        // No re-sumamos; devolvemos el resultado del attempt ya guardado.
        duplicated = true;
      } else {
        throw err;
      }
    }

    // Si fue duplicado, leer el attempt original para devolver datos coherentes.
    let finalWon = flagged ? false : verifyResult.won;
    let finalPoints = flagged ? 0 : points;
    if (duplicated) {
      // `AND duel_id IS NULL`: esta rama es la del RETO DIARIO. Si el usuario
      // además jugó un duelo del mismo juego hoy, sin el filtro habría dos
      // filas para (user, game, fecha) y `rows[0]` podía traer la del duelo,
      // devolviéndole al jugador el resultado equivocado.
      const prev = await query(
        `SELECT won, points FROM attempts
         WHERE user_id = $1 AND game_id = $2 AND date_key = $3 AND duel_id IS NULL`,
        [uid, gameId, session.today],
      );
      if (prev.rows.length > 0) {
        finalWon = Boolean(prev.rows[0]?.won);
        finalPoints = Number(prev.rows[0]?.points ?? 0);
      }
    }

    // Puntos del mes + posición en ranking, en una sola query.
    // Rango [primer día del mes, primer día del mes siguiente) para usar índice.
    const monthStart = session.today.substring(0, 7) + "-01";
    const statsResult = await query(
      `WITH user_scores AS (
         SELECT user_id, SUM(points) as score
         FROM attempts
         WHERE won AND NOT flagged AND ranked
         AND date_key >= $1::date
         AND date_key < ($1::date + INTERVAL '1 month')
         GROUP BY user_id
       ),
       me AS (
         SELECT COALESCE(MAX(score), 0) as my_score
         FROM user_scores WHERE user_id = $2
       )
       SELECT
         (SELECT my_score FROM me) as total_month,
         (SELECT COUNT(*) FROM user_scores, me WHERE score > my_score) as ahead`,
      [monthStart, uid],
    );
    const totalMonth = Number(statsResult.rows[0]?.total_month ?? 0);
    const rank = Number(statsResult.rows[0]?.ahead ?? 0) + 1;

    reply.code(200).send({
      won: finalWon,
      points: finalPoints,
      timeSeconds,
      totalMonth,
      rank,
      flagged,
      duplicated,
      // Si el attempt entró al ranking. false cuando otra cuenta de la misma
      // IP ya jugó este juego hoy: el usuario jugó y ve su resultado, pero no
      // cuenta para el ranking global.
      ranked: session.ranked,
    });
  } catch (err) {
    console.error("finishChallenge error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── Badges inline en el ranking ────────────────────────────────────

/**
 * Dado un conjunto de entradas de ranking (con su rol y su selección de
 * destacados), calcula los `displayBadges` de cada una en UNA sola query batch
 * de badges (evita N+1). admin/superadmin se derivan del rol; el resto de la
 * lógica vive en `deriveDisplayBadges`.
 */
async function computeDisplayBadgesForRanking(
  entries: Array<{ userId: string; role: string; featured: FeaturedSlot[] | null }>,
): Promise<Map<string, DisplayBadge[]>> {
  const map = new Map<string, DisplayBadge[]>();
  if (entries.length === 0) return map;

  const userIds = entries.map((e) => e.userId);
  const res = await query(
    `SELECT user_id, badge_type, COUNT(*)::int AS c,
            array_agg(reference_month::text ORDER BY reference_month DESC) AS months
       FROM badges
      WHERE user_id = ANY($1::text[])
      GROUP BY user_id, badge_type`,
    [userIds] as any,
  );

  const counts = new Map<string, Record<string, number>>();
  const monthsByUser = new Map<string, Record<string, string[]>>();
  for (const r of res.rows as Array<{
    user_id: string;
    badge_type: string;
    c: number;
    months: string[];
  }>) {
    const rec = counts.get(r.user_id) ?? {};
    rec[r.badge_type] = Number(r.c);
    counts.set(r.user_id, rec);

    const monthsRec = monthsByUser.get(r.user_id) ?? {};
    // reference_month es DATE ('YYYY-MM-01T...'); nos quedamos con 'YYYY-MM'.
    monthsRec[r.badge_type] = r.months.map((m) => m.substring(0, 7));
    monthsByUser.set(r.user_id, monthsRec);
  }

  for (const e of entries) {
    map.set(
      e.userId,
      deriveDisplayBadges(
        counts.get(e.userId) ?? {},
        e.role,
        e.featured,
        monthsByUser.get(e.userId) ?? {},
      ),
    );
  }
  return map;
}

// ─── GET /ranking/monthly ───────────────────────────────────────────

export async function getRankingMonthly(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { month, country } = req.query as { month?: string; country?: string };
    // Validar month: si es basura, usar mes actual.
    const target = isValidMonth(month)
      ? `${month}-01`
      : resolveNow(req).toISOString().substring(0, 7) + "-01";

    const countryFilter = isValidCountry(country) ? country : null;

    // Rango del mes [primer día, primer día del mes siguiente).
    // Usar rango en vez de date_trunc(columna) permite aprovechar el índice.
    const monthStart = target; // YYYY-MM-01
    const params: (string | null)[] = [monthStart];
    let countryClause = "";
    if (countryFilter) {
      params.push(countryFilter);
      countryClause = `AND u.country_code = $${params.length}`;
    }

    const topResult = await query(
      `SELECT u.id, u.display_name, u.country_code, u.role, u.featured_badges,
              u.current_streak, u.last_win_date,
              SUM(a.points) as points,
              COUNT(*) FILTER (WHERE a.won) as games_won,
              COUNT(DISTINCT a.date_key) as days_played
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       WHERE NOT a.flagged AND a.ranked
       AND a.date_key >= $1::date
       AND a.date_key < ($1::date + INTERVAL '1 month')
       ${countryClause}
       GROUP BY u.id, u.display_name, u.country_code, u.role, u.featured_badges,
                u.current_streak, u.last_win_date
       ORDER BY points DESC, u.id ASC
       LIMIT 50`,
      params,
    );

    const todayKey = resolveNow(req).toISOString().slice(0, 10);
    const rawTop = topResult.rows.map((row: any, idx: number) => ({
      rank: idx + 1,
      userId: row.id as string,
      displayName: row.display_name as string,
      countryCode: (row.country_code as string) || null,
      points: Number(row.points ?? 0),
      gamesWon: Number(row.games_won ?? 0),
      daysPlayed: Number(row.days_played ?? 0),
      role: (row.role as string) || "user",
      featured: (row.featured_badges as FeaturedSlot[] | null) ?? null,
      currentStreak: displayStreak(
        Number(row.current_streak ?? 0),
        toDateKey(row.last_win_date),
        todayKey,
      ),
    }));

    const badgeMap = await computeDisplayBadgesForRanking(rawTop);
    const top = rawTop.map((e) => ({
      rank: e.rank,
      userId: e.userId,
      displayName: e.displayName,
      countryCode: e.countryCode,
      points: e.points,
      gamesWon: e.gamesWon,
      daysPlayed: e.daysPlayed,
      currentStreak: e.currentStreak,
      displayBadges: badgeMap.get(e.userId) ?? [],
    }));

    reply.code(200).send({ month: target.substring(0, 7), top });
  } catch (err) {
    console.error("getRankingMonthly error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── GET /ranking/daily ─────────────────────────────────────────────

export async function getRankingDaily(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { date, country } = req.query as { date?: string; country?: string };
    const target = isValidDateKey(date)
      ? date
      : resolveNow(req).toISOString().substring(0, 10);
    const countryFilter = isValidCountry(country) ? country : null;

    const topResult = await query(
      `SELECT u.id, u.display_name, u.country_code, u.role, u.featured_badges,
              u.current_streak, u.last_win_date,
              SUM(a.points) as points,
              COUNT(*) FILTER (WHERE a.won) as games_won
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       WHERE NOT a.flagged AND a.ranked
       AND a.date_key = $1::date
       ${countryFilter ? "AND u.country_code = $2" : ""}
       GROUP BY u.id, u.display_name, u.country_code, u.role, u.featured_badges,
                u.current_streak, u.last_win_date
       ORDER BY points DESC, u.id ASC
       LIMIT 50`,
      countryFilter ? [target, countryFilter] : [target],
    );

    const todayKey = resolveNow(req).toISOString().slice(0, 10);
    const rawTop = topResult.rows.map((row: any, idx: number) => ({
      rank: idx + 1,
      userId: row.id as string,
      displayName: row.display_name as string,
      countryCode: (row.country_code as string) || null,
      points: Number(row.points ?? 0),
      gamesWon: Number(row.games_won ?? 0),
      daysPlayed: 1,
      role: (row.role as string) || "user",
      featured: (row.featured_badges as FeaturedSlot[] | null) ?? null,
      currentStreak: displayStreak(
        Number(row.current_streak ?? 0),
        toDateKey(row.last_win_date),
        todayKey,
      ),
    }));

    const badgeMap = await computeDisplayBadgesForRanking(rawTop);
    const top = rawTop.map((e) => ({
      rank: e.rank,
      userId: e.userId,
      displayName: e.displayName,
      countryCode: e.countryCode,
      points: e.points,
      gamesWon: e.gamesWon,
      daysPlayed: e.daysPlayed,
      currentStreak: e.currentStreak,
      displayBadges: badgeMap.get(e.userId) ?? [],
    }));

    reply.code(200).send({ date: target, top });
  } catch (err) {
    console.error("getRankingDaily error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── GET /admin/debug ───────────────────────────────────────────────

export async function adminDebug(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    // El secreto va en un HEADER, no en la query string: así no queda
    // registrado en logs de acceso, historial del navegador ni referers.
    // Se acepta query.secret como fallback por compatibilidad, pero el header
    // es lo recomendado.
    const headerSecret = req.headers["x-admin-secret"];
    const { secret: querySecret } = req.query as { secret?: string };
    const provided = typeof headerSecret === "string" ? headerSecret : (querySecret ?? "");

    // Comparación timing-safe para evitar timing attacks sobre el secreto.
    const a = Buffer.from(String(provided));
    const b = Buffer.from(ADMIN_SECRET);
    const ok = a.length === b.length && timingSafeEqual(a, b);
    if (!ok) {
      reply.code(403).send({ error: "Acceso denegado" });
      return;
    }

    const usersCount = await query("SELECT COUNT(*) as count FROM users");
    const attemptsCount = await query("SELECT COUNT(*) as count FROM attempts");
    const sessionsCount = await query("SELECT COUNT(*) as count FROM sessions");
    const flaggedCount = await query("SELECT COUNT(*) as count FROM attempts WHERE flagged");

    const recentAttempts = await query(
      `SELECT a.user_id, a.game_id, a.date_key, a.difficulty, a.won,
              a.time_seconds, a.points, a.flagged, a.ip_address, a.created_at,
              u.display_name, u.country_code
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 20`,
    );

    const activeSessions = await query(
      `SELECT user_id, game_id, difficulty, date_key, started_at, consumed
       FROM sessions
       WHERE NOT consumed AND expires_at > $1
       ORDER BY started_at DESC
       LIMIT 10`,
      [Date.now()],
    );

    const monthlyRanking = await query(
      `SELECT u.id, u.display_name, u.country_code, SUM(a.points) as points, COUNT(a.id) as games
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       WHERE a.won AND NOT a.flagged
       AND a.date_key >= date_trunc('month', CURRENT_DATE)::date
       AND a.date_key < (date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month')
       GROUP BY u.id, u.display_name, u.country_code
       ORDER BY points DESC
       LIMIT 10`,
    );

    // IPs sospechosas: misma IP con >1 usuario distinto hoy.
    const suspiciousIps = await query(
      `SELECT ip_address,
              COUNT(DISTINCT user_id) as user_count,
              array_agg(DISTINCT user_id) as user_ids
       FROM attempts
       WHERE date_key = CURRENT_DATE AND ip_address IS NOT NULL
       GROUP BY ip_address
       HAVING COUNT(DISTINCT user_id) > 1
       ORDER BY user_count DESC
       LIMIT 20`,
    );

    reply.code(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
      stats: {
        users: Number(usersCount.rows[0]?.count ?? 0),
        attempts: Number(attemptsCount.rows[0]?.count ?? 0),
        sessions: Number(sessionsCount.rows[0]?.count ?? 0),
        flagged: Number(flaggedCount.rows[0]?.count ?? 0),
      },
      recentAttempts: recentAttempts.rows,
      activeSessions: activeSessions.rows,
      monthlyRanking: monthlyRanking.rows,
      suspiciousIps: suspiciousIps.rows,
    });
  } catch (err) {
    console.error("adminDebug error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── POST /admin/badges/close-month ─────────────────────────────────

/**
 * Cierra un mes y entrega los badges de podio (oro/plata/bronce) al top 3.
 * Idempotente y solo-agrega (nunca revoca). Autorización: mismo secreto admin
 * en header que /admin/debug (server-to-server / curl, no desde el navegador).
 * Body: { month: 'YYYY-MM' }.
 */
export async function adminCloseMonth(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const headerSecret = req.headers["x-admin-secret"];
    const provided = typeof headerSecret === "string" ? headerSecret : "";
    // Comparación timing-safe (igual que adminDebug).
    const a = Buffer.from(String(provided));
    const b = Buffer.from(ADMIN_SECRET);
    const ok = a.length === b.length && timingSafeEqual(a, b);
    if (!ok) {
      reply.code(403).send({ error: "Acceso denegado" });
      return;
    }

    const { month } = (req.body ?? {}) as { month?: string };
    if (!isValidMonth(month)) {
      reply.code(422).send({ error: "month inválido (formato YYYY-MM)" });
      return;
    }

    // Transacción: el cálculo del podio + los inserts idempotentes van atómicos.
    const result = await transaction(async (client) =>
      awardMonthlyPodium((sql, params) => client.query(sql, params), month, resolveNow(req)),
    );

    reply.code(200).send({
      month: result.month,
      monthStart: result.monthStart,
      awardedCount: result.awarded.length,
      awarded: result.awarded,
    });
  } catch (err) {
    if (err instanceof MonthNotClosedError) {
      reply.code(422).send({ error: "El mes no está cerrado todavía" });
      return;
    }
    console.error("adminCloseMonth error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── POST /admin/seed-badges (SOLO STAGING) ─────────────────────────

/**
 * Puebla la DB con los escenarios de prueba de scripts/seed-badges.ts desde
 * la UI de debug (botón flotante, Etapa Roadmap #1). Gateado ÚNICAMENTE por
 * STAGING_DEBUG (variable que solo existe en el servicio Railway de staging,
 * nunca en producción — son servicios completamente separados). A propósito
 * NO exige ADMIN_SECRET: ese secreto no debe viajar al bundle del frontend,
 * y este endpoint ya es inalcanzable en producción por el gate de env var.
 * Body: { reset?: boolean }.
 */
export async function adminSeedBadges(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!isStagingDebugEnabled()) {
    reply.code(404).send({ error: "No encontrado" });
    return;
  }
  try {
    const { reset } = (req.body ?? {}) as { reset?: boolean };
    const { cleanupSeedData, seed } = await import("../../scripts/seed-badges");
    await cleanupSeedData();
    if (!reset) {
      await seed(resolveNow(req));
    }
    reply.code(200).send({ ok: true, reset: Boolean(reset) });
  } catch (err) {
    console.error("adminSeedBadges error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** 'YYYY-MM-01' de `now` menos `n` meses (UTC). */
function monthsAgoStartUtc(n: number, now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

// ─── POST /admin/grant-badges (SOLO STAGING) ────────────────────────

/**
 * Otorga un set fijo de badges (3 oros + 1 plata + 1 bronce, en 5 meses YA
 * cerrados y bien alejados de cualquier escenario de scripts/seed-badges.ts
 * para que nunca colisionen) a la cuenta real del que está probando en
 * staging — así puede abrir "Mi Progreso" y probar la galería/selector con
 * sus propios badges, sin depender de los usuarios ficticios del seed.
 * Inserta las filas DIRECTO en `badges` (no juega attempts ni recalcula
 * ranking): no afecta el ranking de ningún mes, solo la colección propia
 * del usuario. Gateado únicamente por STAGING_DEBUG (mismo razonamiento que
 * adminSeedBadges: no debe requerir ADMIN_SECRET en el frontend).
 * Body: { userId: string }.
 */
export async function adminGrantBadges(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!isStagingDebugEnabled()) {
    reply.code(404).send({ error: "No encontrado" });
    return;
  }
  try {
    const { userId } = (req.body ?? {}) as { userId?: string };
    if (!userId || !isValidUserId(userId)) {
      reply.code(422).send({ error: "userId inválido" });
      return;
    }

    // Asegura que exista la fila (si el usuario ya existe, no la toca).
    await query(
      `INSERT INTO users (id, display_name, country_code)
       VALUES ($1, 'Debug Tester', 'ARG')
       ON CONFLICT (id) DO NOTHING`,
      [userId],
    );

    const now = resolveNow(req);
    const grants: Array<{ type: "monthly_gold" | "monthly_silver" | "monthly_bronze"; monthsAgo: number }> = [
      { type: "monthly_gold", monthsAgo: 20 },
      { type: "monthly_gold", monthsAgo: 21 },
      { type: "monthly_gold", monthsAgo: 22 },
      { type: "monthly_silver", monthsAgo: 23 },
      { type: "monthly_bronze", monthsAgo: 24 },
    ];
    let inserted = 0;
    for (const g of grants) {
      const monthStart = monthsAgoStartUtc(g.monthsAgo, now);
      const res = await query(
        `INSERT INTO badges (user_id, badge_type, reference_month)
         VALUES ($1, $2, $3::date)
         ON CONFLICT (user_id, badge_type, reference_month) DO NOTHING
         RETURNING id`,
        [userId, g.type, monthStart],
      );
      inserted += res.rows.length;
    }

    reply.code(200).send({ ok: true, userId, grantedCount: inserted });
  } catch (err) {
    console.error("adminGrantBadges error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── POST /admin/close-debug-month (SOLO STAGING) ───────────────────

/**
 * Cierra el mes ANTERIOR al que estás simulando con el date picker del panel
 * de debug. Existe porque el cierre automático de producción
 * (`closePreviousMonthBadges` en index.ts) usa A PROPÓSITO el reloj real del
 * server, nunca el override — así que simular "estar en septiembre" con el
 * panel no le avisa nada al cron real, y agosto nunca se cierra solo.
 *
 * Reusa la MISMA `awardMonthlyPodium` (mismo camino que el cierre real y que
 * `/admin/badges/close-month`), solo que el mes a cerrar y el "ahora" para
 * validar que esté cerrado salen del header `X-Debug-Date` en vez de un
 * body explícito. Gateado únicamente por STAGING_DEBUG (mismo razonamiento
 * que adminSeedBadges/adminGrantBadges: sin ADMIN_SECRET, para no exponerlo
 * en el bundle del frontend).
 */
export async function adminCloseDebugMonth(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!isStagingDebugEnabled()) {
    reply.code(404).send({ error: "No encontrado" });
    return;
  }
  try {
    const now = resolveNow(req);
    const month = previousMonthKey(now);
    const result = await transaction(async (client) =>
      awardMonthlyPodium((sql, params) => client.query(sql, params), month, now),
    );
    reply.code(200).send({
      month: result.month,
      awardedCount: result.awarded.length,
      awarded: result.awarded,
    });
  } catch (err) {
    if (err instanceof MonthNotClosedError) {
      reply.code(422).send({ error: "El mes no está cerrado todavía" });
      return;
    }
    console.error("adminCloseDebugMonth error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── POST /admin/seed-duels (SOLO STAGING) ──────────────────────────

/**
 * Puebla la DB con los escenarios de prueba de scripts/seed-duels.ts (amigos +
 * duelos DIRIGIDOS a la propia cuenta del que prueba en staging), desde el
 * botón del panel de debug (Roadmap §4, Etapa 2). Mismo gate y razonamiento
 * que adminSeedBadges/adminGrantBadges: solo STAGING_DEBUG, sin ADMIN_SECRET.
 * Body: { userId: string, reset?: boolean }.
 */
export async function adminSeedDuels(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!isStagingDebugEnabled()) {
    reply.code(404).send({ error: "No encontrado" });
    return;
  }
  try {
    const { userId, reset } = (req.body ?? {}) as { userId?: string; reset?: boolean };
    const { cleanupSeedData, seed } = await import("../../scripts/seed-duels");
    await cleanupSeedData();
    if (!reset) {
      if (!userId || !isValidUserId(userId)) {
        reply.code(422).send({ error: "userId inválido" });
        return;
      }
      await seed(userId, resolveNow(req));
    }
    reply.code(200).send({ ok: true, reset: Boolean(reset) });
  } catch (err) {
    console.error("adminSeedDuels error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── Badges del usuario ──────────────────────────────────────────────

/** Formatea una columna DATE (o string) a 'YYYY-MM' en hora local. */
function toMonthStr(d: unknown): string | null {
  if (d instanceof Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  if (typeof d === "string") return d.substring(0, 7);
  return null;
}

/**
 * GET /user/:userId/badges
 *
 * Colección completa de badges de un usuario (público: los badges se muestran
 * públicamente en el ranking). Incluye rol, conteos por tipo y la selección de
 * destacados actual. Usado por la galería del frontend (Etapa 3).
 */
export async function getUserBadges(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { userId } = req.params as { userId?: string };
    if (!userId || !isValidUserId(userId)) {
      reply.code(422).send({ error: "userId inválido" });
      return;
    }

    const userRow = await query(
      "SELECT role, featured_badges FROM users WHERE id = $1",
      [userId],
    );
    if (userRow.rows.length === 0) {
      reply.code(404).send({ error: "Usuario no encontrado" });
      return;
    }

    const badgesRes = await query(
      `SELECT id, badge_type, reference_month, awarded_at
         FROM badges WHERE user_id = $1
        ORDER BY badge_type ASC, reference_month DESC`,
      [userId],
    );

    const counts: Record<string, number> = {};
    const owned = badgesRes.rows.map((b: any) => {
      counts[b.badge_type] = (counts[b.badge_type] ?? 0) + 1;
      return {
        id: Number(b.id),
        type: b.badge_type as string,
        referenceMonth: toMonthStr(b.reference_month),
        awardedAt: b.awarded_at,
      };
    });

    reply.code(200).send({
      userId,
      role: (userRow.rows[0].role as string) || "user",
      owned,
      counts,
      featured: (userRow.rows[0].featured_badges as FeaturedSlot[] | null) ?? null,
    });
  } catch (err) {
    console.error("getUserBadges error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/**
 * POST /user/:userId/badges/featured
 *
 * Setea la selección de badges destacados que se muestran inline en el ranking.
 * Autorización anti-IDOR: exige identityToken del propio usuario (ownsIdentity).
 * Body: { featured: FeaturedSlot[], identityToken: string }.
 */
export async function setFeaturedBadges(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { userId } = req.params as { userId?: string };
    if (!userId || !isValidUserId(userId)) {
      reply.code(422).send({ error: "userId inválido" });
      return;
    }

    const { featured, identityToken } = req.body as {
      featured?: unknown;
      identityToken?: string;
    };

    if (!ownsIdentity(identityToken, userId)) {
      reply.code(403).send({ error: "No autorizado para modificar este perfil" });
      return;
    }

    // El usuario debe existir.
    const exists = await query("SELECT 1 FROM users WHERE id = $1", [userId]);
    if (exists.rows.length === 0) {
      reply.code(404).send({ error: "Usuario no encontrado" });
      return;
    }

    // Conteo de badges realmente poseídos, para validar la selección (anti-inflado).
    const owned = await query(
      "SELECT badge_type, COUNT(*)::int AS c FROM badges WHERE user_id = $1 GROUP BY badge_type",
      [userId],
    );
    const counts: Record<string, number> = {};
    for (const r of owned.rows as Array<{ badge_type: string; c: number }>) {
      counts[r.badge_type] = Number(r.c);
    }

    const validated = validateFeaturedSelection(featured, counts);
    if (!validated.ok) {
      reply.code(422).send({ error: validated.error });
      return;
    }

    await query(
      "UPDATE users SET featured_badges = $1::jsonb WHERE id = $2",
      [JSON.stringify(validated.value), userId],
    );

    reply.code(200).send({ userId, featured: validated.value });
  } catch (err) {
    console.error("setFeaturedBadges error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ═══════════════════════════════════════════════════════════════════
// ─── Perfil del usuario ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /user/:userId
 *
 * Devuelve el perfil del usuario incluyendo si puede cambiar el nombre
 * (1 cambio por mes calendario, no acumulables).
 */
export async function getUserProfile(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { userId } = req.params as { userId?: string };
    if (!userId || !isValidUserId(userId)) {
      reply.code(422).send({ error: "userId inválido" });
      return;
    }

    const rows = await query(
      "SELECT id, display_name, country_code, name_changed_at FROM users WHERE id = $1",
      [userId],
    );

    if (rows.rows.length === 0) {
      reply.code(404).send({ error: "Usuario no encontrado" });
      return;
    }

    const user = rows.rows[0];
    const canChangeName = canChangeNameThisMonth(user.name_changed_at);

    reply.code(200).send({
      userId: user.id,
      displayName: user.display_name,
      countryCode: user.country_code,
      canChangeName,
      nameChangedAt: user.name_changed_at,
    });
  } catch (err) {
    console.error("getUserProfile error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/**
 * POST /user/:userId/profile
 *
 * Actualiza display_name y/o country_code.
 * Regla: display_name solo puede cambiarse 1 vez por mes calendario.
 *        country_code, una vez fijado, no cambia (siempre viene por IP inicialmente).
 *
 * Body: { displayName?: string, countryCode?: string }
 */
export async function updateUserProfile(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { userId } = req.params as { userId?: string };
    if (!userId || !isValidUserId(userId)) {
      reply.code(422).send({ error: "userId inválido" });
      return;
    }

    const { displayName, countryCode, identityToken } = req.body as {
      displayName?: string;
      countryCode?: string;
      identityToken?: string;
    };

    // Traer usuario actual
    const existing = await query(
      "SELECT display_name, country_code, name_changed_at FROM users WHERE id = $1",
      [userId],
    );

    const isNewUser = existing.rows.length === 0;

    // ─── AUTORIZACIÓN ───
    // Un usuario EXISTENTE solo puede ser modificado por quien posee su
    // identityToken (emitido por el server). Esto impide que un atacante
    // modifique el perfil de otro usuario enviando su userId.
    // Un usuario NUEVO se puede crear libremente (no hay nada que proteger
    // todavía); se le emite un token al final.
    if (!isNewUser) {
      if (!ownsIdentity(identityToken, userId)) {
        reply.code(403).send({
          error: "No autorizado para modificar este perfil",
        });
        return;
      }
    }

    const currentDisplayName = existing.rows[0]?.display_name as string | null | undefined;
    const currentCountry = existing.rows[0]?.country_code as string | null | undefined;
    const nameChangedAt = existing.rows[0]?.name_changed_at as Date | null | undefined;

    // Validar displayName si viene
    let sanitizedName: string | null = null;
    if (typeof displayName === "string") {
      sanitizedName = sanitizeDisplayName(displayName);
      if (sanitizedName.length === 0) {
        reply.code(422).send({ error: "Nombre inválido" });
        return;
      }

      // Si el usuario ya existe y ya tiene nombre, verificar regla mensual
      if (!isNewUser && currentDisplayName && sanitizedName !== currentDisplayName) {
        if (!canChangeNameThisMonth(nameChangedAt ?? null)) {
          reply.code(403).send({
            error: "Ya cambiaste tu nombre este mes. Podrás cambiarlo el mes que viene.",
          });
          return;
        }
      }
    }

    // Validar countryCode si viene
    let validCountry: string | null = null;
    if (typeof countryCode === "string") {
      const up = countryCode.toUpperCase();
      if (!isValidCountry(up)) {
        reply.code(422).send({ error: "País inválido" });
        return;
      }
      // Country es fijo una vez set: si ya existe uno diferente, ignorar el nuevo.
      if (currentCountry && currentCountry !== up) {
        // Silenciosamente mantener el actual (no error, no cambio).
        validCountry = currentCountry;
      } else {
        validCountry = up;
      }
    }

    // Construir UPDATE / INSERT. Capturamos violación del índice único
    // sobre LOWER(display_name) para devolver un error claro al frontend.
    try {
      if (isNewUser) {
        await query(
          `INSERT INTO users (id, display_name, country_code, name_changed_at)
           VALUES ($1, $2, $3, $4)`,
          [
            userId,
            sanitizedName,
            validCountry,
            sanitizedName ? new Date() : null,
          ],
        );
      } else {
        // Solo actualizar campos que vienen y son válidos
        const updates: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (sanitizedName !== null && sanitizedName !== currentDisplayName) {
          updates.push(`display_name = $${idx++}`);
          values.push(sanitizedName);
          updates.push(`name_changed_at = $${idx++}`);
          values.push(new Date());
        }

        // Country solo se setea si no había antes
        if (validCountry !== null && !currentCountry) {
          updates.push(`country_code = $${idx++}`);
          values.push(validCountry);
        }

        if (updates.length > 0) {
          values.push(userId);
          await query(
            `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx}`,
            values,
          );
        }
      }
    } catch (err: any) {
      if (err.code === "23505" && String(err.constraint || "").includes("display_name")) {
        reply.code(409).send({
          error: "Ese nombre de usuario ya está en uso. Elegí otro.",
          code: "username_taken",
        });
        return;
      }
      throw err;
    }

    // Devolver estado actualizado
    const finalRow = await query(
      "SELECT id, display_name, country_code, name_changed_at FROM users WHERE id = $1",
      [userId],
    );
    const user = finalRow.rows[0];

    reply.code(200).send({
      userId: user.id,
      displayName: user.display_name,
      countryCode: user.country_code,
      canChangeName: canChangeNameThisMonth(user.name_changed_at),
      nameChangedAt: user.name_changed_at,
      // Emitir/renovar el identityToken. El frontend lo guarda y lo manda
      // en futuras modificaciones para probar la posesión del userId.
      identityToken: signIdentityToken(user.id),
    });
  } catch (err) {
    console.error("updateUserProfile error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/**
 * Devuelve true si el usuario puede cambiar su display_name este mes.
 * Regla: 1 cambio por mes calendario (UTC), no acumulables.
 */
function canChangeNameThisMonth(nameChangedAt: Date | null): boolean {
  if (!nameChangedAt) return true; // nunca lo cambió → puede
  const now = new Date();
  const changed = new Date(nameChangedAt);
  // Puede si estamos en un mes calendario distinto
  return (
    changed.getUTCFullYear() !== now.getUTCFullYear() ||
    changed.getUTCMonth() !== now.getUTCMonth()
  );
}

/**
 * GET /username-available?name=X&userId=Y
 *
 * Chequea si un nombre está disponible (case-insensitive). Si viene userId,
 * se ignora al usuario dueño (permite "usar tu mismo nombre" sin marcarlo
 * como duplicado).
 * Respuesta: { available: boolean }
 */
export async function checkUsernameAvailable(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { name, userId } = req.query as { name?: string; userId?: string };
    const sanitized = sanitizeDisplayName(name);
    if (sanitized.length === 0 || sanitized === "Anónimo") {
      reply.code(200).send({ available: false });
      return;
    }
    const params: string[] = [sanitized.toLowerCase()];
    let sql = "SELECT id FROM users WHERE LOWER(display_name) = $1";
    if (userId && isValidUserId(userId)) {
      params.push(userId);
      sql += " AND id != $2";
    }
    sql += " LIMIT 1";
    const rows = await query(sql, params);
    reply.code(200).send({ available: rows.rows.length === 0 });
  } catch (err) {
    console.error("checkUsernameAvailable error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/**
 * GET /user/:userId/attempts?date=YYYY-MM-DD&identityToken=...
 * GET /user/:userId/attempts?from=YYYY-MM-DD&to=YYYY-MM-DD&identityToken=...
 *
 * Devuelve los attempts del usuario en un rango de fechas (o una fecha
 * puntual con `date`, retrocompatible con el uso anterior de un solo día).
 * Usado para sincronizar el estado local con el server después de login
 * (rango: mes completo) o al cargar la home (rango: mes completo también,
 * para que el gráfico mensual local no pierda días tras un reset).
 *
 * Requiere identityToken propio: el userId no es secreto (aparece en el
 * ranking público), así que sin esta verificación cualquiera podría leer
 * el historial diario de otra persona conociendo su userId.
 */
export async function getUserAttempts(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { userId } = req.params as { userId?: string };
    if (!userId || !isValidUserId(userId)) {
      reply.code(422).send({ error: "userId inválido" });
      return;
    }

    const { identityToken } = req.query as { identityToken?: string };
    if (!ownsIdentity(identityToken, userId)) {
      reply.code(403).send({ error: "No autorizado para leer estos datos" });
      return;
    }

    const { date, from, to } = req.query as { date?: string; from?: string; to?: string };
    const todayKey = resolveNow(req).toISOString().slice(0, 10);
    const singleDate = typeof date === "string" && isValidDateKey(date) ? date : todayKey;
    const fromKey = typeof from === "string" && isValidDateKey(from) ? from : singleDate;
    const toKey = typeof to === "string" && isValidDateKey(to) ? to : singleDate;

    // `AND duel_id IS NULL` es CRÍTICO: esta respuesta alimenta
    // `syncFromServer` (src/lib/stats.ts), que escribe el lock durable
    // `played[dia][juego]`. Sin el filtro, jugar un DUELO de PitTexto hoy
    // bloqueaba el RETO DIARIO de PitTexto al recargar o entrar desde otro
    // dispositivo — rompiendo el invariante "un duelo nunca bloquea el reto
    // diario ni viceversa" (el mismo filtro está en el pre-check de
    // `startChallenge`). Los intentos de duelo son `ranked:false` y no deben
    // afectar racha, gráfico mensual ni bloqueo del reto.
    const rows = await query(
      `SELECT game_id, difficulty, won, time_seconds, points, created_at, date_key
       FROM attempts
       WHERE user_id = $1 AND date_key BETWEEN $2::date AND $3::date
         AND duel_id IS NULL
       ORDER BY date_key DESC, created_at DESC`,
      [userId, fromKey, toKey],
    );

    reply.code(200).send({
      dateKey: toKey,
      attempts: rows.rows.map((r) => ({
        gameId: r.game_id,
        difficulty: r.difficulty,
        won: r.won,
        timeSeconds: r.time_seconds,
        points: r.points,
        finishedAt: r.created_at,
        dateKey: r.date_key.toISOString().slice(0, 10),
      })),
    });
  } catch (err) {
    console.error("getUserAttempts error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/**
 * GET /user/:userId/rank?date=YYYY-MM-DD&identityToken=...
 *
 * Devuelve la posición del usuario en el ranking diario global.
 * Reglas de negocio:
 *  - Solo cuenta usuarios con al menos un attempt ganado y NO flagged.
 *  - Si el usuario no tiene puntos ganados ese día → { rank: null }
 *  - Si tiene → { rank: N, points: P, totalPlayers: T }
 *
 * Calculado eficientemente: cuenta cuántos usuarios distintos tienen
 * más puntos que este usuario ese día.
 *
 * Requiere identityToken propio (ver nota de seguridad en getUserAttempts).
 * Esto NO afecta el ranking público (getRankingMonthly/getRankingDaily),
 * que siguen siendo agregados sin necesidad de identificar a quien consulta.
 */
export async function getUserRank(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { userId } = req.params as { userId?: string };
    if (!userId || !isValidUserId(userId)) {
      reply.code(422).send({ error: "userId inválido" });
      return;
    }

    const { identityToken } = req.query as { identityToken?: string };
    if (!ownsIdentity(identityToken, userId)) {
      reply.code(403).send({ error: "No autorizado para leer estos datos" });
      return;
    }

    const { date } = req.query as { date?: string };
    const dateKey = typeof date === "string" && isValidDateKey(date)
      ? date
      : resolveNow(req).toISOString().slice(0, 10);

    // 1. Puntos RANKEABLES del usuario ese día (ganados, no flagged, ranked).
    const userPointsResult = await query(
      `SELECT COALESCE(SUM(points), 0) as points
       FROM attempts
       WHERE user_id = $1
         AND date_key = $2::date
         AND won
         AND NOT flagged
         AND ranked`,
      [userId, dateKey],
    );
    const userPoints = Number(userPointsResult.rows[0]?.points ?? 0);

    // Regla: si el usuario no tiene puntos rankeables, no rankea → null.
    if (userPoints === 0) {
      reply.code(200).send({
        dateKey,
        rank: null,
        points: 0,
        totalPlayers: 0,
      });
      return;
    }

    // 2. Contar cuántos usuarios distintos tienen MÁS puntos rankeables.
    const aheadResult = await query(
      `SELECT COUNT(*) as ahead FROM (
         SELECT user_id, SUM(points) as total
         FROM attempts
         WHERE date_key = $1::date AND won AND NOT flagged AND ranked
         GROUP BY user_id
         HAVING SUM(points) > $2
       ) t`,
      [dateKey, userPoints],
    );
    const rank = Number(aheadResult.rows[0]?.ahead ?? 0) + 1;

    // 3. Total de jugadores rankeados ese día (para dar contexto).
    const totalResult = await query(
      `SELECT COUNT(DISTINCT user_id) as total
       FROM attempts
       WHERE date_key = $1::date AND won AND NOT flagged AND ranked`,
      [dateKey],
    );
    const totalPlayers = Number(totalResult.rows[0]?.total ?? 0);

    reply.code(200).send({
      dateKey,
      rank,
      points: userPoints,
      totalPlayers,
    });
  } catch (err) {
    console.error("getUserRank error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ════════════════════════════════════════════════════════════════════
// ─── Sistema de Amigos y Duelos (Roadmap §4) ────────────────────────
// ════════════════════════════════════════════════════════════════════

/** Alfabeto sin ambigüedad (sin I, L, O, 0, 1) para códigos legibles/dictables. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const FRIEND_CODE_LEN = 6;
const DUEL_ID_LEN = 8;
/** TTL de un duelo pendiente (esperando aceptación): 60s, "en vivo". */
const DUEL_PENDING_TTL_MS = 60 * 1000;
/**
 * Margen que se suma a la DURACIÓN DE LA PARTIDA para fijar el plazo de un
 * duelo activo: `expires_at = accept + time_limit + este margen`. Cubre la
 * carga del juego, la latencia y el envío del resultado.
 *
 * Antes era un TTL fijo de 5 min, con dos problemas: hacía esperar minutos de
 * más a un rival que nunca apareció, y traía un invariante frágil ("el TTL debe
 * superar al timer más largo de cualquier juego", documentado pero no validado
 * por código: un juego nuevo de >5 min habría expirado duelos en plena
 * partida). Derivar el plazo del propio `time_limit` hace ese invariante
 * automático. Además `startDuelChallenge` lo EXTIENDE (nunca lo acorta) al
 * arrancar, para que quien cargue tarde no pierda su partida por el reloj.
 */
const DUEL_ACTIVE_GRACE_S = 30;

/** Genera un código aleatorio criptográficamente uniforme del alfabeto seguro. */
function randomCode(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}

/** Valida que un string tenga el formato exacto de código (largo + alfabeto). */
function isCodeFormat(s: unknown, len: number): boolean {
  return (
    typeof s === "string" &&
    s.length === len &&
    [...s].every((c) => CODE_ALPHABET.includes(c))
  );
}

/**
 * Devuelve el friend_code del usuario, generándolo (único) la primera vez.
 * Crea la fila del usuario si no existe. Reintenta ante colisión del índice
 * único. Concurrency-safe: si otro request lo setea a la vez, re-lee y lo usa.
 */
async function ensureFriendCode(userId: string): Promise<string> {
  await query("INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [userId]);
  const cur = await query("SELECT friend_code FROM users WHERE id = $1", [userId]);
  const existing = cur.rows[0]?.friend_code as string | null | undefined;
  if (existing) return existing;

  for (let attempt = 0; attempt < 12; attempt++) {
    const code = randomCode(FRIEND_CODE_LEN);
    try {
      const res = await query(
        "UPDATE users SET friend_code = $1 WHERE id = $2 AND friend_code IS NULL RETURNING friend_code",
        [code, userId],
      );
      if (res.rows.length > 0) return res.rows[0].friend_code as string;
      // Otro request lo seteó concurrentemente: re-leer y usar ese.
      const reread = await query("SELECT friend_code FROM users WHERE id = $1", [userId]);
      if (reread.rows[0]?.friend_code) return reread.rows[0].friend_code as string;
    } catch (err: any) {
      if (err.code === "23505") continue; // código ya usado por otro: reintentar
      throw err;
    }
  }
  throw new Error("No se pudo generar friend_code único");
}

/** Ordena un par de userIds alfabéticamente (para la PK de friendships). */
function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Verifica identityToken del usuario que actúa; responde 403 si no. Devuelve true si ok. */
function requireOwnership(
  reply: FastifyReply,
  identityToken: string | undefined,
  userId: string | undefined,
): userId is string {
  if (!userId || !isValidUserId(userId)) {
    reply.code(422).send({ error: "userId inválido" });
    return false;
  }
  if (!ownsIdentity(identityToken, userId)) {
    reply.code(403).send({ error: "No autorizado" });
    return false;
  }
  return true;
}

/** Ejecutor de queries mínimo para `settleExpiredDuels` (pool `pg` o PGlite). */
type SettleExec = (
  sql: string,
  params?: any[],
) => Promise<{ rowCount?: number | null; affectedRows?: number }>;

/**
 * Cierra los duelos cuyo plazo venció. Es el reemplazo del viejo "marcar todo
 * como 'expired'", que dejaba desenlaces perdidos:
 *
 *  - 'pending' vencido → 'expired'. Nadie llegó a aceptar: no hubo duelo y no
 *    hay resultado que registrar.
 *  - 'active' vencido  → 'finished', completando con un resultado de 0 puntos
 *    (`timedOut`) los lados que nunca enviaron el suyo.
 *
 * Así un duelo aceptado SIEMPRE termina en un desenlace explicable: si nadie
 * completó el reto queda 0-0 (empate) y si uno sí lo completó, ese gana. Antes
 * quedaba en 'expired', un estado que `serializeDuel` nunca revela — o sea que
 * el jugador que había jugado y GANADO no llegaba a ver su resultado nunca.
 *
 * Caso borde: un 'active' con `opponent_id NULL` (el rival borró su cuenta,
 * por el `ON DELETE SET NULL`) no tiene dos lados que comparar, así que se
 * expira en vez de cerrarse con un resultado inventado.
 *
 * Se llama de forma lazy desde los handlers (el plazo es corto) y desde el cron
 * de `index.ts` para los duelos que nadie vuelve a consultar.
 */
export async function settleExpiredDuels(
  scope: { userId?: string; duelId?: string },
  /** Ejecutor inyectable (mismo patrón que `badges.ts`): permite correr el SQL
   *  REAL contra PGlite en los tests sin duplicarlo. Por defecto, el pool pg. */
  exec: SettleExec = query,
): Promise<number> {
  const scopeParams: string[] = [];
  let scopeSql = "";
  if (scope.duelId) {
    scopeParams.push(scope.duelId);
    scopeSql += ` AND id = $${scopeParams.length}`;
  }
  if (scope.userId) {
    scopeParams.push(scope.userId);
    scopeSql += ` AND (creator_id = $${scopeParams.length} OR opponent_id = $${scopeParams.length})`;
  }

  const expiredRes = await exec(
    `UPDATE duels SET status = 'expired'
     WHERE expires_at < now()
       AND (status = 'pending' OR (status = 'active' AND opponent_id IS NULL))
       ${scopeSql}`,
    scopeParams,
  );

  // El `COALESCE` es lo que respeta el resultado de quien SÍ jugó: solo se
  // rellena el lado que está vacío. Si una finalización real está en vuelo, su
  // `FOR UPDATE` serializa contra este UPDATE, así que o bien esto ve el
  // resultado ya escrito (y no lo pisa), o bien la finalización encuentra su
  // lado resuelto y responde 409 — nunca se mezclan.
  const timedOutJson = JSON.stringify(timedOutResult(Date.now()));
  const settledRes = await exec(
    `UPDATE duels
     SET creator_result  = COALESCE(creator_result,  $${scopeParams.length + 1}::jsonb),
         opponent_result = COALESCE(opponent_result, $${scopeParams.length + 1}::jsonb),
         status = 'finished',
         finished_at = now()
     WHERE status = 'active' AND expires_at < now() AND opponent_id IS NOT NULL
       ${scopeSql}`,
    [...scopeParams, timedOutJson],
  );

  return rowsAffected(expiredRes) + rowsAffected(settledRes);
}

/** Filas afectadas por un UPDATE. `pg` lo expone como `rowCount`; PGlite (tests)
 *  como `affectedRows`. */
function rowsAffected(res: { rowCount?: number | null; affectedRows?: number }): number {
  return res.rowCount ?? res.affectedRows ?? 0;
}

/**
 * Cierra los duelos vencidos de un usuario (o de todos si no se pasa userId).
 * Los handlers lo llaman al vuelo para que la regla "1 duelo activo" no quede
 * bloqueada por un duelo muerto; el cron de `index.ts` barre el resto.
 */
export async function sweepExpiredDuels(userId?: string): Promise<number> {
  return settleExpiredDuels({ userId });
}

/** ¿El usuario ya tiene un duelo pending/active (vivo)? Excluye `exceptId`. */
async function hasActiveDuel(userId: string, exceptId?: string): Promise<boolean> {
  const res = await query(
    `SELECT 1 FROM duels
     WHERE (creator_id = $1 OR opponent_id = $1)
       AND status IN ('pending', 'active')
       AND expires_at > now()
       AND ($2::text IS NULL OR id <> $2)
     LIMIT 1`,
    [userId, exceptId ?? null],
  );
  return res.rows.length > 0;
}

type DuelRow = {
  id: string;
  creator_id: string;
  opponent_id: string | null;
  game_id: string;
  difficulty: Difficulty;
  time_limit: number | null;
  seed: string;
  status: string;
  creator_result: any;
  opponent_result: any;
  expires_at: Date;
  finished_at: Date | null;
  // Solo presentes cuando la query los joinea explícitamente (getDuel).
  creator_name?: string | null;
  creator_country?: string | null;
};

/** Serializa un duelo para el cliente, aplicando el modo A CIEGAS: el resultado
 *  del oponente NO se revela hasta que AMBOS terminaron (status='finished'). */
function serializeDuel(d: DuelRow, viewerId: string) {
  const isCreator = viewerId === d.creator_id;
  const bothFinished = d.status === "finished";
  const myResult = isCreator ? d.creator_result : d.opponent_result;
  const otherResultRaw = isCreator ? d.opponent_result : d.creator_result;
  return {
    id: d.id,
    gameId: d.game_id,
    difficulty: d.difficulty,
    timeLimit: d.time_limit,
    status: d.status,
    creatorId: d.creator_id,
    opponentId: d.opponent_id,
    creatorName: d.creator_name ?? null,
    creatorCountry: d.creator_country ?? null,
    youAre: isCreator ? "creator" : "opponent",
    myResult: myResult ?? null,
    // A ciegas: solo se revela el resultado ajeno cuando ambos terminaron.
    opponentResult: bothFinished ? otherResultRaw ?? null : null,
    opponentFinished: otherResultRaw != null,
    expiresAt: d.expires_at,
    secondsLeft: Math.max(0, Math.round((new Date(d.expires_at).getTime() - Date.now()) / 1000)),
  };
}

// ─── start/finish para el flujo de duelo (invocados desde start/finishChallenge) ───

async function startDuelChallenge(
  req: FastifyRequest,
  reply: FastifyReply,
  args: { gameId: string; duelId: string; userId?: string; identityToken?: string },
): Promise<void> {
  const { duelId, userId, identityToken } = args;
  if (!isCodeFormat(duelId, DUEL_ID_LEN)) {
    reply.code(422).send({ error: "duelId inválido" });
    return;
  }
  if (!requireOwnership(reply, identityToken, userId)) return;

  const found = await query("SELECT * FROM duels WHERE id = $1", [duelId]);
  const duel = found.rows[0] as DuelRow | undefined;
  if (!duel) {
    reply.code(404).send({ error: "Duelo no encontrado" });
    return;
  }
  if (duel.status !== "active") {
    reply.code(409).send({ error: "El duelo no está activo" });
    return;
  }
  if (new Date(duel.expires_at).getTime() < Date.now()) {
    // Lo cierra con el desenlace que corresponda (0-0 si nadie completó el
    // reto) en vez de dejarlo en 'expired', que el cliente nunca llega a ver.
    await settleExpiredDuels({ duelId });
    reply.code(410).send({ error: "El duelo expiró" });
    return;
  }
  const side = userId === duel.creator_id ? "creator" : userId === duel.opponent_id ? "opponent" : null;
  if (!side) {
    reply.code(403).send({ error: "No sos participante de este duelo" });
    return;
  }
  const already = side === "creator" ? duel.creator_result : duel.opponent_result;
  if (already != null) {
    reply.code(409).send({ error: "Ya jugaste este duelo" });
    return;
  }

  const gameId = duel.game_id;
  const difficulty = duel.difficulty;
  const validOptions = GAME_TIME_OPTIONS[gameId] ?? [];
  const timeLimit = validOptions.includes(duel.time_limit as number)
    ? (duel.time_limit as number)
    : (validOptions.length > 0 ? Math.max(...validOptions) : TIME_LIMITS[gameId] ?? 180);

  // Estira el plazo del duelo para que quien arranca tarde (backend frío, red
  // lenta, aceptación demorada) tenga igual su partida COMPLETA. `GREATEST`
  // garantiza que nunca lo acorte: si el rival ya lo había extendido más, gana
  // el plazo mayor.
  await query(
    `UPDATE duels
     SET expires_at = GREATEST(expires_at, now() + ($2::int * INTERVAL '1 second'))
     WHERE id = $1 AND status = 'active'`,
    [duelId, timeLimit + DUEL_ACTIVE_GRACE_S],
  );

  const today = resolveNow(req).toISOString().substring(0, 10);
  const startedAt = Date.now();
  const expiresAt = startedAt + SESSION_TTL;
  const sessionId = randomUUID();
  const clientIp = req.ip || "unknown";

  const payload: SessionPayload = {
    sessionId, uid: userId!, gameId, difficulty, today, startedAt, timeLimit,
    ranked: false, duelId, duelSeed: duel.seed,
  };
  const sessionToken = signToken(payload);

  await query(
    `INSERT INTO sessions (id, user_id, game_id, difficulty, date_key, started_at, expires_at, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [sessionId, userId!, gameId, difficulty, today, startedAt, expiresAt, clientIp],
  );

  reply.code(200).send({
    puzzle: { gameId, difficulty, dateKey: today, duelId },
    sessionToken,
    serverNow: startedAt,
    identityToken: signIdentityToken(userId!),
  });
}

// ─── Cierre de un lado del duelo (compartido por finish y forfeit) ──

export type DuelSide = "creator" | "opponent";

/** Lo que se guarda en `duels.creator_result` / `duels.opponent_result`. */
export type DuelSideResult = {
  won: boolean;
  points: number;
  timeSeconds: number;
  finishedAt: string;
  /** true si ganó porque el rival abandonó (este lado nunca llegó a jugar). */
  walkover?: boolean;
  /** true si este lado abandonó explícitamente (botón de salir / cerrar pestaña). */
  forfeit?: boolean;
  /** true si este lado nunca envió resultado y lo resolvió el vencimiento del plazo. */
  timedOut?: boolean;
};

type DuelLockCheck =
  | { ok: false; reason: "gone" | "not_participant" | "already_played" }
  | { ok: true; side: DuelSide; otherHadResult: boolean; status: string };

/** Cliente de transacción (pg PoolClient); `transaction()` lo tipa como any. */
type TxClient = { query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }> };

/**
 * Toma el lock de la fila del duelo y valida que este usuario pueda cerrar su
 * lado. DEBE llamarse DENTRO de una transacción.
 *
 * El `FOR UPDATE` no es opcional: sin él, dos finalizaciones simultáneas (el
 * caso real de "ambos abandonan a la vez") leerían ambas que el rival todavía
 * no tiene resultado, y cada una le otorgaría el walkover a la otra — quedaría
 * un duelo con dos ganadores. Con el lock, la segunda espera a que la primera
 * commitee, re-lee, ve que su propio lado ya está resuelto y devuelve 409.
 */
export async function lockDuelForSettle(
  client: TxClient,
  duelId: string,
  userId: string,
): Promise<DuelLockCheck> {
  const found = await client.query(
    `SELECT creator_id, opponent_id, creator_result, opponent_result, status
     FROM duels WHERE id = $1 FOR UPDATE`,
    [duelId],
  );
  const duel = found.rows[0];
  if (!duel) return { ok: false, reason: "gone" };

  const side: DuelSide | null =
    userId === duel.creator_id ? "creator" : userId === duel.opponent_id ? "opponent" : null;
  if (!side) return { ok: false, reason: "not_participant" };

  const mine = side === "creator" ? duel.creator_result : duel.opponent_result;
  if (mine != null) return { ok: false, reason: "already_played" };

  const other = side === "creator" ? duel.opponent_result : duel.creator_result;
  return { ok: true, side, otherHadResult: other != null, status: String(duel.status) };
}

/** Resultado sintético del que GANA por abandono del rival (nunca jugó). */
export function walkoverResult(nowMs: number): DuelSideResult {
  return {
    won: true,
    points: 0,
    timeSeconds: 0,
    walkover: true,
    finishedAt: new Date(nowMs).toISOString(),
  };
}

/**
 * Resultado sintético del lado que NUNCA envió el suyo y lo resolvió el
 * vencimiento del plazo. Es una derrota lisa de 0 puntos, sin `walkover`: no
 * le regala la victoria a nadie. Si el rival tampoco completó el reto, ambos
 * quedan en 0 y el duelo es EMPATE.
 */
export function timedOutResult(nowMs: number): DuelSideResult {
  return {
    won: false,
    points: 0,
    timeSeconds: 0,
    timedOut: true,
    finishedAt: new Date(nowMs).toISOString(),
  };
}

/**
 * Decide cómo se cierra MI lado del duelo. Es LA regla de desenlace, aislada
 * en una función pura para poder testearla sin base de datos.
 *
 * El walkover (regalarle la victoria al rival que todavía no jugó) corresponde
 * SOLO cuando el cierre es un abandono EXPLÍCITO (`forfeit`). Terminar la
 * partida —ganando, perdiendo dentro del juego, o sin completarla a tiempo—
 * nunca se lo otorga: si el rival tampoco hace puntos, el duelo es empate.
 *
 * BUG QUE ESTO ARREGLA: antes la condición era `isAbandon && !otherHadResult`,
 * y como el cliente manda `solution: null` tanto al abandonar como al agotarse
 * el timer, quedarse sin tiempo le regalaba la victoria a un rival AUSENTE.
 */
export function duelClosurePlan(args: {
  reason: "played" | "forfeit";
  otherHadResult: boolean;
}): { grantWalkover: boolean; finished: boolean } {
  return {
    grantWalkover: args.reason === "forfeit" && !args.otherHadResult,
    // Cierra si ya hay resultado del otro lado, o si el abandono explícito lo
    // resuelve en el acto. Si no, el duelo sigue abierto hasta que el rival
    // termine o venza el plazo (`settleExpiredDuels`).
    finished: args.reason === "forfeit" || args.otherHadResult,
  };
}

/**
 * Escribe el resultado de MI lado y, si corresponde, el walkover del rival.
 * `COALESCE($5, ...)` deja intacto el lado ajeno cuando no hay walkover.
 */
export async function writeDuelSideResult(
  client: TxClient,
  args: {
    duelId: string;
    side: DuelSide;
    result: DuelSideResult;
    /** Resultado a forzar en el rival (walkover), o null si no corresponde. */
    walkoverForOther: DuelSideResult | null;
    /** Si el duelo queda cerrado con esta escritura. */
    finished: boolean;
  },
): Promise<void> {
  await client.query(
    `UPDATE duels
     SET creator_result  = CASE WHEN $2 = 'creator'  THEN $3::jsonb ELSE COALESCE($5::jsonb, creator_result)  END,
         opponent_result = CASE WHEN $2 = 'opponent' THEN $3::jsonb ELSE COALESCE($5::jsonb, opponent_result) END,
         status      = CASE WHEN $4 THEN 'finished' ELSE status      END,
         finished_at = CASE WHEN $4 THEN now()       ELSE finished_at END
     WHERE id = $1`,
    [
      args.duelId,
      args.side,
      JSON.stringify(args.result),
      args.finished,
      args.walkoverForOther ? JSON.stringify(args.walkoverForOther) : null,
    ],
  );
}

async function finishDuelChallenge(
  req: FastifyRequest,
  reply: FastifyReply,
  args: { session: SessionPayload; solution?: Record<string, unknown> | null; isAbandon: boolean },
): Promise<void> {
  const { session, solution, isAbandon } = args;
  const duelId = session.duelId!;

  const verifyResult = isAbandon
    ? { won: false, detail: "Abandono o tiempo agotado" }
    : verifyChallenge(session.gameId, session.difficulty, session.today, solution as any, session.duelSeed);

  const now = Date.now();
  const timeSeconds = Math.round((now - session.startedAt) / 1000);
  const sessionTimeLimit = session.timeLimit ?? TIME_LIMITS[session.gameId] ?? 180;
  const gameOptions = GAME_TIME_OPTIONS[session.gameId] ?? [];
  const maxTimeOption = gameOptions.length > 0 ? Math.max(...gameOptions) : sessionTimeLimit;
  const points = computeScore({
    won: verifyResult.won,
    difficulty: session.difficulty,
    timeSeconds,
    timeLimit: sessionTimeLimit,
    maxTimeOption,
  });

  const uid = session.uid;
  const clientIp = req.ip || "unknown";

  const myResult: DuelSideResult = {
    won: verifyResult.won,
    points,
    timeSeconds,
    finishedAt: new Date(now).toISOString(),
  };

  // Todo (lock + attempt + resultado) va en UNA transacción: ver el comentario
  // de `lockDuelForSettle` sobre por qué el FOR UPDATE es obligatorio acá.
  let outcome:
    | { ok: false; reason: "gone" | "not_participant" | "already_played" }
    | { ok: false; reason: "not_active" }
    | { ok: true; duelFinished: boolean }
    | { ok: false; reason: "duplicated" };
  try {
    outcome = await transaction(async (client) => {
      const lock = await lockDuelForSettle(client, duelId, uid);
      if (!lock.ok) return lock;

      // Guard de estado: `writeDuelSideResult` no filtra por status, así que
      // sin esto un finish tardío (el sessionToken vive 15 min) podía escribir
      // sobre un duelo ya cerrado y hasta RESUCITARLO de 'expired' a
      // 'finished'. Solo un duelo en curso acepta resultados.
      if (lock.status !== "active") {
        return { ok: false as const, reason: "not_active" as const };
      }

      await client.query("UPDATE sessions SET consumed = true WHERE id = $1", [session.sessionId]);
      await client.query(
        `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ranked, ip_address, duel_id)
         VALUES ($1, $2, $3::date, $4, $5, $6, $7, false, false, $8, $9)`,
        [uid, session.gameId, session.today, session.difficulty, verifyResult.won, timeSeconds, points, clientIp, duelId],
      );

      // Llegar acá siempre significa "jugué, este es mi resultado": ganado,
      // perdido dentro del juego, o no completado a tiempo (`isAbandon`, que es
      // lo que manda el cliente al agotarse el timer). Por eso `reason:
      // "played"` — nunca otorga walkover. El abandono explícito tiene su
      // propio endpoint (`forfeitDuel`).
      const plan = duelClosurePlan({ reason: "played", otherHadResult: lock.otherHadResult });

      await writeDuelSideResult(client, {
        duelId,
        side: lock.side,
        result: myResult,
        walkoverForOther: null,
        finished: plan.finished,
      });

      return { ok: true as const, duelFinished: plan.finished };
    });
  } catch (err: any) {
    // Defensa en profundidad: con el FOR UPDATE esto ya no debería alcanzarse
    // (el chequeo de `already_played` corre antes del INSERT), pero si el
    // índice único de attempts salta igual, se reporta como duplicado.
    if (err.code === "23505") {
      outcome = { ok: false, reason: "duplicated" };
    } else {
      throw err;
    }
  }

  if (!outcome.ok) {
    if (outcome.reason === "gone") {
      reply.code(410).send({ error: "El duelo ya no existe" });
      return;
    }
    if (outcome.reason === "not_participant") {
      reply.code(403).send({ error: "No sos participante de este duelo" });
      return;
    }
    if (outcome.reason === "already_played") {
      reply.code(409).send({ error: "Ya jugaste este duelo" });
      return;
    }
    if (outcome.reason === "not_active") {
      reply.code(409).send({ error: "El duelo ya terminó" });
      return;
    }
    // duplicated: el intento ya estaba registrado; se responde 200 con el flag.
    reply.code(200).send({
      won: verifyResult.won,
      points,
      timeSeconds,
      duelId,
      duelFinished: false,
      duplicated: true,
      ranked: false,
    });
    return;
  }

  reply.code(200).send({
    won: verifyResult.won,
    points,
    timeSeconds,
    duelId,
    duelFinished: outcome.duelFinished,
    duplicated: false,
    ranked: false,
  });
}

// ─── Endpoints de DUELOS ────────────────────────────────────────────

/** POST /duels — crea un duelo pendiente (TTL 60s). */
export async function createDuel(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { userId, gameId, difficulty, timeLimit, opponentUserId, identityToken } = (req.body ?? {}) as {
      userId?: string; gameId?: string; difficulty?: Difficulty; timeLimit?: number;
      opponentUserId?: string; identityToken?: string;
    };
    if (!requireOwnership(reply, identityToken, userId)) return;
    if (!gameId || !VALID_GAMES.includes(gameId)) {
      reply.code(422).send({ error: "Juego inválido" });
      return;
    }
    if (!difficulty || !VALID_DIFFS.includes(difficulty)) {
      reply.code(422).send({ error: "Dificultad inválida" });
      return;
    }
    const validOptions = GAME_TIME_OPTIONS[gameId] ?? [];
    const tl = validOptions.includes(timeLimit as number)
      ? (timeLimit as number)
      : (validOptions.length > 0 ? Math.max(...validOptions) : TIME_LIMITS[gameId] ?? 180);

    // Oponente directo (opcional): debe ser un amigo, para no spamear a extraños.
    let opponent: string | null = null;
    if (opponentUserId !== undefined && opponentUserId !== null && opponentUserId !== "") {
      if (!isValidUserId(opponentUserId) || opponentUserId === userId) {
        reply.code(422).send({ error: "opponentUserId inválido" });
        return;
      }
      const [a, b] = orderedPair(userId, opponentUserId);
      const fr = await query("SELECT 1 FROM friendships WHERE user_a = $1 AND user_b = $2", [a, b]);
      if (fr.rows.length === 0) {
        reply.code(403).send({ error: "Solo podés desafiar directamente a un amigo" });
        return;
      }
      opponent = opponentUserId;
    }

    // Limpieza lazy + regla "1 duelo activo por usuario".
    await sweepExpiredDuels(userId);
    if (await hasActiveDuel(userId)) {
      reply.code(409).send({ error: "Ya tenés un duelo activo. Terminalo o cancelalo antes de crear otro." });
      return;
    }
    if (opponent) {
      await sweepExpiredDuels(opponent);
      if (await hasActiveDuel(opponent)) {
        reply.code(409).send({ error: "Tu amigo ya tiene un duelo activo" });
        return;
      }
    }

    // Insertar con reintento de colisión de id.
    const expiresAt = new Date(Date.now() + DUEL_PENDING_TTL_MS).toISOString();
    let duelId = "";
    // Solo se auto-repara UNA vez, para no quedar en un bucle si el duelo que
    // bloquea está realmente vivo.
    let healedStaleDuel = false;
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = randomCode(DUEL_ID_LEN);
      try {
        await query(
          `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)`,
          [candidate, userId, opponent, gameId, difficulty, tl, candidate, expiresAt],
        );
        duelId = candidate;
        break;
      } catch (err: any) {
        if (err.code === "23505") {
          // Colisión: puede ser id repetido (reintentar) o el índice de "1 activo".
          const msg = String(err.constraint || "");
          if (msg.includes("creator_active") || msg.includes("opponent_active")) {
            // Los índices `idx_duels_*_active` solo miran `status`, mientras que
            // `hasActiveDuel` exige ADEMÁS que el plazo no haya vencido. Una fila
            // muerta que el barrido todavía no tocó (carrera, o barrido corrido
            // en otra instancia) pasa el chequeo del handler pero hace fallar el
            // INSERT: el usuario veía "ya tenés un duelo activo" sobre un duelo
            // que en los hechos ya no existe — y que `cancelDuel` encima se niega
            // a tocar, por no estar 'pending'. Se cierra a mano y se reintenta.
            if (!healedStaleDuel) {
              healedStaleDuel = true;
              await settleExpiredDuels({ userId });
              if (opponent) await settleExpiredDuels({ userId: opponent });
              continue;
            }
            reply.code(409).send({ error: "Ya tenés un duelo activo. Terminalo o cancelalo antes de crear otro." });
            return;
          }
          continue; // id colisionó, probar otro
        }
        throw err;
      }
    }
    if (!duelId) {
      reply.code(500).send({ error: "No se pudo crear el duelo" });
      return;
    }

    reply.code(200).send({
      duelId,
      gameId,
      difficulty,
      timeLimit: tl,
      status: "pending",
      expiresAt,
      secondsLeft: Math.round(DUEL_PENDING_TTL_MS / 1000),
    });
  } catch (err) {
    console.error("createDuel error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** POST /duels/:id/accept — acepta un duelo pendiente. Race-safe. */
export async function acceptDuel(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { userId, identityToken } = (req.body ?? {}) as { userId?: string; identityToken?: string };
    if (!isCodeFormat(id, DUEL_ID_LEN)) {
      reply.code(422).send({ error: "duelId inválido" });
      return;
    }
    if (!requireOwnership(reply, identityToken, userId)) return;

    // Marcar expirado si venció, antes de intentar aceptar.
    await query("UPDATE duels SET status = 'expired' WHERE id = $1 AND status = 'pending' AND expires_at < now()", [id]);

    // El que acepta no puede tener ya otro duelo activo.
    await sweepExpiredDuels(userId);
    if (await hasActiveDuel(userId, id)) {
      reply.code(409).send({ error: "Ya tenés un duelo activo. Terminalo o cancelalo antes de aceptar otro." });
      return;
    }

    // UPDATE atómico: gana el primero. La condición opponent_id IS NULL/=userId
    // permite tanto duelos abiertos (link) como dirigidos a este usuario.
    // El nuevo plazo se calcula en SQL a partir del `time_limit` de la propia
    // fila (duración de la partida + margen), en vez de un TTL fijo.
    let updated;
    try {
      updated = await query(
        `UPDATE duels
         SET opponent_id = $1, status = 'active',
             expires_at = now() + ((COALESCE(time_limit, 180) + $2::int) * INTERVAL '1 second')
         WHERE id = $3 AND status = 'pending' AND expires_at > now()
           AND creator_id <> $1
           AND (opponent_id IS NULL OR opponent_id = $1)
         RETURNING *`,
        [userId, DUEL_ACTIVE_GRACE_S, id],
      );
    } catch (err: any) {
      if (err.code === "23505") {
        reply.code(409).send({ error: "Ya tenés un duelo activo. Terminalo o cancelalo antes de aceptar otro." });
        return;
      }
      throw err;
    }
    if (updated.rows.length === 0) {
      reply.code(409).send({ error: "El duelo ya no está disponible (aceptado, cancelado o expirado)" });
      return;
    }
    reply.code(200).send(serializeDuel(updated.rows[0] as DuelRow, userId));
  } catch (err) {
    console.error("acceptDuel error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** POST /duels/:id/decline — el oponente rechaza un duelo dirigido a él. */
export async function declineDuel(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { userId, identityToken } = (req.body ?? {}) as { userId?: string; identityToken?: string };
    if (!isCodeFormat(id, DUEL_ID_LEN)) {
      reply.code(422).send({ error: "duelId inválido" });
      return;
    }
    if (!requireOwnership(reply, identityToken, userId)) return;
    const res = await query(
      `UPDATE duels SET status = 'cancelled'
       WHERE id = $1 AND status = 'pending' AND opponent_id = $2 RETURNING id`,
      [id, userId],
    );
    if (res.rows.length === 0) {
      reply.code(409).send({ error: "No se pudo rechazar (ya no está pendiente o no es para vos)" });
      return;
    }
    reply.code(200).send({ ok: true });
  } catch (err) {
    console.error("declineDuel error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** POST /duels/:id/cancel — el creador cancela su propio duelo pendiente. */
export async function cancelDuel(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { userId, identityToken } = (req.body ?? {}) as { userId?: string; identityToken?: string };
    if (!isCodeFormat(id, DUEL_ID_LEN)) {
      reply.code(422).send({ error: "duelId inválido" });
      return;
    }
    if (!requireOwnership(reply, identityToken, userId)) return;
    const res = await query(
      `UPDATE duels SET status = 'cancelled'
       WHERE id = $1 AND creator_id = $2 AND status = 'pending' RETURNING id`,
      [id, userId],
    );
    if (res.rows.length === 0) {
      reply.code(409).send({ error: "No se pudo cancelar (ya fue aceptado o no es tuyo)" });
      return;
    }
    reply.code(200).send({ ok: true });
  } catch (err) {
    console.error("cancelDuel error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/**
 * POST /duels/:id/forfeit — "me voy de este duelo", SIN necesidad de sessionToken.
 *
 * Es el ÚNICO camino del abandono explícito, y por lo tanto el único que otorga
 * walkover. Se separa de `finishChallenge` a propósito: aquel exige un
 * sessionToken que sólo se emite al ARRANCAR la partida, y además no puede
 * distinguir "me fui" de "se me acabó el tiempo" (el cliente manda
 * `solution: null` en los dos casos). Acá la intención es inequívoca.
 *
 * Regla de producto: el que se va PIERDE siempre, aunque el rival tampoco haya
 * hecho puntos. Quedarse sin tiempo, en cambio, no es abandonar: eso lo resuelve
 * `finishChallenge` como una derrota de 0 puntos, y si el rival tampoco completó
 * el reto el duelo termina en EMPATE.
 *
 * Según el estado del duelo:
 *  - 'active'  → registra mi abandono (`forfeit: true`) y, si el rival todavía
 *                no tenía resultado, le otorga el walkover; queda 'finished'.
 *  - 'pending' → equivale a cancelar/rechazar: pasa a 'cancelled' (nadie llegó
 *                a jugar, no hay resultado que registrar).
 *  - otro      → no-op idempotente (200): ya estaba cerrado.
 *
 * NO inserta fila en `attempts`: no se jugó ningún puzzle. `attempts` registra
 * partidas reales; el desenlace del duelo vive en `duels.*_result`.
 */
export async function forfeitDuel(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { userId, identityToken } = (req.body ?? {}) as { userId?: string; identityToken?: string };
    if (!isCodeFormat(id, DUEL_ID_LEN)) {
      reply.code(422).send({ error: "duelId inválido" });
      return;
    }
    if (!requireOwnership(reply, identityToken, userId)) return;

    const now = Date.now();
    const result = await transaction(async (client) => {
      const lock = await lockDuelForSettle(client, id, userId);
      if (!lock.ok) return lock;

      if (lock.status === "pending") {
        await client.query(
          "UPDATE duels SET status = 'cancelled' WHERE id = $1 AND status = 'pending'",
          [id],
        );
        return { ok: true as const, status: "cancelled" as const };
      }
      if (lock.status !== "active") {
        return { ok: true as const, status: "noop" as const };
      }

      const plan = duelClosurePlan({ reason: "forfeit", otherHadResult: lock.otherHadResult });
      await writeDuelSideResult(client, {
        duelId: id,
        side: lock.side,
        result: { won: false, points: 0, timeSeconds: 0, forfeit: true, finishedAt: new Date(now).toISOString() },
        walkoverForOther: plan.grantWalkover ? walkoverResult(now) : null,
        finished: plan.finished,
      });
      return { ok: true as const, status: "forfeited" as const };
    });

    if (!result.ok) {
      if (result.reason === "gone") {
        reply.code(410).send({ error: "El duelo ya no existe" });
        return;
      }
      if (result.reason === "not_participant") {
        reply.code(403).send({ error: "No sos participante de este duelo" });
        return;
      }
      // already_played: mi lado ya estaba resuelto (p. ej. el finish normal
      // llegó primero). Idempotente a propósito: rendirse dos veces no es error.
      reply.code(200).send({ ok: true, status: "already_settled" });
      return;
    }
    reply.code(200).send({ ok: true, status: result.status });
  } catch (err) {
    console.error("forfeitDuel error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/**
 * GET /duels/:id — estado del duelo (para polling). Ownership estricto salvo
 * UNA excepción: un duelo por LINK ABIERTO (`opponent_id IS NULL`, todavía
 * 'pending') puede ser leído por cualquiera SIN identityToken — es lo que le
 * permite a quien recibe el link por WhatsApp ver juego/dificultad/tiempo/
 * quién desafía ANTES de aceptar (si no, el primer contacto con el duelo
 * sería un "aceptar a ciegas", que rompe la promesa de "ver antes de
 * aceptar"). No es una filtración: nadie jugó todavía (no hay resultados que
 * proteger) y el link ya es, por diseño, algo que el creador decidió
 * compartir. En cuanto alguien lo acepta (o si el duelo iba dirigido a un
 * amigo específico, con opponent_id ya seteado), vuelve a aplicar el
 * ownership estricto de siempre.
 */
export async function getDuel(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { userId, identityToken } = req.query as { userId?: string; identityToken?: string };
    if (!isCodeFormat(id, DUEL_ID_LEN)) {
      reply.code(422).send({ error: "duelId inválido" });
      return;
    }

    const found = await query(
      `SELECT d.*, u.display_name AS creator_name, u.country_code AS creator_country
       FROM duels d JOIN users u ON u.id = d.creator_id
       WHERE d.id = $1`,
      [id],
    );
    const duel = found.rows[0] as DuelRow | undefined;
    if (!duel) {
      reply.code(404).send({ error: "Duelo no encontrado" });
      return;
    }

    const isOpenPreview = duel.status === "pending" && duel.opponent_id === null;
    const isParticipant = !!userId && (userId === duel.creator_id || userId === duel.opponent_id);

    if (isParticipant) {
      if (!requireOwnership(reply, identityToken, userId)) return;
    } else if (!isOpenPreview) {
      reply.code(403).send({ error: "No sos participante de este duelo" });
      return;
    }

    // Cierre lazy si venció sin terminar. Es el camino por el que el jugador
    // que está esperando ve aparecer el desenlace: al pollear, este mismo
    // request resuelve el duelo y ya devuelve el resultado.
    if (
      (duel.status === "pending" || duel.status === "active") &&
      new Date(duel.expires_at).getTime() < Date.now()
    ) {
      await settleExpiredDuels({ duelId: id });
      // Hay que RE-LEER: el cierre no solo cambia el estado, también completa
      // los resultados que faltaban (0 puntos para quien no jugó). Serializar
      // la fila vieja mostraría un duelo terminado sin resultados.
      const after = await query(
        `SELECT d.*, u.display_name AS creator_name, u.country_code AS creator_country
         FROM duels d JOIN users u ON u.id = d.creator_id
         WHERE d.id = $1`,
        [id],
      );
      const fresh = after.rows[0] as DuelRow | undefined;
      if (fresh) {
        reply.code(200).send(serializeDuel(fresh, userId ?? ""));
        return;
      }
    }
    reply.code(200).send(serializeDuel(duel, userId ?? ""));
  } catch (err) {
    console.error("getDuel error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** GET /duels/pending — invitaciones pendientes dirigidas a mí (banner in-app). */
export async function getPendingDuels(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { userId, identityToken } = req.query as { userId?: string; identityToken?: string };
    if (!requireOwnership(reply, identityToken, userId)) return;
    await sweepExpiredDuels(userId);
    const res = await query(
      `SELECT d.id, d.game_id, d.difficulty, d.time_limit, d.expires_at,
              u.display_name AS creator_name, u.country_code AS creator_country
       FROM duels d
       JOIN users u ON u.id = d.creator_id
       WHERE d.opponent_id = $1 AND d.status = 'pending' AND d.expires_at > now()
       ORDER BY d.created_at DESC`,
      [userId],
    );
    const duels = res.rows.map((r: any) => ({
      id: r.id,
      gameId: r.game_id,
      difficulty: r.difficulty,
      timeLimit: r.time_limit,
      creatorName: r.creator_name,
      creatorCountry: r.creator_country,
      // `secondsLeft` es solo para clientes que no lo recalculen; el
      // countdown fluido del cliente (Etapa B, useCountdown) usa expiresAt.
      secondsLeft: Math.max(0, Math.round((new Date(r.expires_at).getTime() - Date.now()) / 1000)),
      expiresAt: r.expires_at,
    }));
    reply.code(200).send({ duels });
  } catch (err) {
    console.error("getPendingDuels error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

// ─── Endpoints de AMIGOS ────────────────────────────────────────────

/** GET /me/friend-code — mi código de amigo (lo genera si no existe). */
export async function getMyFriendCode(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { userId, identityToken } = req.query as { userId?: string; identityToken?: string };
    if (!requireOwnership(reply, identityToken, userId)) return;
    const code = await ensureFriendCode(userId);
    reply.code(200).send({ code });
  } catch (err) {
    console.error("getMyFriendCode error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** GET /friends/by-code/:code — resuelve un código a un usuario (público). */
export async function resolveFriendByCode(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { code } = req.params as { code: string };
    if (!isCodeFormat(code, FRIEND_CODE_LEN)) {
      reply.code(422).send({ error: "Código inválido" });
      return;
    }
    const res = await query(
      "SELECT id, display_name, country_code FROM users WHERE friend_code = $1",
      [code],
    );
    if (res.rows.length === 0) {
      reply.code(404).send({ error: "Código no encontrado" });
      return;
    }
    const u = res.rows[0] as any;
    reply.code(200).send({ userId: u.id, displayName: u.display_name, countryCode: u.country_code });
  } catch (err) {
    console.error("resolveFriendByCode error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** POST /friends/request — envía solicitud (por code o userId). Auto-acepta si hay recíproca. */
export async function sendFriendRequest(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { userId, targetCode, targetUserId, identityToken } = (req.body ?? {}) as {
      userId?: string; targetCode?: string; targetUserId?: string; identityToken?: string;
    };
    if (!requireOwnership(reply, identityToken, userId)) return;

    // Resolver destino.
    let target: string | null = null;
    if (targetCode !== undefined && targetCode !== null && targetCode !== "") {
      if (!isCodeFormat(targetCode, FRIEND_CODE_LEN)) {
        reply.code(422).send({ error: "Código inválido" });
        return;
      }
      const r = await query("SELECT id FROM users WHERE friend_code = $1", [targetCode]);
      if (r.rows.length === 0) {
        reply.code(404).send({ error: "Código no encontrado" });
        return;
      }
      target = r.rows[0].id as string;
    } else if (isValidUserId(targetUserId)) {
      const r = await query("SELECT id FROM users WHERE id = $1", [targetUserId]);
      if (r.rows.length === 0) {
        reply.code(404).send({ error: "Usuario no encontrado" });
        return;
      }
      target = targetUserId as string;
    } else {
      reply.code(422).send({ error: "Falta targetCode o targetUserId válido" });
      return;
    }

    if (target === userId) {
      reply.code(422).send({ error: "No podés agregarte a vos mismo" });
      return;
    }

    // ¿Ya son amigos?
    const [a, b] = orderedPair(userId, target);
    const fr = await query("SELECT 1 FROM friendships WHERE user_a = $1 AND user_b = $2", [a, b]);
    if (fr.rows.length > 0) {
      reply.code(409).send({ error: "Ya son amigos" });
      return;
    }

    // ¿Hay una solicitud recíproca pendiente (target → yo)? Entonces auto-aceptar.
    const reverse = await query(
      "SELECT id FROM friend_requests WHERE from_user = $1 AND to_user = $2 AND status = 'pending'",
      [target, userId],
    );
    if (reverse.rows.length > 0) {
      await transaction(async (client) => {
        await client.query(
          "UPDATE friend_requests SET status = 'accepted', resolved_at = now() WHERE id = $1",
          [reverse.rows[0].id],
        );
        await client.query(
          "INSERT INTO friendships (user_a, user_b) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [a, b],
        );
      });
      reply.code(200).send({ ok: true, status: "auto_accepted" });
      return;
    }

    // Crear solicitud (idempotente sobre pendiente).
    try {
      const ins = await query(
        "INSERT INTO friend_requests (from_user, to_user) VALUES ($1, $2) RETURNING id",
        [userId, target],
      );
      reply.code(200).send({ ok: true, status: "sent", requestId: Number(ins.rows[0].id) });
    } catch (err: any) {
      if (err.code === "23505") {
        reply.code(409).send({ error: "Ya enviaste una solicitud a este usuario" });
        return;
      }
      throw err;
    }
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** POST /friends/respond — acepta o rechaza una solicitud recibida. */
export async function respondFriendRequest(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { userId, requestId, accept, identityToken } = (req.body ?? {}) as {
      userId?: string; requestId?: number; accept?: boolean; identityToken?: string;
    };
    if (!requireOwnership(reply, identityToken, userId)) return;
    if (typeof requestId !== "number" || !Number.isInteger(requestId)) {
      reply.code(422).send({ error: "requestId inválido" });
      return;
    }
    const found = await query(
      "SELECT from_user, to_user, status FROM friend_requests WHERE id = $1",
      [requestId],
    );
    const reqRow = found.rows[0] as { from_user: string; to_user: string; status: string } | undefined;
    if (!reqRow || reqRow.to_user !== userId || reqRow.status !== "pending") {
      reply.code(404).send({ error: "Solicitud no encontrada o ya resuelta" });
      return;
    }
    if (accept) {
      const [a, b] = orderedPair(reqRow.from_user, reqRow.to_user);
      await transaction(async (client) => {
        await client.query(
          "UPDATE friend_requests SET status = 'accepted', resolved_at = now() WHERE id = $1",
          [requestId],
        );
        await client.query(
          "INSERT INTO friendships (user_a, user_b) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [a, b],
        );
      });
      reply.code(200).send({ ok: true, status: "accepted" });
    } else {
      await query(
        "UPDATE friend_requests SET status = 'rejected', resolved_at = now() WHERE id = $1",
        [requestId],
      );
      reply.code(200).send({ ok: true, status: "rejected" });
    }
  } catch (err) {
    console.error("respondFriendRequest error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** GET /friends — lista de amigos actuales. */
export async function getFriends(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { userId, identityToken } = req.query as { userId?: string; identityToken?: string };
    if (!requireOwnership(reply, identityToken, userId)) return;
    const res = await query(
      `SELECT (CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END) AS friend_id,
              u.display_name, u.country_code
       FROM friendships f
       JOIN users u ON u.id = (CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END)
       WHERE f.user_a = $1 OR f.user_b = $1
       ORDER BY f.created_at DESC`,
      [userId],
    );
    const friends = res.rows.map((r: any) => ({
      userId: r.friend_id,
      displayName: r.display_name,
      countryCode: r.country_code,
    }));
    reply.code(200).send({ friends });
  } catch (err) {
    console.error("getFriends error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** GET /friends/requests — solicitudes pendientes RECIBIDAS. */
export async function getFriendRequests(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { userId, identityToken } = req.query as { userId?: string; identityToken?: string };
    if (!requireOwnership(reply, identityToken, userId)) return;
    const res = await query(
      `SELECT r.id, r.from_user, u.display_name, u.country_code, r.created_at
       FROM friend_requests r
       JOIN users u ON u.id = r.from_user
       WHERE r.to_user = $1 AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [userId],
    );
    const requests = res.rows.map((r: any) => ({
      requestId: Number(r.id),
      fromUserId: r.from_user,
      displayName: r.display_name,
      countryCode: r.country_code,
    }));
    reply.code(200).send({ requests });
  } catch (err) {
    console.error("getFriendRequests error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/** POST /friends/remove — desamigar. */
export async function removeFriend(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { userId, friendUserId, identityToken } = (req.body ?? {}) as {
      userId?: string; friendUserId?: string; identityToken?: string;
    };
    if (!requireOwnership(reply, identityToken, userId)) return;
    if (!isValidUserId(friendUserId)) {
      reply.code(422).send({ error: "friendUserId inválido" });
      return;
    }
    const [a, b] = orderedPair(userId, friendUserId as string);
    await query("DELETE FROM friendships WHERE user_a = $1 AND user_b = $2", [a, b]);
    reply.code(200).send({ ok: true });
  } catch (err) {
    console.error("removeFriend error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}
