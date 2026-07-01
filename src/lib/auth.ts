// src/lib/auth.ts
//
// Cliente OAuth de Google en el frontend.
//
// Flujo:
//  1. Usuario clickea "Iniciar sesión con Google"
//  2. loginWithGoogle() redirige a Google OAuth
//  3. Google devuelve a /auth/callback con ?code=xxx
//  4. AuthCallback.tsx llama a handleGoogleCallback() con el code
//  5. Backend valida y devuelve identidad completa
//  6. Frontend guarda identidad y redirige a home

import { apiPost } from "./api";
import { getIdentity, updateIdentity } from "./identity";
import { storage } from "./storage";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export type AuthResult = {
  userId: string;
  displayName: string;
  countryCode: string | null;
  email: string;
  picture: string | null;
  isNewLink: boolean;
};

const AUTH_STATUS_KEY = "auth:status";
const AUTH_EMAIL_KEY = "auth:email";
const AUTH_PICTURE_KEY = "auth:picture";

/**
 * Inicia el flujo de OAuth con Google.
 * Redirige a la pantalla de consentimiento de Google.
 */
export function loginWithGoogle(): void {
  if (!GOOGLE_CLIENT_ID) {
    console.error("VITE_GOOGLE_CLIENT_ID no configurado");
    return;
  }
  const redirectUri = `${window.location.origin}/auth/callback`;
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Procesa el callback de Google después del OAuth flow.
 * @param code El authorization code de la query string.
 * @returns La identidad del usuario o null si falla.
 */
export async function handleGoogleCallback(code: string): Promise<AuthResult | null> {
  const redirectUri = `${window.location.origin}/auth/callback`;
  const { userId: currentUserId } = getIdentity();

  const result = await apiPost<AuthResult>("/auth/google", {
    code,
    redirectUri,
    currentUserId,
  });

  if (!result) return null;

  // Guardar identidad completa (server-side es la fuente de verdad).
  updateIdentity({
    displayName: result.displayName,
    countryCode: result.countryCode,
  });
  // También reemplazar userId (por si venía de otro dispositivo).
  const currentIdentity = getIdentity();
  storage.set("identity", {
    ...currentIdentity,
    userId: result.userId,
    displayName: result.displayName,
    countryCode: result.countryCode,
  });

  // Estado de auth para mostrar en UI
  storage.set(AUTH_STATUS_KEY, true);
  storage.set(AUTH_EMAIL_KEY, result.email);
  if (result.picture) storage.set(AUTH_PICTURE_KEY, result.picture);

  return result;
}

/**
 * Cierra sesión: borra estado auth local y vuelve a modo anónimo.
 * El userId original se pierde (nueva identidad anónima).
 */
export function logout(): void {
  storage.set(AUTH_STATUS_KEY, false);
  storage.remove(AUTH_EMAIL_KEY);
  storage.remove(AUTH_PICTURE_KEY);
  // Borrar identidad para forzar generación de nueva.
  storage.remove("identity");
  // Borrar cookie de identidad si existe.
  document.cookie = "bdb_uid=;path=/;max-age=0;SameSite=Lax";
  try {
    sessionStorage.removeItem("bdb_uid");
  } catch {
    // Ignorar.
  }
}

/** true si el usuario está logueado con Google. */
export function isLoggedIn(): boolean {
  return storage.get<boolean>(AUTH_STATUS_KEY, false) === true;
}

/** Email del usuario logueado (o null). */
export function getUserEmail(): string | null {
  return storage.get<string | null>(AUTH_EMAIL_KEY, null);
}

/** URL de foto del usuario (o null). */
export function getUserPicture(): string | null {
  return storage.get<string | null>(AUTH_PICTURE_KEY, null);
}
