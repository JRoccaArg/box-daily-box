// src/lib/career/career.ts
//
// Maquina de estados de una partida del Modo Carrera: crear el piloto,
// elegir asiento, avanzar temporadas (de a 1, 2 o 3 segun el modo), recibir
// ofertas, quedarse sin butaca y retirarse.
//
// Toda la aleatoriedad sale de un Rng sembrado por `state.seed` + la
// temporada, asi que una partida es 100% reproducible: mismas decisiones,
// mismos resultados.

import { Rng } from "@/lib/seed";
import type {
  CareerState,
  CareerTotals,
  PlayerDriver,
  SeasonResult,
  SeatOccupant,
  SeatOffer,
} from "./types";
import {
  GROWTH_RATE_PRIME,
  GROWTH_RATE_YOUNG,
  MAX_SEASONS,
  PLAYER_POTENTIAL_MAX,
  PLAYER_POTENTIAL_MIN,
  REPUTATION_DECAY,
  REPUTATION_START,
  ROOKIE_AGE,
  ROOKIE_ATTR_MAX,
  ROOKIE_ATTR_MIN,
  SEAT_AVAILABILITY_LOW,
  SEAT_AVAILABILITY_MID,
  SEAT_AVAILABILITY_TOP,
} from "./constants";
import {
  CAREER_TEAM_IDS,
  ageGrid,
  buildInitialGrid,
  buildInitialTeams,
  carRanking,
  evolveTeams,
  generateRookieRival,
  growTowardPotential,
} from "./grid";
import { simulateSeason } from "./season";

/** Rng propio de cada fase, para que una fase no "corra" el azar de otra. */
function phaseRng(state: Pick<CareerState, "seed">, tag: string): Rng {
  return new Rng(`${state.seed}::${tag}`);
}

const EMPTY_TOTALS: CareerTotals = {
  seasonsRaced: 0,
  championships: 0,
  points: 0,
  wins: 0,
  podiums: 0,
  poles: 0,
  fastestLaps: 0,
  overtakes: 0,
  mechanicalDnfs: 0,
  accidents: 0,
  teammateBattlesWon: 0,
  teammateBattlesTotal: 0,
};

export type StartCareerParams = {
  firstName: string;
  lastName: string;
  nationalityCode: string;
  /** Cuantas temporadas avanza cada paso (modo de juego). */
  step: 1 | 2 | 3;
  /** Semilla de la partida. Distinta por partida => historia distinta. */
  seed: string;
  /** Anio calendario de la primera temporada. */
  startYear: number;
};

/**
 * Crea una partida nueva. Queda en fase "rookie-offers": el jugador todavia
 * no tiene equipo, tiene que elegir entre las ofertas iniciales.
 */
export function startCareer(params: StartCareerParams): CareerState {
  const seedOnly = { seed: params.seed };
  const rng = phaseRng(seedOnly, "setup");

  // El techo se sortea al crear el piloto: no todos nacen campeones. Es lo
  // que hace que no todas las partidas terminen en titulo.
  //
  // Se toma el MENOR de dos tiradas: eso sesga el reparto hacia abajo, asi
  // que un talento de nivel campeon es raro (como en la F1 real), en vez de
  // salir en la mitad de las partidas como pasaria con un sorteo uniforme.
  const potential = Math.min(
    rng.int(PLAYER_POTENTIAL_MIN, PLAYER_POTENTIAL_MAX),
    rng.int(PLAYER_POTENTIAL_MIN, PLAYER_POTENTIAL_MAX),
  );
  const player: PlayerDriver = {
    firstName: params.firstName,
    lastName: params.lastName,
    nationalityCode: params.nationalityCode,
    age: ROOKIE_AGE,
    attributes: {
      pace: rng.int(ROOKIE_ATTR_MIN, ROOKIE_ATTR_MAX),
      consistency: rng.int(ROOKIE_ATTR_MIN, ROOKIE_ATTR_MAX),
      racecraft: rng.int(ROOKIE_ATTR_MIN, ROOKIE_ATTR_MAX),
    },
    potential,
    morale: 50,
    reputation: REPUTATION_START,
  };

  const teams = buildInitialTeams(rng);
  const grid = buildInitialGrid(params.startYear);

  const state: CareerState = {
    version: 1,
    seed: params.seed,
    step: params.step,
    startYear: params.startYear,
    season: 1,
    phase: "rookie-offers",
    player,
    teamId: null,
    contractYears: 0,
    teams,
    grid,
    history: [],
    totals: { ...EMPTY_TOTALS },
    offers: [],
    retirementReason: null,
  };

  state.offers = buildRookieOffers(state, rng);
  return state;
}

