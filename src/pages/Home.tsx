import { Link } from "react-router-dom";
import type { GameDefinition, DailyGameResult } from "@/types";
import { GAMES } from "@/components/games/registry";
import { useStats } from "@/context/StatsContext";
import { Panel } from "@/components/ui/Panel";
import { Check, Flag as FlagIcon, ChevronRight, Flame, Trophy } from "@/components/ui/Icon";
import { RankBadge } from "@/components/layout/RankBadge";

/** Pagina principal: lista de los retos del dia con su estado. */
export function Home() {
  const { resultFor, summary } = useStats();

  const results = GAMES.map((g) => ({ game: g, result: resultFor(g.id) }));
  const done = results.filter((r) => r.result).length;
  const total = GAMES.length;

  return (
    <div className="space-y-6">
      <Hero done={done} total={total} streak={summary.currentStreak} />

      {/* Posición del usuario en el ranking diario global.
          Se muestra solo si el usuario tiene puntos (rank !== null). */}
      <RankBadge />

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map(({ game, result }) => (
          <GameCard key={game.id} game={game} result={result} />
        ))}
      </div>
    </div>
  );
}

function Hero({ done, total, streak }: { done: number; total: number; streak: number }) {
  const allDone = done === total;
  // Numero en palabras para el titular, derivado del total real de juegos.
  const NUM_WORD: Record<number, string> = {
    3: "Tres", 4: "Cuatro", 5: "Cinco", 6: "Seis", 7: "Siete", 8: "Ocho",
  };
  const countWord = NUM_WORD[total] ?? String(total);
  return (
    <Panel>
      <div className="speed-bar mb-1 pl-1">
        <p className="eyebrow">Retos de hoy</p>
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {countWord} desafios. Un dia.
      </h1>
      <p className="mt-2 max-w-prose text-ink-muted">
        Un set nuevo de minijuegos de Formula 1 cada dia a la medianoche. Sin
        registro: tu progreso se guarda en este dispositivo.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span
          className={[
            "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium",
            allDone
              ? "border-sector-green/40 bg-sector-green/10 text-sector-green"
              : "border-white/10 bg-asphalt-700 text-ink-muted",
          ].join(" ")}
        >
          {allDone ? <Trophy size={15} /> : <Check size={15} />}
          {done} de {total} completados
        </span>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-racing/30 bg-racing/10 px-3 py-1.5 text-sm font-medium text-racing-400">
            <Flame size={15} />
            Racha de {streak} {streak === 1 ? "dia" : "dias"}
          </span>
        )}
      </div>
    </Panel>
  );
}

function GameCard({
  game,
  result,
}: {
  game: GameDefinition;
  result: DailyGameResult | null;
}) {
  const won = result?.status === "won";
  const lost = result?.status === "lost";

  return (
    <Link
      to={`/juego/${game.id}`}
      className="group block rounded-2xl border border-white/10 bg-asphalt-800 p-4 transition-colors hover:border-white/25 hover:bg-asphalt-700 focus-visible:border-racing/50"
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-bold tracking-tight",
            won
              ? "border-sector-green/40 bg-sector-green/10 text-sector-green"
              : lost
                ? "border-racing/40 bg-racing/10 text-racing-400"
                : "border-white/10 bg-asphalt-700 text-ink-muted",
          ].join(" ")}
          aria-hidden="true"
        >
          {game.glyph}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold tracking-tight text-white">
            {game.name}
          </h2>
          <p className="mt-0.5 text-sm leading-snug text-ink-muted">{game.tagline}</p>
        </div>

        <ChevronRight
          size={18}
          className="mt-1 shrink-0 text-ink-faint transition-colors group-hover:text-ink"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <StatusTag won={won} lost={lost} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          {result ? "Vuelve manana" : "Jugar ahora"}
        </span>
      </div>
    </Link>
  );
}

function StatusTag({ won, lost }: { won: boolean; lost: boolean }) {
  if (won) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-sector-green">
        <Check size={15} />
        Resuelto
      </span>
    );
  }
  if (lost) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-racing-400">
        <FlagIcon size={15} />
        Jugado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted">
      <span className="h-2 w-2 rounded-full bg-sector-purple" aria-hidden="true" />
      Sin jugar
    </span>
  );
}
