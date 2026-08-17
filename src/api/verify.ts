// src/api/verify.ts
//
// Verificadores server-side para cada juego.
// Importan la MISMA lógica determinista que el frontend, garantizando
// que el servidor genera el mismo puzzle y valida correctamente.

import type { Difficulty } from "../types";
import { DRIVERS_BY_ID } from "../data";
import { dateFromKey } from "../lib/seed";
import { buildTarget } from "../components/games/PitTexto/pittexto.logic";
import { dailyPick } from "../lib/daily";
import { getDriverPoolAtLeast } from "../lib/filters";
import { buildIntruso } from "../components/games/ElIntruso/intruso.logic";
import { buildBingo } from "../components/games/ParrillaBingo/bingo.logic";
import { buildGPChallenge } from "../components/games/GPResultado/gpresultado.logic";
import { buildChallenge as buildTop10StandingsChallenge } from "../components/games/Top10Standings/top10standings.logic";
import { buildCareerPathTarget } from "../components/games/CareerPath/careerpath.logic";
import { buildTeamRadio, optionId } from "../components/games/TeamRadio/teamradio.logic";

// ─── Tipos de solución por juego ────────────────────────────────────

interface PitTextoSolution {
  /** Id del piloto que el usuario eligió como respuesta final. */
  driverId: string;
}

interface PoleWordleSolution {
  /** Lista de guesses (wordleKeys) que el usuario probó, en orden. */
  guesses: string[];
}

interface IntrusoSolution {
  /** Id del piloto que el usuario seleccionó como intruso. */
  driverId: string;
}

interface BingoSolution {
  /**
   * Array de 9 driverIds, en orden fila*3+col.
   * Cada posición corresponde a la celda [fila][col] de la grilla.
   */
  grid: string[];
}

interface GPResultadoSolution {
  /**
   * Array de 10 nombres de piloto, en orden de posición P1..P10.
   * El juego coloca cada piloto acertado en su barra automáticamente,
   * así que un grid completo y correcto implica haber acertado los 10.
   */
  grid: (string | null)[];
}

interface Top10StandingsSolution {
  /**
   * Array de 10 nombres de piloto, en orden del top 10 ACUMULADO de puntos
   * del período (1-4 años) del día. Mismo shape que GPResultadoSolution.
   */
  grid: (string | null)[];
}

interface CareerPathSolution {
  /** Id del piloto que el usuario eligió como respuesta final. */
  driverId: string;
}

interface TeamRadioSolution {
  /** Id de la opción elegida ("<año>::<nombre del GP>"), una de las 6 que se mostraron. */
  optionId: string;
}

type AnySolution =
  | PitTextoSolution
  | PoleWordleSolution
  | IntrusoSolution
  | BingoSolution
  | GPResultadoSolution
  | Top10StandingsSolution
  | CareerPathSolution
  | TeamRadioSolution;

export interface VerifyResult {
  won: boolean;
  /** Detalle extra para debugging (solo visible en admin). */
  detail?: string;
}

// ─── Dispatcher ─────────────────────────────────────────────────────

/**
 * Verifica la solución de un juego.
 *
 * Regenera el puzzle del día con la MISMA lógica determinista del frontend
 * y compara la solución enviada por el cliente.
 */
export function verifyChallenge(
  gameId: string,
  difficulty: Difficulty,
  dateKeyStr: string,
  solution: AnySolution,
  /** Si viene, el puzzle se regenera con esta semilla (duelo) en vez de la fecha. */
  duelSeed?: string,
): VerifyResult {
  const date = dateFromKey(dateKeyStr);

  switch (gameId) {
    case "pittexto":
      return verifyPitTexto(difficulty, date, solution as PitTextoSolution, duelSeed);
    case "polewordle":
      return verifyPoleWordle(difficulty, date, solution as PoleWordleSolution, duelSeed);
    case "el-intruso":
      return verifyElIntruso(difficulty, date, solution as IntrusoSolution, duelSeed);
    case "parrilla-bingo":
      return verifyParrillaBingo(difficulty, date, solution as BingoSolution, duelSeed);
    case "gp-resultado":
      return verifyGPResultado(difficulty, date, solution as GPResultadoSolution, duelSeed);
    case "top10-standings":
      return verifyTop10Standings(difficulty, date, solution as Top10StandingsSolution, duelSeed);
    case "career-path":
      return verifyCareerPath(difficulty, date, solution as CareerPathSolution, duelSeed);
    case "team-radio":
      return verifyTeamRadio(difficulty, date, solution as TeamRadioSolution, duelSeed);
    default:
      return { won: false, detail: `Juego desconocido: ${gameId}` };
  }
}

// ─── Pit Texto ──────────────────────────────────────────────────────
//
// Regla: HAY UN SOLO piloto correcto por día/dificultad.
// El frontend usa buildTarget(difficulty, date) para generar el target.

function verifyPitTexto(
  difficulty: Difficulty,
  date: Date,
  solution: PitTextoSolution,
  seed?: string,
): VerifyResult {
  if (!solution.driverId) {
    return { won: false, detail: "Falta driverId en la solución" };
  }

  const target = buildTarget(difficulty, date, seed);
  const won = solution.driverId === target.id;

  return {
    won,
    detail: won
      ? `Correcto: ${target.id}`
      : `Incorrecto. Esperado: ${target.id}, recibido: ${solution.driverId}`,
  };
}

