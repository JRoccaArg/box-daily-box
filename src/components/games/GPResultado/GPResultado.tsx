// src/components/games/GPResultado/GPResultado.tsx

import { useMemo, useRef, useState } from "react";
import type { GameProps } from "@/types";
import { buildGPChallenge } from "./gpresultado.logic";
import { allDriverNames, searchDrivers } from "@/data/gpResults";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Check } from "@/components/ui/Icon";

/** Colores de escuderías conocidas para las barras. */
const TEAM_COLORS: Record<string, string> = {
  "Red Bull": "#3671C6", "Ferrari": "#E8002D", "Mercedes": "#27F4D2",
  "McLaren": "#FF8000", "Aston Martin": "#229971", "Alpine": "#FF87BC",
  "Williams": "#64C4FF", "AlphaTauri": "#6692FF", "RB": "#6692FF",
  "Haas": "#B6BABD", "Alfa Romeo": "#C92D4B", "Sauber": "#52E252",
  "Renault": "#FFF500", "Force India": "#F596C8", "Racing Point": "#F596C8",
  "Toro Rosso": "#4E7FFF", "Brawn": "#B1D755", "Honda": "#FFFFFF",
  "BMW Sauber": "#0066CC", "Toyota": "#CC0000", "Jaguar": "#008800",
  "BAR": "#FFFFFF", "Jordan": "#F5D800", "Minardi": "#191919",
  "Benetton": "#00AA00", "Ligier": "#1E90FF", "Tyrrell": "#004080",
  "Brabham": "#00CC00", "Lotus": "#FFB800", "BRM": "#008844",
  "Matra": "#0066FF", "Cooper": "#006633", "Maserati": "#CC0000",
  "Alfa Romeo (classic)": "#900020", "Vanwall": "#005522",
  "Arrows": "#FFCC00", "Prost": "#0033CC", "Stewart": "#FFFFFF",
  "March": "#FF6600", "Surtees": "#FFFFFF", "Lola-Lamborghini": "#006600",
  "Lola-Haas": "#CC0000", "Toleman": "#0000AA",
  "Footwork": "#FFFFFF", "Larrousse": "#0000CC",
  "Dallara": "#CC0000", "Rial": "#333333", "Zakspeed": "#CC6600",
  "Simtek": "#6600CC", "Lola-BMS": "#008800",
  "Super Aguri": "#FFFFFF", "Hesketh": "#FFFFFF",
  "Wolf": "#222222", "Fittipaldi": "#FFD700",
  "ERA": "#006633", "Talbot-Lago": "#0044AA", "HWM": "#333333",
  "Connaught": "#006600", "Cooper-Alta": "#006633",
  "Porsche": "#888888", "Eagle": "#0044AA", "Osella": "#FF0000",
};

function teamColor(team: string): string {
  return TEAM_COLORS[team] ?? "#6B7280";
}

export function GPResultado({ difficulty, date, status, onWin }: GameProps) {
  const { t } = useI18n();

  const gp = useMemo(() => buildGPChallenge(difficulty, date), [difficulty, date]);
  const driverPool = useMemo(() => allDriverNames(), []);

  // Set de pilotos del top 10 de este GP (nombre → posición).
  const top10Map = useMemo(() => {
    const map = new Map<string, number>();
    gp.t.forEach(([name], i) => map.set(name, i));
    return map;
  }, [gp]);

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
    return searchDrivers(query, driverPool)
      .filter((n) => !usedNames.has(n))
      .slice(0, 6);
  }, [query, driverPool, usedNames]);

  const tryDriver = (name: string) => {
    if (finished) return;
    setQuery("");
    setError(null);

    const pos = top10Map.get(name);
    if (pos === undefined) {
      // No está en el top 10.
      setError(t("gpresultado.not_in_top", { name }));
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
      onWin({ grid: next as string[] });
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

  return (
    <Panel>
      {/* Header: año + GP + circuito */}
      <p className="eyebrow speed-bar pl-1">{t("gpresultado.eyebrow")}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl font-extrabold text-white">{gp.y}</span>
        <span className="font-display text-lg font-bold text-ink">{gp.g}</span>
      </div>
      <p className="text-sm text-ink-muted">{gp.c}</p>

      <p className="mt-1 font-mono text-xs text-ink-faint">
        {t("gpresultado.found_count", { found: revealedCount, total: 10 })}
      </p>

      {/* Buscador */}
      {!finished && (
        <div className="relative mt-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(null); }}
            onKeyDown={onKeyDown}
            placeholder={t("gpresultado.search_placeholder")}
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
        {gp.t.map(([driverName, team], i) => {
          const isRevealed = revealed[i] !== null;
          const showAnswer = finished && !isRevealed; // mostrar al perder
          const color = teamColor(team);

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

              {/* Barra de color de escudería */}
              <div
                className="h-6 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />

              {/* Contenido */}
              <div className="min-w-0 flex-1">
                {isRevealed ? (
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-sm font-bold text-white">
                      {driverName}
                    </span>
                    <Check size={14} className="shrink-0 text-sector-green" />
                  </div>
                ) : showAnswer ? (
                  <div>
                    <span className="truncate text-sm font-medium text-ink-faint">
                      {driverName}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-ink-muted">{team}</span>
                )}
              </div>

              {/* Escudería siempre visible como pista */}
              {(isRevealed || showAnswer) && (
                <span className="shrink-0 rounded-md border border-white/10 bg-asphalt-600 px-2 py-0.5 text-[11px] text-ink-faint">
                  {team}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {finished && revealedCount < 10 && (
        <p className="mt-4 text-center text-xs text-ink-faint">
          {t("gpresultado.time_up")}
        </p>
      )}
    </Panel>
  );
}
