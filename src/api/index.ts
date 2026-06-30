// src/api/index.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { initializeDatabase } from "./db";
import { startChallenge, finishChallenge, getRankingMonthly } from "./routes";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.FRONTEND_URL || "https://box-daily-box.vercel.app",
});

// Health check
app.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

// Inicializar BD en background (sin bloquear)
let dbReady = false;
initializeDatabase()
  .then(() => {
    dbReady = true;
    console.log("✅ Database ready");
  })
  .catch((err) => {
    console.error("⚠️  Database init error (will retry on requests):", err);
  });

// Routes
app.post("/challenges/:gameId/start", async (req, reply) => {
  if (!dbReady) {
    return reply.code(503).send({ error: "DB not ready" });
  }
  return (startChallenge as any)(req, reply);
});

app.post("/challenges/:gameId/finish", async (req, reply) => {
  if (!dbReady) {
    return reply.code(503).send({ error: "DB not ready" });
  }
  return (finishChallenge as any)(req, reply);
});

app.get("/ranking/monthly", async (req, reply) => {
  if (!dbReady) {
    return reply.code(503).send({ error: "DB not ready" });
  }
  return (getRankingMonthly as any)(req, reply);
});

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const HOST = "0.0.0.0";

app.listen({ port: PORT, host: HOST }, (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`✅ Server running at ${addr}`);
});

export default app;