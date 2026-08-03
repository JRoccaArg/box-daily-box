// src/lib/career/constants.ts
//
// Constantes de balance del Modo Carrera. Todo lo "afinable" vive aca para
// poder ajustar la dificultad sin tocar la logica de simulacion.

/** Puntos por posicion (sistema actual de F1, P1..P10). */
export const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;

/** Carreras por temporada (calendario actual de F1). */
export const RACES_PER_SEASON = 24;

/** Butacas en la parrilla (10 equipos x 2). */
export const GRID_SIZE = 20;

/** Tope duro de temporadas de una carrera (decidido con el usuario). */
export const MAX_SEASONS = 24;

/** Edad a la que debuta el piloto del jugador. */
export const ROOKIE_AGE = 19;

/**
 * Peso del COCHE vs el PILOTO en el rendimiento de una carrera.
 *
 * En F1 el coche pesa mucho mas que el piloto: un gran piloto en un mal
 * coche no gana. Estos pesos son la razon principal de que la meta del modo
 * sea ESCALAR hasta un equipo ganador, no solo "correr bien".
 */
export const CAR_WEIGHT = 0.62;
export const DRIVER_WEIGHT = 0.38;

/**
 * Ruido aleatorio por carrera (desviacion sobre 100 puntos de "fuerza").
 * Es deliberadamente ALTO comparado con el efecto de la edad: el usuario
 * pidio que la suerte y las decisiones pesen mas que envejecer.
 */
export const RACE_NOISE = 9;

/** Ruido de la clasificacion (menor que el de carrera: quali es mas "pura"). */
export const QUALI_NOISE = 6;

/** Probabilidad base de abandono por mecanica, ajustada por fiabilidad. */
export const BASE_MECHANICAL_DNF = 0.055;

/** Probabilidad base de accidente propio, ajustada por consistencia. */
export const BASE_ACCIDENT = 0.045;

/** Rango del rendimiento de los coches al empezar la carrera. */
export const CAR_PERF_MIN = 30;
export const CAR_PERF_MAX = 95;

/**
 * Evolucion del coche entre temporadas.
 * - DRIFT: cuanto puede moverse un equipo de un anio al otro (deriva normal).
 * - REVERSION: cuanto tira hacia la media (evita dominios eternos).
 * - SHAKEUP_CHANCE / SHAKEUP: cada tanto hay un cambio de reglamento que
 *   reordena la parrilla de golpe (como 2009 o 2022 en la F1 real).
 */
export const CAR_DRIFT = 7;
export const CAR_REVERSION = 0.12;
export const SHAKEUP_CHANCE = 0.14;
export const SHAKEUP_DRIFT = 22;

/**
 * Curva de edad. DELIBERADAMENTE SUAVE: el usuario pidio que la edad
 * "baje un poco el potencial pero no tanto como la suerte y las
 * decisiones". El efecto total de punta a punta es menor que el ruido de
 * una sola carrera (RACE_NOISE), asi que nunca se siente determinante.
 */
export const AGE_PEAK_START = 26;
export const AGE_PEAK_END = 32;
/** Penalizacion maxima por ser muy joven (a los ROOKIE_AGE anios). */
export const AGE_ROOKIE_PENALTY = 7;
/** Penalizacion maxima por veterania (se alcanza recien pasados los 40). */
export const AGE_VETERAN_PENALTY = 5;

/** Cuanto pesa la moral en el rendimiento (sobre 100 de "fuerza"). */
export const MORALE_WEIGHT = 0.06;

/** Atributos iniciales del rookie (se reparten con algo de azar). */
export const ROOKIE_ATTR_MIN = 48;
export const ROOKIE_ATTR_MAX = 66;

/**
 * Techo de talento del piloto del jugador: se sortea al crearlo. No todos
 * nacen campeones — con un techo bajo hace falta MUCHO mas coche y suerte
 * para ganar un titulo. Los eventos (Etapa 2) pueden subirlo un poco.
 */
export const PLAYER_POTENTIAL_MIN = 71;
export const PLAYER_POTENTIAL_MAX = 96;

/**
 * Ritmo al que los atributos se acercan a su techo por temporada. Es
 * asintotico: rapido de joven, casi nulo pasado el pico. Reemplaza al
 * crecimiento lineal, que hacia que cualquier piloto terminara siendo el
 * mejor de la parrilla solo por sumar temporadas.
 */
export const GROWTH_RATE_YOUNG = 0.22;
export const GROWTH_RATE_PRIME = 0.07;

/**
 * Probabilidad de que un equipo tenga la butaca libre cuando te busca.
 * Los equipos grandes casi nunca la tienen disponible (sus pilotos estan
 * bajo contrato), asi que llegar a uno es dificil aunque te sobre
 * reputacion. Indexado por puesto del coche (1 = mejor).
 *
 * Ajustado con datos: con el mejor auto y buenos atributos, el titulo se
 * gana ~93% de las temporadas (medido con Monte Carlo). Como la carrera
 * dura ~23 temporadas en promedio, quien llega arriba tiende a acumular
 * muchos titulos seguidos — eso fue lo que empujo el balance de "dificil
 * pero alcanzable" a "casi la mitad de las carreras salen campeonas"
 * (49% con N=200). El ajuste real no es tocar el % de victoria en el auto
 * top (seria antirealista), sino hacer mas dificil LLEGAR y quedarse ahi.
 */
export const SEAT_AVAILABILITY_TOP = 0.09; // puestos 1-2
export const SEAT_AVAILABILITY_MID = 0.26; // puestos 3-5
export const SEAT_AVAILABILITY_LOW = 0.88; // puestos 6-10

/**
 * Reputacion minima para que un equipo del puesto `rank` te tantee (1 =
 * mejor auto). REQUIRED_REP_BASE es el piso para el peor auto; el termino
 * `(10-rank) * REQUIRED_REP_PER_RANK` lo va subiendo hacia los mejores.
 */
export const REQUIRED_REP_BASE = 20;
export const REQUIRED_REP_PER_RANK = 9.6;

/**
 * Cuanto se olvida el paddock por temporada: la reputacion tira hacia la
 * media. Sin esto, un campeon conserva 100 de reputacion para siempre y
 * siempre le llega el mejor asiento.
 */
export const REPUTATION_DECAY = 0.1;

/** Umbrales de reputacion para que lleguen ofertas de cada franja. */
export const REPUTATION_START = 45;
