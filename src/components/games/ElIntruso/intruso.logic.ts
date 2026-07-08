import type { Difficulty, Driver } from "@/types";
import type { I18nText } from "@/i18n/types";
import { teamIdsOf, teamName, nationality } from "@/data";
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

type Category = {
  key: string;
  rule: I18nText;
  members: Driver[]; // cumplen la regla
  intruders: Driver[]; // no la cumplen
};

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
      rule: { key: "intruso.rule.team", vars: { team: teamName(teamId) } },
      members,
      intruders,
    });
  }

  // --- Campeones / no campeones ---
  const champs = pool.filter((d) => d.championships > 0);
  const nonChamps = pool.filter((d) => d.championships === 0);
  cats.push({ key: "champ:yes", rule: { key: "intruso.rule.champ" }, members: champs, intruders: nonChamps });
  cats.push({ key: "champ:no", rule: { key: "intruso.rule.non_champ" }, members: nonChamps, intruders: champs });

  // --- Por nacionalidad ---
  const byNat = new Map<string, Driver[]>();
  for (const d of pool) {
    const arr = byNat.get(d.nationalityCode) ?? [];
    arr.push(d);
    byNat.set(d.nationalityCode, arr);
  }
  for (const [code, members] of byNat) {
    const intruders = pool.filter((d) => d.nationalityCode !== code);
    cats.push({
      key: `nat:${code}`,
      rule: { key: "intruso.rule.nationality", vars: { nat: nationality(code).name } },
      members,
      intruders,
    });
  }

  // Solo categorias con suficientes miembros y al menos un intruso.
  return cats
    .filter((c) => c.members.length >= GROUP_SIZE && c.intruders.length >= 1)
    .sort((a, b) => a.key.localeCompare(b.key));
}

/** Genera el puzzle del dia de forma determinista. */
export function buildIntruso(difficulty: Difficulty, date: Date): IntrusoPuzzle {
  const pool = getDriverPoolAtLeast(difficulty, 30);
  const rng = dailyRng(date, `intruso::${difficulty}`);

  const cats = feasibleCategories(pool);
  // Siempre habra al menos una categoria factible (campeones/no campeones en
  // un pool de 30+), pero por robustez se contempla el caso degenerado.
  if (cats.length === 0) {
    const tiles = rng.sample(pool, 10);
    return { tiles, intruderId: tiles[0]?.id ?? "", rule: { key: "intruso.rule.none" } };
  }

  const cat = rng.pick(cats);
  const members = rng.sample(cat.members, GROUP_SIZE);
  const intruder = rng.pick(cat.intruders);
  const tiles = rng.shuffle([...members, intruder]);

  return { tiles, intruderId: intruder.id, rule: cat.rule };
}
