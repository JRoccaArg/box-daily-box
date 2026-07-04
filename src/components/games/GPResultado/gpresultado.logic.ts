// src/components/games/GPResultado/gpresultado.logic.ts
//
// Lógica de selección diaria y rangos de dificultad para GP Resultado.

import type { Difficulty } from "@/types";
import type { GPEntry } from "@/data/gpResults";
import { gpsByRange } from "@/data/gpResults";
import { dailyPick } from "@/lib/daily";

/** Rangos exclusivos por dificultad: cada dificultad fuerza una era distinta. */
const RANGES: Record<Difficulty, [number, number]> = {
  facil: [2018, 2025],
  medio: [2006, 2017],
  dificil: [1990, 2005],
  leyenda: [1950, 1989],
};

/**
 * Elige el GP del día según dificultad y fecha.
 * Usa dailyPick (semilla determinista por día) para que todos los
 * usuarios obtengan el mismo GP en el mismo día.
 */
export function buildGPChallenge(
  difficulty: Difficulty,
  date: Date,
): GPEntry {
  const [min, max] = RANGES[difficulty] ?? RANGES.medio;
  const pool = gpsByRange(min, max);
  if (pool.length === 0) {
    // Fallback: si no hay carreras en el rango, usar todo el dataset.
    const all = gpsByRange(1950, 2025);
    return dailyPick(all, date, `gpresultado::${difficulty}`);
  }
  return dailyPick(pool, date, `gpresultado::${difficulty}`);
}
