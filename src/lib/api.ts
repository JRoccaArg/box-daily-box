/**
 * Cliente API — comunicacion con el backend de Box Daily Box.
 *
 * Todas las llamadas son fire-and-forget para la UX: si el backend falla,
 * el juego sigue funcionando localmente. Los resultados del servidor se
 * usan para ranking global, no para bloquear gameplay.
 */

import { getIdentity, setIdentityToken, getIdentityToken } from "./identity";
import { dateKey } from "./seed";
import { getDebugDateOverride } from "./debugDate";

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

/** Logros que se guardan como badges únicos (no pertenecen a un mes). */
export type AchievementBadgeType =
  | "ach_legend_50"
  | "ach_wins_500"
  | "ach_legend_10"
  | "ach_wins_100"
  | "ach_specialist_50"
  | "ach_perfect_day"
  | "ach_complete";

/** Tipos de badge. Los monthly_* y ach_* se ganan; admin/superadmin derivan del rol. */
export type BadgeType =
  | "monthly_gold"
  | "monthly_silver"
  | "monthly_bronze"
  | AchievementBadgeType
  | "admin"
  | "superadmin";

/**
 * Badge listo para renderizar inline junto al nombre (count > 1 => contador).
 * `months` ('YYYY-MM'[]) solo en tipos mensuales — alimenta el tooltip.
 */
export type DisplayBadge = { type: BadgeType; count: number; months?: string[] };

export type RankingEntry = {
  rank: number;
  userId: string;
  displayName: string;
  countryCode: string | null;
  points: number;
  gamesWon: number;
  daysPlayed: number;
  /** Racha diaria actual (días consecutivos ganando). Ya viene con "death-check"
   *  aplicado server-side: 0 si la racha murió. El UI la muestra solo si >= 2. */
  currentStreak: number;
  /** Badges a mostrar inline (admin/superadmin primero + hasta 3 destacados). */
  displayBadges: DisplayBadge[];
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
    // Solo tiene efecto real si el backend corre con STAGING_DEBUG=true
    // (servicio de Railway aislado de producción); si no, el header se
    // ignora en el server. `getDebugDateOverride` ya devuelve null fuera
    // de un build de staging (VITE_STAGING=true), así que esto es un
    // no-op inerte en producción.
    const debugDate = getDebugDateOverride();

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(debugDate ? { "X-Debug-Date": debugDate } : {}),
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
  timeLimit?: number | null,
): Promise<StartResult> {
  if (!API_URL) return { ok: false };

  const { userId, displayName, countryCode } = getIdentity();
  // OJO: usar `dateKey()` (no `new Date()` a mano) es lo que hace que esto
  // respete el override de fecha de debug SOLO STAGING (`debugDate.ts`) —
  // igual que el resto de la app (GameShell, generación del reto vía
  // `getEffectiveNow()`, y el propio ranking vía `apiGetDailyRanking`). Antes
  // esta función calculaba la fecha a mano con el reloj real: en staging,
  // con un override activo, jugabas el reto de UN día pero el intento se
  // guardaba bajo la fecha REAL — y como el ranking sí respeta el override,
  // el intento "desaparecía" (quedaba bajo otra fecha) o el día no reflejaba
  // partidas nuevas nunca. En producción esto no cambia nada: sin override
  // activo, `dateKey()` da exactamente lo mismo que el reloj real.
  const clientDateKey = dateKey();

  const data = await apiFetch<StartResponse>(
    `/challenges/${gameId}/start`,
    {
      method: "POST",
      body: JSON.stringify({ difficulty, userId, displayName, countryCode, clientDateKey, timeLimit }),
    },
  );

  if (!data) return { ok: false };
  if (data.identityToken) {
    setIdentityToken(data.identityToken);
  }
  return { ok: true, sessionToken: data.sessionToken, serverNow: data.serverNow };
}

