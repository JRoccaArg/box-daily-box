import { Fragment, useMemo, useState } from "react";
import type { GameProps, Driver } from "@/types";
import { findDriversByText, fullName, nationality, team } from "@/data";
import { buildBingo, completeGrid } from "./bingo.logic";
import type { Constraint } from "./bingo.logic";
import { driverColor } from "../shared/driverColor";
import { useI18n } from "@/context/I18nContext";
import { Panel } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { Check, Trophy, Flag, Timer, Stat, Grid as GridIcon } from "@/components/ui/Icon";

/**
 * Parrilla Bingo: grilla 3x3 donde cada celda es la interseccion de una
 * restriccion de fila (escuderia) y una de columna (nacionalidad o campeon).
 */
export function ParrillaBingo({ difficulty, date, status, onWin }: GameProps) {
  const { t } = useI18n();
  const puzzle = useMemo(() => buildBingo(difficulty, date), [difficulty, date]);
  const { rows, cols, pool } = puzzle;

  const [cells, setCells] = useState<(string | null)[]>(() =>
    new Array<string | null>(9).fill(null),
  );
  const [active, setActive] = useState<number | null>(null);

  const finished = status !== "playing";

  const driverById = useMemo(() => {
    const m = new Map<string, Driver>();
    for (const d of pool) m.set(d.id, d);
    return m;
  }, [pool]);

  const usedIds = useMemo(() => {
    const s = new Set<string>();
    for (const id of cells) if (id) s.add(id);
    return s;
  }, [cells]);

  const revealIds = useMemo(
    () => (finished ? completeGrid(cells, rows, cols, puzzle.solution) : null),
    [finished, cells, rows, cols, puzzle.solution],
  );

  const filledCount = usedIds.size;

  const assign = (cell: number, driver: Driver) => {
    const next = cells.slice();
    next[cell] = driver.id;
    setCells(next);
    setActive(null);
    if (next.every(Boolean)) onWin({ grid: next as string[] });
  };

  const clearCell = (cell: number) => {
    const next = cells.slice();
    next[cell] = null;
    setCells(next);
    setActive(null);
  };

  const activeData = useMemo(() => {
    if (active === null) return null;
    const ri = Math.floor(active / 3);
    const ci = active % 3;
    const row = rows[ri];
    const col = cols[ci];
    if (!row || !col) return null;
    const currentId = cells[active] ?? null;
    return { row, col, currentId };
  }, [active, rows, cols, cells]);

  /** Texto humano de una restriccion para mensajes de error. */
  function describe(c: Constraint): string {
    if (c.kind === "team") return t("bingo.drove_for", { team: c.label });
    if (c.kind === "nat") return t("bingo.nationality", { name: nationality(c.ref ?? "").name });
    if (c.kind === "stat") return c.label;
    return t("bingo.world_champion");
  }

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("bingo.eyebrow")}</p>
      <p className="mt-2 text-sm text-ink-muted">
        {t("bingo.hint")}
      </p>
      <p className="mt-1 font-mono text-xs text-ink-faint">
        {t("bingo.cells_count", { filled: filledCount })}
      </p>

      {/* Grilla 3x3 con cabeceras */}
      <div
        className="mt-4 grid gap-1.5"
        style={{ gridTemplateColumns: "minmax(52px, 0.75fr) repeat(3, 1fr)" }}
      >
        <div className="flex items-center justify-center rounded-lg text-ink-faint">
          <GridIcon size={18} />
        </div>
        {cols.map((c) => (
          <div
            key={c.key}
            className="flex min-h-[58px] items-center justify-center rounded-lg border border-white/10 bg-asphalt-800 p-1.5"
          >
            <ConstraintLabel constraint={c} />
          </div>
        ))}

        {rows.map((r, ri) => (
          <Fragment key={r.key}>
            <div className="flex items-center justify-center rounded-lg border border-white/10 bg-asphalt-800 p-1.5">
              <ConstraintLabel constraint={r} />
            </div>
            {cols.map((c, ci) => {
              const idx = ri * 3 + ci;
              const id = cells[idx] ?? null;
              const placed = id ? driverById.get(id) ?? null : null;
              const exampleId = finished && !placed ? revealIds?.[idx] ?? null : null;
              const example = exampleId ? driverById.get(exampleId) ?? null : null;
              return (
                <BingoCell
                  key={c.key}
                  placed={placed}
                  example={example}
                  finished={finished}
                  onClick={finished ? undefined : () => setActive(idx)}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      {finished && (
        <p className="mt-4 text-center text-xs text-ink-faint">
          {t("bingo.reveal_hint")}
        </p>
      )}

      {/* Modal de seleccion de piloto */}
      <Modal
        open={activeData !== null}
        onClose={() => setActive(null)}
        title={t("bingo.pick_driver")}
      >
        {activeData && (
          <CellPicker
            row={activeData.row}
            col={activeData.col}
            pool={pool}
            blockedIds={excluding(usedIds, activeData.currentId)}
            current={activeData.currentId ? driverById.get(activeData.currentId) ?? null : null}
            onPick={(d) => active !== null && assign(active, d)}
            onClear={() => active !== null && clearCell(active)}
            describe={describe}
          />
        )}
      </Modal>
    </Panel>
  );
}

function excluding(ids: Set<string>, keep: string | null): Set<string> {
  if (!keep) return ids;
  const s = new Set(ids);
  s.delete(keep);
  return s;
}

/* ===================================================================== */
/* Cabeceras de restriccion                                               */
/* ===================================================================== */

function ConstraintLabel({ constraint }: { constraint: Constraint }) {
  const { t } = useI18n();

  if (constraint.kind === "team") {
    const color = team(constraint.ref ?? "")?.color ?? "#9CA3AF";
    return (
      <div className="flex flex-col items-center gap-1 text-center">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className="text-[11px] font-semibold leading-tight text-ink">
          {constraint.label}
        </span>
      </div>
    );
  }
  if (constraint.kind === "nat") {
    const nat = nationality(constraint.ref ?? "");
    return (
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-base leading-none" aria-hidden="true">
          {nat.flag}
        </span>
        <span className="font-mono text-[11px] text-ink">{nat.code}</span>
      </div>
    );
  }
  if (constraint.kind === "stat") {
    const StatIcon =
      constraint.key === "stat:winner"
        ? Flag
        : constraint.key === "stat:pole"
          ? Timer
          : Stat;
    return (
      <div className="flex flex-col items-center gap-1 text-center text-ink">
        <StatIcon size={16} />
        <span className="text-[11px] font-semibold leading-tight">{constraint.label}</span>
      </div>
    );
  }
  // champion
  return (
    <div className="flex flex-col items-center gap-1 text-center text-sector-yellow">
      <Trophy size={16} />
      <span className="text-[11px] font-semibold leading-tight">{t("bingo.champion_label")}</span>
    </div>
  );
}

/* ===================================================================== */
/* Celda                                                                  */
/* ===================================================================== */

function MiniHelmet({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 13a9 9 0 0 1 18 0v1a2 2 0 0 1-2 2h-5l-1 3H7a4 4 0 0 1-4-4z"
        fill={color}
        opacity="0.9"
      />
      <path d="M8 13h11" stroke="rgba(0,0,0,0.45)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BingoCell({
  placed,
  example,
  finished,
  onClick,
}: {
  placed: Driver | null;
  example: Driver | null;
  finished: boolean;
  onClick?: () => void;
}) {
  const { t } = useI18n();
  const shown = placed ?? example;
  const isHint = !placed && !!example;

  const stateClass = placed
    ? finished
      ? "border-sector-green/60 bg-sector-green/10"
      : "border-racing/50 bg-racing/10"
    : isHint
      ? "border-white/10 bg-asphalt-700/60 opacity-60"
      : "border-dashed border-white/15 bg-asphalt-700 hover:border-white/35 hover:bg-asphalt-600";

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={[
        "relative flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 p-1 text-center transition-colors",
        stateClass,
      ].join(" ")}
      aria-label={shown ? shown.lastName : t("bingo.empty_cell")}
    >
      {shown ? (
        <>
          <MiniHelmet color={driverColor(shown)} />
          <span className="w-full truncate px-0.5 font-display text-[11px] font-bold leading-tight text-white">
            {shown.lastName}
          </span>
          {placed && finished && (
            <span className="absolute right-1 top-1 text-sector-green">
              <Check size={13} />
            </span>
          )}
          {isHint && (
            <span className="absolute left-1 top-1 font-mono text-[9px] uppercase text-ink-faint">
              {t("bingo.example")}
            </span>
          )}
        </>
      ) : (
        <span className="font-display text-2xl font-light text-ink-faint">+</span>
      )}
    </Tag>
  );
}

/* ===================================================================== */
/* Selector de piloto (contenido del modal)                               */
/* ===================================================================== */

function CellPicker({
  row,
  col,
  pool,
  blockedIds,
  current,
  onPick,
  onClear,
  describe,
}: {
  row: Constraint;
  col: Constraint;
  pool: Driver[];
  blockedIds: Set<string>;
  current: Driver | null;
  onPick: (d: Driver) => void;
  onClear: () => void;
  describe: (c: Constraint) => string;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return findDriversByText(query, pool)
      .filter((d) => !blockedIds.has(d.id))
      .slice(0, 80);
  }, [query, pool, blockedIds]);

  const tryPick = (d: Driver) => {
    if (blockedIds.has(d.id)) {
      setError(t("bingo.already_used", { name: d.lastName }));
      return;
    }
    const okRow = row.match(d);
    const okCol = col.match(d);
    if (!okRow || !okCol) {
      const falla = !okRow ? describe(row) : describe(col);
      setError(t("bingo.does_not_match", { name: d.lastName, rule: falla }));
      return;
    }
    onPick(d);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestions[0]) {
      e.preventDefault();
      tryPick(suggestions[0]);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-asphalt-700 px-3 py-3">
        <ConstraintLabel constraint={row} />
        <span className="font-display text-lg text-ink-faint">×</span>
        <ConstraintLabel constraint={col} />
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(null);
          }}
          onKeyDown={onKeyDown}
          placeholder={t("bingo.search_placeholder")}
          autoComplete="off"
          spellCheck={false}
          autoFocus
          className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink placeholder:text-ink-faint focus:border-racing/50"
        />
        {suggestions.length > 0 && (
          <ul className="mt-2 max-h-[46vh] w-full divide-y divide-white/5 overflow-y-auto overscroll-contain rounded-lg border border-white/10 bg-asphalt-800 shadow-panel">
            {suggestions.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => tryPick(d)}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-asphalt-600"
                >
                  <span aria-hidden="true">{nationality(d.nationalityCode).flag}</span>
                  <span className="font-medium">{fullName(d)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && suggestions.length === 0 && (
          <p className="mt-2 px-1 text-sm text-ink-faint">{t("bingo.no_match")}</p>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-racing/40 bg-racing/10 px-3 py-2 text-sm text-racing-400">
          {error}
        </p>
      )}

      {current && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-asphalt-700 px-3 py-2.5">
          <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <span aria-hidden="true">{nationality(current.nationalityCode).flag}</span>
            {t("bingo.in_cell")} <span className="font-semibold text-ink">{current.lastName}</span>
          </span>
          <button
            onClick={onClear}
            className="rounded-md border border-racing/40 px-2.5 py-1 text-xs font-medium text-racing-400 transition-colors hover:bg-racing/10"
          >
            {t("bingo.remove")}
          </button>
        </div>
      )}
    </div>
  );
}
