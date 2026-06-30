// src/api/routes.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "crypto";
import { query, transaction } from "./db";
import { computeScore } from "../lib/scoring";
import type { Difficulty } from "../types";

const SESSION_TTL = 15 * 60 * 1000; // 15 minutos

interface StartBody {
  difficulty: Difficulty;
  userId?: string;
}

interface FinishBody {
  sessionToken: string;
  solution: Record<string, unknown>;
  userId?: string;
}

interface RankingQuery {
  month?: string;
}

export async function startChallenge(
  req: FastifyRequest<{ Body: StartBody; Params: { gameId: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { gameId } = req.params;
    const { difficulty, userId } = req.body;

    if (
      !difficulty ||
      !["facil", "medio", "dificil", "leyenda"].includes(difficulty)
    ) {
      reply.code(422).send({ error: "Invalid difficulty" });
      return;
    }

    const today = new Date().toISOString().substring(0, 10);
    const uid = userId || `anon-${randomUUID()}`;

    const existing = await query(
      "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3",
      [uid, gameId, today]
    );

    if (existing.rows.length > 0) {
      reply.code(409).send({ error: "Already played today" });
      return;
    }

    const startedAt = Date.now();
    const expiresAt = startedAt + SESSION_TTL;
    const sessionToken = Buffer.from(
      JSON.stringify({ uid, gameId, difficulty, today, startedAt })
    ).toString("base64");

    await query(
      `INSERT INTO sessions (id, user_id, game_id, difficulty, date_key, started_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [randomUUID(), uid, gameId, difficulty, today, startedAt, expiresAt]
    );

    reply.code(200).send({
      puzzle: { gameId, difficulty, dateKey: today },
      sessionToken,
      serverNow: startedAt,
    });
  } catch (err) {
    console.error("startChallenge error:", err);
    reply.code(500).send({ error: "Internal server error" });
  }
}

export async function finishChallenge(
  req: FastifyRequest<{ Body: FinishBody; Params: { gameId: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { gameId } = req.params;
    const { sessionToken, solution } = req.body;

    if (!sessionToken || !solution) {
      reply.code(422).send({ error: "Missing sessionToken or solution" });
      return;
    }

    let session: any;
    try {
      session = JSON.parse(
        Buffer.from(sessionToken, "base64").toString()
      );
    } catch {
      reply.code(403).send({ error: "Invalid sessionToken" });
      return;
    }

    const now = Date.now();
    if (session.startedAt + SESSION_TTL < now) {
      reply.code(410).send({ error: "Session expired" });
      return;
    }

    const sessionRow = await query(
      "SELECT consumed FROM sessions WHERE user_id = $1 AND game_id = $2 AND date_key = $3",
      [session.uid, gameId, session.today]
    );

    if (sessionRow.rows.length === 0) {
      reply.code(403).send({ error: "Session not found" });
      return;
    }

    if (sessionRow.rows[0]?.consumed) {
      reply.code(409).send({ error: "Session already used" });
      return;
    }

    const timeSeconds = Math.round((now - session.startedAt) / 1000);
    const won = Math.random() > 0.5; // Placeholder: verificación simple

    const points = computeScore({
      won,
      difficulty: session.difficulty,
      timeSeconds,
      timeLimit: 150,
    });

    const flagged =
      won && timeSeconds < 5;

    const uid = session.uid;

    // Crear usuario si no existe
    await query(
      "INSERT INTO users (id, display_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
      [uid, uid.startsWith("anon-") ? "Anonymous" : uid]
    );

    // Guardar attempt
    try {
      await transaction(async (client) => {
        await client.query(
          "UPDATE sessions SET consumed = true WHERE user_id = $1 AND game_id = $2",
          [uid, gameId]
        );

        try {
          await client.query(
            `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              uid,
              gameId,
              session.today,
              session.difficulty,
              won,
              timeSeconds,
              points,
              flagged,
            ]
          );
        } catch (err: any) {
          if (err.code !== "23505") throw err; // UNIQUE violation
        }
      });
    } catch (err) {
      console.error("Transaction error:", err);
      reply.code(500).send({ error: "Internal server error" });
      return;
    }

    const monthResult = await query(
      `SELECT SUM(points) as total FROM attempts 
       WHERE user_id = $1 AND won AND NOT flagged 
       AND date_trunc('month', date_key) = date_trunc('month', $2::date)`,
      [uid, session.today]
    );

    const totalPoints = Number(monthResult.rows[0]?.total ?? 0);

    reply.code(200).send({
      won: flagged ? false : won,
      points: flagged ? 0 : points,
      totalMonth: totalPoints,
      rank: 1,
      flagged,
    });
  } catch (err) {
    console.error("finishChallenge error:", err);
    reply.code(500).send({ error: "Internal server error" });
  }
}

export async function getRankingMonthly(
  req: FastifyRequest<{ Querystring: RankingQuery }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { month } = req.query;
    const target = month
      ? `${month}-01`
      : new Date().toISOString().substring(0, 7) + "-01";

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

    const top = topResult.rows.map((row: any, idx: number) => ({
      rank: idx + 1,
      userId: row.id,
      displayName: row.display_name,
      points: Number(row.points ?? 0),
      gamesWon: Number(row.games_won ?? 0),
    }));

    reply.code(200).send({
      month: target.substring(0, 7),
      top,
    });
  } catch (err) {
    console.error("getRankingMonthly error:", err);
    reply.code(500).send({ error: "Internal server error" });
  }
}