/**
 * Ofertas iniciales: siempre de la parte de atras de la parrilla (un rookie
 * no llega a un equipo grande). Se ofrecen 3 para que la primera decision
 * ya sea interesante: el peor coche pero con rol de primer piloto, contra
 * uno algo mejor como segundo.
 */
function buildRookieOffers(state: CareerState, rng: Rng): SeatOffer[] {
  const ranking = carRanking(state.teams);
  // Candidatos: los 5 peores coches de la parrilla.
  const candidates = CAREER_TEAM_IDS.filter((id) => (ranking[id] ?? 10) >= 6);
  const chosen = rng.sample(candidates, 3);
  return chosen.map((teamId) => ({
    teamId,
    expectedCarRank: ranking[teamId] ?? 10,
    years: rng.int(1, 2),
    // Cuanto peor el coche, mas probable que te den rol de primer piloto.
    role: (ranking[teamId] ?? 10) >= 9 ? "first" : rng.bool(0.35) ? "first" : "second",
  }));
}

/**
 * Acepta una de las ofertas pendientes. Mete al jugador en esa butaca (el
 * rival mas debil del equipo pierde el asiento) y deja la partida lista
 * para simular.
 */
export function acceptOffer(state: CareerState, offerIndex: number): CareerState {
  const offer = state.offers[offerIndex];
  if (!offer) return state;

  const rng = phaseRng(state, `sign::${state.season}::${offerIndex}`);
  const { grid } = placePlayerInTeam(state.grid, offer.teamId, rng, state.season * 1000);

  return {
    ...state,
    teamId: offer.teamId,
    contractYears: offer.years,
    grid,
    offers: [],
    phase: "ready",
  };
}

/**
 * Coloca al jugador en un equipo: lo saca de su butaca anterior (que pasa a
 * ocupar un joven generado) y desplaza al rival mas debil del equipo destino.
 * La parrilla siempre mantiene 20 butacas ocupadas.
 */
function placePlayerInTeam(
  grid: Record<string, [SeatOccupant, SeatOccupant]>,
  teamId: string,
  rng: Rng,
  uidStart: number,
): { grid: Record<string, [SeatOccupant, SeatOccupant]>; nextUid: number } {
  let uid = uidStart;
  const next: Record<string, [SeatOccupant, SeatOccupant]> = {};

  for (const id of CAREER_TEAM_IDS) {
    const seats = grid[id];
    if (!seats) continue;
    next[id] = [seats[0], seats[1]];
  }

  // 1. Sacar al jugador de donde estuviera; lo reemplaza un joven generado.
  for (const id of CAREER_TEAM_IDS) {
    const seats = next[id];
    if (!seats) continue;
    for (const i of [0, 1] as const) {
      if (seats[i].kind === "player") {
        uid += 1;
        seats[i] = { kind: "rival", driver: generateRookieRival(rng, uid) };
      }
    }
  }

  // 2. Meterlo en el equipo destino, desplazando al rival mas flojo.
  const target = next[teamId];
  if (target) {
    const a = target[0];
    const b = target[1];
    const strengthOf = (s: SeatOccupant) =>
      s.kind === "rival" ? s.driver.attributes.pace + s.driver.attributes.consistency : Infinity;
    const weakerIndex = strengthOf(a) <= strengthOf(b) ? 0 : 1;
    target[weakerIndex] = { kind: "player" };
  }

  return { grid: next, nextUid: uid };
}

/**
 * Avanza la partida `state.step` temporadas (o menos si la carrera termina
 * antes). Devuelve el estado nuevo y las temporadas simuladas, para que la
 * UI las muestre una por una.
 */
export function advanceSeasons(state: CareerState): {
  state: CareerState;
  seasons: SeasonResult[];
} {
  // Solo se simula si no hay nada pendiente de decidir: con ofertas sobre
  // la mesa (o ya retirado) el jugador tiene que elegir primero, o se le
  // simularian temporadas a sus espaldas.
  if (state.phase !== "ready" && state.phase !== "no-seat") {
    return { state, seasons: [] };
  }

  let current: CareerState = { ...state };
  const simulated: SeasonResult[] = [];

  for (let i = 0; i < state.step; i++) {
    if (current.season > MAX_SEASONS) {
      current = { ...current, phase: "retired", retirementReason: "max-seasons" };
      break;
    }
    const outcome = runOneSeason(current);
    current = outcome.state;
    simulated.push(outcome.result);

    if (current.phase === "retired") break;
    // Si se quedo sin contrato, corta la tanda para que el jugador decida.
    if (current.phase === "offers" || current.phase === "no-seat") break;
  }

  if (current.season > MAX_SEASONS && current.phase !== "retired") {
    current = { ...current, phase: "retired", retirementReason: "max-seasons" };
  }

  return { state: current, seasons: simulated };
}

