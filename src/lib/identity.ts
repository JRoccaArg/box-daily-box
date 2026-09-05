/**
 * Identidad del usuario.
 *
 * El userId se persiste en TRES lugares (defensa en profundidad):
 *   1. localStorage (via storage helper)
 *   2. Cookie de navegador (sobrevive al borrado de localStorage)
 *   3. sessionStorage (backup para la sesión actual)
 *
 * Al cargar, se busca en los tres: si ALGUNO tiene un userId, se usa ese.
 * Esto evita que borrar localStorage genere un UUID nuevo y permita
 * rejugar los retos del día con otra identidad.
 */

import { storage } from "./storage";

export type UserIdentity = {
  userId: string;
  displayName: string;
  /** Codigo ISO 3 letras (ARG, BRA, etc.) o null si no eligio. */
  countryCode: string | null;
};

const IDENTITY_KEY = "identity";
const COOKIE_NAME = "bdb_uid";

function generateId(): string {
  // UUID v4 simple (sin crypto.randomUUID para compat con navegadores viejos).
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const s = (n: number) => Array.from({ length: n }, hex).join("");
  return `${s(8)}-${s(4)}-4${s(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${s(3)}-${s(12)}`;
}

// ─── Cookie helpers ──────────────────────────────────────────────────

// Cookie dura hasta el final del día UTC. Al día siguiente se genera un nuevo UUID.
// Esto evita "bloqueos por IP" accidentales si el usuario quiere cambiar de cuenta.
function getCookieMaxAge(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  const secondsLeft = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
  return Math.max(secondsLeft, 60); // Mínimo 60 segundos para evitar cookie ya expirada.
}

function writeCookie(name: string, value: string): void {
  try {
    const maxAge = getCookieMaxAge();
    // `Secure` solo en HTTPS: en el dev server (http://localhost) el navegador
    // descartaría la cookie y romperíamos la persistencia en desarrollo.
    const secure = location.protocol === "https:" ? ";Secure" : "";
    document.cookie =
      `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax${secure}`;
  } catch {
    // SSR o entorno sin document — ignorar.
  }
}

function readCookie(name: string): string | null {
  try {
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.substring(name.length + 1)) : null;
  } catch {
    return null;
  }
}

function deleteCookie(name: string): void {
  try {
    document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
  } catch {
    // SSR o entorno sin document — ignorar.
  }
}

function setCookie(userId: string): void {
  writeCookie(COOKIE_NAME, userId);
}

function getCookie(): string | null {
  return readCookie(COOKIE_NAME);
}

// ─── sessionStorage helpers ──────────────────────────────────────────

function setSessionBackup(userId: string): void {
  try {
    sessionStorage.setItem(COOKIE_NAME, userId);
  } catch {
    // Entorno sin sessionStorage — ignorar.
  }
}

function getSessionBackup(): string | null {
  try {
    return sessionStorage.getItem(COOKIE_NAME);
  } catch {
    return null;
  }
}

// ─── UUID validation ─────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

// ─── API pública ─────────────────────────────────────────────────────

/**
 * Carga o crea la identidad del usuario.
 *
 * Busca el userId en: localStorage → cookie → sessionStorage.
 * Si alguno tiene un UUID válido, lo usa (y restaura los otros).
 * Solo genera uno nuevo si NINGUNO tiene datos.
 */
export function getIdentity(): UserIdentity {
  // 1. Intentar desde localStorage (fuente principal).
  const saved = storage.get<UserIdentity | null>(IDENTITY_KEY, null);
  if (saved?.userId && isValidUuid(saved.userId)) {
    // Asegurar que cookie y session estén sincronizados.
    setCookie(saved.userId);
    setSessionBackup(saved.userId);
    return saved;
  }

  // 2. localStorage vacío/borrado. Buscar en cookie.
  const cookieUid = getCookie();
  if (isValidUuid(cookieUid)) {
    // Restaurar localStorage desde la cookie.
    const restored: UserIdentity = {
      userId: cookieUid,
      displayName: "",
      countryCode: null,
    };
    storage.set(IDENTITY_KEY, restored);
    setSessionBackup(cookieUid);
    return restored;
  }

  // 3. Cookie también vacía. Buscar en sessionStorage.
  const sessionUid = getSessionBackup();
  if (isValidUuid(sessionUid)) {
    const restored: UserIdentity = {
      userId: sessionUid,
      displayName: "",
      countryCode: null,
    };
    storage.set(IDENTITY_KEY, restored);
    setCookie(sessionUid);
    return restored;
  }

  // 4. Nada encontrado: generar nuevo UUID.
  const fresh: UserIdentity = {
    userId: generateId(),
    displayName: "",
    countryCode: null,
  };
  storage.set(IDENTITY_KEY, fresh);
  setCookie(fresh.userId);
  setSessionBackup(fresh.userId);
  return fresh;
}

