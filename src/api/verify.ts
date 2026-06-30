// src/api/verify.ts
import type { Difficulty } from "../types";
import { DRIVERS } from "../data";
import { mulberry32 } from "../lib/seed";

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
    const parts = dateKeyStr.split("-");
    const year = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10);
    const day = parseInt(parts[2]!, 10);
    const date = new Date(year, month - 1, day);

    const rng = mulberry32(date.getTime() + difficulty.charCodeAt(0));
    const minYear = getDifficultyMinYear(difficulty);
    const filtered = DRIVERS.filter((d: any) => (d.debut_year ?? 2025) >= minYear);

    if (filtered.length === 0) return { won: false };
    const idx = Math.floor(rng() * filtered.length);
    const targetDriver = filtered[idx];
    return { won: solution.driverId === targetDriver!.id };
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
    const parts = dateKeyStr.split("-");
    const year = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10);
    const day = parseInt(parts[2]!, 10);
    const date = new Date(year, month - 1, day);

    const rng = mulberry32(date.getTime() + difficulty.charCodeAt(1));
    const minYear = getDifficultyMinYear(difficulty);
    const filtered = DRIVERS.filter((d: any) => (d.debut_year ?? 2025) >= minYear);

    if (filtered.length === 0) return { won: false };
    const idx = Math.floor(rng() * filtered.length);
    const targetDriver = filtered[idx];
    const answer = targetDriver!.lastName.toLowerCase();

    const won = solution.guesses.some((guess: string) => guess.toLowerCase() === answer);
    return { won };
  } catch {
    return { won: false };
  }
}

/**
 * El Intruso: 9 pilotos, 8 comparten algo, 1 no.
 */
function verifyElIntruso(
  difficulty: Difficulty,
  dateKeyStr: string,
  solution: { driverId: string }
): { won: boolean } {
  try {
    const parts = dateKeyStr.split("-");
    const year = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10);
    const day = parseInt(parts[2]!, 10);
    const date = new Date(year, month - 1, day);

    const rng = mulberry32(date.getTime() + difficulty.charCodeAt(2));
    const minYear = getDifficultyMinYear(difficulty);
    const filtered = DRIVERS.filter((d: any) => (d.debut_year ?? 2025) >= minYear);

    if (filtered.length < 9) return { won: false };

    const selected: any[] = [];
    const indices = new Set<number>();
    while (selected.length < 9) {
      const idx = Math.floor(rng() * filtered.length);
      if (!indices.has(idx)) {
        indices.add(idx);
        selected.push(filtered[idx]);
      }
    }

    const intruder = selected[8];
    return { won: solution.driverId === intruder!.id };
  } catch {
    return { won: false };
  }
}

/**
 * Parrilla Bingo: Grilla 3×3 con escuderías + condiciones.
 */
function verifyParrillaBingo(
  _difficulty: Difficulty,
  _dateKeyStr: string,
  solution: { grid: Array<Array<{ driverId: string }>> }
): { won: boolean } {
  try {
    if (!solution.grid || solution.grid.length !== 3) return { won: false };

    for (const row of solution.grid) {
      if (!Array.isArray(row) || row.length !== 3) return { won: false };
      for (const cell of row) {
        if (!cell.driverId) return { won: false };
        const driver = DRIVERS.find((d: any) => d.id === cell.driverId);
        if (!driver) return { won: false };
      }
    }

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