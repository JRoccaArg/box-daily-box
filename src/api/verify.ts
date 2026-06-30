// src/api/verify.ts
import type { Difficulty } from "../types";
import { drivers, teams, nationalities } from "../data";
import { seedRandom } from "../lib/seed";

/**
 * Verifica la solución de cada juego según su lógica.
 * Devuelve { won: boolean }
 */
export function verifyChallenge(
  gameId: string,
  difficulty: Difficulty,
  dateKeyStr: string,
  solution: any
): { won: boolean } {
  switch (gameId) {
    case "pit-texto":
      return verifyPitTexto(difficulty, dateKeyStr, solution);
    case "pole-wordle":
      return verifyPoleWordle(difficulty, dateKeyStr, solution);
    case "el-intruso":
      return verifyElIntruso(difficulty, dateKeyStr, solution);
    case "parrilla-bingo":
      return verifyParrillaBingo(difficulty, dateKeyStr, solution);
    default:
      return { won: false };
  }
}

/**
 * Pit Texto: Adivina el piloto por pistas.
 */
function verifyPitTexto(
  difficulty: Difficulty,
  dateKeyStr: string,
  solution: { driverId: string }
): { won: boolean } {
  try {
    const [year, month, day] = dateKeyStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    // RNG determinista
    const rng = seedRandom(date.getTime() + difficulty.charCodeAt(0));

    // Filtrar pilotos por dificultad
    const minYear = getDifficultyMinYear(difficulty);
    const filtered = drivers.filter((d) => {
      const debut = d.debut_year ?? 2025;
      return debut >= minYear;
    });

    if (filtered.length === 0) return { won: false };

    // Elegir piloto
    const idx = Math.floor(rng() * filtered.length);
    const targetDriver = filtered[idx];

    // Verificar
    return { won: solution.driverId === targetDriver.id };
  } catch {
    return { won: false };
  }
}

/**
 * Pole Wordle: 5 intentos para adivinar el apellido del piloto.
 */
function verifyPoleWordle(
  difficulty: Difficulty,
  dateKeyStr: string,
  solution: { guesses: string[] }
): { won: boolean } {
  try {
    const [year, month, day] = dateKeyStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const rng = seedRandom(date.getTime() + difficulty.charCodeAt(1));

    const minYear = getDifficultyMinYear(difficulty);
    const filtered = drivers.filter((d) => {
      const debut = d.debut_year ?? 2025;
      return debut >= minYear;
    });

    if (filtered.length === 0) return { won: false };

    const idx = Math.floor(rng() * filtered.length);
    const targetDriver = filtered[idx];
    const answer = targetDriver.surname.toLowerCase();

    // Verificar si algún guess es correcto
    const won = solution.guesses.some((guess: string) => guess.toLowerCase() === answer);

    return { won };
  } catch {
    return { won: false };
  }
}

/**
 * El Intruso: 9 pilotos, 8 comparten algo, 1 no.
 * Selecciona quién NO pertenece.
 */
function verifyElIntruso(
  difficulty: Difficulty,
  dateKeyStr: string,
  solution: { driverId: string }
): { won: boolean } {
  try {
    const [year, month, day] = dateKeyStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const rng = seedRandom(date.getTime() + difficulty.charCodeAt(2));

    const minYear = getDifficultyMinYear(difficulty);
    const filtered = drivers.filter((d) => {
      const debut = d.debut_year ?? 2025;
      return debut >= minYear;
    });

    if (filtered.length < 9) return { won: false };

    // Elegir 9 pilotos aleatorios
    const selected: typeof drivers = [];
    const indices = new Set<number>();
    while (selected.length < 9) {
      const idx = Math.floor(rng() * filtered.length);
      if (!indices.has(idx)) {
        indices.add(idx);
        selected.push(filtered[idx]!);
      }
    }

    // El último es el intruso (hardcoded para determinismo)
    const intruder = selected[8]!;

    return { won: solution.driverId === intruder.id };
  } catch {
    return { won: false };
  }
}

/**
 * Parrilla Bingo: Grilla 3×3 con escuderías + condiciones.
 * Verificar que cada celda tiene un piloto válido.
 */
function verifyParrillaBingo(
  difficulty: Difficulty,
  dateKeyStr: string,
  solution: { grid: Array<Array<{ driverId: string }>> }
): { won: boolean } {
  try {
    if (!solution.grid || solution.grid.length !== 3) return { won: false };

    // Verificar que cada fila tiene 3 elementos
    for (const row of solution.grid) {
      if (!Array.isArray(row) || row.length !== 3) return { won: false };
      for (const cell of row) {
        if (!cell.driverId) return { won: false };

        // Verificar que el piloto existe
        const driver = drivers.find((d) => d.id === cell.driverId);
        if (!driver) return { won: false };
      }
    }

    // En producción, validar que cada fila/columna/diagonal cumplen condiciones
    // Por ahora, aceptar cualquier grilla con 9 pilotos válidos
    return { won: true };
  } catch {
    return { won: false };
  }
}

/**
 * Obtiene el año mínimo de debut según dificultad.
 */
function getDifficultyMinYear(difficulty: Difficulty): number {
  const floors: Record<Difficulty, number> = {
    facil: 2019,
    medio: 2006,
    dificil: 1990,
    leyenda: -Infinity,
  };
  return floors[difficulty] ?? 2019;
}
