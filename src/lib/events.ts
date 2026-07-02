// src/lib/events.ts
//
// Event bus minimalista para notificar cambios que ocurren fuera del árbol
// de React (ej: sync con server desde módulos como auth.ts). Se usa para
// que el StatsProvider refresque cuando los datos locales cambian.

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

export function emit(event: string): void {
  const ls = listeners.get(event);
  if (!ls) return;
  for (const fn of ls) {
    try {
      fn();
    } catch {
      // Ignorar errores individuales de listeners
    }
  }
}

export function on(event: string, fn: Listener): () => void {
  let ls = listeners.get(event);
  if (!ls) {
    ls = new Set();
    listeners.set(event, ls);
  }
  ls.add(fn);
  return () => {
    ls?.delete(fn);
  };
}

/** Nombres de eventos usados en la app. */
export const Events = {
  STATS_CHANGED: "stats:changed",
  /** Solicita abrir el modal de stats/ranking desde cualquier lugar. */
  OPEN_STATS: "stats:open",
} as const;
