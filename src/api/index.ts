// src/api/index.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { initializeDatabase, getDb } from "./db";
import { startChallenge, finishChallenge, getRankingMonthly } from "./routes";

const app = Fastify({ logger: true });

// CORS
app.register(cors, {
  origin: process.env.FRONTEND_URL || "https://box-daily-box.vercel.app",
});

// Health check
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Inicializar DB
app.addHook("onReady", async () => {
  try {
    await initializeDatabase();
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    process.exit(1);
  }
});

// Routes
app.post("/challenges/:gameId/start", startChallenge);
app.post("/challenges/:gameId/finish", finishChallenge);
app.get("/ranking/monthly", getRankingMonthly);

// Start server
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const HOST = "0.0.0.0";

app.listen({ port: PORT, host: HOST }, (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`✅ Server listening at ${addr}`);
});

export default app;
