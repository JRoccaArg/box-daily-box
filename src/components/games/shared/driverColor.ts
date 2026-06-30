import type { Driver } from "@/types";
import { team } from "@/data";

/** Id de la escuderia mas reciente del piloto (ultimo stint del array). */
export function lastTeamId(d: Driver): string | null {
  const stint = d.teams[d.teams.length - 1];
  return stint ? stint.teamId : null;
}

/** Color de marca de la escuderia mas reciente (fallback gris). */
export function driverColor(d: Driver): string {
  const id = lastTeamId(d);
  const t = id ? team(id) : undefined;
  return t?.color ?? "#8A8A8E";
}
