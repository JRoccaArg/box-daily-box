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
// Cookie dura 400 días (máximo permitido por navegadores modernos).
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

function generateId(): string {
  // UUID v4 simple (sin crypto.randomUUID para compat con navegadores viejos).
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const s = (n: number) => Array.from({ length: n }, hex).join("");
  return `${s(8)}-${s(4)}-4${s(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${s(3)}-${s(12)}`;
}

// ─── Cookie helpers ──────────────────────────────────────────────────

function setCookie(userId: string): void {
  try {
    document.cookie = `${COOKIE_NAME}=${userId};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
  } catch {
    // SSR o entorno sin document — ignorar.
  }
}

function getCookie(): string | null {
  try {
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    return match ? match.substring(COOKIE_NAME.length + 1) : null;
  } catch {
    return null;
  }
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
