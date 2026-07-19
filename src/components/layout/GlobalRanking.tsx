import { useEffect, useState } from "react";
import {
  apiGetMonthlyRanking,
  apiGetDailyRanking,
  type RankingEntry,
} from "@/lib/api";
import { useI18n } from "@/context";
import { getIdentity } from "@/lib/identity";
import { NATIONALITIES } from "@/data/nationalities";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { Trophy } from "@/components/ui/Icon";

type Tab = "monthly" | "daily";

/** Ranking global que consume la API del servidor. */
export function GlobalRanking({ refreshKey }: { refreshKey?: number }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("daily");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const { userId } = getIdentity();
  const now = new Date();
  const monthName = t(`month.${now.getMonth()}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const country = countryFilter || undefined;
        const data =
          tab === "monthly"
            ? await apiGetMonthlyRanking(undefined, country)
            : await apiGetDailyRanking(undefined, country);
        if (cancelled) return;
        if (data) setEntries(data.top);
        else setError(true);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, countryFilter, refreshKey, retryTick]);

  return (
    <section className="rounded-xl border border-white/10 bg-gradient-to-b from-asphalt-700 to-asphalt-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} />
          <h3 className="font-display text-sm uppercase tracking-wide text-ink">
            {t("ranking.title")}
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex gap-1 rounded-lg border border-white/10 bg-asphalt-800 p-1">
        <TabBtn active={tab === "daily"} onClick={() => setTab("daily")}>
          {t("ranking.tab_today")}
        </TabBtn>
        <TabBtn active={tab === "monthly"} onClick={() => setTab("monthly")}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </TabBtn>
      </div>

      {/* Filtro por pais */}
      <div className="mt-3">
        <CountrySelect
          value={countryFilter}
          onChange={setCountryFilter}
          placeholder={t("ranking.all_countries")}
          size="sm"
          allowClear
        />
      </div>

      {/* Contenido */}
      <div className="mt-3">
        {loading && (
          <p className="py-6 text-center text-sm text-ink-faint">{t("ranking.loading")}</p>
        )}

        {error && !loading && (
          <div className="py-6 text-center">
            <p className="text-sm text-ink-faint">{t("ranking.error")}</p>
            <button
              onClick={() => setRetryTick((v) => v + 1)}
              className="mt-2 text-xs text-racing-400 underline"
            >
              {t("ranking.retry")}
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-faint">
            {tab === "daily" ? t("ranking.empty_daily") : t("ranking.empty_monthly")}
          </p>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="space-y-1.5">
            {entries.map((entry, i) => {
              const isMe = entry.userId === userId;
              const natData = entry.countryCode ? NATIONALITIES[entry.countryCode] : null;
              const hasWins = entry.gamesWon > 0;
              const challengeLabel =
                entry.gamesWon === 1
                  ? t("ranking.challenge_singular")
                  : t("ranking.challenge_plural");

              return (
                <div
                  key={entry.userId}
                  style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors motion-safe:animate-rise",
                    isMe
                      ? "border border-racing/30 bg-racing/10"
                      : "border border-transparent bg-asphalt-700/50",
                    hasWins ? "" : "opacity-70",
                  ].join(" ")}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-asphalt-600 text-xs font-bold text-ink-muted">
                    {entry.rank <= 3 ? (
                      <span className={MEDAL_COLOR[entry.rank] ?? ""}>
                        {MEDAL[entry.rank] ?? entry.rank}
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {natData ? (
                        <span className={`fi fi-${natData.alpha2} text-sm`} role="img" aria-label={natData.name} />
                      ) : (
                        <span className="text-sm">🏁</span>
                      )}
                      <span
                        className={[
                          "truncate text-sm font-medium",
                          isMe ? "text-white" : "text-ink",
                        ].join(" ")}
                      >
                        {entry.displayName || t("ranking.anonymous")}
                        {isMe && (
                          <span className="ml-1.5 text-xs text-racing-400">{t("ranking.you")}</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-ink-faint">
                      {hasWins
                        ? t("ranking.challenges_won", {
                            count: entry.gamesWon,
                            label: challengeLabel,
                          })
                        : t("ranking.played_no_win")}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={[
                        "tnum font-display text-lg font-bold",
                        hasWins ? "text-white" : "text-ink-muted",
                      ].join(" ")}
                    >
                      {entry.points}
                    </span>
                    <span className="ml-1 text-xs text-ink-faint">{t("ranking.pts")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        {tab === "monthly" ? t("ranking.monthly_note") : t("ranking.daily_note")}
      </p>
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-asphalt-600 text-white" : "text-ink-faint hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_COLOR: Record<number, string> = {
  1: "text-lg",
  2: "text-lg",
  3: "text-lg",
};
