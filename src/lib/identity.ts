/**
 * Identidad del usuario.
 *
 * Genera un UUID persistente en localStorage la primera vez, junto con
 * un display name y pais (opcionales, configurables despues).
 *
 * El userId es la clave de ranking: un usuario = un UUID. No hay auth,
 * pero tampoco hay incentivo fuerte para crear multiples cuentas (el
 * ranking es por diversión, no hay premios).
 */

import { storage } from "./storage";

export type UserIdentity = {
  userId: string;
  displayName: string;
  /** Codigo ISO 3 letras (ARG, BRA, etc.) o null si no eligio. */
  countryCode: string | null;
};

const IDENTITY_KEY = "identity";

function generateId(): string {
  // UUID v4 simple (sin crypto.randomUUID para compat con navegadores viejos).
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const s = (n: number) => Array.from({ length: n }, hex).join("");
  return `${s(8)}-${s(4)}-4${s(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${s(3)}-${s(12)}`;
}

/** Carga o crea la identidad del usuario. */
export function getIdentity(): UserIdentity {
  const saved = storage.get<UserIdentity | null>(IDENTITY_KEY, null);
  if (saved?.userId) return saved;

  const fresh: UserIdentity = {
    userId: generateId(),
    displayName: "",
    countryCode: null,
  };
  storage.set(IDENTITY_KEY, fresh);
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
