// src/components/games/TeamRadio/teamradio.logic.ts
//
// Lógica de "Team Radio": se muestra el texto de una radio icónica de F1 y
// el jugador elige en qué Gran Premio se dijo, entre 6 opciones.
//
// Dos decisiones de diseño que este juego NO comparte con el resto del sitio:
//
//  1. RANGOS DE AÑO EXCLUSIVOS por dificultad (no acumulativos como
//     difficultyFloor). Mismo patrón que GPResultado (ver RANGES en
//     gpresultado.logic.ts). Motivo: el material de radios está distribuido
//     al revés que el de pilotos — lo reciente sobra y lo viejo casi no
//     existe transmitido, así que un piso acumulativo dejaba la dificultad
//     más alta siendo ~95% igual a la de abajo.
//
//  2. La dificultad controla DOS cosas a la vez: de qué época sale la radio
//     Y qué tan confusas son las 5 opciones falsas (ver RECIPES). En facil
//     las falsas son fáciles de descartar; en dificil son todas del mismo
//     circuito o del mismo año.
//
// Las opciones falsas SÍ pueden salir de años de otra dificultad: lo único
// que las limita es que el piloto haya estado activo ese año. Sin eso, una
// radio que cae justo en el borde de un rango perdía la opción más confusa
// de todas (el mismo circuito el año anterior).
//
// Todo es determinista: mismo día + misma dificultad => mismo puzzle, en
// todos los navegadores y también en el backend al re-verificar.

import type { Difficulty, Driver } from "@/types";
import type { Rng } from "@/lib/seed";
import { DRIVERS_BY_ID } from "@/data";
import { TEAM_RADIOS, type TeamRadio } from "@/data/teamRadios";
import { GP_CALENDAR, type GPRace } from "@/data/gpCalendar";
import { dailyPick, dailyRng } from "@/lib/daily";

/** Una de las 6 opciones que se le ofrecen al jugador. */
export type RadioOption = GPRace & {
  /** Id estable de la carrera: es lo que viaja al server como solución. */
  id: string;
};

export type TeamRadioPuzzle = {
  /** La radio del día (texto + respuesta correcta). */
  radio: TeamRadio;
  /** Piloto que la dijo. Se muestra en pantalla: sin esto el puzzle sería
   *  irresoluble, y además es lo que acota las opciones a años plausibles. */
  driver: Driver | null;
  /** 6 opciones ya barajadas (5 falsas + la correcta). */
  options: RadioOption[];
  /** Id de la opción correcta (uno de los `options[].id`). */
  correctId: string;
};

/** Cantidad total de opciones en pantalla. */
export const OPTION_COUNT = 6;

/**
 * Rangos de año EXCLUSIVOS por dificultad (ver nota 1 del encabezado).
 * `leyenda` no se ofrece en este juego (registry declara solo 3): se mapea a
 * la misma ventana que `dificil` por robustez, si alguna vez llegara.
 */
export const DIFFICULTY_RANGES: Record<Difficulty, [number, number]> = {
  facil: [2022, 9999],
  medio: [2017, 2021],
  dificil: [0, 2016],
  leyenda: [0, 2016],
};

/** Radios jugables en una dificultad. */
export function getTeamRadioPool(difficulty: Difficulty): TeamRadio[] {
  const [min, max] = DIFFICULTY_RANGES[difficulty] ?? DIFFICULTY_RANGES.medio;
  const pool = TEAM_RADIOS.filter((r) => r.y >= min && r.y <= max);
  // Fallback defensivo: si un rango quedara vacío (dataset recortado), usar
  // todo el corpus antes que romper el juego.
  return pool.length > 0 ? pool : TEAM_RADIOS.slice();
}

/** Id estable de una carrera. Formato: "<año>::<nombre del GP>". */
export function optionId(race: GPRace): string {
  return `${race.y}::${race.g}`;
}

/**
 * Clasificación de una carrera candidata respecto de la respuesta correcta.
 * Los 4 grupos son mutuamente excluyentes y cubren el 100% de los candidatos
 * (D es el cajón de sastre), así que ninguna carrera se pierde ni se duplica.
 *
 *  A - mismo circuito, año cercano (±2)  -> la más confusa de todas
 *  B - mismo año, otro circuito          -> muy confusa
 *  C - mismo circuito o mismo nombre de GP, año lejano (±3 o más)
 *  D - el resto                          -> fácil de descartar
 */
type Bucket = "A" | "B" | "C" | "D";

const NEAR_YEARS = 2;

function classify(race: GPRace, correct: GPRace): Bucket {
  const sameCircuit = race.c === correct.c;
  const sameName = race.g === correct.g;
  const gap = Math.abs(race.y - correct.y);

  if (sameCircuit && gap <= NEAR_YEARS) return "A";
  if (race.y === correct.y && !sameCircuit) return "B";
  if ((sameCircuit || sameName) && gap > NEAR_YEARS) return "C";
  return "D";
}

/**
 * Cuántas opciones falsas sacar de cada grupo, por dificultad, y en qué orden
 * rellenar si algún grupo se queda corto (pasa con circuitos que se usaron
 * pocos años, ej. Buddh 2011-2013). El orden de relleno preserva el carácter
 * de la dificultad: facil rellena con lejanas, dificil con cercanas.
 */
