// src/lib/duelPolling.ts
//
// Polling liviano para el estado "en vivo" de duelos (Roadmap §4). Se eligió
// polling sobre WebSocket/SSE a propósito (ver plan): con TTL de 60s y un
// endpoint liviano, 3s de intervalo alcanza sin la complejidad de mantener
// una conexión persistente en Railway.

import { useEffect, useRef, useState } from "react";
import { apiGetDuel, apiGetPendingDuels, type DuelState, type PendingDuel } from "./api";
import { isGameplayActive, onGameplayChanged } from "./gameplayState";

const POLL_MS = 3000;

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

  const fetchOnce = async () => {
    if (!duelId) return;
    const res = await apiGetDuel(duelId);
    if (stopRef.current) return;
    if (!res) {
      setNotFound(true);
    } else {
      setDuel(res);
      setNotFound(false);
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
    // Nota: se intentó en su momento "dejar de pollear si el estado ya es
    // terminal", pero ese chequeo leía `duel` de la closure de este efecto
    // (que solo se re-crea si cambia `duelId`, no en cada estado nuevo) — la
    // condición nunca se cumplía de verdad y el polling seguía igual. Se
    // quitó: 3s extra de polling en un estado que ya no cambia es inofensivo,
    // y no vale la complejidad de sincronizar el estado actual con una ref
    // solo para ese ahorro marginal.
    const id = window.setInterval(fetchOnce, POLL_MS);
    return () => {
      stopRef.current = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchOnce se recrea cada render a propósito (lee duelId por closure); re-suscribir en cada uno rompería el interval.
  }, [duelId]);

  return { duel, loading, notFound, refresh: fetchOnce };
}

/**
 * Invitaciones de duelo pendientes dirigidas a mí (para el DuelBanner).
 * Se pausa mientras `isGameplayActive()` (jugando el reto diario) — el
 * usuario confirmó que el banner no debe interrumpir una partida en curso.
 */
export function usePendingDuelsPolling(): PendingDuel[] {
  const [duels, setDuels] = useState<PendingDuel[]>([]);

  useEffect(() => {
    let stopped = false;

    const fetchOnce = async () => {
      if (isGameplayActive()) return;
      const res = await apiGetPendingDuels();
      if (!stopped) setDuels(res);
    };

    fetchOnce();
    const id = window.setInterval(fetchOnce, POLL_MS);
    const unsubscribe = onGameplayChanged(() => {
      // Al volver de jugar, refresca enseguida (no esperar hasta 3s).
      if (!isGameplayActive()) fetchOnce();
    });

    return () => {
      stopped = true;
      window.clearInterval(id);
      unsubscribe();
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
