// src/lib/career/events.ts
//
// Motor de eventos del Modo Carrera: decide QUE eventos aparecen y aplica
// las consecuencias de la opcion elegida.
//
// IMPORTANTE (invariante del proyecto): aca NO hay ni un solo texto
// user-facing. Este archivo solo maneja ids, pesos, condiciones y efectos.
// Los textos (titulo, historia, opciones y desenlaces) viven en
// `src/content/career/{es,en}.ts` y se resuelven en el render, igual que el
// contenido legal. Un test cruza ambos lados para que no falte ninguna clave.
//
// Probabilidades OCULTAS (decision del usuario): el jugador nunca ve los
// pesos; las pistas van en la narrativa.

import type { Rng } from "@/lib/seed";
import type { CareerState } from "./types";
import { CAREER_EVENTS, EVENTS_BY_ID } from "./eventData";
import { carRanking } from "./grid";

/** Las 12 familias de situaciones acordadas con el usuario. */
export type EventCategory =
  | "track"
  | "technical"
  | "contract"
  | "media"
  | "stewards"
  | "rivalry"
  | "team-crisis"
  | "chaos"
  | "health"
  | "crew"
  | "outside"
  | "legacy";

/** Cambios que un desenlace aplica al estado. Todos opcionales y sumativos. */
export type EventEffect = {
  pace?: number;
  consistency?: number;
  racecraft?: number;
  /** Mueve el TECHO de talento (raro y valioso: casi nada lo sube). */
  potential?: number;
  morale?: number;
  reputation?: number;
  /** Ajusta el coche del equipo actual (mejora o retroceso de desarrollo). */
  car?: number;
  /** Suma/resta anios de contrato. */
  contractYears?: number;
  /** Marcas narrativas que activa este desenlace (para historias largas). */
  setFlags?: string[];
  /** Marcas que borra (cierra un arco). */
  clearFlags?: string[];
};

/** Un desenlace posible de una opcion. `weight` es relativo, no un %. */
export type EventOutcome = {
  id: string;
  weight: number;
  effect: EventEffect;
};

export type EventOption = {
  id: string;
  outcomes: EventOutcome[];
};

/** Condiciones para que un evento pueda aparecer. Todas opcionales. */
export type EventCondition = {
  minSeason?: number;
  maxSeason?: number;
  minAge?: number;
  maxAge?: number;
  minReputation?: number;
  maxReputation?: number;
  minMorale?: number;
  maxMorale?: number;
  /** Puesto del coche (1 = mejor). minCarRank: 7 => "coche flojo o peor". */
  minCarRank?: number;
  maxCarRank?: number;
  /** true = solo con butaca; false = solo sin butaca. */
  requiresSeat?: boolean;
  /** Solo aparece si TODAS estas marcas estan activas. */
  requiresFlags?: string[];
  /** No aparece si alguna de estas marcas esta activa. */
  forbidsFlags?: string[];
  /** Temporadas que deben haber pasado desde la marca de `requiresFlags`. */
  minSeasonsSinceFlag?: number;
};

export type CareerEvent = {
  id: string;
  category: EventCategory;
  /** Peso base de aparicion (a mayor peso, mas frecuente). */
  weight: number;
  condition?: EventCondition;
  options: EventOption[];
};

/** Cuantos eventos pueden salir por tanda (acordado: de 1 a 5). */
export const MIN_EVENTS_PER_CHUNK = 1;
export const MAX_EVENTS_PER_CHUNK = 5;

