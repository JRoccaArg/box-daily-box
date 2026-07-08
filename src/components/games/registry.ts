import type { GameDefinition } from "@/types";
import { PitTexto } from "./PitTexto/PitTexto";
import { PoleWordle } from "./PoleWordle/PoleWordle";
import { ElIntruso } from "./ElIntruso/ElIntruso";
import { ParrillaBingo } from "./ParrillaBingo/ParrillaBingo";
import { GPResultado } from "./GPResultado/GPResultado";
import { Top10Standings } from "./Top10Standings/Top10Standings";

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
    glyph: "PT",
    difficulties: [...DIFFS],
    timer: { kind: "choice", options: [120, 180] },
    component: PitTexto,
  },
  {
    id: "polewordle",
    glyph: "PW",
    difficulties: [...DIFFS],
    timer: { kind: "choice", options: [90, 120] },
    component: PoleWordle,
  },
  {
    id: "el-intruso",
    glyph: "IN",
    difficulties: [...DIFFS],
    timer: { kind: "choice", options: [45, 60] },
    component: ElIntruso,
  },
  {
    id: "parrilla-bingo",
    glyph: "BG",
    difficulties: [...DIFFS],
    timer: { kind: "fixed", seconds: 150 },
    component: ParrillaBingo,
  },
  {
    id: "gp-resultado",
    glyph: "GP",
    difficulties: [...DIFFS],
    timer: { kind: "choice", options: [90, 120, 150, 180] },
    component: GPResultado,
  },
  {
    id: "top10-standings",
    glyph: "TS",
    difficulties: [...DIFFS],
    timer: { kind: "choice", options: [90, 120, 150, 180] },
    component: Top10Standings,
  },
];

/** Busca una definicion de juego por su id (slug de URL). */
export function gameById(id: string): GameDefinition | undefined {
  return GAMES.find((g) => g.id === id);
}
