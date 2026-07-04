// src/components/games/GPResultado/gpresultado.logic.ts
//
// Lógica de selección diaria, rangos de dificultad y verificación
// para GP Resultado. El verificador es una función PURA que el backend
// importa para re-verificar la solución del cliente (misma fuente de
// verdad ⇒ imposible que front y server diverjan).

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

/** Solución que el cliente envía: el top 10 en orden de posición (P1→P10). */
export type GPSolution = {
  /** Nombres de los 10 pilotos, en el orden P1..P10 que ocupó cada barra. */
  grid: (string | null)[];
};

/**
 * Verificador PURO (lo usa el backend en verifyChallenge).
 *
 * Reconstruye el GP del día con la MISMA semilla y compara: se gana si
 * las 10 posiciones están completas y cada nombre coincide exactamente
 * con el piloto que terminó en esa posición. No confía en el cliente.
 */
export function verifyGPResultado(
  difficulty: Difficulty,
  date: Date,
  solution: GPSolution,
): { won: boolean } {
  if (!solution || !Array.isArray(solution.grid)) return { won: false };
  if (solution.grid.length !== 10) return { won: false };

  const gp = buildGPChallenge(difficulty, date);
  for (let i = 0; i < 10; i++) {
    const expected = gp.t[i]?.[0];
    if (!expected) return { won: false };
    if (solution.grid[i] !== expected) return { won: false };
  }
  return { won: true };
}
