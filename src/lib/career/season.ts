// src/lib/career/season.ts
//
// Simulacion de UNA temporada completa (24 carreras) para los 20 pilotos
// de la parrilla. Todo es determinista: con el mismo Rng, mismo resultado.
//
// Modelo por carrera:
//   1. Clasificacion: fuerza = coche*0.62 + piloto*0.38 + ruido (bajo).
//   2. Abandonos: por mecanica (fiabilidad del equipo) o por accidente
//      (consistencia del piloto).
//   3. Carrera: misma formula con ruido mas alto; los abandonos van al
//      fondo. De ahi salen puntos, victorias, podios y adelantamientos.
//
// El coche pesa mas que el piloto A PROPOSITO (CAR_WEIGHT > DRIVER_WEIGHT):
// es lo que hace que la meta del modo sea escalar a un equipo ganador.

import type { Rng } from "@/lib/seed";
import type {
  DriverAttributes,
  SeasonStats,
  SeatOccupant,
  TeamState,
} from "./types";
import { carRanking, flattenGrid } from "./grid";
import {
  AGE_PEAK_END,
  AGE_PEAK_START,
  AGE_ROOKIE_PENALTY,
  AGE_VETERAN_PENALTY,
  BASE_ACCIDENT,
  BASE_MECHANICAL_DNF,
  CAR_WEIGHT,
  DRIVER_WEIGHT,
  MORALE_WEIGHT,
  POINTS_TABLE,
  QUALI_NOISE,
  RACES_PER_SEASON,
  RACE_NOISE,
  ROOKIE_AGE,
} from "./constants";

/**
 * Penalizacion por edad, en puntos de "fuerza" (sobre 100).
 *
 * A PROPOSITO es suave: el usuario pidio que la edad pese MENOS que la
 * suerte y las decisiones. El efecto maximo (7 puntos siendo rookie, 5
 * siendo veterano) es menor que el ruido de una sola carrera (RACE_NOISE
 * = 9), asi que nunca decide una temporada por si sola.
 */
export function ageEffect(age: number): number {
  if (age < AGE_PEAK_START) {
    const span = AGE_PEAK_START - ROOKIE_AGE;
    const t = Math.max(0, Math.min(1, (AGE_PEAK_START - age) / span));
    return -AGE_ROOKIE_PENALTY * t;
  }
  if (age > AGE_PEAK_END) {
    const t = Math.max(0, Math.min(1, (age - AGE_PEAK_END) / 10));
    return -AGE_VETERAN_PENALTY * t;
  }
  return 0;
}

/** Habilidad global de un piloto en carrera (mezcla de sus 3 atributos). */
function raceAbility(attr: DriverAttributes): number {
  return attr.pace * 0.6 + attr.consistency * 0.2 + attr.racecraft * 0.2;
}

/** Habilidad en clasificacion: casi todo ritmo puro. */
function qualiAbility(attr: DriverAttributes): number {
  return attr.pace * 0.85 + attr.consistency * 0.15;
}

/** Una butaca lista para simular. */
type Entry = {
  key: string;
  teamId: string;
  isPlayer: boolean;
  attributes: DriverAttributes;
  age: number;
  morale: number;
  car: number;
  reliability: number;
  /** Nombre propio, solo para mostrar al companiero en la UI. */
  name: string;
};

export type SeasonSimInput = {
  teams: TeamState[];
  grid: Record<string, [SeatOccupant, SeatOccupant]>;
  /** Equipo del jugador; si es null, el jugador no corre esta temporada. */
  playerTeamId: string | null;
  playerAttributes: DriverAttributes;
  playerAge: number;
  playerMorale: number;
  rng: Rng;
};

export type SeasonSimOutput = {
  /** null si el jugador no tenia asiento. */
  playerStats: SeasonStats | null;
  /** Puntos finales de los 20, para mostrar el campeonato si hace falta. */
  standings: { key: string; name: string; teamId: string; points: number }[];
};

/** Construye las 20 entradas a partir de la parrilla y el estado de equipos. */
function buildEntries(input: SeasonSimInput): Entry[] {
  const teamById = new Map(input.teams.map((t) => [t.teamId, t]));
  const entries: Entry[] = [];

  for (const { teamId, seatIndex, occupant } of flattenGrid(input.grid)) {
    const team = teamById.get(teamId);
    if (!team) continue;
    if (occupant.kind === "player") {
      entries.push({
        key: "player",
        teamId,
        isPlayer: true,
        attributes: input.playerAttributes,
        age: input.playerAge,
        morale: input.playerMorale,
        car: team.carPerformance,
        reliability: team.reliability,
        name: "",
      });
    } else {
      const d = occupant.driver;
      entries.push({
        key: `${teamId}:${seatIndex}:${d.id}`,
        teamId,
        isPlayer: false,
        attributes: d.attributes,
        age: d.age,
        // Los rivales corren siempre con moral neutra: la moral es una
        // mecanica del jugador (la mueven sus decisiones), no de la IA.
        morale: 50,
        car: team.carPerformance,
        reliability: team.reliability,
        name: `${d.firstName} ${d.lastName}`,
      });
    }
  }
  return entries;
}

