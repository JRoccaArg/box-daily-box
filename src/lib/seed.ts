/**
 * Generador de numeros pseudoaleatorios DETERMINISTICO.
 *
 * Misma seed => misma secuencia, en todos los navegadores. Esto garantiza
 * que "todos los usuarios ven el mismo juego del dia" sin servidor.
 *
 * Implementacion: hash xmur3 (string -> uint32) + PRNG mulberry32.
 * Son algoritmos pequenos, rapidos y de buena distribucion para este uso
 * (NO aptos para criptografia).
 */

/** Hashea un string a una semilla uint32 estable. */
export function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** PRNG mulberry32: devuelve floats en [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * RNG de conveniencia con utilidades de muestreo deterministico.
 * Crear uno por contexto (p.ej. por juego + dia) y reutilizarlo.
 */
export class Rng {
  private next: () => number;

  constructor(seedStr: string) {
    this.next = mulberry32(xmur3(seedStr));
  }

  /** Float en [0, 1). */
  float(): number {
    return this.next();
  }

  /** Entero en [min, max] inclusivo. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Booleano con probabilidad `p` de ser true. */
  bool(p = 0.5): boolean {
    return this.next() < p;
  }

  /** Elige un elemento del array (no muta). */
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("Rng.pick: array vacio");
    return arr[Math.floor(this.next() * arr.length)] as T;
  }

  /** Devuelve una COPIA barajada (Fisher-Yates). No muta el original. */
  shuffle<T>(arr: readonly T[]): T[] {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j] as T, out[i] as T];
    }
    return out;
  }

  /** Muestrea `n` elementos unicos sin reemplazo. */
  sample<T>(arr: readonly T[], n: number): T[] {
    return this.shuffle(arr).slice(0, Math.min(n, arr.length));
  }
}

/* --------------------------------------------------------------------- */
/* Helpers de fecha                                                       */
/* --------------------------------------------------------------------- */

/**
 * Clave de dia en formato YYYY-MM-DD usando la fecha LOCAL del usuario.
 * El reto cambia a la medianoche local (igual que Wordle). Si en el futuro
 * se quiere un reto global identico por reloj UTC, cambiar a getUTC*.
 */
export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Numero de dia entero y estable (dias desde la epoca, en hora local).
 * Util para rotar pools sin repetir: pool[(dayNumber + offset) % pool.length].
 */
export function dayNumber(date: Date = new Date()): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

/** Convierte una clave YYYY-MM-DD a Date local (medianoche). */
export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}
