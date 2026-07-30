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

/**
 * "Semilla base" de la selección: por defecto la fecha (reto diario), pero si
 * se pasa `seed` (un string arbitrario, p.ej. el id de un duelo) se usa ESE
 * en su lugar. Así el mismo motor determinista sirve para el reto del día y
 * para un puzzle de duelo que NO depende de la fecha (permite rejugar el mismo
 * juego el mismo día con respuestas distintas). Ver Roadmap §4.
 *
 * `dateKey`/`dayNumber` derivan de la fecha; con `seed` se reemplazan por un
 * hash estable del seed, preservando determinismo y buena distribución.
 */
function baseSeedString(date: Date, seed?: string): string {
  return seed !== undefined ? seed : dateKey(date);
}
function rotationNumber(date: Date, seed?: string): number {
  return seed !== undefined ? xmur3(`seed::${seed}`) : dayNumber(date);
}

/** RNG determinista para un dia + juego concretos (o para un duelo si hay `seed`). */
export function dailyRng(date: Date, salt: string, seed?: string): Rng {
  return new Rng(`${baseSeedString(date, seed)}::${salt}`);
}

/** Orden barajado estable de un pool (no depende de la fecha). */
function stableOrder<T>(pool: readonly T[], salt: string): T[] {
  return new Rng(`order::${salt}`).shuffle(pool);
}

/**
 * Selecciona 1 elemento del pool de forma determinista y NO repetitiva:
 * rota por todo el pool antes de repetir. Con `seed` la rotación deja de
 * depender de la fecha y pasa a depender del seed (duelo).
 */
export function dailyPick<T>(pool: readonly T[], date: Date, salt: string, seed?: string): T {
  if (pool.length === 0) throw new Error(`dailyPick: pool vacio (${salt})`);
  const order = stableOrder(pool, salt);
  const offset = xmur3(salt) % order.length;
  const idx = (rotationNumber(date, seed) + offset) % order.length;
  return order[idx] as T;
}

/**
 * Indice diario deterministico en [0, length). Util cuando se quiere el indice
 * y no el elemento (p.ej. para elegir un rango de una lista paralela).
 */
export function dailyIndex(length: number, date: Date, salt: string, seed?: string): number {
  if (length <= 0) return 0;
  const offset = xmur3(`idx::${salt}`) % length;
  return (rotationNumber(date, seed) + offset) % length;
}
