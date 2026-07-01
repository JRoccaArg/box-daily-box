import { useState } from "react";
import { useStats } from "@/context/StatsContext";
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
  const [confirming, setConfirming] = useState(false);
  const [view, setView] = useState<View>("global");
  const [identityOpen, setIdentityOpen] = useState(false);

  const total = summary.won + summary.lost;
  const winRate = total > 0 ? Math.round((summary.won / total) * 100) : 0;

  const identity = getIdentity();
  const flag = identity.countryCode
    ? (NATIONALITIES[identity.countryCode]?.flag ?? "🏁")
    : "🏁";

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
      <Modal open={open} onClose={onClose} title="Estadísticas">
        {/* Perfil */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-asphalt-700 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">{flag}</span>
            <span className="text-sm font-medium text-ink">
              {identity.displayName || "Sin nombre"}
            </span>
          </div>
          <button
            onClick={() => setIdentityOpen(true)}
            className="text-xs text-racing-400 hover:underline"
          >
            Editar perfil
          </button>
        </div>

        {/* Tabs personal/global */}
        <div className="mb-4 flex gap-1 rounded-lg border border-white/10 bg-asphalt-800 p-1">
          <ViewTab active={view === "global"} onClick={() => setView("global")}>
            Ranking Global
          </ViewTab>
          <ViewTab active={view === "personal"} onClick={() => setView("personal")}>
            Mi Progreso
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
              <StatPill label="Ganados" value={summary.won} accent="green" />
              <StatPill label="Perdidos" value={summary.lost} accent="red" />
              <StatPill label="% Victorias" value={`${winRate}`} />
              <StatPill
                label="Racha"
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
                <span className="text-ink-muted">Mejor racha</span>
                <span className="tnum font-mono font-semibold text-white">
                  {summary.bestStreak} dias
                </span>
              </div>
            </div>

            {!persistent && (
              <p className="mt-3 text-xs leading-relaxed text-sector-yellow/90">
                El almacenamiento persistente no esta disponible en este navegador. Tu progreso
                se guardara solo durante esta sesion.
              </p>
            )}

            <div className="mt-5 border-t border-white/5 pt-4">
              {confirming ? (
                <div className="space-y-2">
                  <p className="text-sm text-ink-muted">
                    Esto borra tus estadísticas y puntos. Los retos que ya jugaste hoy seguirán
                    bloqueados hasta mañana. Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={handleReset}>
                      Si, borrar todo
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-ink-muted">
                  Reiniciar progreso
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
