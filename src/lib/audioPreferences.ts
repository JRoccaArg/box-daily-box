// src/lib/audioPreferences.ts
//
// Preferencias de sonido y vibración (Roadmap #9), independientes entre sí
// (decisión confirmada con el usuario: dos interruptores, no uno combinado).
// Ambas DESACTIVADAS por defecto para no sorprender al usuario.
//
// Mismo patrón defensivo que el resto de src/lib (debugDate.ts, identity.ts):
// localStorage envuelto en try/catch, silencioso si no está disponible (modo
// privado, SSR durante el prerender, etc.) — nunca debe romper la app.

const SOUND_KEY = "bdb_sound_enabled";
const HAPTICS_KEY = "bdb_haptics_enabled";

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* localStorage no disponible — la preferencia no persiste, no rompe nada. */
  }
}

export function isSoundEnabled(): boolean {
  return readFlag(SOUND_KEY);
}

/** Invierte la preferencia de sonido y devuelve el nuevo valor. */
export function toggleSound(): boolean {
  const next = !isSoundEnabled();
  writeFlag(SOUND_KEY, next);
  return next;
}

export function isHapticsEnabled(): boolean {
  return readFlag(HAPTICS_KEY);
}

/** Invierte la preferencia de vibración y devuelve el nuevo valor. */
export function toggleHaptics(): boolean {
  const next = !isHapticsEnabled();
  writeFlag(HAPTICS_KEY, next);
  return next;
}
