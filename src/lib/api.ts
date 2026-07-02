/**
 * Cliente API — comunicacion con el backend de Box Daily Box.
 *
 * Todas las llamadas son fire-and-forget para la UX: si el backend falla,
 * el juego sigue funcionando localmente. Los resultados del servidor se
 * usan para ranking global, no para bloquear gameplay.
 */

import { getIdentity } from "./identity";

const API_URL = import.meta.env.VITE_API_URL ?? "";

type StartResponse = {
  puzzle: { gameId: string; difficulty: string; dateKey: string };
  sessionToken: string;
  serverNow: number;
};

type FinishResponse = {
  won: boolean;
  points: number;
  timeSeconds: number;
  totalMonth: number;
  rank: number;
  flagged: boolean;
  duplicated: boolean;
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

/** Wrapper de fetch con timeout y manejo de errores. */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 8000,
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

/** Inicia un reto. Devuelve sessionToken + serverNow o null si falla. */
export async function apiStartChallenge(
  gameId: string,
  difficulty: string,
): Promise<{ sessionToken: string; serverNow: number } | null> {
  const { userId, displayName, countryCode } = getIdentity();
  // Enviar la fecha LOCAL del cliente para evitar mismatch de timezone.
  const now = new Date();
  const clientDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const data = await apiFetch<StartResponse>(
    `/challenges/${gameId}/start`,
    {
      method: "POST",
      body: JSON.stringify({ difficulty, userId, displayName, countryCode, clientDateKey }),
    },
  );
  if (!data) return null;
  return { sessionToken: data.sessionToken, serverNow: data.serverNow };
}

/** Envia la solucion y obtiene resultado verificado. */
export async function apiFinishChallenge(
  gameId: string,
  sessionToken: string,
  solution: Record<string, unknown>,
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
  if (month) params.set("month", month);
  if (country) params.set("country", country);
  const qs = params.toString();
  return apiFetch<RankingResponse>(`/ranking/monthly${qs ? `?${qs}` : ""}`);
}

/** Ranking del dia. */
export async function apiGetDailyRanking(
  date?: string,
  country?: string,
): Promise<DailyRankingResponse | null> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (country) params.set("country", country);
  const qs = params.toString();
  return apiFetch<DailyRankingResponse>(`/ranking/daily${qs ? `?${qs}` : ""}`);
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
};

/** GET /user/:userId */
export async function apiGetUserProfile(userId: string): Promise<UserProfile | null> {
  return apiFetch<UserProfile>(`/user/${encodeURIComponent(userId)}`);
}

/** POST /user/:userId/profile */
export async function apiUpdateUserProfile(
  userId: string,
  updates: { displayName?: string; countryCode?: string },
): Promise<UserProfile | { error: string } | null> {
  return apiFetch<UserProfile | { error: string }>(
    `/user/${encodeURIComponent(userId)}/profile`,
    {
      method: "POST",
      body: JSON.stringify(updates),
    },
  );
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
  if (date) params.set("date", date);
  const qs = params.toString();
  return apiFetch<UserAttemptsResponse>(
    `/user/${encodeURIComponent(userId)}/attempts${qs ? `?${qs}` : ""}`,
  );
}
