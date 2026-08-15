import type { Difficulty, Driver } from "@/types";
import type { I18nText } from "@/i18n/types";
import { teamIdsOf, teamName } from "@/data";
import { getDriverPoolAtLeast } from "@/lib/filters";
import { dailyRng } from "@/lib/daily";

export type IntrusoPuzzle = {
  /** 10 pilotos en orden ya barajado. */
  tiles: Driver[];
  /** Id del piloto intruso (el que NO comparte la caracteristica). */
  intruderId: string;
  /** Regla que comparten los otros 9 (se revela al terminar). */
  rule: I18nText;
};

const GROUP_SIZE = 9;

/**
 * Tipo de regla. El sorteo elige primero la FAMILIA y despues la regla
 * concreta, no una categoria al azar de una lista plana: como las categorias
 * de escuderia son decenas y las de estadisticas son 2 por familia, un sorteo
 * plano hacia salir "condujeron para X" ~9 de cada 10 dias en Leyenda.
 */
type CategoryFamily = "team" | "champ" | "win" | "pole" | "podium";

type Category = {
  key: string;
  family: CategoryFamily;
  rule: I18nText;
  members: Driver[]; // cumplen la regla
  intruders: Driver[]; // no la cumplen
};

/**
 * Familias basadas en estadisticas del piloto. NINGUNA de estas se puede
 * deducir mirando la tarjeta (que muestra nombre, bandera y casco), a
 * diferencia de la vieja regla de nacionalidad: la bandera esta impresa en la
 * tarjeta, asi que ese dia el juego se resolvia sin saber nada de F1.
 */
const STAT_FAMILIES: {
  family: CategoryFamily;
  has: (d: Driver) => boolean;
  yes: { key: string; rule: string };
  no: { key: string; rule: string };
}[] = [
  {
    family: "champ",
    has: (d) => d.championships > 0,
    yes: { key: "champ:yes", rule: "intruso.rule.champ" },
    no: { key: "champ:no", rule: "intruso.rule.non_champ" },
  },
  {
    family: "win",
    has: (d) => (d.wins ?? 0) > 0,
    yes: { key: "win:yes", rule: "intruso.rule.winner" },
    no: { key: "win:no", rule: "intruso.rule.non_winner" },
  },
  {
    family: "pole",
    has: (d) => (d.poles ?? 0) > 0,
    yes: { key: "pole:yes", rule: "intruso.rule.poleman" },
    no: { key: "pole:no", rule: "intruso.rule.non_poleman" },
  },
  {
    family: "podium",
    has: (d) => (d.podiums ?? 0) > 0,
    yes: { key: "podium:yes", rule: "intruso.rule.podium" },
    no: { key: "podium:no", rule: "intruso.rule.non_podium" },
  },
];

/** Construye todas las categorias posibles y deja solo las factibles. */
function feasibleCategories(pool: Driver[]): Category[] {
  const cats: Category[] = [];

  // --- Por escuderia: "Condujeron para X" ---
  const teamIds = new Set<string>();
  for (const d of pool) for (const id of teamIdsOf(d)) teamIds.add(id);
  for (const teamId of teamIds) {
    const members = pool.filter((d) => teamIdsOf(d).includes(teamId));
    const intruders = pool.filter((d) => !teamIdsOf(d).includes(teamId));
    cats.push({
      key: `team:${teamId}`,
      family: "team",
      rule: { key: "intruso.rule.team", vars: { team: teamName(teamId) } },
      members,
      intruders,
    });
  }

  // --- Por estadisticas: campeonatos, victorias, poles, podios ---
  for (const { family, has, yes, no } of STAT_FAMILIES) {
    const withStat = pool.filter(has);
    const withoutStat = pool.filter((d) => !has(d));
    cats.push({ key: yes.key, family, rule: { key: yes.rule }, members: withStat, intruders: withoutStat });
    cats.push({ key: no.key, family, rule: { key: no.rule }, members: withoutStat, intruders: withStat });
  }

  // Solo categorias con suficientes miembros y al menos un intruso.
  return cats
    .filter((c) => c.members.length >= GROUP_SIZE && c.intruders.length >= 1)
    .sort((a, b) => a.key.localeCompare(b.key));
}

/** Genera el puzzle del dia de forma determinista (o de un duelo si hay `seed`). */
export function buildIntruso(difficulty: Difficulty, date: Date, seed?: string): IntrusoPuzzle {
  const pool = getDriverPoolAtLeast(difficulty, 30);
  const rng = dailyRng(date, `intruso::${difficulty}`, seed);

  const cats = feasibleCategories(pool);
  // Siempre habra al menos una categoria factible (campeones/no campeones en
  // un pool de 30+), pero por robustez se contempla el caso degenerado.
  if (cats.length === 0) {
    const tiles = rng.sample(pool, 10);
    return { tiles, intruderId: tiles[0]?.id ?? "", rule: { key: "intruso.rule.none" } };
  }

  // Sorteo en dos pasos para que todas las familias salgan con la misma
  // frecuencia (ver comentario de CategoryFamily). `cats` ya viene ordenado
  // por key, asi que el orden de insercion del Map es determinista; el sort
  // explicito lo deja a salvo de cambios futuros en ese orden.
  const byFamily = new Map<CategoryFamily, Category[]>();
  for (const c of cats) {
    const arr = byFamily.get(c.family) ?? [];
    arr.push(c);
    byFamily.set(c.family, arr);
  }
  const families = [...byFamily.keys()].sort();
  const family = rng.pick(families);
  const cat = rng.pick(byFamily.get(family) as Category[]);

  const members = rng.sample(cat.members, GROUP_SIZE);
  const intruder = rng.pick(cat.intruders);
  const tiles = rng.shuffle([...members, intruder]);

  return { tiles, intruderId: intruder.id, rule: cat.rule };
}