// ─── Pole Wordle ────────────────────────────────────────────────────
//
// Regla: HAY UN SOLO apellido correcto. El usuario tiene 6 intentos.
// Gana si ALGUNO de sus guesses coincide con target.wordleKey.

function verifyPoleWordle(
  difficulty: Difficulty,
  date: Date,
  solution: PoleWordleSolution,
  seed?: string,
): VerifyResult {
  if (!solution.guesses || !Array.isArray(solution.guesses) || solution.guesses.length === 0) {
    return { won: false, detail: "Falta guesses en la solución" };
  }

  // Regenerar el target exactamente como el frontend
  const base = getDriverPoolAtLeast(difficulty, 10);
  const sane = base.filter((d) => d.wordleKey.length >= 4 && d.wordleKey.length <= 11);
  const pool = sane.length >= 8 ? sane : base;
  const target = dailyPick(pool, date, `polewordle::${difficulty}`, seed);
  const answer = target.wordleKey;

  // Verificar: gana si algún guess coincide (case-insensitive, normalizado)
  const won = solution.guesses.some(
    (g) => typeof g === "string" && g.toUpperCase() === answer,
  );

  return {
    won,
    detail: won
      ? `Correcto: ${answer} (en ${solution.guesses.length} intentos)`
      : `Incorrecto. Esperado: ${answer}, guesses: [${solution.guesses.join(", ")}]`,
  };
}

// ─── El Intruso ─────────────────────────────────────────────────────
//
// Regla: HAY UN SOLO intruso entre 10 pilotos.
// 9 comparten una característica, 1 no.

function verifyElIntruso(
  difficulty: Difficulty,
  date: Date,
  solution: IntrusoSolution,
  seed?: string,
): VerifyResult {
  if (!solution.driverId) {
    return { won: false, detail: "Falta driverId en la solución" };
  }

  const puzzle = buildIntruso(difficulty, date, seed);
  const won = solution.driverId === puzzle.intruderId;

  return {
    won,
    detail: won
      ? `Correcto: ${puzzle.intruderId} (regla: ${puzzle.rule.key})`
      : `Incorrecto. Intruso era: ${puzzle.intruderId}, recibido: ${solution.driverId}. Regla: ${puzzle.rule.key}`,
  };
}

// ─── Parrilla Bingo ─────────────────────────────────────────────────
//
// Regla: MÚLTIPLES soluciones válidas.
// Cada celda acepta CUALQUIER piloto que cumpla:
//   1. row.match(driver) === true  (escudería, match global = droveFor alguna vez)
//   2. col.match(driver) === true  (nacionalidad, campeón, logro, u otra escudería)
//   3. Los 9 pilotos deben ser DISTINTOS.
//
// NO se compara contra la solución canónica (que es solo UN ejemplo válido).
// No hay forma de "perder" Bingo: el frontend solo llama onWin().

function verifyParrillaBingo(
  difficulty: Difficulty,
  date: Date,
  solution: BingoSolution,
  seed?: string,
): VerifyResult {
  if (!solution.grid || !Array.isArray(solution.grid) || solution.grid.length !== 9) {
    return { won: false, detail: "Falta grid (9 elementos) en la solución" };
  }

  const puzzle = buildBingo(difficulty, date, seed);
  const { rows, cols } = puzzle;

  // Validar que hay 3 filas y 3 columnas
  if (rows.length !== 3 || cols.length !== 3) {
    return { won: false, detail: "Puzzle inválido (filas o columnas != 3)" };
  }

  // Verificar que los 9 pilotos son distintos
  const uniqueIds = new Set(solution.grid);
  if (uniqueIds.size !== 9) {
    return {
      won: false,
      detail: `Pilotos repetidos. Únicos: ${uniqueIds.size}, esperados: 9`,
    };
  }

  // Verificar cada celda
  const errors: string[] = [];
  for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
    const driverId = solution.grid[cellIdx];
    if (!driverId) {
      errors.push(`Celda ${cellIdx}: vacía`);
      continue;
    }

    const driver = DRIVERS_BY_ID[driverId];
    if (!driver) {
      errors.push(`Celda ${cellIdx}: piloto no existe (${driverId})`);
      continue;
    }

    const rowIdx = Math.floor(cellIdx / 3);
    const colIdx = cellIdx % 3;
    const row = rows[rowIdx]!;
    const col = cols[colIdx]!;

    const okRow = row.match(driver);
    const okCol = col.match(driver);

    if (!okRow) {
      errors.push(`Celda ${cellIdx}: ${driverId} no cumple fila "${row.label}"`);
    }
    if (!okCol) {
      errors.push(`Celda ${cellIdx}: ${driverId} no cumple columna "${col.label}"`);
    }
  }

  const won = errors.length === 0;
  return {
    won,
    detail: won
      ? "Grilla completa y válida (9 pilotos distintos, todas las restricciones cumplidas)"
      : `Errores: ${errors.join("; ")}`,
  };
}