/** Simula exactamente una temporada y actualiza todo el estado derivado. */
function runOneSeason(state: CareerState): { state: CareerState; result: SeasonResult } {
  const year = state.startYear + state.season - 1;
  const rng = phaseRng(state, `season::${state.season}`);

  const sim = simulateSeason({
    teams: state.teams,
    grid: state.grid,
    playerTeamId: state.teamId,
    playerAttributes: state.player.attributes,
    playerAge: state.player.age,
    playerMorale: state.player.morale,
    rng,
  });

  const result: SeasonResult = {
    season: state.season,
    year,
    teamId: state.teamId,
    stats: sim.playerStats,
  };

  // ── Actualizar al piloto ──────────────────────────────────────────
  const totals = { ...state.totals };
  let { morale, reputation } = state.player;

  if (sim.playerStats) {
    const s = sim.playerStats;
    totals.seasonsRaced += 1;
    totals.points += s.points;
    totals.wins += s.wins;
    totals.podiums += s.podiums;
    totals.poles += s.poles;
    totals.fastestLaps += s.fastestLaps;
    totals.overtakes += s.overtakes;
    totals.mechanicalDnfs += s.mechanicalDnfs;
    totals.accidents += s.accidents;
    totals.teammateBattlesTotal += 1;
    if (s.points > s.teammatePoints) totals.teammateBattlesWon += 1;
    if (s.championshipPosition === 1) totals.championships += 1;

    // La reputacion mide rendir por encima del COCHE, no puntos absolutos:
    // ir 12mo con el peor auto puede subirla mas que ir 6to con el 3er auto.
    const beatTeammate = s.points > s.teammatePoints;
    const repDelta =
      s.performanceDelta * 2.0 +
      (beatTeammate ? 4 : -4) +
      s.wins * 1.5 +
      (s.championshipPosition === 1 ? 12 : 0);
    reputation = clamp01to100(reputation + repDelta);

    const moraleDelta = s.performanceDelta * 1.5 + (beatTeammate ? 5 : -5) + s.podiums * 0.8;
    morale = clamp01to100(morale + moraleDelta);
  } else {
    // Un anio sin correr: el paddock se olvida y la moral cae.
    reputation = clamp01to100(reputation - 8);
    morale = clamp01to100(morale - 6);
  }

  // El paddock tiene memoria corta: sin resultados nuevos, la reputacion
  // vuelve hacia la media. Sin esto un campeon conserva 100 para siempre y
  // siempre le llega el mejor asiento.
  reputation = clamp01to100(reputation + (50 - reputation) * REPUTATION_DECAY);

  // Crecimiento por experiencia (los jovenes mejoran mas rapido).
  const attributes = growPlayer(
    state.player.attributes,
    state.player.potential,
    state.player.age,
    rng,
  );

  // ── Avanzar el mundo un anio ──────────────────────────────────────
  const { teams: nextTeams } = evolveTeams(state.teams, rng);
  const { grid: agedGrid } = ageGrid(state.grid, rng, state.season * 1000 + 500);

  const nextSeason = state.season + 1;
  const contractYears = state.teamId ? Math.max(0, state.contractYears - 1) : 0;

  let next: CareerState = {
    ...state,
    season: nextSeason,
    player: {
      ...state.player,
      age: state.player.age + 1,
      attributes,
      morale,
      reputation,
    },
    teams: nextTeams,
    grid: agedGrid,
    history: [...state.history, result],
    totals,
    contractYears,
  };

  // ── Decidir la fase siguiente ─────────────────────────────────────
  if (nextSeason > MAX_SEASONS) {
    next = { ...next, phase: "retired", retirementReason: "max-seasons" };
    return { state: next, result };
  }

  if (contractYears > 0 && next.teamId) {
    // Sigue bajo contrato: puede seguir simulando sin decidir nada.
    next = { ...next, phase: "ready" };
    return { state: next, result };
  }

  // Se le acabo el contrato (o no tenia asiento): buscar ofertas.
  const offerRng = phaseRng(state, `offers::${nextSeason}`);
  const offers = buildOffers(next, offerRng);
  if (offers.length === 0) {
    next = { ...next, teamId: null, offers: [], phase: "no-seat", grid: removePlayerFromGrid(next.grid, offerRng, nextSeason * 1000 + 700) };
  } else {
    next = { ...next, offers, phase: "offers" };
  }
  return { state: next, result };
}

