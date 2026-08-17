// src/components/games/CareerPath/careerpath.logic.ts
//
// Logica pura de "Career Path": se muestra la cadena de escuderias por las
// que paso un piloto, en orden cronologico (con logos), y hay que adivinar
// el piloto. Mismo patron determinista que PitTexto (buildTarget), pero el
// pool se restringe a pilotos con >=2 escuderias Y con logo disponible para
// TODA su cadena (ver hasFullLogoChain en src/data), para no mostrar nunca
// un logo faltante.

import type { Difficulty, Driver } from "@/types";
import { DRIVERS, hasFullLogoChain, getCareerChain } from "@/data";
import { dailyPick } from "@/lib/daily";
import { difficultyFloor } from "@/lib/filters";

/** Pool de pilotos jugables para una dificultad: respeta el corte de anios de
 *  la dificultad, pero SIEMPRE filtra a los que tienen logo completo. Si la
 *  dificultad elegida se queda sin material, afloja hacia "leyenda" (mismo
 *  patron de "aflojar" que getDriverPoolAtLeast, pero acotado a este juego
 *  porque el filtro de logos es propio de Career Path). */
export function getCareerPathPool(difficulty: Difficulty): Driver[] {
  const floor = difficultyFloor(difficulty);
  const filtered = DRIVERS.filter(
    (d) => hasFullLogoChain(d) && (floor === -Infinity || (d.active.end ?? 9999) >= floor),
  );
  if (filtered.length >= 5) return filtered;
  // Aflojar: con los logos actuales esto en la practica siempre devuelve el
  // pool completo de pilotos con logo.
  return DRIVERS.filter(hasFullLogoChain);
}

/** Objetivo del dia para la dificultad elegida (o para un duelo si hay `seed`). */
export function buildCareerPathTarget(difficulty: Difficulty, date: Date, seed?: string): Driver {
  const pool = getCareerPathPool(difficulty);
  return dailyPick(pool, date, `careerpath::${difficulty}`, seed);
}

/** Cadena de escuderias a mostrar (colapsada, ver getCareerChain). */
export function targetChain(target: Driver): string[] {
  return getCareerChain(target);
}
