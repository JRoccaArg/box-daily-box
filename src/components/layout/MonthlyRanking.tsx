import { useMemo } from "react";
import { getMonthlyScore } from "@/lib/stats";
import { BASE_POINTS } from "@/lib/scoring";
import { gameById } from "@/components/games/registry";
import { useI18n } from "@/context/I18nContext";
import { Trophy, Flame } from "@/components/ui/Icon";
import type { Difficulty } from "@/types";

const DIFF_ACCENT: Record<Difficulty, string> = {
  facil: "text-sector-green",
  medio: "text-sky-400",
  dificil: "text-sector-yellow",
  leyenda: "text-sector-purple",
};

/**
 * Ranking mensual PERSONAL. Suma los puntos de los retos ganados en el mes,
 * recalculados desde el progreso guardado. Es local (no compite con otros).
 */
export function MonthlyRanking({ refreshKey }: { refreshKey?: number }) {
  const { t } = useI18n();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const score = useMemo(() => getMonthlyScore(), [refreshKey]);

  const now = new Date();
  const monthName = t(`month.${now.getMonth()}`);
  const maxDaily = Math.max(1, ...score.daily.map((d) => d.points));
  const today = now.getDate();

  const gameRows = Object.entries(score.byGame)
    .map(([id, pts]) => ({ name: gameById(id)?.name ?? id, pts }))
    .sort((a, b) => b.pts - a.pts);

  const diffs: Difficulty[] = ["facil", "medio", "dificil", "leyenda"];

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

      {/* Total del mes */}
      <div className="mt-3 flex items-end gap-2">
        <span className="tnum font-display text-4xl leading-none text-white">{score.total}</span>
        <span className="mb-1 text-sm text-ink-muted">{t("monthly.points_month")}</span>
      </div>

      {score.gamesWon === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">
          {t("monthly.no_wins")}
        </p>
      ) : (
        <>
          {/* Mini-grafico de puntos por dia */}
          <div className="mt-4">
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

          {/* Desglose por dificultad */}
          <div className="mt-4 grid grid-cols-4 gap-2">
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

          {/* Desglose por juego */}
          <div className="mt-3 space-y-1.5">
            {gameRows.map((g) => (
              <div key={g.name} className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">{g.name}</span>
                <span className="tnum font-mono font-semibold text-ink">{g.pts}</span>
              </div>
            ))}
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
