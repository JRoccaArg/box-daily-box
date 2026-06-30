/**
 * Capa de persistencia sobre localStorage.
 *
 * - Namespacing + version para evitar colisiones y permitir migraciones.
 * - Serializacion JSON segura.
 * - Fallback a memoria si localStorage no esta disponible (modo incognito,
 *   storage deshabilitado, cuota llena). La app nunca debe romperse por esto.
 */

const NAMESPACE = "boxbox";
const VERSION = "v1";

const prefix = (key: string) => `${NAMESPACE}:${VERSION}:${key}`;

/** Detecta una vez si localStorage es utilizable. */
function detectStorage(): Storage | null {
  try {
    const probe = "__boxbox_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

const real = typeof window !== "undefined" ? detectStorage() : null;

/** Fallback en memoria: mantiene la sesion aunque no persista entre recargas. */
const memory = new Map<string, string>();

const backend = {
  getItem(k: string): string | null {
    if (real) return real.getItem(k);
    return memory.has(k) ? (memory.get(k) as string) : null;
  },
  setItem(k: string, v: string): void {
    if (real) {
      try {
        real.setItem(k, v);
        return;
      } catch {
        // cuota / privacidad: caemos a memoria silenciosamente
      }
    }
    memory.set(k, v);
  },
  removeItem(k: string): void {
    real?.removeItem(k);
    memory.delete(k);
  },
};

/** true si estamos persistiendo de verdad (no solo en memoria). */
export const storageIsPersistent = real !== null;

export const storage = {
  get<T>(key: string, fallback: T): T {
    const raw = backend.getItem(prefix(key));
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      backend.setItem(prefix(key), JSON.stringify(value));
    } catch {
      // valor no serializable: ignorar en vez de romper
    }
  },

  remove(key: string): void {
    backend.removeItem(prefix(key));
  },

  /** Actualiza un valor de forma funcional (read-modify-write). */
  update<T>(key: string, fallback: T, fn: (prev: T) => T): T {
    const next = fn(this.get(key, fallback));
    this.set(key, next);
    return next;
  },
};
