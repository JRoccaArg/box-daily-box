// src/lib/career/types.ts
//
// Tipos del Modo Carrera (simulador de carrera de piloto de F1).
//
// IMPORTANTE: este modo NO usa GameShell, NO puntua para el ranking y NO
// habla con el server. Todo su estado vive en localStorage (ver storage.ts).
//
// Regla de i18n (misma que el resto del proyecto): NADA de texto
// user-facing se arma aca. El motor devuelve ids/datos y la UI traduce.
// Excepcion: nombres propios (piloto, escuderia) son strings crudos, igual
// que los nombres del dataset real.

/** Atributos ocultos del piloto (0-100). Los eventos los empujan. */
export type DriverAttributes = {
  /** Ritmo puro: define la posicion base en clasificacion y carrera. */
  pace: number;
  /** Consistencia: a mayor valor, menos errores y accidentes. */
  consistency: number;
  /** Pericia en carrera: adelantamientos y defensa. */
  racecraft: number;
};

/** Estado variable del piloto del jugador, temporada a temporada. */
export type PlayerDriver = {
  /** Nombre propio elegido por el jugador (string crudo, no se traduce). */
  firstName: string;
  lastName: string;
  /** Codigo alpha-3 del dataset de nacionalidades. */
  nationalityCode: string;
  age: number;
  attributes: DriverAttributes;
  /**
   * Techo de talento (0-100). Los atributos crecen ACERCANDOSE a este
   * valor y nunca lo superan: es lo que evita que cualquier piloto termine
   * siendo el mejor de la historia solo por acumular temporadas. Se sortea
   * al crear el piloto (no todos nacen campeones) y los eventos de la
   * Etapa 2 pueden moverlo.
   */
  potential: number;
  /**
   * Moral / forma (0-100, arranca en 50). Sube con buenos resultados y
   * decisiones acertadas; baja con malas rachas. Modifica el rendimiento de
   * la temporada siguiente, pero pesa MENOS que el coche.
   */
  morale: number;
  /**
   * Reputacion en el paddock (0-100). Es lo que mueve las ofertas de
   * asiento: sube si rendis por ENCIMA de tu coche, baja si rendis por
   * debajo. No es lo mismo que "puntos": ir 12mo con el peor coche puede
   * subir la reputacion.
   */
  reputation: number;
};

/** Un piloto rival (IA). Puede venir del dataset real o ser generado. */
export type RivalDriver = {
  /** id del dataset real, o `gen::<n>` si es generado. */
  id: string;
  firstName: string;
  lastName: string;
  nationalityCode: string;
  age: number;
  attributes: DriverAttributes;
  /** Techo de talento, igual que en el jugador (ver PlayerDriver.potential). */
  potential: number;
  /** true si salio del dataset real de F1 (para dar sabor en la UI). */
  real: boolean;
};

/** Ocupante de una butaca: el jugador o un rival. */
export type SeatOccupant =
  | { kind: "player" }
  | { kind: "rival"; driver: RivalDriver };

/** Estado de una escuderia en una temporada concreta. */
export type TeamState = {
  teamId: string;
  /**
   * Rendimiento del coche (0-100) en ESTA temporada. Evoluciona de un anio
   * a otro (deriva + reversion a la media + saltos por cambios de
   * reglamento), asi que ningun equipo domina las 24 temporadas.
   */
  carPerformance: number;
  /** Fiabilidad (0-100): a mayor valor, menos abandonos por mecanica. */
  reliability: number;
};

/** Resultado agregado de UNA temporada para el piloto del jugador. */
export type SeasonResult = {
  season: number;
  /** Anio calendario mostrado en la UI (ej. 2026). */
  year: number;
  /** Equipo en el que corrio, o null si se quedo sin asiento ese anio. */
  teamId: string | null;
  /** null cuando no tuvo asiento (no corrio). */
  stats: SeasonStats | null;
};

