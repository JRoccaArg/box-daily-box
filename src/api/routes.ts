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

const SESSION_TTL = 15 * 60 * 1000; // 15 minutos

// Secreto para firmar tokens (configurable via env).
const TOKEN_SECRET = process.env.TOKEN_SECRET || "bdb-token-secret-2026-change-me";

// Advertencia de arranque si los secretos siguen en su valor por defecto.
if (!process.env.TOKEN_SECRET) {
  console.warn("⚠️  TOKEN_SECRET no configurado: usando default INSEGURO. Configuralo en Railway.");
}
if (!process.env.ADMIN_SECRET) {
  console.warn("⚠️  ADMIN_SECRET no configurado: usando default INSEGURO. Configuralo en Railway.");
}

// Tiempo mínimo plausible por juego (segundos).
// Tiempo límite por juego (para calcular bonus de velocidad).
const TIME_LIMITS: Record<string, number> = {
  "pittexto": 300,
  "polewordle": 300,
  "el-intruso": 120,
  "parrilla-bingo": 600,
};

const VALID_GAMES = ["pittexto", "polewordle", "el-intruso", "parrilla-bingo"];
const VALID_DIFFS = ["facil", "medio", "dificil", "leyenda"];

// ─── Token firmado (HMAC-SHA256) ────────────────────────────────────

type SessionPayload = {
  sessionId: string;
  uid: string;
  gameId: string;
  difficulty: Difficulty;
  today: string;
  startedAt: number;
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
    const { difficulty, userId, displayName, countryCode, clientDateKey } = req.body as {
      difficulty: Difficulty;
      userId?: string;
      displayName?: string;
      countryCode?: string;
      clientDateKey?: string;
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

    if (ipUsable) {
      // Regla nueva: SOLO 1 usuario por IP por día en el ranking.
      // Si otro userId ya registró CUALQUIER attempt hoy desde esta IP,
      // el nuevo usuario no puede registrar. Esto evita crear cuentas nuevas
      // desde la misma IP para inflar rankings, pero permite jugar
      // localmente con amigos (comparando resultados presencialmente).
      const ipCheck = await query(
        `SELECT user_id FROM attempts
         WHERE ip_address = $1 AND date_key = $2
         AND user_id != $3
         LIMIT 1`,
        [clientIp, today, uid],
      );
      if (ipCheck.rows.length > 0) {
        reply.code(403).send({
          error: "Ya se registró otro jugador desde esta conexión hoy",
        });
        return;
      }

      // Verificar que no haya una sesión activa (no consumida) desde esta IP
      // hoy con otro usuario.
      const sessionIpCheck = await query(
        `SELECT user_id FROM sessions
         WHERE ip_address = $1 AND date_key = $2
         AND user_id != $3 AND NOT consumed AND expires_at > $4
         LIMIT 1`,
        [clientIp, today, uid, Date.now()],
      );
      if (sessionIpCheck.rows.length > 0) {
        reply.code(403).send({
          error: "Ya hay una partida activa desde esta conexión con otro jugador",
        });
        return;
      }
    }

    // Upsert usuario (nombre sanitizado, país ya validado arriba).
    const name = sanitizeDisplayName(displayName);
    await query(
      `INSERT INTO users (id, display_name, country_code)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         display_name = COALESCE(NULLIF($2, ''), users.display_name),
         country_code = COALESCE($3, users.country_code)`,
      [uid, name, country],
    );

    // Crear sesión firmada (con IP)
    const startedAt = Date.now();
    const expiresAt = startedAt + SESSION_TTL;
    const sessionId = randomUUID();

    const payload: SessionPayload = {
      sessionId, uid, gameId, difficulty, today, startedAt,
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
      solution: Record<string, unknown>;
    };

    if (!isPlausibleToken(sessionToken)) {
      reply.code(422).send({ error: "sessionToken inválido" });
      return;
    }
    if (!isPlausibleSolution(solution)) {
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
    const verifyResult = verifyChallenge(
      gameId,
      session.difficulty,
      session.today,
      solution as any,
    );

    const timeSeconds = Math.round((now - session.startedAt) / 1000);
    // Sin tiempo mínimo: si la verificación server dice que es correcto, es válido.
    const flagged = false;

    const timeLimit = TIME_LIMITS[gameId] ?? 300;
    const points = computeScore({
      won: verifyResult.won,
      difficulty: session.difficulty,
      timeSeconds,
      timeLimit,
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
          `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [uid, gameId, session.today, session.difficulty, verifyResult.won, timeSeconds, points, flagged, clientIp],
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
         WHERE won AND NOT flagged
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
       WHERE a.won AND NOT a.flagged
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
       WHERE a.won AND NOT a.flagged
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

    const adminSecret = process.env.ADMIN_SECRET || "boxdailybox-debug-2026";
    // Comparación timing-safe para evitar timing attacks sobre el secreto.
    const a = Buffer.from(String(provided));
    const b = Buffer.from(adminSecret);
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

    // Construir UPDATE / INSERT
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
 * GET /user/:userId/attempts?date=YYYY-MM-DD
 *
 * Devuelve los attempts del usuario para una fecha específica.
 * Usado para sincronizar el estado local con el server después de login
 * o al cargar la home.
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

    const { date } = req.query as { date?: string };
    const dateKey = typeof date === "string" && isValidDateKey(date)
      ? date
      : new Date().toISOString().slice(0, 10);

    const rows = await query(
      `SELECT game_id, difficulty, won, time_seconds, points, created_at
       FROM attempts
       WHERE user_id = $1 AND date_key = $2
       ORDER BY created_at DESC`,
      [userId, dateKey],
    );

    reply.code(200).send({
      dateKey,
      attempts: rows.rows.map((r) => ({
        gameId: r.game_id,
        difficulty: r.difficulty,
        won: r.won,
        timeSeconds: r.time_seconds,
        points: r.points,
        finishedAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error("getUserAttempts error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}
