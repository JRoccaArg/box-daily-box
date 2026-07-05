/**
 * Cliente API — comunicacion con el backend de Box Daily Box.
 *
 * Todas las llamadas son fire-and-forget para la UX: si el backend falla,
 * el juego sigue funcionando localmente. Los resultados del servidor se
 * usan para ranking global, no para bloquear gameplay.
 */

import { getIdentity, setIdentityToken } from "./identity";
import { dateKey } from "./seed";

const API_URL = import.meta.env.VITE_API_URL ?? "";

type StartResponse = {
  puzzle: { gameId: string; difficulty: string; dateKey: string };
  sessionToken: string;
  serverNow: number;
  identityToken?: string;
};

type FinishResponse = {
  won: boolean;
  points: number;
  timeSeconds: number;
  totalMonth: number;
  rank: number;
  flagged: boolean;
  duplicated: boolean;
  /** Si el resultado entró al ranking (false si otra cuenta de la IP ya jugó). */
  ranked?: boolean;
};

export type RankingEntry = {
  rank: number;
  userId: string;
  displayName: string;
  countryCode: string | null;
  points: number;
  gamesWon: number;
  daysPlayed: number;
};

type RankingResponse = {
  month: string;
  top: RankingEntry[];
};

type DailyRankingResponse = {
  date: string;
  top: RankingEntry[];
};

