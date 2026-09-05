import { useMemo } from "react";
import { getMonthlyScore } from "@/lib/stats";
import { BASE_POINTS } from "@/lib/scoring";
import { gameById } from "@/components/games/registry";
import { useI18n } from "@/context";
import { Trophy, Flame } from "@/components/ui/Icon";
import { getEffectiveNow } from "@/lib/debugDate";
import { getStreakVisual } from "@/lib/streakVisual";
import type { Difficulty } from "@/types";

const DIFF_ACCENT: Record<Difficulty, string> = {
  facil: "text-sector-green",
  medio: "text-sky-400",
  dificil: "text-sector-yellow",
  leyenda: "text-sector-purple",
};

/** Agrupa los puntos diarios del mes en semanas de 7 días (semana 1 = días 1-7, etc). */
function weeklyFromDaily(daily: { day: number; points: number }[]): { week: number; points: number }[] {
  const weeks: { week: number; points: number }[] = [];
  for (const d of daily) {
    const idx = Math.floor((d.day - 1) / 7);
    weeks[idx] ??= { week: idx + 1, points: 0 };
    weeks[idx]!.points += d.points;
  }
  return weeks;
}

/**
 * Ranking mensual PERSONAL. Suma los puntos de los retos ganados en el mes,
 * recalculados desde el progreso guardado. Es local (no compite con otros).
 *
 * `currentStreak` se recibe del resumen local (`useStats().summary`), que ya
 * incorpora el progreso sincronizado del servidor tras el login — no hace
 * falta una llamada nueva al backend para mostrarla acá (Roadmap #10).
 */
export function MonthlyRanking({
  refreshKey,
  currentStreak,
}: {
  refreshKey?: number;
  currentStreak: number;
}) {
  const { t } = useI18n();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const score = useMemo(() => getMonthlyScore(), [refreshKey]);

  const now = getEffectiveNow();
  const monthName = t(`month.${now.getMonth()}`);
  const maxDaily = Math.max(1, ...score.daily.map((d) => d.points));
  const today = now.getDate();

  const weekly = useMemo(() => weeklyFromDaily(score.daily), [score.daily]);
  const maxWeekly = Math.max(1, ...weekly.map((w) => w.points));
  const currentWeek = Math.floor((today - 1) / 7) + 1;

  const gameRows = Object.entries(score.byGame)
    .map(([id, pts]) => ({ name: gameById(id) ? t(`game.${id}.name`) : id, pts }))
    .sort((a, b) => b.pts - a.pts);

  const diffs: Difficulty[] = ["facil", "medio", "dificil", "leyenda"];
  const hasStreak = currentStreak > 0;
  const streakVisual = getStreakVisual(currentStreak);

  return (
    <section className="rounded-xl border border-white/10 bg-gradient-to-b from-asphalt-700 to-asphalt-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} />
          <h3 className="font-display text-sm uppercase tracking-wide text-ink">
            {t("monthly.title", { month: monthName })}
          </h3>
        </div>
        <span className="text-xs text-ink-faint">
          {t("monthly.challenges_won", { count: score.gamesWon })}
        </span>
      </div>

      {/* Puntos del mes + racha actual, lado a lado (Roadmap #10: racha prominente arriba). */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-end gap-2">
            <span className="tnum font-display text-4xl leading-none text-white">{score.total}</span>
          </div>
          <span className="text-sm text-ink-muted">{t("monthly.points_month")}</span>
        </div>
        <div className="border-l border-white/5 pl-3">
          <div className="flex items-end gap-1.5">
            <Flame
              size={26}
              className={hasStreak ? streakVisual.flameClass : "text-ink-faint"}
            />
            <span
              className={[
                "tnum font-display text-4xl leading-none",
                hasStreak ? streakVisual.textClass : "text-ink-faint",
              ].join(" ")}
            >
              {currentStreak}
            </span>
          </div>
          <span className="text-sm text-ink-muted">{t("stats.streak")}</span>
        </div>
      </div>

      {score.gamesWon === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">
          {t("monthly.no_wins")}
        </p>
      ) : (
        <>
          {/* Mini-grafico de puntos por dia */}
          <div className="mt-5">
            <p className="eyebrow mb-1.5">{t("monthly.daily_title")}</p>
            <div className="flex h-16 items-end gap-[2px]">
              {score.daily.map((d) => {
                const h = d.points > 0 ? Math.max(8, (d.points / maxDaily) * 100) : 3;
                const isToday = d.day === today;
                return (
                  <div
                    key={d.day}
                    title={`${d.day}: ${d.points} pts`}
                    className={[
                      "flex-1 rounded-sm transition-colors",
                      d.points > 0 ? "bg-racing" : "bg-white/5",
                      isToday ? "ring-1 ring-sector-yellow" : "",
                    ].join(" ")}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
            {score.bestDay && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-faint">
                <Flame size={12} />
                {t("monthly.best_day", {
                  day: score.bestDay.day,
                  points: score.bestDay.points,
                })}
              </p>
            )}
          </div>

          {/* Mini-grafico semanal */}
          {weekly.length > 1 && (
            <div className="mt-4">
              <p className="eyebrow mb-1.5">{t("monthly.weekly_title")}</p>
              <div className="flex h-12 items-end gap-1.5">
                {weekly.map((w) => {
                  const h = w.points > 0 ? Math.max(10, (w.points / maxWeekly) * 100) : 4;
                  const isCurrent = w.week === currentWeek;
                  return (
                    <div
                      key={w.week}
                      title={t("monthly.week_tooltip", { n: w.week, points: w.points })}
                      className={[
                        "flex-1 rounded-sm transition-colors",
                        w.points > 0 ? "bg-sector-purple/70" : "bg-white/5",
                        isCurrent ? "ring-1 ring-sector-yellow" : "",
                      ].join(" ")}
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Desglose por dificultad */}
          <div className="mt-5">
            <p className="eyebrow mb-1.5">{t("monthly.by_difficulty")}</p>
            <div className="grid grid-cols-4 gap-2">
              {diffs.map((d) => (
                <div
                  key={d}
                  className="rounded-lg border border-white/5 bg-asphalt-700 px-2 py-2 text-center"
                >
                  <div className={["text-[11px] font-semibold", DIFF_ACCENT[d]].join(" ")}>
                    {t(`diff.${d}`)}
                  </div>
                  <div className="tnum mt-0.5 font-mono text-sm text-ink">
                    {score.byDifficulty[d]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose por juego */}
          <div className="mt-4">
            <p className="eyebrow mb-1.5">{t("monthly.by_game")}</p>
            <div className="space-y-1.5">
              {gameRows.map((g) => (
                <div key={g.name} className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">{g.name}</span>
                  <span className="tnum font-mono font-semibold text-ink">{g.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Como se puntua */}
      <details className="mt-4 text-xs text-ink-faint">
        <summary className="cursor-pointer select-none text-ink-muted">
          {t("monthly.scoring_title")}
        </summary>
        <p className="mt-2 leading-relaxed">
          {t("monthly.scoring_body", {
            easy: BASE_POINTS.facil,
            medium: BASE_POINTS.medio,
            hard: BASE_POINTS.dificil,
            legend: BASE_POINTS.leyenda,
          })}
        </p>
      </details>

      {/* Nota de seguridad honesta */}
      <p className="mt-3 rounded-lg border border-white/5 bg-asphalt-700/60 px-3 py-2 text-[11px] leading-relaxed text-ink-faint">
        {t("monthly.disclaimer")}
      </p>
    </section>
  );
}
