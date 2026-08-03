// src/lib/career/storage.ts
//
// Persistencia LOCAL del Modo Carrera. Usa src/lib/storage.ts (el mismo
// wrapper de localStorage que el resto de la app), con sus propias keys,
// separadas a proposito de stats.ts: este modo NO cuenta para el ranking,
// las rachas ni el conteo de juegos, asi que su estado nunca debe
// mezclarse con el de stats.ts.
//
// Decision del usuario: una sola partida guardada a la vez. Empezar una
// carrera nueva reemplaza la anterior (la UI pide confirmacion antes).

import { storage } from "@/lib/storage";
import type { CareerState } from "./types";

const RUN_KEY = "career_run";
const HISTORY_KEY = "career_history";

/** Resumen minimo de una carrera terminada, para un futuro "salon de la fama". */
export type CareerHistoryEntry = {
  firstName: string;
  lastName: string;
  nationalityCode: string;
  seasonsRaced: number;
  championships: number;
  wins: number;
  retirementReason: CareerState["retirementReason"];
  finishedAt: number;
};

export function loadCareerRun(): CareerState | null {
  return storage.get<CareerState | null>(RUN_KEY, null);
}

export function saveCareerRun(state: CareerState): void {
  storage.set(RUN_KEY, state);
}

export function clearCareerRun(): void {
  storage.remove(RUN_KEY);
}

export function loadCareerHistory(): CareerHistoryEntry[] {
  return storage.get<CareerHistoryEntry[]>(HISTORY_KEY, []);
}

/** Archiva una carrera terminada en el historial y borra la partida en curso. */
export function archiveFinishedCareer(state: CareerState): void {
  const entry: CareerHistoryEntry = {
    firstName: state.player.firstName,
    lastName: state.player.lastName,
    nationalityCode: state.player.nationalityCode,
    seasonsRaced: state.totals.seasonsRaced,
    championships: state.totals.championships,
    wins: state.totals.wins,
    retirementReason: state.retirementReason,
    finishedAt: Date.now(),
  };
  const history = loadCareerHistory();
  storage.set(HISTORY_KEY, [entry, ...history].slice(0, 20));
  clearCareerRun();
}
