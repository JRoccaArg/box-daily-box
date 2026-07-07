// src/api/routes.ts
//
// Endpoints del backend de Box Daily Box.
// Verificación server-authoritative con tokens firmados HMAC.

import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID, createHmac, timingSafeEqual } from "crypto";
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
};

// Tiempo máximo por juego (para fallback de sesiones antiguas sin timeLimit guardado).
const TIME_LIMITS: Record<string, number> = {
  "pittexto": 180,
  "polewordle": 120,
  "el-intruso": 60,
  "parrilla-bingo": 150,
  "gp-resultado": 180,
  "top10-standings": 180,
};

const VALID_GAMES = ["pittexto", "polewordle", "el-intruso", "parrilla-bingo", "gp-resultado", "top10-standings"];
const VALID_DIFFS = ["facil", "medio", "dificil", "leyenda"];

// ─── Token firmado (HMAC-SHA256) ────────────────────────────────────

type SessionPayload = {
  sessionId: string;
  uid: string;
  gameId: string;
  difficulty: Difficulty;
  today: string;
  startedAt: number;
  /** Tiempo elegido por el jugador (segundos). Firmado para que no se pueda inflar. */
  timeLimit: number;
  /** Si el attempt entrará al ranking global (false si otra cuenta de la IP
   *  ya jugó este juego hoy). Firmado en el token: no se puede falsificar. */
  ranked: boolean;
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
    const { difficulty, userId, displayName, countryCode, clientDateKey, timeLimit: rawTimeLimit } = req.body as {
      difficulty: Difficulty;
      userId?: string;
      displayName?: string;
      countryCode?: string;
      clientDateKey?: string;
      timeLimit?: number;
    };

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
    const utcToday = new Date().toISOString().substring(0, 10);
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
    // 1. Verificar que ESTE usuario no jugó ya hoy
    const existing = await query(
      "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3",
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

    // Validar timeLimit: debe ser una opción reconocida para el juego.
    const validOptions = GAME_TIME_OPTIONS[gameId] ?? [];
    const timeLimit = validOptions.includes(rawTimeLimit as number)
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

    // Usar el timeLimit firmado en la sesión; fallback al máximo del juego para
    // sesiones antiguas (pre-deploy) que no tienen timeLimit en el token.
    const sessionTimeLimit = session.timeLimit ?? TIME_LIMITS[gameId] ?? 180;
    const gameOptions = GAME_TIME_OPTIONS[gameId] ?? [];
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
      const prev = await query(
        `SELECT won, points FROM attempts
         WHERE user_id = $1 AND game_id = $2 AND date_key = $3`,
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
      : new Date().toISOString().substring(0, 7) + "-01";

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
      `SELECT u.id, u.display_name, u.country_code,
              SUM(a.points) as points,
              COUNT(a.id) as games_won,
              COUNT(DISTINCT a.date_key) as days_played
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       WHERE a.won AND NOT a.flagged AND a.ranked
       AND a.date_key >= $1::date
       AND a.date_key < ($1::date + INTERVAL '1 month')
       ${countryClause}
       GROUP BY u.id, u.display_name, u.country_code
       ORDER BY points DESC
       LIMIT 50`,
      params,
    );

    const top = topResult.rows.map((row: any, idx: number) => ({
      rank: idx + 1,
      userId: row.id as string,
      displayName: row.display_name as string,
      countryCode: (row.country_code as string) || null,
      points: Number(row.points ?? 0),
      gamesWon: Number(row.games_won ?? 0),
      daysPlayed: Number(row.days_played ?? 0),
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
      : new Date().toISOString().substring(0, 10);
    const countryFilter = isValidCountry(country) ? country : null;

    const topResult = await query(
      `SELECT u.id, u.display_name, u.country_code,
              SUM(a.points) as points,
              COUNT(a.id) as games_won
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       WHERE a.won AND NOT a.flagged AND a.ranked
       AND a.date_key = $1::date
       ${countryFilter ? "AND u.country_code = $2" : ""}
       GROUP BY u.id, u.display_name, u.country_code
       ORDER BY points DESC
       LIMIT 50`,
      countryFilter ? [target, countryFilter] : [target],
    );

    const top = topResult.rows.map((row: any, idx: number) => ({
      rank: idx + 1,
      userId: row.id as string,
      displayName: row.display_name as string,
      countryCode: (row.country_code as string) || null,
      points: Number(row.points ?? 0),
      gamesWon: Number(row.games_won ?? 0),
      daysPlayed: 1,
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
    const todayKey = new Date().toISOString().slice(0, 10);
    const singleDate = typeof date === "string" && isValidDateKey(date) ? date : todayKey;
    const fromKey = typeof from === "string" && isValidDateKey(from) ? from : singleDate;
    const toKey = typeof to === "string" && isValidDateKey(to) ? to : singleDate;

    const rows = await query(
      `SELECT game_id, difficulty, won, time_seconds, points, created_at, date_key
       FROM attempts
       WHERE user_id = $1 AND date_key BETWEEN $2::date AND $3::date
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
      : new Date().toISOString().slice(0, 10);

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