/** Wrapper de fetch con timeout y manejo de errores.
 *  Si `preserveClientErrors` es true, devuelve el body de respuestas 4xx
 *  en lugar de null (útil para mostrar errores de validación al usuario). */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 8000,
  preserveClientErrors = false,
): Promise<T | null> {
  if (!API_URL) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.warn(`[API] ${path} → ${res.status}:`, body);
      if (preserveClientErrors && res.status >= 400 && res.status < 500) {
        return body as T;
      }
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    // No romper la app si el backend esta caido.
    if ((err as Error).name !== "AbortError") {
      console.warn(`[API] ${path} error:`, err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Endpoints ──────────────────────────────────────────────────────

/** Resultado del intento de iniciar un reto. */
export type StartResult =
  | { ok: true; sessionToken: string; serverNow: number }
  | { ok: false };

/** Inicia un reto. El server siempre permite jugar; decide internamente si
 *  el resultado será rankeable (firmado en el token). */
export async function apiStartChallenge(
  gameId: string,
  difficulty: string,
): Promise<StartResult> {
  if (!API_URL) return { ok: false };

  const { userId, displayName, countryCode } = getIdentity();
  const now = new Date();
  const clientDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const data = await apiFetch<StartResponse>(
    `/challenges/${gameId}/start`,
    {
      method: "POST",
      body: JSON.stringify({ difficulty, userId, displayName, countryCode, clientDateKey }),
    },
  );

  if (!data) return { ok: false };
  if (data.identityToken) {
    setIdentityToken(data.identityToken);
  }
  return { ok: true, sessionToken: data.sessionToken, serverNow: data.serverNow };
}

/** Envia la solucion y obtiene resultado verificado.
 *  solution puede ser null: representa abandono/timeout (perdido sin verificar). */
export async function apiFinishChallenge(
  gameId: string,
  sessionToken: string,
  solution: Record<string, unknown> | null,
): Promise<FinishResponse | null> {
  const { userId } = getIdentity();
  return apiFetch<FinishResponse>(
    `/challenges/${gameId}/finish`,
    {
      method: "POST",
      body: JSON.stringify({ sessionToken, solution, userId }),
    },
  );
}

/** Ranking mensual global. */
export async function apiGetMonthlyRanking(
  month?: string,
  country?: string,
): Promise<RankingResponse | null> {
  const params = new URLSearchParams();
  // Mes LOCAL del cliente por default (no UTC), consistente con date_key.
  params.set("month", month ?? dateKey().substring(0, 7));
  if (country) params.set("country", country);
  return apiFetch<RankingResponse>(`/ranking/monthly?${params.toString()}`);
}

/** Ranking del dia. */
export async function apiGetDailyRanking(
  date?: string,
  country?: string,
): Promise<DailyRankingResponse | null> {
  const params = new URLSearchParams();
  // Dia LOCAL del cliente por default (no UTC). Esto es lo que arreglaba el
  // ranking diario vacio despues de las 21:00 ART (UTC-3).
  params.set("date", date ?? dateKey());
  if (country) params.set("country", country);
  return apiFetch<DailyRankingResponse>(`/ranking/daily?${params.toString()}`);
}

/**
 * Endpoint genérico para POST autenticado. Usado por el módulo de auth
 * (que no puede importar apiFetch porque es privado).
 */
export async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T | null> {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ═══════════════════════════════════════════════════════════════════
// ─── Perfil del usuario ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export type UserProfile = {
  userId: string;
  displayName: string | null;
  countryCode: string | null;
  canChangeName: boolean;
  nameChangedAt: string | null;
  /** Token de identidad emitido por el server (solo en respuestas de escritura). */
  identityToken?: string;
};

/** GET /user/:userId */
export async function apiGetUserProfile(userId: string): Promise<UserProfile | null> {
  return apiFetch<UserProfile>(`/user/${encodeURIComponent(userId)}`);
}

/** POST /user/:userId/profile */
export async function apiUpdateUserProfile(
  userId: string,
  updates: { displayName?: string; countryCode?: string },
  identityToken?: string | null,
): Promise<UserProfile | { error: string; code?: string } | null> {
  return apiFetch<UserProfile | { error: string; code?: string }>(
    `/user/${encodeURIComponent(userId)}/profile`,
    {
      method: "POST",
      body: JSON.stringify({
        ...updates,
        ...(identityToken ? { identityToken } : {}),
      }),
    },
    8000,
    true, // preservar errores 4xx para mostrar "nombre en uso", "mes bloqueado", etc.
  );
}

/** GET /username-available?name=X&userId=Y
 *  Chequea si un nombre está libre. userId opcional: si es tu propio nombre,
 *  no se marca como duplicado. Devuelve null si la API no responde. */
export async function apiCheckUsernameAvailable(
  name: string,
  userId?: string,
): Promise<boolean | null> {
  const params = new URLSearchParams({ name });
  if (userId) params.set("userId", userId);
  const data = await apiFetch<{ available: boolean }>(
    `/username-available?${params.toString()}`,
  );
  if (!data) return null;
  return data.available;
}

export type ServerAttempt = {
  gameId: string;
  difficulty: string;
  won: boolean;
  timeSeconds: number;
  points: number;
  finishedAt: string; // ISO timestamp
};

export type UserAttemptsResponse = {
  dateKey: string;
  attempts: ServerAttempt[];
};

/**
 * GET /user/:userId/attempts?date=YYYY-MM-DD
 * Trae los attempts del usuario para una fecha específica.
 */
export async function apiGetUserAttempts(
  userId: string,
  date?: string,
): Promise<UserAttemptsResponse | null> {
  const params = new URLSearchParams();
  params.set("date", date ?? dateKey());
  return apiFetch<UserAttemptsResponse>(
    `/user/${encodeURIComponent(userId)}/attempts?${params.toString()}`,
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── Ranking del usuario (posición diaria) ─────────────────────────
// ═══════════════════════════════════════════════════════════════════

export type UserRank = {
  dateKey: string;
  /** Posición en el ranking diario global. null si no rankea (0 puntos). */
  rank: number | null;
  /** Puntos ganados ese día. */
  points: number;
  /** Total de jugadores rankeados ese día (contexto). */
  totalPlayers: number;
};

/** GET /user/:userId/rank?date=YYYY-MM-DD */
export async function apiGetUserRank(
  userId: string,
  date?: string,
): Promise<UserRank | null> {
  const params = new URLSearchParams();
  params.set("date", date ?? dateKey());
  return apiFetch<UserRank>(
    `/user/${encodeURIComponent(userId)}/rank?${params.toString()}`,
  );
}