const RECIPES: Record<Difficulty, { mix: Record<Bucket, number>; fill: Bucket[] }> = {
  facil: { mix: { A: 1, B: 1, C: 0, D: 3 }, fill: ["D", "C", "B", "A"] },
  medio: { mix: { A: 2, B: 2, C: 1, D: 0 }, fill: ["B", "A", "C", "D"] },
  dificil: { mix: { A: 3, B: 2, C: 0, D: 0 }, fill: ["A", "B", "C", "D"] },
  leyenda: { mix: { A: 3, B: 2, C: 0, D: 0 }, fill: ["A", "B", "C", "D"] },
};

/** Ventana de años en que el piloto estuvo en activo. */
function activeWindow(driver: Driver | null): [number, number] {
  if (!driver) return [0, 9999];
  return [driver.active.start, driver.active.end ?? 9999];
}

/**
 * Carreras que pueden funcionar como opción falsa: dentro de la ventana
 * activa del piloto (si no, se descartan de un vistazo) y sin contar la
 * carrera correcta. Las carreras trágicas ya están excluidas en GP_CALENDAR.
 */
function candidateRaces(correct: GPRace, driver: Driver | null): GPRace[] {
  const [from, to] = activeWindow(driver);
  const correctKey = optionId(correct);
  return GP_CALENDAR.filter(
    (r) => r.y >= from && r.y <= to && optionId(r) !== correctKey,
  );
}

/** Elige las 5 opciones falsas siguiendo la receta de la dificultad. */
function pickDistractors(
  correct: GPRace,
  driver: Driver | null,
  difficulty: Difficulty,
  rng: Rng,
): GPRace[] {
  const recipe = RECIPES[difficulty] ?? RECIPES.medio;

  // Agrupar candidatos. Se ordenan por id ANTES de barajar para que el
  // resultado no dependa del orden en que estén escritas las carreras en
  // gpCalendar.ts (mismo criterio que el .sort() de intruso.logic.ts).
  const buckets: Record<Bucket, GPRace[]> = { A: [], B: [], C: [], D: [] };
  for (const race of candidateRaces(correct, driver)) {
    buckets[classify(race, correct)].push(race);
  }
  const remaining: Record<Bucket, GPRace[]> = { A: [], B: [], C: [], D: [] };
  for (const key of ["A", "B", "C", "D"] as Bucket[]) {
    const sorted = buckets[key].slice().sort((a, b) => optionId(a).localeCompare(optionId(b)));
    remaining[key] = rng.shuffle(sorted);
  }

  const chosen: GPRace[] = [];
  const takeFrom = (key: Bucket, n: number) => {
    for (let i = 0; i < n && remaining[key].length > 0; i++) {
      chosen.push(remaining[key].shift() as GPRace);
    }
  };

  // 1) La mezcla que pide la dificultad.
  for (const key of ["A", "B", "C", "D"] as Bucket[]) {
    takeFrom(key, recipe.mix[key]);
  }
  // 2) Relleno si algún grupo se quedó corto.
  const target = OPTION_COUNT - 1;
  for (const key of recipe.fill) {
    if (chosen.length >= target) break;
    takeFrom(key, target - chosen.length);
  }

  return chosen.slice(0, target);
}

/** Genera el puzzle del día (o de un duelo si viene `seed`). */
export function buildTeamRadio(
  difficulty: Difficulty,
  date: Date,
  seed?: string,
): TeamRadioPuzzle {
  const pool = getTeamRadioPool(difficulty);
  const radio = dailyPick(pool, date, `teamradio::${difficulty}`, seed);
  const driver = DRIVERS_BY_ID[radio.driverId] ?? null;

  // Salt propio para las opciones: así el sorteo de las falsas no altera qué
  // radio sale ese día, y cuando la misma radio reaparece en la rotación (en
  // otra fecha) las opciones son distintas — que es justo lo que evita que se
  // memorice el par radio-respuesta. Mismo truco que puzzleColors.ts.
  const rng = dailyRng(date, `teamradio-options::${difficulty}`, seed);

  const correct: GPRace = { y: radio.y, g: radio.g, c: radio.c };
  const distractors = pickDistractors(correct, driver, difficulty, rng);

  const options: RadioOption[] = rng
    .shuffle([correct, ...distractors])
    .map((race) => ({ ...race, id: optionId(race) }));

  return { radio, driver, options, correctId: optionId(correct) };
}

/** Solución que el cliente envía al server: el id de la opción elegida. */
export type TeamRadioSolution = {
  optionId: string;
};

/**
 * Verificador PURO (lo usa el backend en verifyChallenge, Etapa 6).
 * Reconstruye el puzzle con la MISMA semilla y compara: nunca confía en el
 * cliente, que solo manda cuál opción tocó.
 */
export function verifyTeamRadio(
  difficulty: Difficulty,
  date: Date,
  solution: TeamRadioSolution,
  seed?: string,
): { won: boolean; detail: string } {
  if (!solution || typeof solution.optionId !== "string" || solution.optionId === "") {
    return { won: false, detail: "Falta optionId en la solución" };
  }
  const puzzle = buildTeamRadio(difficulty, date, seed);
  // La opción enviada tiene que ser una de las 6 que se mostraron.
  if (!puzzle.options.some((o) => o.id === solution.optionId)) {
    return { won: false, detail: `Opción inexistente: ${solution.optionId}` };
  }
  const won = solution.optionId === puzzle.correctId;
  return {
    won,
    detail: won
      ? `Correcto: ${puzzle.radio.g} ${puzzle.radio.y}`
      : `Incorrecto. Era: ${puzzle.radio.g} ${puzzle.radio.y}`,
  };
}
