import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getStats,
  getResult,
  getPlayedStatus,
  recordResult as persistResult,
  resetAllProgress,
} from "@/lib/stats";
import { storageIsPersistent } from "@/lib/storage";
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
  resetProgress: () => void;
};

const StatsContext = createContext<StatsContextValue | null>(null);

export function StatsProvider({ children }: { children: ReactNode }) {
  // `version` fuerza recomputo de los agregados tras cada escritura.
  const [version, setVersion] = useState(0);

  // `version` fuerza recomputo de los agregados tras cada escritura a storage.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const summary = useMemo<StatsSummary>(() => getStats(), [version]);

  const record = useCallback<StatsContextValue["record"]>((gameId, status, meta, date) => {
    persistResult(gameId, status, meta, date);
    setVersion((v) => v + 1);
  }, []);

  const resultFor = useCallback<StatsContextValue["resultFor"]>(
    (gameId, date) => getResult(gameId, date),
    // depende de `version` para releer tras escrituras
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const playedStatus = useCallback<StatsContextValue["playedStatus"]>(
    (gameId, date) => getPlayedStatus(gameId, date),
    // depende de `version` para releer tras escrituras
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const resetProgress = useCallback(() => {
    resetAllProgress();
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo<StatsContextValue>(
    () => ({
      summary,
      persistent: storageIsPersistent,
      resultFor,
      playedStatus,
      record,
      resetProgress,
    }),
    [summary, resultFor, playedStatus, record, resetProgress],
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
