// src/components/games/Top10Standings/Top10Standings.tsx

import { useMemo, useRef, useState } from "react";
import type { GameProps } from "@/types";
import { buildChallenge, allStandingsDriverNames, searchStandingsDrivers } from "./top10standings.logic";
import type { Top10StandingsSolution } from "./top10standings.logic";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Flag } from "@/components/ui/Flag";
import { Check } from "@/components/ui/Icon";

export function Top10Standings({ difficulty, date, status, onWin }: GameProps) {
  const { t } = useI18n();

  const challenge = useMemo(() => buildChallenge(difficulty, date), [difficulty, date]);
  const driverPool = useMemo(() => allStandingsDriverNames(), []);

  // Set del top 10 acumulado (nombre → posición).
  const top10Map = useMemo(() => {
    const map = new Map<string, number>();
    challenge.top10.forEach((entry, i) => map.set(entry.name, i));
    return map;
  }, [challenge]);

  // Estado: barras reveladas (null = no revelada).
  const [revealed, setRevealed] = useState<(string | null)[]>(() =>
    new Array<string | null>(10).fill(null),
  );

  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const revealedCount = revealed.filter(Boolean).length;
  const finished = status !== "playing";

  // Nombres ya usados (acertados).
  const usedNames = useMemo(() => {
    const s = new Set<string>();
    for (const n of revealed) if (n) s.add(n);
    return s;
  }, [revealed]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchStandingsDrivers(query, driverPool)
      .filter((n) => !usedNames.has(n))
      .slice(0, 6);
  }, [query, driverPool, usedNames]);

  const tryDriver = (name: string) => {
    if (finished) return;
    setQuery("");
    setError(null);

    const pos = top10Map.get(name);
    if (pos === undefined) {
      // No está en el top 10 acumulado.
      setError(t("top10standings.not_in_top", { name }));
      inputRef.current?.focus();
      return;
    }

    // Ya revelado?
    if (revealed[pos]) {
      inputRef.current?.focus();
      return;
    }

    const next = revealed.slice();
    next[pos] = name;
    setRevealed(next);
    inputRef.current?.focus();

    // Victoria: todos revelados.
    if (next.every(Boolean)) {
      const solution: Top10StandingsSolution = { grid: next };
      onWin(solution);
    }
  };

  // Al expirar el timer, onLose se llama desde GameShell.
  // Cuando status cambia a "lost", mostramos las respuestas.

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestions[0]) {
      e.preventDefault();
      tryDriver(suggestions[0]);
    }
  };

  const yearLabel = challenge.startYear === challenge.endYear
    ? `${challenge.startYear}`
    : `${challenge.startYear} – ${challenge.endYear}`;

  return (
    <Panel>
      {/* Header: rango de años */}
      <p className="eyebrow speed-bar pl-1">{t("top10standings.eyebrow")}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl font-extrabold text-white">{yearLabel}</span>
      </div>
      <p className="text-sm text-ink-muted">{t("top10standings.subtitle")}</p>

      <p className="mt-1 font-mono text-xs text-ink-faint">
        {t("top10standings.found_count", { found: revealedCount, total: 10 })}
      </p>

      {/* Buscador */}
      {!finished && (
        <div className="relative mt-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(null); }}
            onKeyDown={onKeyDown}
            placeholder={t("top10standings.search_placeholder")}
            autoComplete="off"
            spellCheck={false}
            autoFocus
            className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink placeholder:text-ink-faint focus:border-racing/50"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-white/10 bg-asphalt-800 shadow-panel">
              {suggestions.map((name) => (
                <li key={name}>
                  <button
                    onClick={() => tryDriver(name)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-asphalt-600"
                  >
                    <span className="font-medium">{name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-lg border border-racing/40 bg-racing/10 px-3 py-2 text-sm text-racing-400">
          {error}
        </p>
      )}

      {/* Las 10 barras */}
      <div className="mt-5 space-y-1.5">
        {challenge.top10.map((entry, i) => {
          const isRevealed = revealed[i] !== null;
          const showAnswer = finished && !isRevealed; // mostrar al perder

          return (
            <div
              key={i}
              className={[
                "flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 transition-all duration-300",
                isRevealed
                  ? "border-sector-green/50 bg-sector-green/10"
                  : showAnswer
                    ? "border-white/10 bg-asphalt-700/60 opacity-70"
                    : "border-white/10 bg-asphalt-700",
              ].join(" ")}
            >
              {/* Posición */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-asphalt-600 font-mono text-sm font-bold text-ink-muted">
                P{i + 1}
              </span>

              {/* Bandera de nacionalidad */}
              <Flag code={entry.nationalityCode} size="md" />

              {/* Contenido */}
              <div className="min-w-0 flex-1">
                {isRevealed ? (
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-sm font-bold text-white">
                      {entry.name}
                    </span>
                    <Check size={14} className="shrink-0 text-sector-green" />
                  </div>
                ) : showAnswer ? (
                  <div>
                    <span className="truncate text-sm font-medium text-ink-faint">
                      {entry.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-ink-muted">
                    {t("top10standings.points_label", { points: entry.points })}
                  </span>
                )}
              </div>

              {/* Puntos siempre visibles como pista */}
              {(isRevealed || showAnswer) && (
                <span className="shrink-0 rounded-md border border-white/10 bg-asphalt-600 px-2 py-0.5 text-[11px] text-ink-faint">
                  {entry.points} pts
                </span>
              )}
            </div>
          );
        })}
      </div>

      {finished && revealedCount < 10 && (
        <p className="mt-4 text-center text-xs text-ink-faint">
          {t("top10standings.time_up")}
        </p>
      )}
    </Panel>
  );
}
