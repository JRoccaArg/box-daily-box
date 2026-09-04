// src/api/identity-token.ts
//
// Token de identidad firmado (HMAC-SHA256) que prueba la posesión de un userId.
//
// Problema que resuelve: sin esto, cualquiera podría enviar
// POST /user/{cualquier-id}/profile y modificar el perfil de otro usuario,
// porque el userId viaja en texto plano y no hay sesión.
//
// Cómo funciona:
//  1. El frontend pide un identityToken al server (GET /user/:userId/token)
//     la primera vez, o cuando no tiene uno.
//  2. El server firma { userId } con HMAC y devuelve el token.
//  3. Para operaciones sensibles (update profile), el frontend manda el token.
//  4. El server verifica que el token es válido Y que su userId coincide con
//     el userId de la operación.
//
// IMPORTANTE (auditoría 2026-09): el userId SÍ es público — `/ranking/monthly`
// y `/ranking/daily` lo devuelven para cada jugador (el frontend lo usa para
// resaltarte y para el botón "agregar amigo"). Por eso el userId NO puede
// tratarse como un secreto: la única prueba de identidad es este token, y
// `startChallenge` debe exigirlo para todo userId que ya exista (antes lo
// emitía a demanda para cualquier userId recibido, lo que permitía tomar
// control de la cuenta de cualquiera que apareciera en el ranking).
//
// VENCIMIENTO: los tokens valen `TOKEN_TTL_MS` (1 año) desde su emisión y se
// RENUEVAN solos en cada operación donde el portador prueba la propiedad. Un
// jugador activo (esto es un juego diario) nunca lo nota; un token filtrado
// deja de servir eventualmente.

import { createHmac, timingSafeEqual } from "crypto";
import { TOKEN_SECRET } from "./secrets";

/** Vida del token de identidad: 1 año desde `iat`, con renovación automática. */
export const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000;

type IdentityPayload = {
  userId: string;
  /** Timestamp de emisión. Se usa para expirar/rotar el token. */
  iat: number;
};

/** Firma un token de identidad para un userId. */
export function signIdentityToken(userId: string): string {
  const payload: IdentityPayload = { userId, iat: Date.now() };
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64");
  const sig = createHmac("sha256", TOKEN_SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

/**
 * Verifica un token de identidad y devuelve el userId que contiene, o null
 * si el token es inválido o está malformado.
 */
export function verifyIdentityToken(token: unknown): string | null {
  if (typeof token !== "string") return null;
  if (token.length < 20 || token.length > 4096) return null;

  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;

  const data = token.substring(0, dot);
  const sig = token.substring(dot + 1);
  const expected = createHmac("sha256", TOKEN_SECRET).update(data).digest("hex");

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64").toString()) as IdentityPayload;
    if (typeof payload.userId !== "string") return null;
    // Vencimiento. Un token sin `iat` (o con uno no numérico) es de un formato
    // que ya no emitimos: se rechaza en vez de tratarse como eterno.
    if (typeof payload.iat !== "number" || !Number.isFinite(payload.iat)) return null;
    if (Date.now() - payload.iat > TOKEN_TTL_MS) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

/**
 * Verifica que el token pertenece al userId esperado.
 * @returns true si el token es válido Y su userId coincide con expectedUserId.
 */
export function ownsIdentity(token: unknown, expectedUserId: string): boolean {
  const tokenUserId = verifyIdentityToken(token);
  if (!tokenUserId) return false;
  // Comparación directa (los userId no son secretos, no necesita timing-safe).
  return tokenUserId === expectedUserId;
}