/** ¿El estado actual cumple la condicion del evento? */
export function meetsCondition(state: CareerState, c: EventCondition | undefined): boolean {
  if (!c) return true;

  if (c.minSeason !== undefined && state.season < c.minSeason) return false;
  if (c.maxSeason !== undefined && state.season > c.maxSeason) return false;
  if (c.minAge !== undefined && state.player.age < c.minAge) return false;
  if (c.maxAge !== undefined && state.player.age > c.maxAge) return false;
  if (c.minReputation !== undefined && state.player.reputation < c.minReputation) return false;
  if (c.maxReputation !== undefined && state.player.reputation > c.maxReputation) return false;
  if (c.minMorale !== undefined && state.player.morale < c.minMorale) return false;
  if (c.maxMorale !== undefined && state.player.morale > c.maxMorale) return false;

  if (c.requiresSeat !== undefined) {
    const hasSeat = state.teamId !== null;
    if (c.requiresSeat !== hasSeat) return false;
  }

  if (c.minCarRank !== undefined || c.maxCarRank !== undefined) {
    if (!state.teamId) return false;
    const rank = carRanking(state.teams)[state.teamId] ?? 10;
    if (c.minCarRank !== undefined && rank < c.minCarRank) return false;
    if (c.maxCarRank !== undefined && rank > c.maxCarRank) return false;
  }

  if (c.forbidsFlags?.some((f) => f in state.flags)) return false;
  if (c.requiresFlags?.some((f) => !(f in state.flags))) return false;

  if (c.minSeasonsSinceFlag !== undefined && c.requiresFlags?.length) {
    const first = c.requiresFlags[0] as string;
    const setAt = state.flags[first];
    if (setAt === undefined) return false;
    if (state.season - setAt < c.minSeasonsSinceFlag) return false;
  }

  return true;
}

/** Eventos que podrian aparecer ahora mismo. */
export function eligibleEvents(state: CareerState): CareerEvent[] {
  return CAREER_EVENTS.filter((e) => meetsCondition(state, e.condition));
}

/**
 * Elige los eventos de una tanda (1 a 5), sin repetir dentro de la misma
 * tanda y sin repetir ninguno que ya haya salido en esta partida (se lleva
 * la cuenta con una marca `seen::<id>`). Cuando ya se vieron todos los
 * elegibles, se permite repetir para no quedarse sin contenido en una
 * carrera larga.
 *
 * La seleccion es ponderada: los eventos con mas `weight` salen mas
 * seguido, pero cualquiera puede tocar.
 */
export function pickEvents(state: CareerState, rng: Rng, count?: number): string[] {
  const howMany =
    count ?? rng.int(MIN_EVENTS_PER_CHUNK, Math.min(MAX_EVENTS_PER_CHUNK, state.step + 2));

  const eligible = eligibleEvents(state);
  if (eligible.length === 0) return [];

  const unseen = eligible.filter((e) => !(`seen::${e.id}` in state.flags));
  const pool = unseen.length > 0 ? unseen : eligible;

  const chosen: string[] = [];
  const remaining = pool.slice();
  for (let i = 0; i < howMany && remaining.length > 0; i++) {
    const idx = weightedIndex(remaining, rng);
    const picked = remaining[idx];
    if (!picked) break;
    chosen.push(picked.id);
    remaining.splice(idx, 1);
  }
  return chosen;
}

/** Indice elegido con probabilidad proporcional a `weight`. */
function weightedIndex(events: CareerEvent[], rng: Rng): number {
  const total = events.reduce((s, e) => s + Math.max(0, e.weight), 0);
  if (total <= 0) return rng.int(0, events.length - 1);
  let roll = rng.float() * total;
  for (let i = 0; i < events.length; i++) {
    roll -= Math.max(0, events[i]?.weight ?? 0);
    if (roll <= 0) return i;
  }
  return events.length - 1;
}

/** Sortea un desenlace de una opcion, segun los pesos (ocultos al jugador). */
export function rollOutcome(option: EventOption, rng: Rng): EventOutcome {
  const total = option.outcomes.reduce((s, o) => s + Math.max(0, o.weight), 0);
  if (total <= 0) return option.outcomes[0] as EventOutcome;
  let roll = rng.float() * total;
  for (const o of option.outcomes) {
    roll -= Math.max(0, o.weight);
    if (roll <= 0) return o;
  }
  return option.outcomes[option.outcomes.length - 1] as EventOutcome;
}

/** Busca un evento por id (o undefined si no existe). */
export function getEvent(id: string): CareerEvent | undefined {
  return EVENTS_BY_ID[id];
}

export { CAREER_EVENTS };