// ─── GP Resultado ───────────────────────────────────────────────────
//
// Regla: HAY UNA SOLA solución (el top 10 real del GP del día).
// El usuario debe completar las 10 posiciones con el piloto exacto que
// terminó en cada una. El juego coloca cada piloto acertado en su barra,
// así que un grid completo P1..P10 correcto sólo se logra acertando los 10.
//
// El servidor regenera el GP con buildGPChallenge (determinista) y compara
// posición por posición. No confía en el cliente.

function verifyGPResultado(
  difficulty: Difficulty,
  date: Date,
  solution: GPResultadoSolution,
  seed?: string,
): VerifyResult {
  if (!solution.grid || !Array.isArray(solution.grid) || solution.grid.length !== 10) {
    return { won: false, detail: "Falta grid (10 elementos) en la solución" };
  }

  const gp = buildGPChallenge(difficulty, date, seed);

  const errors: string[] = [];
  for (let i = 0; i < 10; i++) {
    const expected = gp.t[i]?.[0];
    if (!expected) {
      errors.push(`P${i + 1}: puzzle inválido (sin piloto esperado)`);
      continue;
    }
    if (solution.grid[i] !== expected) {
      errors.push(`P${i + 1}: esperado "${expected}", recibido "${solution.grid[i] ?? "vacío"}"`);
    }
  }

  const won = errors.length === 0;
  return {
    won,
    detail: won
      ? `Top 10 completo y correcto (${gp.y} ${gp.g})`
      : `Errores: ${errors.join("; ")}`,
  };
}

// ─── Top 10 Standings ───────────────────────────────────────────────
//
// Regla: HAY UNA SOLA solución (el top 10 acumulado de puntos del período
// de 1-4 años del día). El usuario debe completar las 10 posiciones con el
// piloto exacto. Misma lógica de verificación que GP Resultado, pero el
// "puzzle" es un acumulado multi-año en vez de una carrera puntual.
//
// El servidor regenera el período con buildTop10StandingsChallenge
// (determinista) y compara posición por posición. No confía en el cliente.

function verifyTop10Standings(
  difficulty: Difficulty,
  date: Date,
  solution: Top10StandingsSolution,
  seed?: string,
): VerifyResult {
  if (!solution.grid || !Array.isArray(solution.grid) || solution.grid.length !== 10) {
    return { won: false, detail: "Falta grid (10 elementos) en la solución" };
  }

  const challenge = buildTop10StandingsChallenge(difficulty, date, seed);

  const errors: string[] = [];
  for (let i = 0; i < 10; i++) {
    const expected = challenge.top10[i]?.name;
    if (!expected) {
      errors.push(`P${i + 1}: puzzle inválido (sin piloto esperado)`);
      continue;
    }
    if (solution.grid[i] !== expected) {
      errors.push(`P${i + 1}: esperado "${expected}", recibido "${solution.grid[i] ?? "vacío"}"`);
    }
  }

  const won = errors.length === 0;
  return {
    won,
    detail: won
      ? `Top 10 acumulado completo y correcto (${challenge.startYear}-${challenge.endYear})`
      : `Errores: ${errors.join("; ")}`,
  };
}

// ─── Career Path ────────────────────────────────────────────────────
//
// Regla: HAY UN SOLO piloto correcto por día/dificultad (mismo patrón que
// Pit Texto). El frontend usa buildCareerPathTarget(difficulty, date) para
// generar el target.

function verifyCareerPath(
  difficulty: Difficulty,
  date: Date,
  solution: CareerPathSolution,
  seed?: string,
): VerifyResult {
  if (!solution.driverId) {
    return { won: false, detail: "Falta driverId en la solución" };
  }

  const target = buildCareerPathTarget(difficulty, date, seed);
  const won = solution.driverId === target.id;

  return {
    won,
    detail: won
      ? `Correcto: ${target.id}`
      : `Incorrecto. Esperado: ${target.id}, recibido: ${solution.driverId}`,
  };
}

// ─── Team Radio ─────────────────────────────────────────────────────
//
// Regla: HAY UNA SOLA opción correcta (el GP real donde se dijo la radio),
// entre las 6 que se le mostraron al usuario. El frontend usa
// buildTeamRadio(difficulty, date) para generar el puzzle completo
// (radio + las 6 opciones); acá solo hace falta la opción correcta.

function verifyTeamRadio(
  difficulty: Difficulty,
  date: Date,
  solution: TeamRadioSolution,
  seed?: string,
): VerifyResult {
  if (!solution.optionId) {
    return { won: false, detail: "Falta optionId en la solución" };
  }

  const puzzle = buildTeamRadio(difficulty, date, seed);
  const correctId = optionId({ y: puzzle.radio.y, g: puzzle.radio.g, c: puzzle.radio.c });
  const won = solution.optionId === correctId;

  return {
    won,
    detail: won
      ? `Correcto: ${puzzle.radio.g} ${puzzle.radio.y}`
      : `Incorrecto. Esperado: ${correctId}, recibido: ${solution.optionId}`,
  };
}
