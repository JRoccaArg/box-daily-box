// src/lib/career/grid.ts
//
// La parrilla del Modo Carrera: las 10 escuderias actuales, el rendimiento
// de cada coche (y como evoluciona anio a anio) y los 20 pilotos.
//
// Los rivales arrancan siendo los REALES de la parrilla actual (salen del
// dataset de src/data, no se duplican nombres aca) y con los anios se van
// retirando: los reemplazan jovenes generados, para que una carrera de 24
// temporadas no termine con Alonso corriendo a los 68.

import type { Rng } from "@/lib/seed";
import { DRIVERS_BY_ID } from "@/data";
import type { Driver } from "@/types";
import type { DriverAttributes, RivalDriver, SeatOccupant, TeamState } from "./types";
import {
  CAR_DRIFT,
  CAR_PERF_MAX,
  CAR_PERF_MIN,
  CAR_REVERSION,
  SHAKEUP_CHANCE,
  SHAKEUP_DRIFT,
} from "./constants";

/** Las 10 escuderias actuales (ids del dataset real de src/data/teams.ts). */
export const CAREER_TEAM_IDS = [
  "mclaren",
  "ferrari",
  "red-bull",
  "mercedes",
  "williams",
  "racing-bulls",
  "aston-martin",
  "haas",
  "alpine",
  "kick-sauber",
] as const;

/**
 * Fuerza inicial aproximada de cada coche, en el orden de la parrilla
 * actual. No es un dato del dataset (no existe ahi), es la calibracion de
 * arranque del simulador; a partir de la 2da temporada evoluciona sola.
 */
const INITIAL_CAR_PERFORMANCE: Record<string, number> = {
  "mclaren": 92,
  "ferrari": 84,
  "red-bull": 83,
  "mercedes": 82,
  "williams": 66,
  "racing-bulls": 60,
  "aston-martin": 55,
  "haas": 54,
  "alpine": 44,
  "kick-sauber": 42,
};

/** Butacas iniciales: los 20 pilotos reales de la parrilla actual. */
const INITIAL_SEATS: Record<string, [string, string]> = {
  "mclaren": ["lando-norris", "oscar-piastri"],
  "ferrari": ["charles-leclerc", "lewis-hamilton"],
  "red-bull": ["max-verstappen", "yuki-tsunoda"],
  "mercedes": ["george-russell", "kimi-antonelli"],
  "williams": ["alexander-albon", "carlos-sainz-jr"],
  "racing-bulls": ["isack-hadjar", "liam-lawson"],
  "aston-martin": ["fernando-alonso", "lance-stroll"],
  "haas": ["esteban-ocon", "oliver-bearman"],
  "alpine": ["pierre-gasly", "franco-colapinto"],
  "kick-sauber": ["nico-hulkenberg", "gabriel-bortoleto"],
};

/** Nombres para pilotos generados. Son nombres propios inventados: NO se
 *  traducen (misma excepcion que los nombres del dataset real). */
const GEN_FIRST = [
  "Luca", "Mateo", "Nico", "Elias", "Tomas", "Bruno", "Kai", "Andre",
  "Rafael", "Milan", "Otto", "Diego", "Felix", "Ivan", "Noah", "Sergio",
  "Enzo", "Viktor", "Hugo", "Dario", "Emil", "Joel", "Ruben", "Theo",
];
const GEN_LAST = [
  "Bianchi", "Vermeer", "Kovacs", "Ferreira", "Lindqvist", "Moretti",
  "Duval", "Nakamura", "Ricci", "Sorensen", "Alvarez", "Brandt", "Costa",
  "Halvorsen", "Marchetti", "Okada", "Petrov", "Rossi", "Vidal", "Weiss",
  "Almeida", "Berger", "Cruz", "Dumont",
];
const GEN_NATIONALITIES = [
  "ITA", "GBR", "FRA", "DEU", "ESP", "BRA", "ARG", "NLD", "AUS", "JPN",
  "USA", "MEX", "FIN", "DNK", "CHE", "BEL", "SWE", "CAN", "NZL", "PRT",
];

/** Edad a la que un rival empieza a plantearse el retiro. */
const RIVAL_RETIRE_AGE = 36;

/**
 * Atributos de un piloto real derivados de su palmares REAL del dataset
 * (titulos, victorias, podios, poles). Asi Verstappen y Hamilton arrancan
 * fuertes y un debutante arranca mas flojo, sin inventar numeros a mano.
 */