/** Estadisticas de una temporada corrida. */
export type SeasonStats = {
  points: number;
  /** Promedio de puntos por carrera (redondeado a 1 decimal). */
  pointsPerRace: number;
  /** Posicion final en el campeonato de pilotos (1-20). */
  championshipPosition: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  /** Adelantamientos completados en toda la temporada. */
  overtakes: number;
  /** Abandonos por rotura del coche (mala suerte). */
  mechanicalDnfs: number;
  /** Abandonos por accidente propio (error del piloto). */
  accidents: number;
  /** Puntos del companiero de equipo, para la comparacion directa. */
  teammatePoints: number;
  /** Nombre del companiero (string crudo, nombre propio). */
  teammateName: string;
  /**
   * Puesto del COCHE en la parrilla por rendimiento (1 = mejor coche del
   * anio, 10 = peor). Permite comparar resultado vs material: terminar 8vo
   * con el 10mo coche es sobresaliente; con el 2do coche es un fracaso.
   */
  carRank: number;
  /**
   * Diferencia entre el rendimiento del coche y el resultado obtenido.
   * Positivo = rendiste POR ENCIMA del coche. Se calcula comparando la
   * posicion del campeonato esperada segun el coche contra la real.
   */
  performanceDelta: number;
};

/** Palmares acumulado de toda la carrera. */
export type CareerTotals = {
  seasonsRaced: number;
  championships: number;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  overtakes: number;
  mechanicalDnfs: number;
  accidents: number;
  /** Temporadas en las que quedo por delante del companiero en puntos. */
  teammateBattlesWon: number;
  /** Temporadas en las que corrio contra un companiero. */
  teammateBattlesTotal: number;
};

/** Una oferta de asiento para la temporada siguiente. */
export type SeatOffer = {
  teamId: string;
  /** Rendimiento estimado del coche que se le muestra al jugador (1-10). */
  expectedCarRank: number;
  /** Duracion del contrato en temporadas. */
  years: number;
  /**
   * Rol ofrecido. Afecta expectativas: como "primer piloto" el equipo
   * espera mas y la reputacion cae mas rapido si no rendis.
   */
  role: "first" | "second";
};

/** Fase actual de la partida (maquina de estados). */
export type CareerPhase =
  /** Eligiendo entre las ofertas iniciales (antes de la 1ra temporada). */
  | "rookie-offers"
  /** Listo para simular la proxima tanda de temporadas. */
  | "ready"
  /** Hay eventos pendientes de resolver (Etapa 2). */
  | "events"
  /** Terminada la tanda: hay ofertas para elegir. */
  | "offers"
  /** Sin asiento: espera ofertas el anio que viene. */
  | "no-seat"
  /** Carrera terminada (retiro voluntario, sin ofertas, o 24 temporadas). */
  | "retired";

/** Motivo por el que termino la carrera (la UI elige el epilogo). */
export type RetirementReason =
  | "voluntary"
  | "no-offers"
  | "max-seasons";

/** Estado completo de una partida. Es lo que se guarda en localStorage. */
export type CareerState = {
  /** Version del formato, para migrar sin romper partidas guardadas. */
  version: 1;
  /** Semilla de la partida: la hace reproducible de punta a punta. */
  seed: string;
  /** Cuantas temporadas avanza cada paso: 1, 2 o 3 (modo de juego). */
  step: 1 | 2 | 3;
  /** Anio calendario de la primera temporada. */
  startYear: number;
  /** Temporada actual dentro de la carrera (1..MAX_SEASONS). */
  season: number;
  phase: CareerPhase;
  player: PlayerDriver;
  /** Equipo actual, o null si esta sin asiento. */
  teamId: string | null;
  /** Temporadas que quedan del contrato vigente. */
  contractYears: number;
  /**
   * Estado de las 10 escuderias en la temporada actual (rendimiento del
   * coche y fiabilidad). Evoluciona anio a anio, ver evolveTeams.
   */
  teams: TeamState[];
  /** Butacas ocupadas: teamId -> los dos ocupantes. */
  grid: Record<string, [SeatOccupant, SeatOccupant]>;
  /** Historial temporada a temporada (incluye anios sin asiento). */
  history: SeasonResult[];
  totals: CareerTotals;
  /** Ofertas pendientes cuando la fase es "rookie-offers" u "offers". */
  offers: SeatOffer[];
  retirementReason: RetirementReason | null;
};
