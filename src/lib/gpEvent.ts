// src/lib/gpEvent.ts
//
// EVENTO PUNTUAL Y ÚNICO — GP de Monza 2026, puntos dobles por 48 horas.
//
// Esto NO es todavía el "calendario de eventos" automatizado: es UN evento
// hardcodeado, con fecha fija, pensado para vivir poco y borrarse fácil.
// Todo el evento cabe en este archivo + `GpEventBanner.tsx` + 2 llamadas en el
// backend. Para desactivarlo basta con poner `MULTIPLIER = 1` (o borrar el
// archivo y sus 4 usos).
//
// ─── POR QUÉ ESTE MÓDULO ES PURO Y COMPARTIDO ──────────────────────────────
// Lo importan el cliente (para el cartel) y el servidor (para multiplicar los
// puntos de verdad). Es la misma decisión de diseño que `scoring.ts`: una sola
// función determinista que el server re-ejecuta por su cuenta. Que el cliente
// la tenga NO es un riesgo — el cliente puede mentirse a sí mismo todo lo que
// quiera, porque los puntos que se persisten los calcula exclusivamente el
// backend con SU reloj (ver `resolveNow` en src/api/debugDate.ts).
//
// ─── LA VENTANA ES UN INSTANTE ABSOLUTO, NO UNA FECHA LOCAL ────────────────
// El evento arranca EN EL MISMO INSTANTE para todo el mundo: medianoche UTC
// del sábado (cuando cambia de día el servidor), sin importar el huso horario
// del jugador. Por eso la ventana se expresa en epoch-ms (`Date.UTC`) y se
// compara con `.getTime()`, nunca con un 'YYYY-MM-DD'.
//
// Esta distinción es de SEGURIDAD, no de estilo. `startChallenge` acepta el
// `clientDateKey` del navegador cuando está a ±1 día del UTC del server (para
// que el reto diario respete el huso local del jugador), así que `session.today`
// NO es un dato server-authoritative: un cliente modificado puede correrlo un
// día. Si el multiplicador se decidiera con `session.today`, se podrían cobrar
// puntos dobles el viernes o el lunes. Por eso el backend evalúa la ventana
// contra su propio reloj en el momento de acreditar los puntos, y jamás contra
// una fecha que haya tocado el cliente.

/** Multiplicador de puntos mientras el evento está activo. */
export const GP_EVENT_MULTIPLIER = 2;

/**
 * Inicio: sábado 5 de septiembre de 2026, 00:00 UTC (el cambio de día del
 * servidor). Fin: lunes 7 de septiembre, 00:00 UTC — 48 horas exactas.
 * El fin es EXCLUSIVO: a las 00:00:00.000 del lunes el evento ya terminó.
 */
export const GP_EVENT_START_MS = Date.UTC(2026, 8, 5, 0, 0, 0, 0);
export const GP_EVENT_END_MS = Date.UTC(2026, 8, 7, 0, 0, 0, 0);

/**
 * Cuánto antes del inicio se muestra el cartel en modo "cuenta regresiva".
 * 24 h: aparece el viernes a las 00:00 UTC y anuncia lo que viene.
 */
export const GP_EVENT_TEASER_MS = 24 * 60 * 60 * 1000;

export type GpEventPhase =
  /** Fuera de rango: ni teaser ni evento. No se muestra nada. */
  | "off"
  /** Falta poco: el cartel anuncia el evento con cuenta regresiva. */
  | "soon"
  /** Evento en curso: puntos dobles. */
  | "active";

/** Fase del evento para un instante dado. Pura y determinista. */
export function gpEventPhase(now: Date): GpEventPhase {
  const ms = now.getTime();
  if (ms >= GP_EVENT_START_MS && ms < GP_EVENT_END_MS) return "active";
  if (ms >= GP_EVENT_START_MS - GP_EVENT_TEASER_MS && ms < GP_EVENT_START_MS) return "soon";
  return "off";
}

/** true solo dentro de la ventana de 48 h. */
export function isGpEventActive(now: Date): boolean {
  return gpEventPhase(now) === "active";
}

/**
 * Multiplicador a aplicar sobre el puntaje de un intento.
 *
 * USO EN EL BACKEND: pasarle SIEMPRE el reloj del servidor
 * (`resolveNow(req)`), nunca una fecha derivada del cliente. Ver el comentario
 * de cabecera sobre por qué `session.today` no sirve para esto.
 */
export function gpEventMultiplier(now: Date): number {
  return isGpEventActive(now) ? GP_EVENT_MULTIPLIER : 1;
}

/** Milisegundos hasta el próximo hito (inicio si falta, fin si está activo). */
export function gpEventMsUntilNextMilestone(now: Date): number {
  const ms = now.getTime();
  if (ms < GP_EVENT_START_MS) return GP_EVENT_START_MS - ms;
  if (ms < GP_EVENT_END_MS) return GP_EVENT_END_MS - ms;
  return 0;
}
