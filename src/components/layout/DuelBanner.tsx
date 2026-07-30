// src/components/layout/DuelBanner.tsx
//
// Banner in-app de invitación a duelo (Roadmap §4). Hace polling de
// GET /duels/pending (cada 3s) y muestra la más reciente con countdown +
// Aceptar/Rechazar. Se PAUSA mientras se está jugando el reto diario
// (confirmado con el usuario: "el banner espera, no interrumpe") — se
// reactiva apenas GameShell vuelve a config/resultado.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/context";
import { usePendingDuelsPolling } from "@/lib/duelPolling";
import { apiAcceptDuel, apiDeclineDuel, isApiError } from "@/lib/api";
import { isGameplayActive, onGameplayChanged } from "@/lib/gameplayState";
import { duelPath } from "@/lib/routes";
import { NATIONALITIES } from "@/data/nationalities";
import { Swords } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export function DuelBanner() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const pending = usePendingDuelsPolling();
  const [gameplayActive, setGameplayActive] = useState(isGameplayActive());
  const [busy, setBusy] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => onGameplayChanged(() => setGameplayActive(isGameplayActive())), []);

  if (gameplayActive) return null;

  const visible = pending.filter((d) => !dismissed.has(d.id));
  const top = visible[0];
  if (!top) return null;

  const nat = top.creatorCountry ? NATIONALITIES[top.creatorCountry] : null;

  const accept = async () => {
    setBusy(top.id);
    const res = await apiAcceptDuel(top.id);
    setBusy(null);
    if (res && !isApiError(res)) {
      navigate(duelPath(locale, top.id));
    } else {
      // Alguien más lo aceptó, o expiró: sacarlo de la vista, el polling se encarga del resto.
      setDismissed((prev) => new Set(prev).add(top.id));
    }
  };

  const decline = async () => {
    setBusy(top.id);
    await apiDeclineDuel(top.id);
    setBusy(null);
    setDismissed((prev) => new Set(prev).add(top.id));
  };

  return (
    <div className="fixed bottom-3 right-3 z-40 w-[calc(100vw-1.5rem)] max-w-sm sm:right-4 sm:bottom-4">
      <div className="panel flex flex-col gap-2.5 border-racing/40 p-4">
        <div className="flex items-center gap-2 text-racing-400">
          <Swords size={18} />
          <span className="text-xs font-semibold uppercase tracking-wide">{t("duel.invitation_label")}</span>
        </div>
        <p className="text-sm text-ink">
          {nat && <span className={`fi fi-${nat.alpha2} mr-1.5`} role="img" aria-label={nat.name} />}
          {t("duel.invitation_from", { name: top.creatorName || t("duel.someone"), game: t(`game.${top.gameId}.name`) })}
        </p>
        <p className="text-xs text-ink-muted">
          {t("duel.expires_in", { seconds: top.secondsLeft })}
          {visible.length > 1 && ` · ${t("duel.more_pending", { count: visible.length - 1 })}`}
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={accept} disabled={busy === top.id} className="flex-1">
            {t("duel.accept_or_reject_accept")}
          </Button>
          <Button variant="ghost" size="sm" onClick={decline} disabled={busy === top.id} className="flex-1">
            {t("duel.accept_or_reject_reject")}
          </Button>
        </div>
      </div>
    </div>
  );
}
