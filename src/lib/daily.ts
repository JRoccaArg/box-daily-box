/**
 * Orquestacion de la generacion diaria.
 *
 * Idea central para "todos ven lo mismo" + "no repetir lo reciente":
 *  - Se baraja el pool UNA vez con una seed estable (depende solo del salt del
 *    juego, no de la fecha).
 *  - Se indexa por numero de dia: (dayNumber + offset) % length.
 *  Resultado: una rotacion pseudoaleatoria fija. El mismo item no vuelve a
 *  salir hasta recorrer TODO el pool. Determinista y sin estado.
 *
 * Para selecciones mas complejas (grupos, intruso, etc.) usar `dailyRng`, que
 * da un generador determinista sembrado por fecha + salt.
 */
import { Rng, dayNumber, dateKey, xmur3 } from "./seed";

/** RNG determinista para un dia + juego concretos. */
export function dailyRng(date: Date, salt: string): Rng {
  return new Rng(`${dateKey(date)}::${salt}`);
}

/** Orden barajado estable de un pool (no depende de la fecha). */
function stableOrder<T>(pool: readonly T[], salt: string): T[] {
  return new Rng(`order::${salt}`).shuffle(pool);
}

/**
 * Selecciona 1 elemento del pool de forma determinista y NO repetitiva:
 * rota por todo el pool antes de repetir.
 */
export function dailyPick<T>(pool: readonly T[], date: Date, salt: string): T {
  if (pool.length === 0) throw new Error(`dailyPick: pool vacio (${salt})`);
  const order = stableOrder(pool, salt);
  const offset = xmur3(salt) % order.length;
  const idx = (dayNumber(date) + offset) % order.length;
  return order[idx] as T;
}

/**
 * Indice diario deterministico en [0, length). Util cuando se quiere el indice
 * y no el elemento (p.ej. para elegir un rango de una lista paralela).
 */
export function dailyIndex(length: number, date: Date, salt: string): number {
  if (length <= 0) return 0;
  const offset = xmur3(`idx::${salt}`) % length;
  return (dayNumber(date) + offset) % length;
}