/** Saca al jugador de la parrilla (se quedo sin butaca). */
function removePlayerFromGrid(
  grid: Record<string, [SeatOccupant, SeatOccupant]>,
  rng: Rng,
  uidStart: number,
): Record<string, [SeatOccupant, SeatOccupant]> {
  let uid = uidStart;
  const next: Record<string, [SeatOccupant, SeatOccupant]> = {};
  for (const id of CAREER_TEAM_IDS) {
    const seats = grid[id];
    if (!seats) continue;
    const copy: [SeatOccupant, SeatOccupant] = [seats[0], seats[1]];
    for (const i of [0, 1] as const) {
      if (copy[i].kind === "player") {
        uid += 1;
        copy[i] = { kind: "rival", driver: generateRookieRival(rng, uid) };
      }
    }
    next[id] = copy;
  }
  return next;
}

/**
 * Ofertas para la temporada siguiente segun la reputacion.
 *
 * Cada equipo pide una reputacion minima proporcional a lo bueno que es su
 * coche: para entrar al mejor equipo hay que haber demostrado mucho. Se
 * agrega algo de azar para que el mercado no sea siempre igual.
 */
function buildOffers(state: CareerState, rng: Rng): SeatOffer[] {
  const ranking = carRanking(state.teams);
  const rep = state.player.reputation;

  const willing = CAREER_TEAM_IDS.filter((teamId) => {
    const rank = ranking[teamId] ?? 10;
    // rank 1 (mejor coche) exige ~88 de reputacion; rank 10, ~20.
    const required = 20 + (10 - rank) * 7.5;
    const luck = rng.int(-8, 8);
    if (rep + luck < required) return false;
    // Aunque te sobre reputacion, la butaca tiene que estar LIBRE: los
    // equipos punteros casi siempre tienen a sus dos pilotos bajo contrato.
    const availability =
      rank <= 2 ? SEAT_AVAILABILITY_TOP : rank <= 5 ? SEAT_AVAILABILITY_MID : SEAT_AVAILABILITY_LOW;
    return rng.bool(availability);
  });

  if (willing.length === 0) return [];

  // Se muestran hasta 3, priorizando los mejores coches disponibles.
  const sorted = willing.slice().sort((a, b) => (ranking[a] ?? 10) - (ranking[b] ?? 10));
  const shortlist = sorted.slice(0, 4);
  const chosen = rng.sample(shortlist, Math.min(3, shortlist.length));

  return chosen.map((teamId) => {
    const rank = ranking[teamId] ?? 10;
    return {
      teamId,
      expectedCarRank: rank,
      years: rng.int(1, 3),
      role: rep >= 70 || rank >= 8 ? "first" : rng.bool(0.4) ? "first" : "second",
    };
  });
}

/**
 * Crecimiento del piloto del jugador: se acerca a su techo sin superarlo
 * (ver PlayerDriver.potential). La caida por edad NO destruye atributos:
 * se aplica aparte, en la simulacion (ageEffect).
 */
function growPlayer(
  attributes: PlayerDriver["attributes"],
  potential: number,
  age: number,
  rng: Rng,
): PlayerDriver["attributes"] {
  return growTowardPotential(attributes, potential, age, rng, GROWTH_RATE_YOUNG, GROWTH_RATE_PRIME);
}

function clamp01to100(v: number): number {
  return Math.max(1, Math.min(100, Math.round(v)));
}

/** Retiro voluntario: el jugador decide colgar el casco. */
export function retire(state: CareerState): CareerState {
  return { ...state, phase: "retired", retirementReason: "voluntary", offers: [] };
}

/**
 * Rechaza todas las ofertas y se queda un anio sin butaca (por ejemplo,
 * esperando algo mejor). Es una apuesta: la reputacion cae mientras no
 * corres.
 */
export function declineOffers(state: CareerState): CareerState {
  const rng = phaseRng(state, `decline::${state.season}`);
  return {
    ...state,
    teamId: null,
    contractYears: 0,
    offers: [],
    phase: "no-seat",
    grid: removePlayerFromGrid(state.grid, rng, state.season * 1000 + 900),
  };
}

/**
 * Estando sin butaca, intenta conseguir asiento para la temporada
 * siguiente. Si no aparece ninguna oferta y ya no quedan temporadas
 * razonables, la carrera termina.
 */
export function seekSeat(state: CareerState): CareerState {
  const rng = phaseRng(state, `seek::${state.season}`);
  const offers = buildOffers(state, rng);
  if (offers.length > 0) return { ...state, offers, phase: "offers" };
  return { ...state, offers: [] , phase: "no-seat" };
}

/** Puestos de los coches del anio en curso (helper para la UI). */
export function currentCarRanking(state: CareerState): Record<string, number> {
  return carRanking(state.teams);
}
