/**
 * Filtros de dificultad.
 *
 * Las cohortes se definen relativas a la temporada de referencia del dataset
 * (DATA_AS_OF_SEASON), no al anio real del reloj, para que "actual" sea
 * coherente con los datos cargados. Al actualizar el dataset, basta con
 * mover DATA_AS_OF_SEASON.
 *
 *   facil   -> parrilla reciente (ultimas ~7 temporadas)
 *   medio   -> era hibrida y V8 (desde 2006)
 *   dificil -> era moderna (desde 1990)
 *   leyenda -> toda la historia de la F1
 */
import { DRIVERS, TEAMS, DATA_AS_OF_SEASON, activeInRange } from "@/data";
import type { Difficulty, Driver, Team } from "@/types";

const CURRENT_SEASON = DATA_AS_OF_SEASON;

/** Orden de dificultades de menor a mayor amplitud historica. */
export const DIFFICULTY_ORDER: Difficulty[] = ["facil", "medio", "dificil", "leyenda"];

/** Anio de corte inferior por dificultad. -Infinity = sin limite. */
export function difficultyFloor(difficulty: Difficulty): number {
  switch (difficulty) {
    case "facil":
      return CURRENT_SEASON - 6; // ultimas ~7 temporadas
    case "medio":
      return 2006;
    case "dificil":
      return 1990;
    case "leyenda":
      return -Infinity;
  }
}

/** Pool de pilotos para una dificultad. */
export function getDriverPool(difficulty: Difficulty): Driver[] {
  const floor = difficultyFloor(difficulty);
  if (floor === -Infinity) return DRIVERS.slice();
  return DRIVERS.filter((d) => activeInRange(d, floor, CURRENT_SEASON + 1));
}

/** Pool de escuderias para una dificultad. */
export function getTeamPool(difficulty: Difficulty): Team[] {
  const floor = difficultyFloor(difficulty);
  const all = Object.values(TEAMS);
  if (floor === -Infinity) return all;
  return all.filter((t) => {
    const end = t.active.end ?? CURRENT_SEASON + 1;
    return t.active.start <= CURRENT_SEASON + 1 && end >= floor;
  });
}

/**
 * Garantiza un pool de al menos `min` pilotos: si la dificultad elegida es
 * demasiado restrictiva, "afloja" hacia historico. Evita que un juego se
 * quede sin material.
 */
export function getDriverPoolAtLeast(difficulty: Difficulty, min: number): Driver[] {
  let idx = DIFFICULTY_ORDER.indexOf(difficulty);
  let pool = getDriverPool(difficulty);
  while (pool.length < min && idx < DIFFICULTY_ORDER.length - 1) {
    idx++;
    pool = getDriverPool(DIFFICULTY_ORDER[idx] as Difficulty);
  }
  return pool;
}
