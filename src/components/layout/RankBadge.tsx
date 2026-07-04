// src/components/layout/RankBadge.tsx

import { useEffect, useState } from "react";
import { apiGetUserRank } from "@/lib/api";
import { getIdentity } from "@/lib/identity";
import { dateKey } from "@/lib/seed";
import { on, Events } from "@/lib/events";
import { useI18n } from "@/context/I18nContext";

type RankBadgeProps = {
  variant?: "inline" | "block";
};

export function RankBadge({ variant = "block" }: RankBadgeProps) {
  const { t } = useI18n();
  const [rank, setRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRank = () => {
    const { userId } = getIdentity();
    if (!userId) {
      setLoading(false);
      return;
    }
    const today = dateKey(new Date());
    (async () => {
      const r = await apiGetUserRank(userId, today);
      if (r) {
        setRank(r.rank);
        setTotalPlayers(r.totalPlayers);
      }
      setLoading(false);
    })();
  };

  useEffect(() => {
    fetchRank();
    return on(Events.STATS_CHANGED, fetchRank);
  }, []);

  if (loading || rank === null) return null;

  if (variant === "inline") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-racing/30 bg-racing/10 px-2.5 py-1 font-mono text-xs font-semibold text-racing"
        title={t("rank.badge_title", { count: totalPlayers })}
      >
        <span aria-hidden>🏆</span>
        {t("rank.position", { rank })}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-racing/30 bg-racing/10 px-4 py-3">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-ink-faint">
          {t("rank.your_position")}
        </p>
        <p className="mt-0.5 font-display text-2xl text-ink">
          {t("rank.position", { rank })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[11px] uppercase tracking-wider text-ink-faint">
          {t("rank.world_ranking")}
        </p>
        <p className="mt-0.5 tnum text-sm text-ink-muted">
          {t("rank.of_players", { count: totalPlayers.toLocaleString() })}
        </p>
      </div>
    </div>
  );
}