/**
 * Descarta la identidad actual y arranca una nueva (userId nuevo, sin token),
 * conservando nombre y país para no obligar a reconfigurarlos.
 *
 * Se usa en un solo caso: el server respondió `IDENTITY_REQUIRED`, es decir
 * "ese userId pertenece a una cuenta y no probaste que sea tuya". Pasa cuando
 * el token se perdió de las tres capas a la vez. Sin esto, el jugador quedaría
 * trabado sin poder jugar; con esto sigue jugando bajo una identidad nueva, y
 * puede recuperar su historial anterior entrando con Google si lo tenía
 * vinculado.
 */
export function resetIdentity(): UserIdentity {
  const previous = storage.get<UserIdentity | null>(IDENTITY_KEY, null);
  clearIdentityToken();
  const fresh: UserIdentity = {
    userId: generateId(),
    displayName: previous?.displayName ?? "",
    countryCode: previous?.countryCode ?? null,
  };
  storage.set(IDENTITY_KEY, fresh);
  setCookie(fresh.userId);
  setSessionBackup(fresh.userId);
  return fresh;
}

/**
 * Borra por completo la identidad local: userId y token, en las TRES capas.
 *
 * `localStorage.clear()` por sí solo no alcanza — las cookies `bdb_uid` y
 * `bdb_tok` sobrevivirían y en la próxima carga `getIdentity()` restauraría el
 * userId de una cuenta que ya no existe en el server. Se usa al borrar la
 * cuenta (derecho de supresión).
 */
export function clearIdentity(): void {
  storage.remove(IDENTITY_KEY);
  clearIdentityToken();
  deleteCookie(COOKIE_NAME);
  try {
    sessionStorage.removeItem(COOKIE_NAME);
  } catch {
    // Entorno sin sessionStorage — ignorar.
  }
}

/** Actualiza el nombre y/o pais. */
export function updateIdentity(
  patch: Partial<Pick<UserIdentity, "displayName" | "countryCode">>,
): UserIdentity {
  const current = getIdentity();
  const updated = { ...current, ...patch };
  storage.set(IDENTITY_KEY, updated);
  return updated;
}

/** true si el usuario ya configuró nombre y pais. */
export function isIdentityComplete(): boolean {
  const id = getIdentity();
  return id.displayName.trim().length > 0 && id.countryCode !== null;
}

// ─── Identity Token ──────────────────────────────────────────────────
// Token firmado por el server que prueba la posesión del userId.
//
// TRIPLE PERSISTENCIA (auditoría 2026-09), igual que el userId. Antes vivía
// SOLO en localStorage, y eso creaba un estado imposible de sostener: si
// localStorage no está disponible (navegación privada de Safari, cuota llena,
// políticas corporativas), `storage` cae a un Map en memoria que se borra al
// recargar — pero `document.cookie` sigue funcionando. Resultado: al recargar,
// el usuario recuperaba su userId desde la cookie y perdía el token.
//
// Eso antes no se notaba porque `POST /challenges/:id/start` le regalaba un
// token nuevo a cualquiera que mandara un userId (el agujero de robo de cuenta
// que se cerró en esta misma auditoría). Ahora que el server EXIGE el token
// para jugar con una cuenta existente, el token tiene que sobrevivir a lo
// mismo que sobrevive el userId, o dejaríamos al dueño afuera de su cuenta.

const IDENTITY_TOKEN_KEY = "identity_token";
const TOKEN_COOKIE_NAME = "bdb_tok";

/** Guarda el identityToken emitido por el server, en las tres capas. */
export function setIdentityToken(token: string): void {
  storage.set(IDENTITY_TOKEN_KEY, token);
  writeCookie(TOKEN_COOKIE_NAME, token);
  try {
    sessionStorage.setItem(TOKEN_COOKIE_NAME, token);
  } catch {
    // Entorno sin sessionStorage — ignorar.
  }
}

/**
 * Lee el identityToken guardado, o null si no hay.
 *
 * Busca en localStorage → cookie → sessionStorage y, si lo encuentra en una
 * capa secundaria, RE-SINCRONIZA las otras. Eso además migra solo a los
 * usuarios que ya tenían un token de antes de este cambio (lo tienen en
 * localStorage y se les copia a cookie/sessionStorage en la primera visita).
 */
export function getIdentityToken(): string | null {
  const saved = storage.get<string | null>(IDENTITY_TOKEN_KEY, null);
  if (saved) {
    setIdentityToken(saved);
    return saved;
  }

  const fromCookie = readCookie(TOKEN_COOKIE_NAME);
  if (fromCookie) {
    setIdentityToken(fromCookie);
    return fromCookie;
  }

  try {
    const fromSession = sessionStorage.getItem(TOKEN_COOKIE_NAME);
    if (fromSession) {
      setIdentityToken(fromSession);
      return fromSession;
    }
  } catch {
    // Entorno sin sessionStorage — ignorar.
  }

  return null;
}

/** Borra el identityToken de las tres capas (ej: al cerrar sesión). */
export function clearIdentityToken(): void {
  storage.remove(IDENTITY_TOKEN_KEY);
  deleteCookie(TOKEN_COOKIE_NAME);
  try {
    sessionStorage.removeItem(TOKEN_COOKIE_NAME);
  } catch {
    // Entorno sin sessionStorage — ignorar.
  }
}
