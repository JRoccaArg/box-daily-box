/**
 * Override de fecha SOLO STAGING (roadmap Box_Daily_Box_Roadmap.md #1).
 *
 * Gateado por la variable de entorno STAGING_DEBUG, seteada UNICAMENTE en el
 * servicio de Railway de staging (nunca en producción — son servicios
 * separados). Si la variable no está en 'true', el header X-Debug-Date se
 * ignora por completo: un cliente que lo mande en producción no tiene efecto
 * alguno, porque `process.env.STAGING_DEBUG` ahí ni existe.
 */
import type { FastifyRequest } from "fastify";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isStagingDebugEnabled(): boolean {
  return process.env.STAGING_DEBUG === "true";
}

/** Fecha "actual" para esta request: honra X-Debug-Date solo si STAGING_DEBUG. */
export function resolveNow(req: FastifyRequest): Date {
  if (isStagingDebugEnabled()) {
    const header = req.headers["x-debug-date"];
    const value = typeof header === "string" ? header : undefined;
    if (value && DATE_KEY_RE.test(value)) {
      return new Date(`${value}T12:00:00.000Z`);
    }
  }
  return new Date();
}
