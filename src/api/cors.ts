import type { FastifyCorsOptions } from '@fastify/cors';

/** Browser headers used by the authenticated API client, including staging's date override. */
export function apiCorsOptions(origins: string[]): FastifyCorsOptions {
 return {
  origin: origins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Identity-Token', 'X-Debug-Date'],
  credentials: false,
  maxAge: 86400,
 };
}
