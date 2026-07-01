// src/api/index.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { initializeDatabase } from "./db";
import {
  startChallenge,
  finishChallenge,
  getRankingMonthly,
  getRankingDaily,
  adminDebug,
} from "./routes";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : [
        "https://box-daily-box.vercel.app",
        "https://boxdailybox.com",
        "https://www.boxdailybox.com",
      ],
});

app.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

// BD en background (sin bloquear startup)
let dbReady = false;
initializeDatabase()
  .then(() => {
    dbReady = true;
    console.log("✅ Database ready");
  })
  .catch((err) => {
    console.error("⚠️  Database init error:", err);
  });

const requireDb = async (_req: any, reply: any) => {
  if (!dbReady) {
    reply.code(503).send({ error: "DB no lista, reintenta en unos segundos" });
  }
};

// Routes
app.post("/challenges/:gameId/start", { preHandler: requireDb }, startChallenge as any);
app.post("/challenges/:gameId/finish", { preHandler: requireDb }, finishChallenge as any);
app.get("/ranking/monthly", { preHandler: requireDb }, getRankingMonthly as any);
app.get("/ranking/daily", { preHandler: requireDb }, getRankingDaily as any);
app.get("/admin/debug", { preHandler: requireDb }, adminDebug as any);

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
