import { useCallback, useEffect, useRef, useState } from "react";

type UseTimerOptions = {
  /** Segundos iniciales, o null para "sin cronometro". */
  seconds: number | null;
  /** Se llama una vez al llegar a 0. */
  onExpire?: () => void;
};

type UseTimerReturn = {
  secondsLeft: number | null;
  running: boolean;
  start: () => void;
  pause: () => void;
  reset: (seconds?: number | null) => void;
};

/**
 * Cronometro de cuenta regresiva basado en timestamp (robusto frente a
 * pestanas en segundo plano: recalcula contra Date.now en vez de acumular
 * ticks). Si `seconds` es null, el cronometro queda desactivado.
 */
export function useTimer({ seconds, onExpire }: UseTimerOptions): UseTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(seconds);
  const [running, setRunning] = useState(false);

  const deadlineRef = useRef<number | null>(null);
  const remainingRef = useRef<number | null>(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Mantener refs sincronizadas si cambia el total externo.
  useEffect(() => {
    remainingRef.current = seconds;
    setSecondsLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running || seconds === null) return;

    const tick = () => {
      if (deadlineRef.current === null) return;
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      remainingRef.current = left;
      if (left <= 0) {
        setRunning(false);
        onExpireRef.current?.();
      }
    };

    const id = window.setInterval(tick, 250);
    tick();
    return () => window.clearInterval(id);
  }, [running, seconds]);

  const start = useCallback(() => {
    if (seconds === null) return;
    const base = remainingRef.current ?? seconds;
    deadlineRef.current = Date.now() + base * 1000;
    setRunning(true);
  }, [seconds]);

  const pause = useCallback(() => {
    if (deadlineRef.current !== null) {
      remainingRef.current = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
    }
    setRunning(false);
  }, []);

  const reset = useCallback(
    (next?: number | null) => {
      const value = next === undefined ? seconds : next;
      remainingRef.current = value;
      deadlineRef.current = null;
      setSecondsLeft(value);
      setRunning(false);
    },
    [seconds],
  );

  return { secondsLeft, running, start, pause, reset };
}