/** Envia la solucion y obtiene resultado verificado.
 *  solution puede ser null: representa abandono/timeout (perdido sin verificar).
 *  `keepalive: true` para que el POST sobreviva a una navegacion de pagina
 *  real (cerrar pestana, o el redirect de loginWithGoogle inmediatamente
 *  despues de abandonar un reto) — sin esto, el browser puede abortar el
 *  fetch a mitad de camino y el intento nunca llega al server. */
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
      keepalive: true,
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
  /** Día (YYYY-MM-DD) al que pertenece el attempt, para agrupar en syncFromServer. */
  dateKey: string;
};

export type UserAttemptsResponse = {
  dateKey: string;
  attempts: ServerAttempt[];
};

/**
 * GET /user/:userId/attempts?date=YYYY-MM-DD&identityToken=...
 * GET /user/:userId/attempts?from=YYYY-MM-DD&to=YYYY-MM-DD&identityToken=...
 *
 * Trae los attempts del usuario para una fecha puntual (`date`) o un rango
 * (`from`/`to`) — usado para reconstruir el gráfico mensual local tras login.
 *
 * Manda el identityToken guardado localmente: el server solo devuelve datos
 * si prueba la posesión del userId (evita que cualquiera con un userId ajeno
 * pueda leer el historial de otra persona).
 */
