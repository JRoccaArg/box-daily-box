// src/api/routes.ts
//
// Endpoints del backend de Box Daily Box.
// Verificación server-authoritative con tokens firmados HMAC.

import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID, createHmac } from "crypto";
import { query, transaction } from "./db";
import { verifyChallenge } from "./verify";
import { computeScore } from "../lib/scoring";
import type { Difficulty } from "../types";

const SESSION_TTL = 15 * 60 * 1000; // 15 minutos

// Secreto para firmar tokens (configurable via env).
const TOKEN_SECRET = process.env.TOKEN_SECRET || "bdb-token-secret-2026-change-me";

// Tiempo mínimo plausible por juego (segundos).
const MIN_PLAUSIBLE: Record<string, number> = {
  "pittexto": 5,
  "polewordle": 8,
  "el-intruso": 3,
  "parrilla-bingo": 10,
};

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
  // Comparación timing-safe (longitud fija de hex digest).
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return null;
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

    // Usar la fecha LOCAL del cliente si es valida (±1 dia de UTC).
    // Esto evita que a las 11 PM Argentina (2 AM UTC) el server use
    // una fecha distinta a la que el frontend usa para generar el puzzle.
    const utcToday = new Date().toISOString().substring(0, 10);
    let today = utcToday;
    if (clientDateKey && /^\d{4}-\d{2}-\d{2}$/.test(clientDateKey)) {
      const clientMs = new Date(clientDateKey + "T12:00:00Z").getTime();
      const utcMs = new Date(utcToday + "T12:00:00Z").getTime();
      const diffDays = Math.abs(clientMs - utcMs) / 86_400_000;
      if (diffDays <= 1) {
        today = clientDateKey;
      }
    }
    const uid = userId || `anon-${randomUUID()}`;

    // Verificar que no jugó ya hoy
    const existing = await query(
      "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3",
      [uid, gameId, today],
    );
    if (existing.rows.length > 0) {
      reply.code(409).send({ error: "Ya jugaste este reto hoy" });
      return;
    }

    // Upsert usuario (actualiza nombre/pais si cambió)
    const name = (displayName || "").trim().substring(0, 30) || "Anónimo";
    const country = countryCode?.trim().substring(0, 3) || null;
    await query(
      `INSERT INTO users (id, display_name, country_code)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         display_name = COALESCE(NULLIF($2, ''), users.display_name),
         country_code = COALESCE($3, users.country_code)`,
      [uid, name, country],
    );

    // Crear sesión firmada
    const startedAt = Date.now();
    const expiresAt = startedAt + SESSION_TTL;
    const sessionId = randomUUID();

    const payload: SessionPayload = {
      sessionId, uid, gameId, difficulty, today, startedAt,
    };
    const sessionToken = signToken(payload);

    await query(
      `INSERT INTO sessions (id, user_id, game_id, difficulty, date_key, started_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionId, uid, gameId, difficulty, today, startedAt, expiresAt],
    );

    reply.code(200).send({
      puzzle: { gameId, difficulty, dateKey: today },
      sessionToken,
      serverNow: startedAt,
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

    if (!sessionToken || !solution) {
      reply.code(422).send({ error: "Faltan sessionToken o solution" });
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
    const minTime = MIN_PLAUSIBLE[gameId] ?? 3;
    const flagged = verifyResult.won && timeSeconds < minTime;

    const timeLimit = TIME_LIMITS[gameId] ?? 300;
    const points = computeScore({
      won: verifyResult.won,
      difficulty: session.difficulty,
      timeSeconds,
      timeLimit,
    });

    const uid = session.uid;

    // Guardar attempt
    let duplicated = false;
    try {
      await transaction(async (client) => {
        await client.query(
          "UPDATE sessions SET consumed = true WHERE id = $1",
          [session.sessionId],
        );
        await client.query(
          `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uid, gameId, session.today, session.difficulty, verifyResult.won, timeSeconds, points, flagged],
        );
      });
    } catch (err: any) {
      if (err.code === "23505") {
        duplicated = true;
      } else {
        throw err;
      }
    }

    // Puntos del mes
    const monthResult = await query(
      `SELECT SUM(points) as total FROM attempts
       WHERE user_id = $1 AND won AND NOT flagged
       AND date_trunc('month', date_key) = date_trunc('month', $2::date)`,
      [uid, session.today],
    );
    const totalMonth = Number(monthResult.rows[0]?.total ?? 0);

    // Posición en ranking
    const rankResult = await query(
      `WITH user_scores AS (
         SELECT user_id, SUM(points) as score
         FROM attempts
         WHERE won AND NOT flagged
         AND date_trunc('month', date_key) = date_trunc('month', $1::date)
         GROUP BY user_id
       )
       SELECT COUNT(*) as rank FROM user_scores WHERE score > $2`,
      [session.today, totalMonth],
    );
    const rank = Number(rankResult.rows[0]?.rank ?? 0) + 1;

    reply.code(200).send({
      won: flagged ? false : verifyResult.won,
      points: flagged ? 0 : points,
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
    const target = month
      ? `${month}-01`
      : new Date().toISOString().substring(0, 7) + "-01";

    const countryFilter = country?.trim().substring(0, 3) || null;

    const topResult = await query(
      `SELECT u.id, u.display_name, u.country_code,
              SUM(a.points) as points,
              COUNT(a.id) as games_won,
              COUNT(DISTINCT a.date_key) as days_played
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       WHERE a.won AND NOT a.flagged
       AND date_trunc('month', a.date_key) = date_trunc('month', $1::date)
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
    const target = date || new Date().toISOString().substring(0, 10);
    const countryFilter = country?.trim().substring(0, 3) || null;

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
    const { secret } = req.query as { secret?: string };
    const adminSecret = process.env.ADMIN_SECRET || "boxdailybox-debug-2026";
    if (secret !== adminSecret) {
      reply.code(403).send({ error: "Acceso denegado" });
      return;
    }

    const usersCount = await query("SELECT COUNT(*) as count FROM users");
    const attemptsCount = await query("SELECT COUNT(*) as count FROM attempts");
    const sessionsCount = await query("SELECT COUNT(*) as count FROM sessions");
    const flaggedCount = await query("SELECT COUNT(*) as count FROM attempts WHERE flagged");

    const recentAttempts = await query(
      `SELECT a.user_id, a.game_id, a.date_key, a.difficulty, a.won,
              a.time_seconds, a.points, a.flagged, a.created_at,
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
       AND date_trunc('month', a.date_key) = date_trunc('month', CURRENT_DATE)
       GROUP BY u.id, u.display_name, u.country_code
       ORDER BY points DESC
       LIMIT 10`,
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
    });
  } catch (err) {
    console.error("adminDebug error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}
