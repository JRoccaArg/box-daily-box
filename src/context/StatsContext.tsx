import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getStats,
  getResult,
  getPlayedStatus,
  recordResult as persistResult,
  resetAllProgress,
  syncFromServer,
} from "@/lib/stats";
import { storageIsPersistent } from "@/lib/storage";
import { getIdentity } from "@/lib/identity";
import { apiGetUserAttempts } from "@/lib/api";
import { dateKey } from "@/lib/seed";
import { on, Events } from "@/lib/events";
import type { DailyGameResult, GameStatus, StatsSummary } from "@/types";

type StatsContextValue = {
  summary: StatsSummary;
  persistent: boolean;
  /** Resultado de un juego para hoy (o fecha dada), o null. */
  resultFor: (gameId: string, date?: Date) => DailyGameResult | null;
  /**
   * Estado del reto HOY segun el lock durable (sobrevive al reinicio de
   * progreso). Se usa para bloquear el reto hasta el dia siguiente.
   */
  playedStatus: (gameId: string, date?: Date) => "won" | "lost" | null;
  /** Registra resultado y refresca agregados. Idempotente por dia. */
  record: (
    gameId: string,
    status: Extract<GameStatus, "won" | "lost">,
    meta?: DailyGameResult["meta"],
    date?: Date,
  ) => void;
  /** Fuerza re-lectura de stats desde storage (útil tras sync con server). */
  refreshStats: () => void;
  resetProgress: () => void;
};

const StatsContext = createContext<StatsContextValue | null>(null);

/** Estado neutral para el primer render (server y cliente pre-hidratación). */
const EMPTY_SUMMARY: StatsSummary = {
  won: 0,
  lost: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayed: null,
};

export function StatsProvider({ children }: { children: ReactNode }) {
  // `version` fuerza recomputo de los agregados tras cada escritura.
  const [version, setVersion] = useState(0);

  // El HTML prerenderizado no tiene acceso a localStorage: para que el
  // primer render del cliente coincida bit a bit con ese HTML (sin mismatch
  // de hidratación), el progreso real solo se lee DESPUÉS de montar.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const summary = useMemo<StatsSummary>(
    () => (mounted ? getStats() : EMPTY_SUMMARY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, mounted],
  );

  const record = useCallback<StatsContextValue["record"]>((gameId, status, meta, date) => {
    persistResult(gameId, status, meta, date);
    setVersion((v) => v + 1);
  }, []);

  const resultFor = useCallback<StatsContextValue["resultFor"]>(
    (gameId, date) => (mounted ? getResult(gameId, date) : null),
    // depende de `version` para releer tras escrituras
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, mounted],
  );

  const playedStatus = useCallback<StatsContextValue["playedStatus"]>(
    (gameId, date) => (mounted ? getPlayedStatus(gameId, date) : null),
    // depende de `version` para releer tras escrituras
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, mounted],
  );

  const resetProgress = useCallback(() => {
    resetAllProgress();
    setVersion((v) => v + 1);
  }, []);

  const refreshStats = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // ─── Sincronización con server al montar ─────────────────────────
  // Trae los attempts de hoy del server y los mergea en el storage local.
  // Esto asegura que si el usuario:
  //   - Jugó en otro dispositivo con la misma cuenta Google
  //   - Se logueó y sus attempts anónimos se migraron
  //   - Reinstaló la app o borró localStorage
  // ...los juegos ya jugados aparezcan correctamente marcados en la home.
  useEffect(() => {
    const { userId } = getIdentity();
    if (!userId) return;

    let cancelled = false;
    const today = dateKey(new Date());

    (async () => {
      const response = await apiGetUserAttempts(userId, today);
      if (cancelled || !response) return;
      if (response.attempts.length === 0) return;

      syncFromServer(response.attempts, response.dateKey);
      setVersion((v) => v + 1);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Suscribirse al evento STATS_CHANGED: cualquier módulo que modifique
  // los datos locales (como auth.ts después del login) emite este evento
  // para que la UI se actualice.
  useEffect(() => {
    return on(Events.STATS_CHANGED, () => {
      setVersion((v) => v + 1);
    });
  }, []);

  const value = useMemo<StatsContextValue>(
    () => ({
      summary,
      persistent: storageIsPersistent,
      resultFor,
      playedStatus,
      record,
      refreshStats,
      resetProgress,
    }),
    [summary, resultFor, playedStatus, record, refreshStats, resetProgress],
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

// El hook se exporta junto al provider a proposito (patron de contexto comun).
// eslint-disable-next-line react-refresh/only-export-components
export function useStats(): StatsContextValue {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error("useStats debe usarse dentro de <StatsProvider>");
  return ctx;
}
