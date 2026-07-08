/**
 * Tipos de dominio del proyecto.
 *
 * Mantener este archivo como unica fuente de verdad de las formas de datos.
 * Todo el codigo (dataset, libs, juegos) depende de estos tipos.
 */

import type { ComponentType } from "react";

/** Codigo ISO-3166 alpha-3 simplificado para nacionalidades. */
export type Nationality = {
  code: string; // ISO alpha-3 p.ej. "ARG", "GBR"
  alpha2: string; // ISO alpha-2 p.ej. "ar", "gb" (minúsculas, para flag-icons CSS)
  name: string; // p.ej. "Argentina", "Reino Unido"
  /** Emoji de bandera, usado como fallback en <select> nativos. */
  flag: string;
};

/** Rango de anios activos. `end: null` significa "en activo". */
export type YearRange = {
  start: number;
  end: number | null;
};

/** Paso de un piloto por una escuderia. */
export type TeamStint = {
  teamId: string;
  years: YearRange;
};

export type Driver = {
  id: string; // slug estable, p.ej. "max-verstappen"
  firstName: string;
  lastName: string;
  /** Apellido normalizado para PoleWordle (sin espacios ni signos, MAYUS). */
  wordleKey: string;
  nationalityCode: string;
  /** Escuderias en orden cronologico. */
  teams: TeamStint[];
  /** Periodo activo en F1 (carrera completa). */
  active: YearRange;
  /** Cantidad de campeonatos de pilotos ganados. */
  championships: number;
  /** Anios en que fue campeon (subconjunto, puede estar incompleto). */
  championYears?: number[];
  /** Victorias en GP (carrera principal, sin sprints). */
  wins?: number;
  /** Podios en GP (top 3 en carrera principal). */
  podiums?: number;
  /** Pole positions (1° en clasificacion). */
  poles?: number;
  /**
   * Puntos por temporada (OPCIONAL y heredado). Ya no lo usa ningun juego;
   * se mantiene opcional por compatibilidad. No cargar datos inventados aqui.
   */
  pointsByYear?: Record<number, number>;
};

export type Team = {
  id: string; // slug estable, p.ej. "ferrari"
  name: string;
  /** Pais de la escuderia (codigo de nacionalidad). */
  countryCode: string;
  active: YearRange;
  /** Color de marca para acentos de UI. */
  color: string;
};

/** Niveles de dificultad y su significado historico. */
export type Difficulty = "facil" | "medio" | "dificil" | "leyenda";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: "Facil",
  medio: "Medio",
  dificil: "Dificil",
  leyenda: "Leyenda",
};

/** Resultado de una partida diaria de un juego. */
export type GameStatus = "idle" | "playing" | "won" | "lost";

/** Props que recibe TODO juego desde el GameShell. Contrato estable. */
export type GameProps = {
  /** Dificultad elegida por el usuario. */
  difficulty: Difficulty;
  /** Fecha del reto (define la seed diaria). */
  date: Date;
  /** Limite de tiempo en segundos, o null si el juego no usa cronometro. */
  timeLimit: number | null;
  /** Segundos restantes (lo administra el GameShell). null = sin tiempo. */
  secondsLeft: number | null;
  /** Estado actual de la partida administrado por el GameShell. */
  status: GameStatus;
  /** Llamar cuando el usuario gana. Pasar solution para verificacion server. */
  onWin: (solution?: Record<string, unknown>) => void;
  /** Llamar cuando el usuario pierde. Pasar solution para registro server. */
  onLose: (solution?: Record<string, unknown>) => void;
};

/** Opciones de cronometro que admite un juego. */
export type TimerConfig =
  | { kind: "none" } // el juego no usa tiempo
  | { kind: "fixed"; seconds: number } // tiempo unico
  | { kind: "choice"; options: number[] }; // el usuario elige

/** Definicion declarativa de un juego para el registro. */
export type GameDefinition = {
  id: string; // slug usado en la URL: /juego/:id
  // Nombre y tagline NO viven aqui: se resuelven con t(`game.${id}.name`/`.tagline`)
  // en cada consumidor (Home, GameShell, MonthlyRanking...). Este objeto es
  // estatico (no un componente), no puede ser reactivo al locale.
  /** Glyph corto para la insignia (1-3 caracteres). */
  glyph: string;
  /** Como se eligen los niveles de dificultad permitidos. */
  difficulties: Difficulty[];
  timer: TimerConfig;
  component: ComponentType<GameProps>;
};

/** Estado persistido por dia y por juego. */
export type DailyGameResult = {
  status: Extract<GameStatus, "won" | "lost">;
  /** ISO date (YYYY-MM-DD) en que se jugo. */
  date: string;
  /** Marca de tiempo de finalizacion. */
  finishedAt: number;
  /** Metadato opcional especifico del juego (intentos, score...). */
  meta?: Record<string, number | string>;
};

/** Agregados globales mostrados en estadisticas. */
export type StatsSummary = {
  won: number;
  lost: number;
  /** Racha de dias consecutivos con al menos un juego ganado. */
  currentStreak: number;
  bestStreak: number;
  /** Ultimo dia jugado (ISO). */
  lastPlayed: string | null;
};
