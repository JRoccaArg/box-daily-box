// src/components/games/Top10Standings/top10standings.logic.ts
//
// Lógica de selección diaria, rangos de dificultad y verificación para
// "Top 10 Standings". A diferencia de GP Resultado (una carrera puntual),
// acá el reto es el TOP 10 ACUMULADO de puntos del campeonato de pilotos
// a lo largo de un período de 1 a 4 años consecutivos (sorteado por día).
//
// El verificador es una función PURA que el backend importa para
// re-verificar la solución del cliente (misma fuente de verdad ⇒
// imposible que front y server diverjan).

import type { Difficulty } from "@/types";
import type { StandingEntry } from "@/data/championshipStandings";
import { CHAMPIONSHIP_STANDINGS } from "@/data/championshipStandings";
import { dailyPick } from "@/lib/daily";

/** Rangos exclusivos por dificultad: idénticos a GP Resultado (misma era). */
const RANGES: Record<Difficulty, [number, number]> = {
  facil: [2018, 2025],
  medio: [2006, 2017],
  dificil: [1990, 2005],
  leyenda: [1950, 1989],
};

/** Mínimo de pilotos distintos que debe tener un período para ser válido. */
const MIN_DRIVERS = 10;

/** Mínimo de años que puede durar un período. */
const MIN_LENGTH = 1;
/** Máximo de años que puede durar un período. */
const MAX_LENGTH = 4;

type Period = { startYear: number; length: number };

const STANDINGS_BY_YEAR = new Map(
  CHAMPIONSHIP_STANDINGS.map((s) => [s.year, s.standings]),
);

/** Suma los puntos de cada piloto a través de los años del período. */
function accumulate(startYear: number, length: number): StandingEntry[] {
  const totals = new Map<string, { nationalityCode: string; points: number }>();
  for (let year = startYear; year < startYear + length; year++) {
    const standings = STANDINGS_BY_YEAR.get(year) ?? [];
    for (const entry of standings) {
      const acc = totals.get(entry.name) ?? { nationalityCode: entry.nationalityCode, points: 0 };
      acc.points += entry.points;
      totals.set(entry.name, acc);
    }
  }
  return [...totals.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

/** Enumera todos los períodos válidos (1-4 años) dentro de una era. */
function validPeriods(difficulty: Difficulty): Period[] {
  const [min, max] = RANGES[difficulty] ?? RANGES.medio;
  const periods: Period[] = [];
  for (let length = MIN_LENGTH; length <= MAX_LENGTH; length++) {
    for (let startYear = min; startYear + length - 1 <= max; startYear++) {
      const uniqueDrivers = accumulate(startYear, length).length;
      if (uniqueDrivers >= MIN_DRIVERS) periods.push({ startYear, length });
    }
  }
  return periods;
}

export type ChallengeEntry = {
  startYear: number;
  endYear: number;
  /** Top 10 acumulado, ya ordenado por puntos (desc), longitud 10. */
  top10: StandingEntry[];
};

/**
 * Elige el período del día según dificultad y fecha.
 * Usa dailyPick (semilla determinista por día) para que todos los
 * usuarios obtengan el mismo período en el mismo día.
 */
export function buildChallenge(difficulty: Difficulty, date: Date): ChallengeEntry {
  const periods = validPeriods(difficulty);
  const period = periods.length > 0
    ? dailyPick(periods, date, `top10-standings::${difficulty}`)
    : { startYear: RANGES.medio[0], length: 1 }; // fallback defensivo, no debería ocurrir

  const top10 = accumulate(period.startYear, period.length).slice(0, 10);
  return {
    startYear: period.startYear,
    endYear: period.startYear + period.length - 1,
    top10,
  };
}

/** Todos los nombres de piloto que aparecen en el dataset (para autocompletado). */
export function allStandingsDriverNames(): string[] {
  const set = new Set<string>();
  for (const season of CHAMPIONSHIP_STANDINGS) {
    for (const entry of season.standings) set.add(entry.name);
  }
  return [...set].sort();
}

/** Busca pilotos por texto (case-insensitive, sin acentos, coincidencia parcial). */
export function searchStandingsDrivers(query: string, pool: string[]): string[] {
  const q = query.toLowerCase().normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
  return pool.filter((name) => {
    const n = name.toLowerCase().normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
    return n.includes(q);
  });
}

/** Solución que el cliente envía: el top 10 en orden de posición (P1→P10). */
export type Top10StandingsSolution = {
  /** Nombres de los 10 pilotos, en el orden P1..P10 que ocupó cada barra. */
  grid: (string | null)[];
};

/**
 * Verificador PURO (lo usa el backend en verifyChallenge).
 *
 * Reconstruye el período del día con la MISMA semilla y compara: se gana
 * si las 10 posiciones están completas y cada nombre coincide exactamente
 * con el piloto que ocupó esa posición en el acumulado. No confía en el cliente.
 */
export function verifyTop10Standings(
  difficulty: Difficulty,
  date: Date,
  solution: Top10StandingsSolution,
): { won: boolean } {
  if (!solution || !Array.isArray(solution.grid)) return { won: false };
  if (solution.grid.length !== 10) return { won: false };

  const challenge = buildChallenge(difficulty, date);
  for (let i = 0; i < 10; i++) {
    const expected = challenge.top10[i]?.name;
    if (!expected) return { won: false };
    if (solution.grid[i] !== expected) return { won: false };
  }
  return { won: true };
}
