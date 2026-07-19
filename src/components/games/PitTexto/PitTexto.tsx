import { useMemo, useRef, useState } from "react";
import type { GameProps } from "@/types";
import type { Driver } from "@/types";
import { findDriversByText, fullName, nationality, countryName } from "@/data";
import { getDriverPoolAtLeast } from "@/lib/filters";
import { buildTarget, scoreGuess, heatColor } from "./pittexto.logic";
import type { Factor } from "./pittexto.logic";
import { DriverAvatar } from "../shared/DriverAvatar";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Check, Close } from "@/components/ui/Icon";

const MAX_GUESSES = 8;

export function PitTexto({ difficulty, date, status, onWin, onLose }: GameProps) {
  const { t } = useI18n();
  const target = useMemo(() => buildTarget(difficulty, date), [difficulty, date]);
  const pool = useMemo(() => getDriverPoolAtLeast(difficulty, 15), [difficulty]);

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
      <p className="eyebrow speed-bar pl-1">{t("pittexto.eyebrow")}</p>
      <p className="mt-2 text-sm text-ink-muted">
        {t("pittexto.hint")}
      </p>
      <p className="mt-1 font-mono text-xs text-ink-faint">
        {t("pittexto.attempt", {
          current: Math.min(guesses.length + (finished ? 0 : 1), MAX_GUESSES),
          max: MAX_GUESSES,
        })}
      </p>

      {/* Buscador */}
      {!finished && (
        <div className="relative mt-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("pittexto.placeholder")}
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
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-ink transition-colors hover:bg-asphalt-600"
                  >
                    <DriverAvatar driver={d} size="sm" />
                    <span className={`fi fi-${nationality(d.nationalityCode).alpha2}`} role="img" aria-label={countryName(d.nationalityCode, t)} />
                    <span className="font-medium">{fullName(d)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
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
            {solved ? t("pittexto.found") : t("pittexto.answer_was")}
          </p>
          <p className="mt-1 flex items-center justify-center gap-2 font-display text-lg font-bold text-white">
            <DriverAvatar driver={target} size="md" />
            <span>
              <span className={`fi fi-${nationality(target.nationalityCode).alpha2}`} role="img" aria-label={countryName(target.nationalityCode, t)} /> {fullName(target)}
            </span>
          </p>
        </div>
      )}

      {/* Intentos (mas reciente arriba) */}
      <div className="mt-4 space-y-2.5">
        {[...guesses].reverse().map((g) => (
          <GuessRow key={g.id} guess={g} target={target} />
        ))}
      </div>
    </Panel>
  );
}

function GuessRow({ guess, target }: { guess: Driver; target: Driver }) {
  const { t } = useI18n();
  const score = useMemo(() => scoreGuess(guess, target), [guess, target]);
  const color = heatColor(score.total);

  return (
    <div className="animate-rise rounded-xl border border-white/10 bg-asphalt-700 p-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold text-asphalt-900"
          style={{ backgroundColor: color }}
        >
          {score.total}%
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <DriverAvatar driver={guess} size="sm" />
            <span className="truncate font-display font-semibold text-white">
              <span className={`fi fi-${nationality(guess.nationalityCode).alpha2}`} role="img" aria-label={countryName(guess.nationalityCode, t)} /> {fullName(guess)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {score.factors.map((f) => (
              <FactorChip key={f.key} factor={f} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CHIP_STATE: Record<Factor["state"], string> = {
  match: "border-sector-green/40 bg-sector-green/10 text-sector-green",
  partial: "border-sector-yellow/40 bg-sector-yellow/10 text-sector-yellow",
  none: "border-white/10 bg-asphalt-600 text-ink-faint",
};

function DirArrow({ dir }: { dir?: Factor["dir"] }) {
  if (!dir || dir === "eq") return null;
  return (
    <span aria-hidden="true" className="ml-0.5">
      {dir === "up" ? "▲" : "▼"}
    </span>
  );
}

function FactorChip({ factor }: { factor: Factor }) {
  const { t } = useI18n();
  const label = t(factor.label.key, factor.label.vars);
  const value = typeof factor.value === "string" ? factor.value : t(factor.value.key, factor.value.vars);
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium",
        CHIP_STATE[factor.state],
      ].join(" ")}
      title={label}
    >
      <span className="font-mono uppercase tracking-wide opacity-70">{label}</span>
      <span className="inline-flex items-center">
        {value}
        {factor.state === "match" && factor.key === "mates" ? (
          <Check size={12} className="ml-0.5" />
        ) : factor.key === "mates" ? (
          <Close size={12} className="ml-0.5" />
        ) : (
          <DirArrow dir={factor.dir} />
        )}
      </span>
    </span>
  );
}
