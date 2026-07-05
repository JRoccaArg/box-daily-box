import { useState } from "react";
import { useStats } from "@/context/StatsContext";
import { useI18n } from "@/context";
import { Modal } from "@/components/ui/Modal";
import { StatPill } from "@/components/ui/StatPill";
import { Button } from "@/components/ui/Button";
import { Flame } from "@/components/ui/Icon";
import { MonthlyRanking } from "./MonthlyRanking";
import { GlobalRanking } from "./GlobalRanking";
import { IdentityModal } from "./IdentityModal";
import { getIdentity } from "@/lib/identity";
import { NATIONALITIES } from "@/data/nationalities";

type StatsModalProps = {
  open: boolean;
  onClose: () => void;
};

type View = "personal" | "global";

/** Panel de estadisticas + ranking global + perfil. */
export function StatsModal({ open, onClose }: StatsModalProps) {
  const { summary, persistent, resetProgress } = useStats();
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [view, setView] = useState<View>("global");
  const [identityOpen, setIdentityOpen] = useState(false);

  const total = summary.won + summary.lost;
  const winRate = total > 0 ? Math.round((summary.won / total) * 100) : 0;

  const identity = getIdentity();
  const natData = identity.countryCode ? NATIONALITIES[identity.countryCode] : null;

  const handleReset = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    resetProgress();
    setConfirming(false);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={t("stats.title")}>
        {/* Perfil */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-asphalt-700 px-3 py-2.5">
          <div className="flex items-center gap-2">
            {natData ? (
              <span className={`fi fi-${natData.alpha2} text-lg`} role="img" aria-label={natData.name} />
            ) : (
              <span className="text-lg">🏁</span>
            )}
            <span className="text-sm font-medium text-ink">
              {identity.displayName || t("stats.no_name")}
            </span>
          </div>
          <button
            onClick={() => setIdentityOpen(true)}
            className="text-xs text-racing-400 hover:underline"
          >
            {t("stats.edit_profile")}
          </button>
        </div>

        {/* Tabs personal/global */}
        <div className="mb-4 flex gap-1 rounded-lg border border-white/10 bg-asphalt-800 p-1">
          <ViewTab active={view === "global"} onClick={() => setView("global")}>
            {t("stats.tab_global")}
          </ViewTab>
          <ViewTab active={view === "personal"} onClick={() => setView("personal")}>
            {t("stats.tab_personal")}
          </ViewTab>
        </div>

        {view === "global" ? (
          <GlobalRanking refreshKey={summary.won + summary.lost} />
        ) : (
          <>
            <div className="mb-4">
              <MonthlyRanking refreshKey={summary.won + summary.lost} />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <StatPill label={t("stats.won")} value={summary.won} accent="green" />
              <StatPill label={t("stats.lost")} value={summary.lost} accent="red" />
              <StatPill label={t("stats.win_rate")} value={`${winRate}`} />
              <StatPill
                label={t("stats.streak")}
                value={
                  <span className="inline-flex items-center gap-1">
                    {summary.currentStreak > 0 && <Flame size={20} />}
                    {summary.currentStreak}
                  </span>
                }
                accent="yellow"
              />
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-asphalt-700 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">{t("stats.best_streak")}</span>
                <span className="tnum font-mono font-semibold text-white">
                  {summary.bestStreak} {t("stats.days")}
                </span>
              </div>
            </div>

            {!persistent && (
              <p className="mt-3 text-xs leading-relaxed text-sector-yellow/90">
                {t("stats.no_persistent")}
              </p>
            )}

            <div className="mt-5 border-t border-white/5 pt-4">
              {confirming ? (
                <div className="space-y-2">
                  <p className="text-sm text-ink-muted">
                    {t("stats.reset_confirm")}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={handleReset}>
                      {t("stats.reset_yes")}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                      {t("stats.reset_cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-ink-muted">
                  {t("stats.reset")}
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>

      <IdentityModal open={identityOpen} onClose={() => setIdentityOpen(false)} />
    </>
  );
}

function ViewTab({
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
