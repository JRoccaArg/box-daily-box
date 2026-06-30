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

// Initialize DB on startup
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
app.post("/challenges/:gameId/start", startChallenge as any);
app.post("/challenges/:gameId/finish", finishChallenge as any);
app.get("/ranking/monthly", getRankingMonthly as any);

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
