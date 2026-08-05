// src/lib/toast.ts
//
// Cartelitos globales ("toasts") que aparecen abajo a la derecha (mismo lugar
// que el DuelBanner, ver Layout.tsx) y desaparecen solos. Mismo espiritu que
// gameplayState.ts: un store a nivel de modulo (sin contexto de React) para
// que CUALQUIER parte de la app pueda llamar `showToast(...)` sin tener que
// pasar props ni envolver nada en un Provider.

import { emit, on } from "./events";

export type ToastType = "success" | "error";

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
  /** true en los ultimos instantes antes de sacarlo del todo (dispara animate-toast-out). */
  leaving: boolean;
};

const EVENT = "toast:changed";
/** Cuanto dura la animacion de salida: se resta a la duracion total para que
 *  el toast quede oculto/removido justo cuando pasa la duracion pedida. */
const EXIT_MS = 220;

let toasts: Toast[] = [];
let nextId = 1;

function set(next: Toast[]): void {
  toasts = next;
  emit(EVENT);
}

/** Muestra un cartelito por `durationMs` (3000 por defecto) y lo saca solo. */
export function showToast(message: string, type: ToastType = "success", durationMs = 3000): void {
  const id = nextId++;
  set([...toasts, { id, message, type, leaving: false }]);

  const exitDelay = Math.max(0, durationMs - EXIT_MS);
  window.setTimeout(() => {
    set(toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
  }, exitDelay);

  window.setTimeout(() => {
    set(toasts.filter((t) => t.id !== id));
  }, durationMs);
}

export function getToasts(): Toast[] {
  return toasts;
}

export function onToastsChanged(fn: () => void): () => void {
  return on(EVENT, fn);
}