export async function apiGetUserAttempts(
  userId: string,
  opts: { date?: string; from?: string; to?: string } = {},
): Promise<UserAttemptsResponse | null> {
  const params = new URLSearchParams();
  if (opts.from || opts.to) {
    params.set("from", opts.from ?? opts.to ?? dateKey());
    params.set("to", opts.to ?? opts.from ?? dateKey());
  } else {
    params.set("date", opts.date ?? dateKey());
  }
  const token = getIdentityToken();
  if (token) params.set("identityToken", token);
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

/**
 * GET /user/:userId/rank?date=YYYY-MM-DD&identityToken=...
 * Manda el identityToken guardado localmente (ver nota en apiGetUserAttempts).
 */
export async function apiGetUserRank(
  userId: string,
  date?: string,
): Promise<UserRank | null> {
  const params = new URLSearchParams();
  params.set("date", date ?? dateKey());
  const token = getIdentityToken();
  if (token) params.set("identityToken", token);
  return apiFetch<UserRank>(
    `/user/${encodeURIComponent(userId)}/rank?${params.toString()}`,
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── Badges ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

/** Un slot de la selección de destacados (podio y logros son elegibles). */
export type FeaturedSlot = {
  type: Exclude<BadgeType, "admin" | "superadmin">;
  grouped?: boolean;
};

export type OwnedBadge = {
  id: number;
  type: BadgeType;
  /** Mes al que corresponde (YYYY-MM), null para badges sin mes. */
  referenceMonth: string | null;
  awardedAt: string;
};

export type UserBadges = {
  userId: string;
  role: string;
  owned: OwnedBadge[];
  counts: Record<string, number>;
  featured: FeaturedSlot[] | null;
  achievements: AchievementProgress[];
};

export type AchievementProgress = {
  type: AchievementBadgeType;
  current: number;
  rawCurrent: number;
  target: number;
  percent: number;
  unlocked: boolean;
};

/** GET /user/:userId/badges — colección pública de badges de un usuario. */
export async function apiGetUserBadges(
  userId: string,
): Promise<UserBadges | null> {
  return apiFetch<UserBadges>(`/user/${encodeURIComponent(userId)}/badges`);
}

/**
 * POST /user/:userId/badges/featured — setea los badges destacados.
 * Manda el identityToken guardado localmente (anti-IDOR server-side).
 * Devuelve el body de errores 4xx (ej. selección inválida) para mostrarlos.
 */
export async function apiSetFeaturedBadges(
  userId: string,
  featured: FeaturedSlot[],
  identityToken?: string | null,
): Promise<{ userId: string; featured: FeaturedSlot[] } | { error: string } | null> {
  const token = identityToken ?? getIdentityToken();
  return apiFetch<{ userId: string; featured: FeaturedSlot[] } | { error: string }>(
    `/user/${encodeURIComponent(userId)}/badges/featured`,
    {
      method: "POST",
      body: JSON.stringify({
        featured,
        ...(token ? { identityToken: token } : {}),
      }),
    },
    8000,
    true, // preservar errores 4xx (selección inválida, no autorizado)
  );
}

/**
 * POST /admin/seed-badges — SOLO responde 200 si el backend tiene
 * STAGING_DEBUG=true (si no, 404). Usado por el panel de debug de staging
 * (roadmap #1) para poblar/limpiar los escenarios de prueba de badges.
 */
export async function apiSeedBadges(
  reset = false,
): Promise<{ ok: boolean; reset: boolean } | null> {
  return apiFetch<{ ok: boolean; reset: boolean }>("/admin/seed-badges", {
    method: "POST",
    body: JSON.stringify({ reset }),
  });
}

/**
 * POST /admin/grant-badges — SOLO responde 200 si el backend tiene
 * STAGING_DEBUG=true (si no, 404). Otorga 3 oros + 1 plata + 1 bronce a la
 * cuenta indicada (pensado para la propia cuenta del que prueba en staging),
 * para poder abrir "Mi Progreso" y probar la galería con badges reales.
 */
export async function apiGrantSelfBadges(
  userId: string,
): Promise<{ ok: boolean; userId: string; grantedCount: number } | null> {
  return apiFetch<{ ok: boolean; userId: string; grantedCount: number }>(
    "/admin/grant-badges",
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
  );
}

/**
 * POST /admin/close-debug-month — SOLO responde 200 si el backend tiene
 * STAGING_DEBUG=true (si no, 404). Cierra el mes ANTERIOR al que está
 * simulando el date picker del panel de debug (lee X-Debug-Date, que
 * apiFetch ya adjunta solo). El cron automático de producción nunca honra
 * el override, así que sin esto un mes "simulado" nunca se cierra solo.
 */
export async function apiCloseDebugMonth(): Promise<{
  month: string;
  awardedCount: number;
} | { error: string } | null> {
  return apiFetch<{ month: string; awardedCount: number } | { error: string }>(
    "/admin/close-debug-month",
    // Body vacío EXPLÍCITO: mandar Content-Type: application/json (que pone
    // apiFetch siempre) sin body hace que Fastify rechace la request con
    // 400 "Bad Request" antes de llegar al handler.
    { method: "POST", body: "{}" },
    8000,
    true, // preservar el 422 de "mes no cerrado" para mostrarlo
  );
}

/**
 * POST /admin/seed-duels — SOLO responde 200 si el backend tiene
 * STAGING_DEBUG=true (si no, 404). Usado por el panel de debug de staging
 * (roadmap §4, Etapa 2) para poblar amigos/duelos ficticios DIRIGIDOS a la
 * propia cuenta del que prueba (banner de invitación, solicitudes, etc.).
 */
export async function apiSeedDuels(
  userId: string,
  reset = false,
): Promise<{ ok: boolean; reset: boolean } | { error: string } | null> {
  return apiFetch<{ ok: boolean; reset: boolean } | { error: string }>(
    "/admin/seed-duels",
    { method: "POST", body: JSON.stringify({ userId, reset }) },
    8000,
    true, // preservar el 422 (userId inválido) para mostrarlo
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── Amigos y Duelos (Roadmap §4) ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export type DuelResult = {
  won: boolean;
  points: number;
  timeSeconds: number;
  finishedAt: string;
  /**
   * true cuando este lado ganó porque el RIVAL abandonó antes de que este
   * jugador llegara a jugar (Roadmap §4). En ese caso `points`/`timeSeconds`
   * son 0 y NO representan una partida real: la UI debe mostrar un mensaje de
   * "ganaste por abandono" en vez de un puntaje.
   */
  walkover?: boolean;
  /** true si este lado abandonó explícitamente (botón de salir / cerrar pestaña). */
  forfeit?: boolean;
  /**
   * true si este lado nunca envió resultado y lo resolvió el vencimiento del
   * plazo (se quedó AFK o nunca abrió el duelo). Derrota de 0 puntos: si el
   * rival tampoco completó el reto, el duelo termina en empate.
   */
  timedOut?: boolean;
};
export type DuelStatus = "pending" | "active" | "finished" | "expired" | "cancelled";

/** Estado de un duelo tal como lo ve un participante (modo a ciegas aplicado por el server). */
export type DuelState = {
  id: string;
  gameId: string;
  difficulty: string;
  timeLimit: number | null;
  status: DuelStatus;
  creatorId: string;
  opponentId: string | null;
  creatorName: string | null;
  creatorCountry: string | null;
  youAre: "creator" | "opponent";
  myResult: DuelResult | null;
  /** Solo revelado cuando ambos terminaron (status='finished'). */
  opponentResult: DuelResult | null;
  opponentFinished: boolean;
  expiresAt: string;
  secondsLeft: number;
};

export type PendingDuel = {
  id: string;
  gameId: string;
  difficulty: string;
  timeLimit: number | null;
  creatorName: string | null;
  creatorCountry: string | null;
  secondsLeft: number;
  expiresAt: string;
};

export type Friend = {
  userId: string;
  displayName: string | null;
  countryCode: string | null;
  /** ¿Tiene la web abierta ahora? Lo calcula el server (ventana de 2 min);
   *  nunca llega el timestamp crudo de la última conexión. */
  online: boolean;
};
export type FriendRequest = {
  requestId: number;
  fromUserId: string;
  displayName: string | null;
  countryCode: string | null;
};
/** Solicitud de amistad que YO mande y todavia no fue respondida. */
export type OutgoingFriendRequest = {
  requestId: number;
  toUserId: string;
  displayName: string | null;
  countryCode: string | null;
};

type ErrShape = { error: string };
function isErr<T>(v: T | ErrShape | null): v is ErrShape {
  return v != null && typeof (v as ErrShape).error === "string";
}

/** Inicia una partida de DUELO. El server toma juego/dificultad/tiempo/semilla
 *  de la fila del duelo (no del cliente); acá solo mandamos duelId + identidad. */
export async function apiStartDuelChallenge(
  gameId: string,
  duelId: string,
): Promise<StartResult> {
  if (!API_URL) return { ok: false };
  const { userId } = getIdentity();
  const data = await apiFetch<StartResponse>(`/challenges/${gameId}/start`, {
    method: "POST",
    body: JSON.stringify({ duelId, userId, identityToken: getIdentityToken() }),
  });
  if (!data) return { ok: false };
  if (data.identityToken) setIdentityToken(data.identityToken);
  return { ok: true, sessionToken: data.sessionToken, serverNow: data.serverNow };
}

/** Crea un duelo. `opponentUserId` opcional = desafío directo a un amigo. */
export async function apiCreateDuel(
  gameId: string,
  difficulty: string,
  timeLimit: number | null,
  opponentUserId?: string,
): Promise<{ duelId: string; expiresAt: string; secondsLeft: number } | ErrShape | null> {
  const { userId } = getIdentity();
  return apiFetch(
    "/duels",
    {
      method: "POST",
      body: JSON.stringify({ userId, gameId, difficulty, timeLimit, opponentUserId, identityToken: getIdentityToken() }),
    },
    8000,
    true,
  );
}

export async function apiAcceptDuel(duelId: string): Promise<DuelState | ErrShape | null> {
  const { userId } = getIdentity();
  return apiFetch(`/duels/${encodeURIComponent(duelId)}/accept`, {
    method: "POST",
    body: JSON.stringify({ userId, identityToken: getIdentityToken() }),
  }, 8000, true);
}

export async function apiDeclineDuel(duelId: string): Promise<{ ok: boolean } | ErrShape | null> {
  const { userId } = getIdentity();
  return apiFetch(`/duels/${encodeURIComponent(duelId)}/decline`, {
    method: "POST",
    body: JSON.stringify({ userId, identityToken: getIdentityToken() }),
  }, 8000, true);
}

export async function apiCancelDuel(duelId: string): Promise<{ ok: boolean } | ErrShape | null> {
  const { userId } = getIdentity();
  return apiFetch(`/duels/${encodeURIComponent(duelId)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ userId, identityToken: getIdentityToken() }),
  }, 8000, true);
}

/**
 * Rendirse / salir de un duelo SIN necesidad de un sessionToken activo.
 *
 * Sirve para el caso en que el usuario se va antes de que el juego cargue
 * (pantalla de espera, transición): ahí `apiFinishChallenge` no es opción
 * porque todavía no hay sessionToken. Si el duelo estaba 'active', el rival
 * gana por walkover; si estaba 'pending', el duelo se cancela.
 *
 * `keepalive` para que el navegador la despache aunque la pestaña se esté
 * cerrando (mismo motivo que en `apiFinishChallenge`).
 */
export async function apiForfeitDuel(
  duelId: string,
): Promise<{ ok: boolean; status: string } | ErrShape | null> {
  const { userId } = getIdentity();
  return apiFetch(
    `/duels/${encodeURIComponent(duelId)}/forfeit`,
    {
      method: "POST",
      body: JSON.stringify({ userId, identityToken: getIdentityToken() }),
      keepalive: true,
    },
    8000,
    true,
  );
}

export async function apiGetDuel(duelId: string): Promise<DuelState | null> {
  const { userId } = getIdentity();
  const params = new URLSearchParams({ userId, identityToken: getIdentityToken() ?? "" });
  return apiFetch<DuelState>(`/duels/${encodeURIComponent(duelId)}?${params.toString()}`);
}

export async function apiGetPendingDuels(): Promise<PendingDuel[]> {
  const { userId } = getIdentity();
  if (!userId) return [];
  const params = new URLSearchParams({ userId, identityToken: getIdentityToken() ?? "" });
  const res = await apiFetch<{ duels: PendingDuel[] }>(`/duels/pending?${params.toString()}`);
  return res?.duels ?? [];
}

export async function apiGetMyFriendCode(): Promise<string | null> {
  const { userId } = getIdentity();
  if (!userId) return null;
  const params = new URLSearchParams({ userId, identityToken: getIdentityToken() ?? "" });
  const res = await apiFetch<{ code: string }>(`/me/friend-code?${params.toString()}`);
  return res?.code ?? null;
}

export async function apiResolveFriendByCode(
  code: string,
): Promise<Friend | ErrShape | null> {
  return apiFetch<Friend | ErrShape>(`/friends/by-code/${encodeURIComponent(code)}`, {}, 8000, true);
}

/** Envía solicitud de amistad por código o por userId. */
export async function apiSendFriendRequest(
  target: { targetCode?: string; targetUserId?: string },
): Promise<{ ok: boolean; status: string; requestId?: number } | ErrShape | null> {
  const { userId } = getIdentity();
  return apiFetch("/friends/request", {
    method: "POST",
    body: JSON.stringify({ userId, ...target, identityToken: getIdentityToken() }),
  }, 8000, true);
}

export async function apiRespondFriendRequest(
  requestId: number,
  accept: boolean,
): Promise<{ ok: boolean; status: string } | ErrShape | null> {
  const { userId } = getIdentity();
  return apiFetch("/friends/respond", {
    method: "POST",
    body: JSON.stringify({ userId, requestId, accept, identityToken: getIdentityToken() }),
  }, 8000, true);
}

export async function apiRemoveFriend(friendUserId: string): Promise<{ ok: boolean } | ErrShape | null> {
  const { userId } = getIdentity();
  return apiFetch("/friends/remove", {
    method: "POST",
    body: JSON.stringify({ userId, friendUserId, identityToken: getIdentityToken() }),
  }, 8000, true);
}

export async function apiListFriends(): Promise<Friend[]> {
  const { userId } = getIdentity();
  if (!userId) return [];
  const params = new URLSearchParams({ userId, identityToken: getIdentityToken() ?? "" });
  const res = await apiFetch<{ friends: Friend[] }>(`/friends?${params.toString()}`);
  return res?.friends ?? [];
}

export async function apiListFriendRequests(): Promise<FriendRequest[]> {
  const { userId } = getIdentity();
  if (!userId) return [];
  const params = new URLSearchParams({ userId, identityToken: getIdentityToken() ?? "" });
  const res = await apiFetch<{ requests: FriendRequest[] }>(`/friends/requests?${params.toString()}`);
  return res?.requests ?? [];
}

/** Solicitudes de amistad que YO mande y siguen pendientes de respuesta. */
export async function apiListOutgoingFriendRequests(): Promise<OutgoingFriendRequest[]> {
  const { userId } = getIdentity();
  if (!userId) return [];
  const params = new URLSearchParams({ userId, identityToken: getIdentityToken() ?? "" });
  const res = await apiFetch<{ requests: OutgoingFriendRequest[] }>(`/friends/requests/outgoing?${params.toString()}`);
  return res?.requests ?? [];
}

// Reexport util para que la UI distinga respuestas de error de las de éxito.
export { isErr as isApiError };

/**
 * Traduce mensajes de error crudos del server (literales en español, ver
 * `requireOwnership` en `src/api/routes.ts`) a una clave i18n. El server no
 * devuelve códigos de error, solo el string — este mapeo es la traducción
 * del lado del cliente para no tener que tocar el backend (ver Etapa C del
 * plan de bugfixes de Amigos y Duelos). Si no reconoce el string, cae a
 * `duel.error_generic` en vez de mostrar el literal en español.
 */
export function friendlyApiError(error: string, t: (key: string) => string): string {
  if (error === "No autorizado") return t("friends.need_to_play");
  return t("duel.error_generic");
}

export type DebugAchievementState = {
  activeScenarios: AchievementBadgeType[];
  streak: { current: number; best: number; lastWinDate: string | null };
  achievements: AchievementProgress[];
};

export type DebugAchievementCommand =
  | { action: "status" }
  | { action: "apply" | "remove"; achievementType: AchievementBadgeType }
  | { action: "set_streak"; streak: number }
  | { action: "reset" };

/** Controles persistentes de logros/racha, disponibles solo en staging. */
export async function apiDebugAchievements(
  userId: string,
  command: DebugAchievementCommand,
): Promise<({ ok: true } & DebugAchievementState) | { error: string } | null> {
  return apiFetch<({ ok: true } & DebugAchievementState) | { error: string }>(
    "/admin/debug-achievements",
    {
      method: "POST",
      body: JSON.stringify({
        userId,
        identityToken: getIdentityToken(),
        ...command,
      }),
    },
    15_000,
    true,
  );
}

/** Vuelve al modo automático: podio primero y luego logros por dificultad. */
export async function apiResetFeaturedBadges(
  userId: string,
  identityToken?: string | null,
): Promise<{ userId: string; featured: null } | { error: string } | null> {
  const token = identityToken ?? getIdentityToken();
  return apiFetch<{ userId: string; featured: null } | { error: string }>(
    `/user/${encodeURIComponent(userId)}/badges/featured`,
    {
      method: "POST",
      body: JSON.stringify({
        featured: null,
        ...(token ? { identityToken: token } : {}),
      }),
    },
    8000,
    true,
  );
}