function attributesFromRealDriver(d: Driver): DriverAttributes {
  const wins = d.wins ?? 0;
  const podiums = d.podiums ?? 0;
  const poles = d.poles ?? 0;
  const titles = d.championships;

  // Escalas suaves y con techo: el palmares empuja, no dispara.
  const winScore = Math.min(18, Math.sqrt(wins) * 3.4);
  const podiumScore = Math.min(12, Math.sqrt(podiums) * 1.9);
  const titleScore = Math.min(10, titles * 2.6);
  const poleScore = Math.min(8, Math.sqrt(poles) * 1.7);

  const pace = clampAttr(62 + winScore + titleScore * 0.5 + poleScore * 0.5);
  const consistency = clampAttr(60 + podiumScore + titleScore * 0.6);
  const racecraft = clampAttr(60 + winScore * 0.7 + podiumScore * 0.6);
  return { pace, consistency, racecraft };
}

/** Techo de talento de un piloto real: algo por encima de lo que ya mostro. */
function potentialFromAttributes(attr: DriverAttributes, bonus: number): number {
  const best = Math.max(attr.pace, attr.consistency, attr.racecraft);
  return clampAttr(best + bonus);
}

function clampAttr(v: number): number {
  return Math.max(1, Math.min(99, Math.round(v)));
}

/** Edad actual aproximada de un piloto real, derivada de su debut. */
function ageFromDebut(d: Driver, currentYear: number): number {
  // La mayoria debuta entre los 18 y los 22; tomamos 20 como referencia.
  const seasonsSinceDebut = Math.max(0, currentYear - d.active.start);
  return 20 + seasonsSinceDebut;
}

/** Construye un rival a partir de un piloto REAL del dataset. */
export function rivalFromRealDriver(driverId: string, year: number): RivalDriver | null {
  const d = DRIVERS_BY_ID[driverId];
  if (!d) return null;
  const age = ageFromDebut(d, year);
  const attributes = attributesFromRealDriver(d);
  // A los jovenes reales todavia les queda margen de crecimiento; a los
  // consagrados, poco (ya estan cerca de su techo).
  return {
    id: d.id,
    firstName: d.firstName,
    lastName: d.lastName,
    nationalityCode: d.nationalityCode,
    age,
    attributes,
    potential: potentialFromAttributes(attributes, age <= 23 ? 22 : age <= 27 ? 10 : 4),
    real: true,
  };
}

/** Genera un piloto joven ficticio para reemplazar a uno que se retira. */
export function generateRookieRival(rng: Rng, uid: number): RivalDriver {
  const first = rng.pick(GEN_FIRST);
  const last = rng.pick(GEN_LAST);
  // Techo variable: la mayoria queda en el monton, pero cada tanto aparece
  // un fenomeno. Sin esto la parrilla se debilita con los anios (los cracks
  // reales se retiran) y el jugador termina ganando todo por descarte.
  const prodigy = rng.bool(0.18);
  const potential = prodigy ? rng.int(86, 96) : rng.int(66, 84);
  const start = potential - rng.int(14, 24);
  return {
    id: `gen::${uid}`,
    firstName: first,
    lastName: last,
    nationalityCode: rng.pick(GEN_NATIONALITIES),
    age: rng.int(18, 21),
    attributes: {
      pace: clampAttr(start + rng.int(-3, 3)),
      consistency: clampAttr(start - 3 + rng.int(-3, 3)),
      racecraft: clampAttr(start - 1 + rng.int(-3, 3)),
    },
    potential,
    real: false,
  };
}

/** Estado inicial de las 10 escuderias, con algo de ruido sobre la base. */
export function buildInitialTeams(rng: Rng): TeamState[] {
  return CAREER_TEAM_IDS.map((teamId) => ({
    teamId,
    carPerformance: clampPerf((INITIAL_CAR_PERFORMANCE[teamId] ?? 60) + rng.int(-4, 4)),
    reliability: rng.int(55, 90),
  }));
}

function clampPerf(v: number): number {
  return Math.max(CAR_PERF_MIN, Math.min(CAR_PERF_MAX, Math.round(v)));
}

/**
 * Evoluciona los coches de un anio al siguiente.
 *
 * Tres fuerzas combinadas:
 *  1. Deriva aleatoria: cada equipo mejora o empeora un poco.
 *  2. Reversion a la media: los de arriba tienden a bajar y los de abajo a
 *     subir, para que nadie domine 24 temporadas seguidas.
 *  3. Cambio de reglamento (SHAKEUP_CHANCE): cada tantos anios la parrilla
 *     se reordena de golpe, como pasa en la F1 real.
 */
export function evolveTeams(teams: TeamState[], rng: Rng): { teams: TeamState[]; shakeup: boolean } {
  const shakeup = rng.bool(SHAKEUP_CHANCE);
  const drift = shakeup ? SHAKEUP_DRIFT : CAR_DRIFT;
  const mean = teams.reduce((s, t) => s + t.carPerformance, 0) / teams.length;

  const next = teams.map((t) => {
    const toMean = (mean - t.carPerformance) * CAR_REVERSION;
    const random = (rng.float() * 2 - 1) * drift;
    return {
      teamId: t.teamId,
      carPerformance: clampPerf(t.carPerformance + toMean + random),
      reliability: Math.max(40, Math.min(96, t.reliability + rng.int(-6, 6))),
    };
  });
  return { teams: next, shakeup };
}

