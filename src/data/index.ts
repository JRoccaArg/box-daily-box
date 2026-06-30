/**
 * Punto de entrada del dataset + helpers derivados que cruzan pilotos y
 * escuderias. Los juegos deberian importar desde aqui ("@/data").
 */
import type { Driver } from "@/types";
import { DRIVERS, DRIVERS_BY_ID } from "./drivers";

export { DRIVERS, DRIVERS_BY_ID, driver, DATA_AS_OF_SEASON } from "./drivers";
export { TEAMS, team, teamName } from "./teams";
export { NATIONALITIES, nationality } from "./nationalities";

/** ¿El piloto estuvo activo en `year`? */
export function activeInYear(d: Driver, year: number): boolean {
  const end = d.active.end ?? new Date().getFullYear();
  return year >= d.active.start && year <= end;
}

/** ¿El piloto estuvo activo en algun momento del rango [from, to]? */
export function activeInRange(d: Driver, from: number, to: number): boolean {
  const end = d.active.end ?? new Date().getFullYear();
  return d.active.start <= to && end >= from;
}

/** Ids unicos de escuderias por las que paso un piloto. */
export function teamIdsOf(d: Driver): string[] {
  return [...new Set(d.teams.map((t) => t.teamId))];
}

/** ¿Compartio escuderia con otro piloto en algun anio solapado? */
export function wereTeammates(a: Driver, b: Driver): boolean {
  for (const ta of a.teams) {
    for (const tb of b.teams) {
      if (ta.teamId !== tb.teamId) continue;
      const aEnd = ta.years.end ?? new Date().getFullYear();
      const bEnd = tb.years.end ?? new Date().getFullYear();
      if (ta.years.start <= bEnd && tb.years.start <= aEnd) return true;
    }
  }
  return false;
}

/** Escuderia "principal" del piloto en un anio dado (para pistas de UI). */
export function teamInYear(d: Driver, year: number): string | null {
  for (const t of d.teams) {
    const end = t.years.end ?? new Date().getFullYear();
    if (year >= t.years.start && year <= end) return t.teamId;
  }
  return null;
}

/** Nombre completo legible. */
export function fullName(d: Driver): string {
  return `${d.firstName} ${d.lastName}`;
}

/** Busca por nombre/apellido normalizado (para autocompletar en juegos). */
export function findDriversByText(query: string, pool: Driver[] = DRIVERS): Driver[] {
  const q = normalize(query);
  if (!q) return [];
  return pool.filter((d) => normalize(fullName(d)).includes(q) || d.wordleKey.toLowerCase().includes(q));
}

/** Normaliza texto: minusculas, sin acentos, sin signos. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Acceso rapido por id con error claro si no existe. */
export function requireDriver(id: string): Driver {
  const d = DRIVERS_BY_ID[id];
  if (!d) throw new Error(`Driver no encontrado: ${id}`);
  return d;
}
