import { useState } from "react";
import { useStats } from "@/context/StatsContext";
import { Modal } from "@/components/ui/Modal";
import { StatPill } from "@/components/ui/StatPill";
import { Button } from "@/components/ui/Button";
import { Flame } from "@/components/ui/Icon";
import { MonthlyRanking } from "./MonthlyRanking";

type StatsModalProps = {
  open: boolean;
  onClose: () => void;
};

/** Panel de estadisticas acumuladas + reinicio de progreso. */
export function StatsModal({ open, onClose }: StatsModalProps) {
  const { summary, persistent, resetProgress } = useStats();
  const [confirming, setConfirming] = useState(false);

  const total = summary.won + summary.lost;
  const winRate = total > 0 ? Math.round((summary.won / total) * 100) : 0;

  const handleReset = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    resetProgress();
    setConfirming(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Tus estadisticas">
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
          <span className="tnum font-mono font-semibold text-white">{summary.bestStreak} dias</span>
        </div>
      </div>

      {!persistent && (
        <p className="mt-3 text-xs leading-relaxed text-sector-yellow/90">
          El almacenamiento persistente no esta disponible en este navegador. Tu progreso se
          guardara solo durante esta sesion.
        </p>
      )}

      <div className="mt-5 border-t border-white/5 pt-4">
        {confirming ? (
          <div className="space-y-2">
            <p className="text-sm text-ink-muted">
              Esto borra tus estadísticas y puntos. Los retos que ya jugaste hoy seguirán
              bloqueados hasta mañana (no podés rejugarlos conociendo las respuestas). Esta acción
              no se puede deshacer.
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
    </Modal>
  );
}
