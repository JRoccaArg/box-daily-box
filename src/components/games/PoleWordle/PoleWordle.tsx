import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameProps } from "@/types";
import { DRIVERS, fullName } from "@/data";
import { getDriverPoolAtLeast } from "@/lib/filters";
import { dailyPick } from "@/lib/daily";
import { Panel } from "@/components/ui/Panel";

const MAX_ATTEMPTS = 6;

/** Estado de cada casilla tras evaluar un intento. */
type Cell = "correct" | "present" | "absent" | "empty";

/** Evalua un intento contra la palabra objetivo (doble pasada estilo Wordle). */
function scoreGuess(guess: string, target: string): Cell[] {
  const result: Cell[] = new Array(target.length).fill("absent");
  const remaining: Record<string, number> = {};

  // Primera pasada: aciertos exactos.
  for (let i = 0; i < target.length; i++) {
    const t = target[i] as string;
    if (guess[i] === t) {
      result[i] = "correct";
    } else {
      remaining[t] = (remaining[t] ?? 0) + 1;
    }
  }
  // Segunda pasada: letras presentes en otra posicion.
  for (let i = 0; i < target.length; i++) {
    if (result[i] === "correct") continue;
    const g = guess[i] as string;
    if ((remaining[g] ?? 0) > 0) {
      result[i] = "present";
      remaining[g] = (remaining[g] ?? 0) - 1;
    }
  }
  return result;
}

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const CELL_CLASS: Record<Cell, string> = {
  correct: "bg-sector-green border-sector-green text-asphalt-900",
  present: "bg-sector-yellow border-sector-yellow text-asphalt-900",
  absent: "bg-asphalt-600 border-asphalt-500 text-ink-muted",
  empty: "bg-transparent border-white/15 text-ink",
};

const KEY_CLASS: Record<Cell, string> = {
  correct: "bg-sector-green text-asphalt-900",
  present: "bg-sector-yellow text-asphalt-900",
  absent: "bg-asphalt-700 text-ink-faint",
  empty: "bg-asphalt-600 text-ink hover:bg-asphalt-500",
};

