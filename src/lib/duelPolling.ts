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
    const id = window.setInterval(() => {
      // Deja de pollear una vez que el duelo llegó a un estado terminal:
      // no tiene sentido seguir pegándole al backend por algo que ya no cambia.
      const terminal = duel && ["finished", "expired", "cancelled"].includes(duel.status);
      if (terminal) return;
      fetchOnce();
    }, POLL_MS);
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