/** Fuerza de una butaca en una sesion concreta. */
function strength(e: Entry, ability: number, noise: number, rng: Rng): number {
  const base = e.car * CAR_WEIGHT + ability * DRIVER_WEIGHT;
  const age = ageEffect(e.age) * DRIVER_WEIGHT;
  const morale = (e.morale - 50) * MORALE_WEIGHT;
  const random = (rng.float() * 2 - 1) * noise;
  return base + age + morale + random;
}

/**
 * Simula una temporada completa y devuelve las estadisticas del jugador
 * (o null si no tenia asiento) mas la tabla final del campeonato.
 */
export function simulateSeason(input: SeasonSimInput): SeasonSimOutput {
  const { rng } = input;
  const entries = buildEntries(input);

  const points = new Map<string, number>();
  for (const e of entries) points.set(e.key, 0);

  // Acumuladores del jugador.
  let wins = 0;
  let podiums = 0;
  let poles = 0;
  let fastestLaps = 0;
  let overtakes = 0;
  let mechanicalDnfs = 0;
  let accidents = 0;

  for (let race = 0; race < RACES_PER_SEASON; race++) {
    // 1. Clasificacion -> orden de largada.
    const qualiOrder = entries
      .map((e) => ({ e, s: strength(e, qualiAbility(e.attributes), QUALI_NOISE, rng) }))
      .sort((a, b) => b.s - a.s);
    const gridPos = new Map<string, number>();
    qualiOrder.forEach((row, i) => gridPos.set(row.e.key, i + 1));
    const polesitter = qualiOrder[0];
    if (polesitter?.e.isPlayer) poles++;

    // 2. Abandonos.
    const retired = new Set<string>();
    for (const e of entries) {
      const mechChance = BASE_MECHANICAL_DNF * (1 + (70 - e.reliability) / 100);
      const crashChance = BASE_ACCIDENT * (1 + (70 - e.attributes.consistency) / 100);
      if (rng.bool(Math.max(0.005, mechChance))) {
        retired.add(e.key);
        if (e.isPlayer) mechanicalDnfs++;
      } else if (rng.bool(Math.max(0.005, crashChance))) {
        retired.add(e.key);
        if (e.isPlayer) accidents++;
      }
    }

    // 3. Carrera: los que terminan ordenados por fuerza; los abandonos, al fondo.
    const finishers = entries
      .filter((e) => !retired.has(e.key))
      .map((e) => ({ e, s: strength(e, raceAbility(e.attributes), RACE_NOISE, rng) }))
      .sort((a, b) => b.s - a.s);

    finishers.forEach((row, i) => {
      const pos = i + 1;
      const scored = POINTS_TABLE[i] ?? 0;
      if (scored > 0) points.set(row.e.key, (points.get(row.e.key) ?? 0) + scored);

      if (!row.e.isPlayer) return;
      if (pos === 1) wins++;
      if (pos <= 3) podiums++;
      // Adelantamientos: puestos ganados respecto a la largada + pases
      // sueltos segun la pericia en carrera.
      const started = gridPos.get(row.e.key) ?? pos;
      const gained = Math.max(0, started - pos);
      const extra = rng.int(0, Math.round(row.e.attributes.racecraft / 28));
      overtakes += gained + extra;
    });

    // Vuelta rapida: sorteo entre los 6 primeros, con ventaja para el mejor coche.
    const flCandidates = finishers.slice(0, 6);
    if (flCandidates.length > 0) {
      const winnerFl = rng.pick(flCandidates);
      if (winnerFl.e.isPlayer) fastestLaps++;
    }

    // Los que abandonaron no suman, pero perdieron posiciones: si el jugador
    // abandono largando adelante, no cuenta adelantamientos de esa carrera.
  }

  // Tabla final del campeonato.
  const standings = entries
    .map((e) => ({
      key: e.key,
      name: e.isPlayer ? "" : e.name,
      teamId: e.teamId,
      points: points.get(e.key) ?? 0,
    }))
    .sort((a, b) => b.points - a.points);

  if (!input.playerTeamId) {
    return { playerStats: null, standings };
  }

  const playerEntry = entries.find((e) => e.isPlayer);
  if (!playerEntry) return { playerStats: null, standings };

  const championshipPosition = standings.findIndex((s) => s.key === "player") + 1;
  const playerPoints = points.get("player") ?? 0;

  // Companiero de equipo: la otra butaca del mismo equipo.
  const teammate = entries.find((e) => e.teamId === playerEntry.teamId && !e.isPlayer);
  const teammatePoints = teammate ? (points.get(teammate.key) ?? 0) : 0;

  const ranking = carRanking(input.teams);
  const carRank = ranking[playerEntry.teamId] ?? 10;
  // Con 2 coches por equipo, el mejor coche "deberia" pelear P1-P2, el
  // segundo P3-P4, etc. Comparar contra eso dice si rendiste por encima
  // o por debajo del material que tenias.
  const expectedPosition = carRank * 2 - 0.5;

  const playerStats: SeasonStats = {
    points: playerPoints,
    pointsPerRace: Math.round((playerPoints / RACES_PER_SEASON) * 10) / 10,
    championshipPosition,
    wins,
    podiums,
    poles,
    fastestLaps,
    overtakes,
    mechanicalDnfs,
    accidents,
    teammatePoints,
    teammateName: teammate?.name ?? "",
    carRank,
    performanceDelta: Math.round(expectedPosition - championshipPosition),
  };

  return { playerStats, standings };
}