export function PoleWordle({ difficulty, date, status, onWin, onLose }: GameProps) {
  // Objetivo del dia: un piloto del pool de la dificultad elegida.
  const target = useMemo(() => {
    const base = getDriverPoolAtLeast(difficulty, 10);
    // Evita apellidos extremos en la grilla (muy cortos o larguisimos);
    // si el filtro deja muy pocos, cae al pool completo.
    const sane = base.filter((d) => d.wordleKey.length >= 4 && d.wordleKey.length <= 11);
    const pool = sane.length >= 8 ? sane : base;
    return dailyPick(pool, date, `polewordle::${difficulty}`);
  }, [difficulty, date]);

  const answer = target.wordleKey;
  const len = answer.length;

  // Apellidos validos (misma longitud) de toda la base, para aceptar intentos.
  const validWords = useMemo(() => {
    const set = new Set<string>();
    for (const d of DRIVERS) if (d.wordleKey.length === len) set.add(d.wordleKey);
    return set;
  }, [len]);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const solved = guesses.some((g) => g === answer);
  const finished = status !== "playing" || solved || guesses.length >= MAX_ATTEMPTS;
  const locked = finished;

  // Estado por letra para colorear el teclado.
  const keyState = useMemo(() => {
    const map: Record<string, Cell> = {};
    const rank: Record<Cell, number> = { empty: 0, absent: 1, present: 2, correct: 3 };
    for (const g of guesses) {
      const score = scoreGuess(g, answer);
      for (let i = 0; i < g.length; i++) {
        const ch = g[i] as string;
        const s = score[i] as Cell;
        if (!map[ch] || rank[s] > rank[map[ch] as Cell]) map[ch] = s;
      }
    }
    return map;
  }, [guesses, answer]);

  const submit = useCallback(() => {
    if (locked) return;
    if (current.length !== len) {
      setError(`El apellido tiene ${len} letras`);
      return;
    }
    if (!validWords.has(current)) {
      setError("No esta en la lista de pilotos");
      return;
    }
    setError(null);
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent("");

    if (current === answer) {
      onWin({ guesses: next });
    } else if (next.length >= MAX_ATTEMPTS) {
      onLose({ guesses: next });
    }
  }, [current, len, validWords, guesses, answer, locked, onWin, onLose]);

  const press = useCallback(
    (key: string) => {
      if (locked) return;
      setError(null);
      if (key === "ENTER") {
        submit();
      } else if (key === "DEL") {
        setCurrent((c) => c.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && current.length < len) {
        setCurrent((c) => c + key);
      }
    },
    [current.length, len, locked, submit],
  );

  // Soporte de teclado fisico.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") press("ENTER");
      else if (e.key === "Backspace") press("DEL");
      else {
        const k = e.key.toUpperCase();
        if (/^[A-Z]$/.test(k)) press(k);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <Panel className="flex flex-col items-center">
      <p className="eyebrow mb-1">Apellido del piloto</p>
      <p className="mb-2 max-w-xs text-center text-sm text-ink-muted">
        Adivina el apellido en {MAX_ATTEMPTS} intentos. Verde = letra y posicion
        correctas; amarillo = la letra esta pero en otro lugar; gris = no esta.
      </p>
      <p className="mb-5 font-mono text-xs text-ink-faint">
        {len} letras &middot; {MAX_ATTEMPTS} intentos
      </p>

      {/* Grilla */}
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, row) => {
          const guess = guesses[row];
          const isCurrentRow = row === guesses.length && !locked;
          const score = guess ? scoreGuess(guess, answer) : null;
          return (
            <div
              key={row}
              className={["flex gap-1.5", error && isCurrentRow ? "animate-shake" : ""].join(" ")}
            >
              {Array.from({ length: len }).map((__, col) => {
                const letter = guess ? guess[col] : isCurrentRow ? current[col] : undefined;
                const cell: Cell = score ? (score[col] as Cell) : "empty";
                const filled = Boolean(letter);
                return (
                  <div
                    key={col}
                    className={[
                      "flex items-center justify-center rounded-md border-2 font-mono font-bold uppercase",
                      "transition-colors",
                      // Tamano adaptable segun longitud para que entre en mobile.
                      len > 8 ? "h-10 w-7 text-base sm:h-11 sm:w-9" : "h-11 w-10 text-xl sm:h-12 sm:w-11",
                      CELL_CLASS[cell],
                      filled && cell === "empty" ? "border-white/40" : "",
                      guess ? "animate-flip-in" : "",
                    ].join(" ")}
                    style={guess ? { animationDelay: `${col * 60}ms` } : undefined}
                  >
                    {letter ?? ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Mensaje de error / revelacion */}
      <div className="mt-4 h-6 text-center text-sm">
        {error && <span className="text-sector-yellow">{error}</span>}
        {!error && finished && !solved && status !== "playing" && (
          <span className="text-ink-muted">
            Era <strong className="text-white">{fullName(target)}</strong>
          </span>
        )}
        {!error && solved && <span className="text-sector-green">Correcto!</span>}
      </div>

      {/* Teclado en pantalla */}
      <div className="mt-2 flex w-full max-w-md flex-col gap-1.5">
        {ROWS.map((rowKeys, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {i === 2 && <KeyButton wide label="ENTER" onPress={() => press("ENTER")} disabled={locked} />}
            {rowKeys.split("").map((k) => (
              <KeyButton
                key={k}
                label={k}
                state={keyState[k] ?? "empty"}
                onPress={() => press(k)}
                disabled={locked}
              />
            ))}
            {i === 2 && <KeyButton wide label="DEL" onPress={() => press("DEL")} disabled={locked} />}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function KeyButton({
  label,
  state = "empty",
  wide = false,
  disabled = false,
  onPress,
}: {
  label: string;
  state?: Cell;
  wide?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={[
        "flex h-12 items-center justify-center rounded-md font-mono text-sm font-semibold uppercase",
        "transition-colors disabled:opacity-50",
        wide ? "px-3 text-[11px]" : "w-8 sm:w-9",
        KEY_CLASS[state],
      ].join(" ")}
    >
      {label === "DEL" ? "⌫" : label}
    </button>
  );
}
