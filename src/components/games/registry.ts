import type { GameDefinition } from "@/types";
import { PitTexto } from "./PitTexto/PitTexto";
import { PoleWordle } from "./PoleWordle/PoleWordle";
import { ElIntruso } from "./ElIntruso/ElIntruso";
import { ParrillaBingo } from "./ParrillaBingo/ParrillaBingo";

/**
 * Registro central de juegos. Cada entrada es autodescriptiva: el resto de la
 * app (home, ruteo, GameShell) se construye a partir de esta lista.
 *
 * Para AGREGAR un juego nuevo:
 *  1. Implementa un componente que reciba `GameProps`.
 *  2. (Opcional) Su logica de generacion diaria en un archivo aparte.
 *  3. Agrega aqui un objeto `GameDefinition` con un `id` unico (slug de URL).
 * No hace falta tocar nada mas: la home y la ruta /juego/:id lo toman solos.
 *
 * El orden de este array define el orden de aparicion en la home.
 */
const DIFFS = ["facil", "medio", "dificil", "leyenda"] as const;

export const GAMES: GameDefinition[] = [
  {
    id: "pittexto",
    name: "PitTexto",
    tagline: "Adivina al piloto secreto. Cada intento te dice que tan cerca estas.",
    glyph: "PT",
    difficulties: [...DIFFS],
    timer: { kind: "choice", options: [120, 180] },
    component: PitTexto,
  },
  {
    id: "polewordle",
    name: "PoleWordle",
    tagline: "Adivina el apellido del piloto del dia, estilo Wordle, en 6 intentos.",
    glyph: "PW",
    difficulties: [...DIFFS],
    timer: { kind: "choice", options: [90, 120] },
    component: PoleWordle,
  },
  {
    id: "el-intruso",
    name: "El Intruso",
    tagline: "Nueve de diez pilotos comparten algo. Toca al que no encaja.",
    glyph: "IN",
    difficulties: [...DIFFS],
    timer: { kind: "choice", options: [45, 60] },
    component: ElIntruso,
  },
  {
    id: "parrilla-bingo",
    name: "Parrilla Bingo",
    tagline: "Pon en cada celda un piloto que cumpla su escuderia y su condicion.",
    glyph: "BG",
    difficulties: [...DIFFS],
    timer: { kind: "fixed", seconds: 150 },
    component: ParrillaBingo,
  },
];

/** Busca una definicion de juego por su id (slug de URL). */
export function gameById(id: string): GameDefinition | undefined {
  return GAMES.find((g) => g.id === id);
}
