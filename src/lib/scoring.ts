/**
 * Motor de puntaje — funcion PURA y determinista.
 *
 * Reglas (segun el pedido):
 *   - Se puntua SOLO si se gana el reto (perder o abandonar = 0).
 *   - Mas dificultad => mas puntos base.
 *   - Menos tiempo => mas bonus de rapidez (proporcional al tiempo que sobro).
 *
 * Esta funcion no toca almacenamiento ni fechas: recibe los datos del intento
 * y devuelve un numero. Se reutiliza IDENTICA en el backend (routes.ts) para
 * recalcular el puntaje del lado del servidor, garantizando un ranking
 * multiusuario verificado server-side.
 */

import type { Difficulty } from "@/types";

export type ScoreInput = {
  won: boolean;
  difficulty: Difficulty;
  /** Segundos que tardo en resolver (reloj real). */
  timeSeconds?: number | null;
  /** Limite de tiempo elegido por el jugador. */
  timeLimit?: number | null;
  /**
   * Tiempo máximo disponible para este juego (el mayor de las opciones).
   * Si el jugador eligió un tiempo menor, el bonus de velocidad sube
   * proporcionalmente (recompensa el riesgo). Omitir = sin multiplicador (1×).
   */
  maxTimeOption?: number | null;
  /** Modo "Sin Tiempo": ignora tiempo/dificultad, siempre da UNTIMED_SCORE si gana. */
  untimed?: boolean;
};

/** Puntos base por dificultad. Separados a proposito (ver MAX_SPEED_BONUS). */
export const BASE_POINTS: Record<Difficulty, number> = {
  facil: 100,
  medio: 220,
  dificil: 380,
  leyenda: 600,
};

/**
 * Bonus maximo por resolver al instante (decrece con el tiempo usado),
 * proporcional a la dificultad (antes era un numero fijo de 120 igual para
 * todas: al ser mayor que la base de "facil" (100), resolver facil rapido
 * casi empataba con resolver medio lento, sin compensar el riesgo de elegir
 * una dificultad mayor). Ahora es ~15% de la base de cada dificultad: ni con
 * el maximo multiplicador de riesgo (ver riskMultiplier) el techo de una
 * dificultad alcanza la base de la siguiente.
 */
export const MAX_SPEED_BONUS: Record<Difficulty, number> = {
  facil: 15,
  medio: 33,
  dificil: 57,
  leyenda: 90,
};

/** Puntaje fijo del modo "Sin Tiempo": bajo y constante, no importa cuanto tardes (no hay riesgo de tiempo que compensar). Menor que el piso de "facil". */
export const UNTIMED_SCORE = 60;

/** Puntaje de un intento. Determinista: mismas entradas => mismo numero. */
export function computeScore(input: ScoreInput): number {
  if (!input.won) return 0;
  if (input.untimed) return UNTIMED_SCORE;
  const base = BASE_POINTS[input.difficulty] ?? BASE_POINTS.medio;

  let speed = 0;
  const { timeSeconds, timeLimit, maxTimeOption } = input;
  if (timeSeconds != null && timeLimit != null && timeLimit > 0) {
    const maxBonus = MAX_SPEED_BONUS[input.difficulty] ?? MAX_SPEED_BONUS.medio;
    const remaining = Math.max(0, Math.min(timeLimit, timeLimit - timeSeconds));
    const maxTime = maxTimeOption != null && maxTimeOption >= timeLimit ? maxTimeOption : timeLimit;
    const riskMultiplier = maxTime / timeLimit;
    speed = Math.round(maxBonus * riskMultiplier * (remaining / timeLimit));
  }
  return base + speed;
}

/** Desglose legible de un puntaje (para mostrar en la UI). */
export function scoreBreakdown(input: ScoreInput): { base: number; speed: number; total: number } {
  if (!input.won) return { base: 0, speed: 0, total: 0 };
  const total = computeScore(input);
  if (input.untimed) return { base: total, speed: 0, total };
  const base = BASE_POINTS[input.difficulty] ?? BASE_POINTS.medio;
  return { base, speed: total - base, total };
}
