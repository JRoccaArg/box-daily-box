import { useEffect, useRef, useState } from "react";
import { useStats } from "@/context/StatsContext";
import { useI18n } from "@/context";
import { Modal } from "@/components/ui/Modal";
import { StatPill } from "@/components/ui/StatPill";
import { MonthlyRanking } from "./MonthlyRanking";
import { GlobalRanking } from "./GlobalRanking";
import { IdentityModal } from "./IdentityModal";
import { BadgeGallery } from "./BadgeGallery";
import { FriendsTab } from "./FriendsTab";
import { getIdentity } from "@/lib/identity";
import { NATIONALITIES } from "@/data/nationalities";

export type StatsView = "personal" | "global" | "friends";

type StatsModalProps = {
  open: boolean;
  onClose: () => void;
  /** Pestaña a mostrar la próxima vez que se ABRE (ej: "friends" cuando se
   *  tocó el botón de stats con el globito de solicitudes pendientes
   *  visible). `undefined` = no forzar nada, dejar la última pestaña vista. */
  initialView?: StatsView;
};

/** Panel de estadisticas + ranking global + perfil. */
export function StatsModal({ open, onClose, initialView }: StatsModalProps) {
  const { summary, persistent } = useStats();
  const { t } = useI18n();
  const [view, setView] = useState<StatsView>("global");
  const [identityOpen, setIdentityOpen] = useState(false);

  // Solo al TRANSICIONAR de cerrado a abierto se fuerza `initialView` (si
  // vino). Mientras el modal ya está abierto, el usuario puede cambiar de
  // pestaña libremente sin que esto lo interrumpa.
  const wasOpenRef = useRef(open);
  useEffect(() => {
    if (open && !wasOpenRef.current && initialView) {
      setView(initialView);
    }
    wasOpenRef.current = open;
  }, [open, initialView]);

  const total = summary.won + summary.lost;
  const winRate = total > 0 ? Math.round((summary.won / total) * 100) : 0;

  const identity = getIdentity();
  const natData = identity.countryCode ? NATIONALITIES[identity.countryCode] : null;

  return (
    <>
      <Modal open={open} onClose={onClose} title={t("stats.title")} size="lg">
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

        {/* Tabs personal/global/amigos */}
        <div className="mb-4 flex gap-1 rounded-lg border border-white/10 bg-asphalt-800 p-1">
          <ViewTab active={view === "global"} onClick={() => setView("global")}>
            {t("stats.tab_global")}
          </ViewTab>
          <ViewTab active={view === "personal"} onClick={() => setView("personal")}>
            {t("stats.tab_personal")}
          </ViewTab>
          <ViewTab active={view === "friends"} onClick={() => setView("friends")}>
            {t("friends.tab_title")}
          </ViewTab>
        </div>

        {view === "global" && <GlobalRanking refreshKey={summary.won + summary.lost} />}
        {view === "friends" && <FriendsTab />}
        {view === "personal" && (
          <>
            <BadgeGallery userId={identity.userId} />

            <div className="mb-4">
              <MonthlyRanking
                refreshKey={summary.won + summary.lost}
                currentStreak={summary.currentStreak}
              />
            </div>

            {/* Racha actual: se muestra prominente arriba, dentro de MonthlyRanking
                (Roadmap #10) — se saca de acá para no mostrarla 2 veces. */}
            <div className="grid grid-cols-3 gap-2.5">
              <StatPill label={t("stats.won")} value={summary.won} accent="green" />
              <StatPill label={t("stats.lost")} value={summary.lost} accent="red" />
              <StatPill label={t("stats.win_rate")} value={`${winRate}`} />
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
