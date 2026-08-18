// src/components/games/CareerPath/CareerPath.tsx
//
// UI de "Career Path": muestra la cadena de logos de escuderias del piloto
// del dia, en orden cronologico, y un buscador de piloto (mismo patron de
// autocompletado que PitTexto — copiado inline, no compartido, ver Etapa 2
// del plan). MAX_GUESSES intentos; se pierde si se agotan sin acertar.

import { useMemo, useRef, useState } from "react";
import type { GameProps, Driver } from "@/types";
import { findDriversByText, fullName, nationality, countryName, teamName } from "@/data";
import { buildCareerPathTarget, targetChain, getCareerPathPool } from "./careerpath.logic";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { ChevronRight } from "@/components/ui/Icon";

const MAX_GUESSES = 3;

export function CareerPath({ difficulty, date, seed, status, onWin, onLose }: GameProps) {
  const { t } = useI18n();
  const target = useMemo(() => buildCareerPathTarget(difficulty, date, seed), [difficulty, date, seed]);
  const chain = useMemo(() => targetChain(target), [target]);
  const pool = useMemo(() => getCareerPathPool(difficulty), [difficulty]);

  const [guesses, setGuesses] = useState<Driver[]>([]);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const solved = guesses.some((g) => g.id === target.id);
  const finished = status !== "playing" || solved || guesses.length >= MAX_GUESSES;

  const guessedIds = new Set(guesses.map((g) => g.id));
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return findDriversByText(query, pool)
      .filter((d) => !guessedIds.has(d.id))
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, pool, guesses]);

  const addGuess = (d: Driver) => {
    if (finished || guessedIds.has(d.id)) return;
    const next = [...guesses, d];
    setGuesses(next);
    setQuery("");
    inputRef.current?.focus();

    if (d.id === target.id) onWin({ driverId: d.id });
    else if (next.length >= MAX_GUESSES) onLose({ driverId: d.id });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestions[0]) {
      e.preventDefault();
      addGuess(suggestions[0]);
    }
  };

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("careerpath.eyebrow")}</p>
      <p className="mt-2 text-sm text-ink-muted">{t("careerpath.hint")}</p>
      <p className="mt-1 font-mono text-xs text-ink-faint">
        {t("careerpath.attempt", {
          current: Math.min(guesses.length + (finished ? 0 : 1), MAX_GUESSES),
          max: MAX_GUESSES,
        })}
      </p>

      {/* Cadena de escuderias */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-lg border border-white/10 bg-asphalt-700/50 p-4">
        {chain.map((teamId, i) => (
          <div key={`${teamId}-${i}`} className="flex items-center gap-3">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white/5 p-2 sm:h-24 sm:w-24"
              title={teamName(teamId)}
            >
              <img
                src={`/team-logos/${teamId}.png`}
                alt={teamName(teamId)}
                className="h-full w-full object-contain"
              />
            </div>
            {i < chain.length - 1 && (
              <ChevronRight size={20} className="shrink-0 text-ink-faint rtl:rotate-180" />
            )}
          </div>
        ))}
      </div>

      {/* Buscador */}
      {!finished && (
        <div className="relative mt-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("careerpath.placeholder")}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink placeholder:text-ink-faint focus:border-racing/50"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-white/10 bg-asphalt-800 shadow-panel">
              {suggestions.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => addGuess(d)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-asphalt-600"
                  >
                    <span className={`fi fi-${nationality(d.nationalityCode).alpha2}`} role="img" aria-label={countryName(d.nationalityCode, t)} />
                    <span className="font-medium">{fullName(d)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Intentos previos incorrectos */}
      {guesses.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {guesses
            .filter((g) => g.id !== target.id)
            .map((g) => (
              <span
                key={g.id}
                className="rounded-md border border-racing/30 bg-racing/10 px-2 py-1 text-xs text-racing-400 line-through"
              >
                {fullName(g)}
              </span>
            ))}
        </div>
      )}

      {/* Revelacion */}
      {finished && (
        <div
          className={[
            "mt-4 rounded-lg border px-4 py-3 text-center",
            solved
              ? "border-sector-green/40 bg-sector-green/10"
              : "border-racing/40 bg-racing/10",
          ].join(" ")}
        >
          <p className="text-sm text-ink-muted">
            {solved ? t("careerpath.found") : t("careerpath.answer_was")}
          </p>
          <p className="mt-0.5 font-display text-lg font-bold text-white">
            <span className={`fi fi-${nationality(target.nationalityCode).alpha2}`} role="img" aria-label={countryName(target.nationalityCode, t)} /> {fullName(target)}
          </p>
        </div>
      )}
    </Panel>
  );
}
