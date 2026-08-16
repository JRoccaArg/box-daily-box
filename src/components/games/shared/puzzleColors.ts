import type { Driver, Difficulty } from "@/types";
import { dailyRng } from "@/lib/daily";
import { BRAND_TEAM_IDS } from "@/data";
import { driverColor, lastTeamId } from "./driverColor";

/**
 * Paleta de reemplazo para cuando dos pilotos de la MISMA partida quedarian
 * con colores demasiado parecidos entre si. Vive aca (no en scripts/gen-data.py)
 * porque es una decision de runtime, no del dataset.
 */
const SWAP_PALETTE = [
  "#E53935", "#D81B60", "#8E24AA", "#5E35B1", "#3949AB", "#1E88E5", "#039BE5",
  "#00ACC1", "#00897B", "#43A047", "#7CB342", "#C0CA33", "#FDD835", "#FFB300",
  "#FB8C00", "#F4511E", "#6D4C41", "#78909C", "#EC407A", "#26A69A",
];

/** Distancia RGB minima para considerar dos colores "distinguibles" en la grilla. */
const MIN_DISTANCE = 70;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function distance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function farEnough(color: string, used: readonly string[]): boolean {
  return used.every((u) => distance(color, u) >= MIN_DISTANCE);
}

/**
 * Asigna un color de casco a cada piloto de la grilla de El Intruso,
 * garantizando que las 10 tarjetas se vean distintas entre si. Prioriza el
 * color de marca/nacional (`driverColor`) y solo lo reemplaza cuando choca
 * con uno ya asignado en la MISMA partida (ej. dos pilotos de escuderias
 * italianas en la misma grilla). Determinista con seed propia
 * ("intruso-colors::"), distinta de la de `buildIntruso`, para no alterar el
 * puzzle en si (regla + intruso) al tocar solo los colores.
 */
export function assignPuzzleColors(
  drivers: readonly Driver[],
  difficulty: Difficulty,
  date: Date,
  seed?: string,
): Map<string, string> {
  const rng = dailyRng(date, `intruso-colors::${difficulty}`, seed);
  const shuffledSwap = rng.shuffle(SWAP_PALETTE);

  const result = new Map<string, string>();
  const used: string[] = [];

  // Equipos con color de marca/nacional real van primero: se quedan con su
  // color salvo choque, y le ceden el paso al "relleno" (paleta al azar) si
  // hace falta desplazar a alguien.
  const brand = drivers.filter((d) => {
    const id = lastTeamId(d);
    return id !== null && BRAND_TEAM_IDS.includes(id);
  });
  const rest = drivers.filter((d) => !brand.includes(d));

  for (const d of [...brand, ...rest]) {
    const base = driverColor(d);
    if (farEnough(base, used)) {
      result.set(d.id, base);
      used.push(base);
      continue;
    }

    const alt = shuffledSwap.find((c) => farEnough(c, used));
    const chosen =
      alt ??
      shuffledSwap.reduce((best, c) => {
        const bestMin = Math.min(...used.map((u) => distance(best, u)));
        const cMin = Math.min(...used.map((u) => distance(c, u)));
        return cMin > bestMin ? c : best;
      }, shuffledSwap[0] as string);

    result.set(d.id, chosen);
    used.push(chosen);
  }

  return result;
}
