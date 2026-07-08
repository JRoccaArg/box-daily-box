import type { Difficulty, Driver } from "@/types";
import type { I18nText } from "@/i18n/types";
import { DATA_AS_OF_SEASON, teamIdsOf, teamName, wereTeammates } from "@/data";
import { getDriverPoolAtLeast } from "@/lib/filters";
import { dailyPick } from "@/lib/daily";

/** Anio de cierre para rangos "en activo" (coherente con el dataset). */
const OPEN_END = DATA_AS_OF_SEASON;

export type FactorState = "match" | "partial" | "none";
export type Direction = "up" | "down" | "eq";

export type Factor = {
  key: string;
  label: I18nText;
  /** string cuando el valor es un nombre propio del dataset (equipo, año, cantidad);
   *  I18nText cuando es un texto que debe traducirse ("Si"/"No", "Sin coincidencia"). */
  value: I18nText | string;
  state: FactorState;
  dir?: Direction;
};

export type Score = {
  /** Similitud total 0-100. */
  total: number;
  factors: Factor[];
};

/** Objetivo del dia para la dificultad elegida. */
export function buildTarget(difficulty: Difficulty, date: Date): Driver {
  const pool = getDriverPoolAtLeast(difficulty, 15);
  return dailyPick(pool, date, `pittexto::${difficulty}`);
}

function end(d: Driver): number {
  return d.active.end ?? OPEN_END;
}

/** Jaccard entre los conjuntos de escuderias. */
function teamJaccard(a: Driver, b: Driver): { score: number; shared: string[] } {
  const sa = new Set(teamIdsOf(a));
  const sb = new Set(teamIdsOf(b));
  const shared = [...sa].filter((x) => sb.has(x));
  const union = new Set([...sa, ...sb]);
  return { score: union.size === 0 ? 0 : shared.length / union.size, shared };
}

/** Cercania temporal de carreras (0-1). 1 = mismo periodo. */
function eraCloseness(a: Driver, b: Driver): number {
  const overlap = a.active.start <= end(b) && b.active.start <= end(a);
  if (overlap) return 1;
  const gap = Math.min(Math.abs(a.active.start - end(b)), Math.abs(b.active.start - end(a)));
  return Math.max(0, 1 - gap / 25);
}

/** Temporadas en activo compartidas (conteo). */
function sharedSeasons(a: Driver, b: Driver): number {
  const lo = Math.max(a.active.start, b.active.start);
  const hi = Math.min(end(a), end(b));
  return Math.max(0, hi - lo + 1);
}

function direction(guessVal: number, targetVal: number): Direction {
  if (guessVal === targetVal) return "eq";
  return targetVal > guessVal ? "up" : "down";
}

/**
 * Calcula la similitud entre un intento y el objetivo.
 * Pesos (suman 100): nacionalidad 20, escuderia 25, epoca 15, titulos 15,
 * companeros 10, temporadas compartidas 15.
 */
export function scoreGuess(guess: Driver, target: Driver): Score {
  // Acierto exacto: 100% garantizado.
  if (guess.id === target.id) {
    return {
      total: 100,
      factors: [
        { key: "nat", label: { key: "pittexto.factor.nationality" }, value: guess.nationalityCode, state: "match" },
        { key: "team", label: { key: "pittexto.factor.team" }, value: teamName(teamIdsOf(guess)[0] ?? ""), state: "match" },
        { key: "debut", label: { key: "pittexto.factor.debut" }, value: String(guess.active.start), state: "match", dir: "eq" },
        { key: "titles", label: { key: "pittexto.factor.titles" }, value: String(guess.championships), state: "match", dir: "eq" },
        { key: "mates", label: { key: "pittexto.factor.mates" }, value: { key: "common.yes" }, state: "match" },
      ],
    };
  }

  const natMatch = guess.nationalityCode === target.nationalityCode;
  const { score: teamScore, shared } = teamJaccard(guess, target);
  const era = eraCloseness(guess, target);
  const champDiff = Math.abs(guess.championships - target.championships);
  const champClose = 1 - Math.min(champDiff, 5) / 5;
  const mates = wereTeammates(guess, target);
  const seasons = sharedSeasons(guess, target);
  const seasonsScore = Math.min(seasons, 8) / 8;

  const total = Math.round(
    (natMatch ? 1 : 0) * 20 +
      teamScore * 25 +
      era * 15 +
      champClose * 15 +
      (mates ? 1 : 0) * 10 +
      seasonsScore * 15,
  );

  const debutDir = direction(guess.active.start, target.active.start);
  const debutDelta = Math.abs(guess.active.start - target.active.start);
  const titleDir = direction(guess.championships, target.championships);

  const factors: Factor[] = [
    {
      key: "nat",
      label: { key: "pittexto.factor.nationality" },
      value: guess.nationalityCode,
      state: natMatch ? "match" : "none",
    },
    {
      key: "team",
      label: { key: "pittexto.factor.team" },
      value: shared.length > 0 ? teamName(shared[0] as string) : { key: "pittexto.no_team_match" },
      state: shared.length > 0 ? "match" : "none",
    },
    {
      key: "debut",
      label: { key: "pittexto.factor.debut" },
      value: String(guess.active.start),
      state: debutDelta === 0 ? "match" : debutDelta <= 4 ? "partial" : "none",
      dir: debutDir,
    },
    {
      key: "titles",
      label: { key: "pittexto.factor.titles" },
      value: String(guess.championships),
      state: champDiff === 0 ? "match" : champDiff === 1 ? "partial" : "none",
      dir: titleDir,
    },
    {
      key: "mates",
      label: { key: "pittexto.factor.mates" },
      value: mates ? { key: "common.yes" } : { key: "common.no" },
      state: mates ? "match" : "none",
    },
  ];

  return { total: Math.max(0, Math.min(100, total)), factors };
}

/** Color "frio -> caliente" en funcion de la similitud (0 azul, 100 rojo). */
export function heatColor(pct: number): string {
  const hue = 210 - 2.1 * Math.max(0, Math.min(100, pct)); // 210 -> 0
  return `hsl(${hue}, 85%, 52%)`;
}
