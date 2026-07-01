// src/api/index.ts
//
// Servidor Fastify de Box Daily Box con defensa en profundidad:
//  - Helmet: headers de seguridad HTTP
//  - Rate limiting: global + por-ruta (anti DoS / brute force)
//  - Body size limit: rechaza payloads gigantes
//  - CORS estricto: solo orígenes conocidos
//  - trustProxy: IP real detrás del proxy de Railway

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { initializeDatabase, cleanupExpiredSessions } from "./db";
import {
  startChallenge,
  finishChallenge,
  getRankingMonthly,
  getRankingDaily,
  adminDebug,
} from "./routes";

const app = Fastify({
  logger: {
    level: "info",
    redact: ["req.headers.authorization", "req.headers.cookie"],
  },
  // Railway usa proxy: IP real del cliente (para rate-limit e IP-tracking).
  trustProxy: true,
  // Body máximo 16 KB. Nuestro payload más grande (grid bingo) es < 1 KB.
  // Frena ataques de payloads gigantes que agotan memoria.
  bodyLimit: 16 * 1024,
  // Cierra conexiones que cuelgan (slowloris).
  connectionTimeout: 30_000,
});

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  console.error(
    "❌ FATAL: FRONTEND_URL no configurado. Define en Railway variables.",
  );
  process.exit(1);
}
const ALLOWED_ORIGINS = FRONTEND_URL.split(",").map((s) => s.trim());

const requireDb = async (_req: any, reply: any) => {
  if (!dbReady) {
    reply.code(503).send({ error: "DB no lista, reintenta en unos segundos" });
  }
};

async function start(): Promise<void> {
  // ─── Helmet: headers de seguridad ─────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // API pura, no sirve HTML
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });

  // ─── CORS estricto ────────────────────────────────────────────────
  await app.register(cors, {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: false, // no usamos cookies
    maxAge: 86400,
  });

  // ─── Rate limiting global ─────────────────────────────────────────
  // 100 req/min por IP: suficiente para uso normal, frena floods.
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: () => ({
      error: "Demasiadas solicitudes. Esperá un momento e intentá de nuevo.",
    }),
    addHeadersOnExceeding: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
  });

  // ─── Health check ─────────────────────────────────────────────────
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  // ─── Rutas con rate-limits específicos ────────────────────────────
  app.post(
    "/challenges/:gameId/start",
    {
      preHandler: requireDb,
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    },
    startChallenge as any,
  );

  app.post(
    "/challenges/:gameId/finish",
    {
      preHandler: requireDb,
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    },
    finishChallenge as any,
  );

  app.get(
    "/ranking/monthly",
    {
      preHandler: requireDb,
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    },
    getRankingMonthly as any,
  );

  app.get(
    "/ranking/daily",
    {
      preHandler: requireDb,
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    },
    getRankingDaily as any,
  );

  app.get(
    "/admin/debug",
    {
      preHandler: requireDb,
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    adminDebug as any,
  );

  // ─── Inicializar BD en background ─────────────────────────────────
  initializeDatabase()
    .then(() => {
      dbReady = true;
      console.log("✅ Database ready");
      // Limpieza inicial + cada hora, de sesiones expiradas.
      cleanupExpiredSessions().catch(() => {});
      setInterval(() => {
        cleanupExpiredSessions()
          .then((n) => {
            if (n > 0) console.log(`🧹 ${n} sesiones expiradas eliminadas`);
          })
          .catch(() => {});
      }, 60 * 60 * 1000); // cada hora
    })
    .catch((err) => {
      console.error("⚠️  Database init error:", err);
    });

  const PORT = parseInt(process.env.PORT ?? "3000", 10);
  const HOST = "0.0.0.0";

  await app.listen({ port: PORT, host: HOST });
  console.log(`✅ Server running on port ${PORT}`);
}

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

export default app;
