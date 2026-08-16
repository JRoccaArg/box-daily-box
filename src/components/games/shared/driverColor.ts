import type { Driver } from "@/types";
import { team, getCareerChain } from "@/data";

/**
 * Id de la escuderia mas reciente del piloto. Usa `teamsChronology` (orden
 * real por temporada) cuando existe: `d.teams` esta colapsado y ordenado por
 * (minYear, maxYear), asi que con dos equipos que arrancan el mismo anio el
 * ultimo elemento del array no es necesariamente el mas reciente (ej. Tsunoda
 * devolvia "racing-bulls" en vez de "red-bull"). Fallback al array colapsado
 * para datasets viejos sin `teamsChronology`.
 */
export function lastTeamId(d: Driver): string | null {
  const chain = getCareerChain(d);
  if (chain.length > 0) return chain[chain.length - 1] ?? null;
  const stint = d.teams[d.teams.length - 1];
  return stint ? stint.teamId : null;
}

/** Color de marca de la escuderia mas reciente (fallback gris). */
export function driverColor(d: Driver): string {
  const id = lastTeamId(d);
  const t = id ? team(id) : undefined;
  return t?.color ?? "#8A8A8E";
}
