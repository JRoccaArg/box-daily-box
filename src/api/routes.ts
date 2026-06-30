// src/api/routes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "crypto";
import { query, transaction } from "./db";
import { verifyChallenge } from "./verify";
import { computeScore } from "../lib/scoring";
import { dateKey } from "../lib/seed";
import type { Difficulty } from "../types";

const HMAC_SECRET = process.env.HMAC_SECRET || "dev-secret-unsafe";
const SESSION_TTL = 15 * 60 * 1000; // 15 minutos

/**
 * Firma un sessionToken con HMAC (stateless).
 */
function signToken(
  userId: string,
  gameId: string,
  difficulty: Difficulty,
  dateKey: string,
  startedAt: number
): string {
  // En producción, usar crypto.sign() con HMAC-SHA256
  // Por ahora, base64 simple
  const payload = JSON.stringify({
    userId,
    gameId,
    difficulty,
    dateKey,
    startedAt,
    nonce: randomUUID(),
  });
  return Buffer.from(payload).toString("base64");
}

/**
 * POST /challenges/:gameId/start
 * Inicia un reto: devuelve puzzle + sessionToken
 */
export async function startChallenge(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { gameId } = req.params as { gameId: string };
    const { difficulty, userId } = req.body as {
      difficulty: Difficulty;
      userId?: string;
    };

    if (!difficulty || !["facil", "medio", "dificil", "leyenda"].includes(difficulty)) {
      return reply.code(422).send({ error: "Invalid difficulty" });
    }

    const today = dateKey(new Date());

    // Si no hay userId (anónimo), generar uno temporal
    const uid = userId || `anon-${randomUUID()}`;

    // Verificar que no jugó ya hoy
    const existing = await query(
      "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3",
      [uid, gameId, today]
    );

    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: "Already played today" });
    }

    // Generar puzzle (determinista por gameId + fecha + difficulty)
    // Para que sea determinista, importamos buildBingo, buildWordle, etc.
    // Por ahora, devolvemos un puzzle placeholder
    const puzzle = { gameId, difficulty, dateKey: today };

    // Crear sesión
    const startedAt = Date.now();
    const expiresAt = startedAt + SESSION_TTL;
    const sessionToken = signToken(uid, gameId, difficulty, today, startedAt);

    // Guardar sesión en DB (para validar después)
    await query(
      `INSERT INTO sessions (id, user_id, game_id, difficulty, date_key, started_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [randomUUID(), uid, gameId, difficulty, today, startedAt, expiresAt]
    );

    return reply.code(200).send({
      puzzle,
      sessionToken,
      serverNow: startedAt,
    });
  } catch (err) {
    console.error("startChallenge error:", err);
    return reply.code(500).send({ error: "Internal server error" });
  }
}

/**
 * POST /challenges/:gameId/finish
 * Termina un reto: valida, calcula puntos, guarda attempt
 */
export async function finishChallenge(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { gameId } = req.params as { gameId: string };
    const { sessionToken, solution, userId } = req.body as {
      sessionToken: string;
      solution: any;
      userId?: string;
    };

    if (!sessionToken || !solution) {
      return reply.code(422).send({ error: "Missing sessionToken or solution" });
    }

    // Decodificar sesión
    let session: any;
    try {
      const payload = JSON.parse(Buffer.from(sessionToken, "base64").toString());
      session = payload;
    } catch {
      return reply.code(403).send({ error: "Invalid sessionToken" });
    }

    // Validar que no expiró
    const now = Date.now();
    if (session.startedAt + SESSION_TTL < now) {
      return reply.code(410).send({ error: "Session expired" });
    }

    // Validar sesión no usada
    const sessionRow = await query(
      "SELECT consumed FROM sessions WHERE user_id = $1 AND game_id = $2 AND date_key = $3",
      [session.userId, gameId, session.dateKey]
    );

    if (sessionRow.rows.length === 0) {
      return reply.code(403).send({ error: "Session not found" });
    }

    if (sessionRow.rows[0]!.consumed) {
      return reply.code(409).send({ error: "Session already used" });
    }

    // Medir tiempo
    const timeSeconds = Math.round((now - session.startedAt) / 1000);

    // Verificar solución
    const { won } = verifyChallenge(gameId, session.difficulty, session.dateKey, solution);

    // Calcular puntos
    const points = computeScore({
      won,
      difficulty: session.difficulty,
      timeSeconds,
      timeLimit: 150, // Ajustar según juego
    });

    // Anti-abuso: marcar si tiempo es sospechosamente rápido
    const MIN_PLAUSIBLE: Record<string, number> = {
      "pit-texto": 5,
      "pole-wordle": 10,
      "el-intruso": 8,
      "parrilla-bingo": 3,
    };
    const flagged = won && timeSeconds < (MIN_PLAUSIBLE[gameId] ?? 5);

    // Crear usuario si no existe
    const uid = session.userId;
    await query(
      "INSERT INTO users (id, display_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
      [uid, uid.startsWith("anon-") ? "Anonymous" : uid]
    );

    // Guardar attempt (idempotente)
    const result = await transaction(async (client) => {
      // Marcar sesión como usada
      await client.query("UPDATE sessions SET consumed = true WHERE user_id = $1 AND game_id = $2", [
        uid,
        gameId,
      ]);

      // Insertar attempt
      try {
        await client.query(
          `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uid, gameId, session.dateKey, session.difficulty, won, timeSeconds, points, flagged]
        );
      } catch (err: any) {
        if (err.code === "23505") {
          // UNIQUE violation: ya existe este attempt
          return { status: "duplicate" };
        }
        throw err;
      }

      return { status: "ok" };
    });

    // Ranking del mes
    const monthResult = await query(
      `SELECT SUM(points) as total FROM attempts 
       WHERE user_id = $1 AND won AND NOT flagged 
       AND date_trunc('month', date_key) = date_trunc('month', $2::date)`,
      [uid, session.dateKey]
    );

    const totalPoints = Number(monthResult.rows[0]?.total ?? 0);

    // Ranking global del mes
    const rankResult = await query(
      `SELECT COUNT(DISTINCT user_id) as rank FROM attempts
       WHERE won AND NOT flagged
       AND date_trunc('month', date_key) = date_trunc('month', $1::date)
       AND (
         SELECT SUM(points) FROM attempts a2 
         WHERE a2.user_id = a2.user_id AND a2.won AND NOT a2.flagged
         AND date_trunc('month', a2.date_key) = date_trunc('month', $1::date)
       ) > (
         SELECT SUM(points) FROM attempts a3
         WHERE a3.user_id = $2 AND a3.won AND NOT a3.flagged
         AND date_trunc('month', a3.date_key) = date_trunc('month', $1::date)
       )`,
      [session.dateKey, uid]
    );

    const rank = Number(rankResult.rows[0]?.rank ?? 0) + 1;

    return reply.code(200).send({
      won: flagged ? false : won, // Si está marcado, mostrar como derrota
      points: flagged ? 0 : points,
      totalMonth: totalPoints,
      rank,
      flagged,
    });
  } catch (err) {
    console.error("finishChallenge error:", err);
    return reply.code(500).send({ error: "Internal server error" });
  }
}

/**
 * GET /ranking/monthly?month=YYYY-MM
 * Devuelve ranking del mes
 */
export async function getRankingMonthly(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { month } = req.query as { month?: string };

    const target = month ? `${month}-01` : new Date().toISOString().substring(0, 7) + "-01";

    // Top 50
    const topResult = await query(
      `SELECT u.id, u.display_name, SUM(a.points) as points, COUNT(a.id) as games_won
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       WHERE a.won AND NOT a.flagged
       AND date_trunc('month', a.date_key) = date_trunc('month', $1::date)
       GROUP BY u.id, u.display_name
       ORDER BY points DESC
       LIMIT 50`,
      [target]
    );

    const top = topResult.rows.map((row, idx) => ({
      rank: idx + 1,
      userId: row.id,
      displayName: row.display_name,
      points: Number(row.points),
      gamesWon: Number(row.games_won),
    }));

    return reply.code(200).send({
      month: target.substring(0, 7),
      top,
    });
  } catch (err) {
    console.error("getRankingMonthly error:", err);
    return reply.code(500).send({ error: "Internal server error" });
  }
}