/** Parrilla inicial: los 20 pilotos reales en sus equipos reales. */
export function buildInitialGrid(year: number): Record<string, [SeatOccupant, SeatOccupant]> {
  const grid: Record<string, [SeatOccupant, SeatOccupant]> = {};
  for (const teamId of CAREER_TEAM_IDS) {
    const [aId, bId] = INITIAL_SEATS[teamId] as [string, string];
    const a = rivalFromRealDriver(aId, year);
    const b = rivalFromRealDriver(bId, year);
    if (!a || !b) throw new Error(`Modo Carrera: falta piloto real para ${teamId}`);
    grid[teamId] = [
      { kind: "rival", driver: a },
      { kind: "rival", driver: b },
    ];
  }
  return grid;
}

/**
 * Envejece a los rivales un anio, hace crecer a los jovenes, decaer a los
 * veteranos y retira a los que ya estan grandes (reemplazandolos por
 * jovenes generados). Devuelve la parrilla nueva.
 */
export function ageGrid(
  grid: Record<string, [SeatOccupant, SeatOccupant]>,
  rng: Rng,
  uidStart: number,
): { grid: Record<string, [SeatOccupant, SeatOccupant]>; nextUid: number } {
  let uid = uidStart;
  const next: Record<string, [SeatOccupant, SeatOccupant]> = {};

  for (const teamId of CAREER_TEAM_IDS) {
    const seats = grid[teamId];
    if (!seats) continue;
    const updated = seats.map((seat): SeatOccupant => {
      if (seat.kind === "player") return seat;
      const d = seat.driver;
      const age = d.age + 1;

      // Retiro: probabilidad creciente a partir de RIVAL_RETIRE_AGE.
      const retireChance = age < RIVAL_RETIRE_AGE ? 0 : Math.min(0.9, (age - RIVAL_RETIRE_AGE) * 0.18 + 0.1);
      if (rng.bool(retireChance)) {
        uid += 1;
        return { kind: "rival", driver: generateRookieRival(rng, uid) };
      }

      return {
        kind: "rival",
        driver: { ...d, age, attributes: growTowardPotential(d.attributes, d.potential, age, rng) },
      };
    }) as [SeatOccupant, SeatOccupant];
    next[teamId] = updated;
  }
  return { grid: next, nextUid: uid };
}

/**
 * Crecimiento ASINTOTICO hacia el techo de talento: rapido de joven, lento
 * en el pico, nulo despues. Nunca supera el `potential`, que es lo que
 * impide que un piloto se vuelva imbatible solo por acumular temporadas.
 */
export function growTowardPotential(
  attr: DriverAttributes,
  potential: number,
  age: number,
  rng: Rng,
  youngRate = 0.22,
  primeRate = 0.07,
): DriverAttributes {
  const rate = age < 25 ? youngRate : age < 31 ? primeRate : 0;
  const step = (v: number) => {
    // Si ya llego (o lo empujaron por encima con un evento), no se toca: el
    // crecimiento natural nunca EMPUJA HACIA ABAJO a alguien que supero su
    // techo, para que un premio de un evento no se evapore al anio siguiente.
    if (v >= potential) return clampAttr(v);
    const grown = v + (potential - v) * rate;
    // Pequenio ruido: dos temporadas iguales no rinden exactamente igual.
    return clampAttr(Math.min(potential, grown + (rng.float() * 2 - 1) * 0.8));
  };
  return {
    pace: step(attr.pace),
    consistency: step(attr.consistency),
    racecraft: step(attr.racecraft),
  };
}

/** Todas las butacas de la parrilla, aplanadas (20 entradas). */
export function flattenGrid(
  grid: Record<string, [SeatOccupant, SeatOccupant]>,
): { teamId: string; seatIndex: 0 | 1; occupant: SeatOccupant }[] {
  const out: { teamId: string; seatIndex: 0 | 1; occupant: SeatOccupant }[] = [];
  for (const teamId of CAREER_TEAM_IDS) {
    const seats = grid[teamId];
    if (!seats) continue;
    out.push({ teamId, seatIndex: 0, occupant: seats[0] });
    out.push({ teamId, seatIndex: 1, occupant: seats[1] });
  }
  return out;
}

/** Ranking de coches del anio: 1 = mejor. */
export function carRanking(teams: TeamState[]): Record<string, number> {
  const sorted = teams.slice().sort((a, b) => b.carPerformance - a.carPerformance);
  const out: Record<string, number> = {};
  sorted.forEach((t, i) => {
    out[t.teamId] = i + 1;
  });
  return out;
}
