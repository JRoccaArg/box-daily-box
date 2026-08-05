// src/lib/duelPolling.ts
//
// Polling liviano para el estado "en vivo" de duelos (Roadmap §4). Se eligió
// polling sobre WebSocket/SSE a propósito (ver plan): con TTL de 60s y un
// endpoint liviano, 3s de intervalo alcanza sin la complejidad de mantener
// una conexión persistente en Railway.

import { useEffect, useRef, useState } from "react";
import { apiGetDuel, apiGetPendingDuels, type DuelState, type PendingDuel } from "./api";

const POLL_MS = 3000;

/** Estados en los que un duelo ya no puede cambiar: no tiene sentido seguir pollleando. */
const TERMINAL_STATUSES = new Set<DuelState["status"]>(["finished", "expired", "cancelled"]);

/** Estado en vivo de UN duelo (pantalla de espera, juego, resultado). */
export function useDuelPolling(duelId: string | null): {
  duel: DuelState | null;
  loading: boolean;
  notFound: boolean;
  refresh: () => void;
} {
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const stopRef = useRef(false);
  // Guarda el id del interval para poder cortarlo desde dentro de fetchOnce.
  const intervalRef = useRef<number | null>(null);

  const fetchOnce = async () => {
    if (!duelId) return;
    const res = await apiGetDuel(duelId);
    if (stopRef.current) return;
    if (!res) {
      setNotFound(true);
    } else {
      setDuel(res);
      setNotFound(false);
      // Corta el polling en un estado terminal. A diferencia de un intento
      // anterior (que chequeaba la `duel` guardada en el closure del efecto,
      // desactualizada porque ese closure solo se re-crea si cambia `duelId`),
      // acá se lee `res.status` — el valor RECIÉN llegado del server — así que
      // la condición sí se cumple de verdad.
      if (TERMINAL_STATUSES.has(res.status) && intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    stopRef.current = false;
    setLoading(true);
    setNotFound(false);
    setDuel(null);
    if (!duelId) return;

    fetchOnce();
    intervalRef.current = window.setInterval(fetchOnce, POLL_MS);
    return () => {
      stopRef.current = true;
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchOnce se recrea cada render a propósito (lee duelId por closure); re-suscribir en cada uno rompería el interval.
  }, [duelId]);

  return { duel, loading, notFound, refresh: fetchOnce };
}

/**
 * Invitaciones de duelo pendientes dirigidas a mí (para el DuelBanner).
 * Polling continuo (cada 3s), TAMBIÉN mientras se está jugando: el usuario
 * pidió que la invitación aparezca "estés donde estés". Es solo lectura y
 * NUNCA interrumpe la partida por sí mismo — el único que saca del juego es
 * la acción explícita de "Aceptar" (que además avisa antes, ver DuelBanner).
 */
export function usePendingDuelsPolling(): PendingDuel[] {
  const [duels, setDuels] = useState<PendingDuel[]>([]);

  useEffect(() => {
    let stopped = false;

    const fetchOnce = async () => {
      const res = await apiGetPendingDuels();
      if (!stopped) setDuels(res);
    };

    fetchOnce();
    const id = window.setInterval(fetchOnce, POLL_MS);

    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, []);

  return duels;
}

/** Segundos restantes hasta `expiresAtIso`, nunca negativo. */
function secondsUntil(expiresAtIso: string | null | undefined): number {
  if (!expiresAtIso) return 0;
  return Math.max(0, Math.round((Date.parse(expiresAtIso) - Date.now()) / 1000));
}

const COUNTDOWN_TICK_MS = 500;

/**
 * Countdown fluido derivado LOCALMENTE de una fecha límite estable
 * (`expiresAt`, un ISO string), en vez de depender de `secondsLeft` — un
 * número que el server recalcula en cada poll (cada 3s) y que por eso salta
 * de a saltos de ~3 en vez de bajar de a uno. Tickea cada 500ms en el
 * cliente; el polling normal sigue siendo la fuente de verdad para el
 * ESTADO (pending/active/etc.), esto solo suaviza el número en pantalla.
 */
export function useCountdown(expiresAtIso: string | null | undefined): number {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(expiresAtIso));

  useEffect(() => {
    setSecondsLeft(secondsUntil(expiresAtIso));
    if (!expiresAtIso) return;
    const id = window.setInterval(() => {
      setSecondsLeft(secondsUntil(expiresAtIso));
    }, COUNTDOWN_TICK_MS);
    return () => window.clearInterval(id);
  }, [expiresAtIso]);

  return secondsLeft;
}
