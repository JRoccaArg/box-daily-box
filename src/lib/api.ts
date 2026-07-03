/**
 * Cliente API — comunicacion con el backend de Box Daily Box.
 *
 * Todas las llamadas son fire-and-forget para la UX: si el backend falla,
 * el juego sigue funcionando localmente. Los resultados del servidor se
 * usan para ranking global, no para bloquear gameplay.
 */

import { getIdentity, setIdentityToken } from "./identity";

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

/** Resultado del intento de iniciar un reto. */
export type StartResult =
  | { ok: true; sessionToken: string; serverNow: number }
  | { ok: false; reason: "blocked" | "error"; message?: string };

/** Inicia un reto. Distingue el bloqueo por IP (403) de otros errores. */
export async function apiStartChallenge(
  gameId: string,
  difficulty: string,
): Promise<StartResult> {
  if (!API_URL) return { ok: false, reason: "error" };

  const { userId, displayName, countryCode } = getIdentity();
  // Enviar la fecha LOCAL del cliente para evitar mismatch de timezone.
  const now = new Date();
  const clientDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_URL}/challenges/${gameId}/start`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty, userId, displayName, countryCode, clientDateKey }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      // 403 = bloqueo por IP (otra cuenta ya jugó desde esta conexión hoy).
      if (res.status === 403) {
        return { ok: false, reason: "blocked", message: body?.error };
      }
      return { ok: false, reason: "error", message: body?.error };
    }

    const data = (await res.json()) as StartResponse;
    // Guardar el identityToken emitido: prueba de posesión del userId.
    if (data.identityToken) {
      setIdentityToken(data.identityToken);
    }
    return { ok: true, sessionToken: data.sessionToken, serverNow: data.serverNow };
  } catch {
    return { ok: false, reason: "error" };
  } finally {
    clearTimeout(timer);
  }
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
): Promise<UserProfile | { error: string } | null> {
  return apiFetch<UserProfile | { error: string }>(
    `/user/${encodeURIComponent(userId)}/profile`,
    {
      method: "POST",
      body: JSON.stringify({
        ...updates,
        ...(identityToken ? { identityToken } : {}),
      }),
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
  if (date) params.set("date", date);
  const qs = params.toString();
  return apiFetch<UserRank>(
    `/user/${encodeURIComponent(userId)}/rank${qs ? `?${qs}` : ""}`,
  );
}
