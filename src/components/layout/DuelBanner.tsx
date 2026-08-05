// src/components/layout/DuelBanner.tsx
//
// Banner in-app de invitación a duelo (Roadmap §4). Hace polling de
// GET /duels/pending (cada 3s) y muestra la más reciente con countdown +
// Aceptar/Rechazar. Aparece TAMBIÉN mientras se está jugando (el usuario lo
// pidió: "estés donde estés"). Si se acepta un duelo estando en una partida
// (reto diario o duelo en curso), primero se avisa que se pierde/abandona la
// partida actual — recién al confirmar se navega. Salir del juego persiste la
// derrota server-side por sí solo: GameShell (unmount -> persistAbandon) o
// DuelPage (unmount -> apiForfeitDuel).

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/context";
import { usePendingDuelsPolling, useCountdown } from "@/lib/duelPolling";
import { apiAcceptDuel, apiDeclineDuel, apiForfeitDuel, isApiError } from "@/lib/api";
import { isGameplayActive } from "@/lib/gameplayState";
import { duelPath } from "@/lib/routes";
import { NATIONALITIES } from "@/data/nationalities";
import { Swords } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DuelBanner() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const pending = usePendingDuelsPolling();
  const [busy, setBusy] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  // id del duelo para el que hay que confirmar (se aceptó estando en partida).
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // `visible`/`top` se calculan ANTES de cualquier `return null` para que
  // `useCountdown` (como todo hook) se llame siempre, incondicionalmente, en
  // el mismo orden en cada render — con `top` undefined, da 0 y no importa
  // porque el componente igual va a devolver null más abajo.
  const visible = pending.filter((d) => !dismissed.has(d.id));
  const top = visible[0];
  const secondsLeft = useCountdown(top?.expiresAt);

  if (!top) return null;

  const nat = top.creatorCountry ? NATIONALITIES[top.creatorCountry] : null;

  /** Acepta de verdad: navega al duelo. Salir del juego actual (si lo había)
   *  persiste la derrota/abandono por sí solo: si venías del reto diario,
   *  GameShell se desmonta (ruta distinta) y llama persistAbandon. Excepción:
   *  si YA estabas en OTRO duelo, ir de /duelo/A a /duelo/B es la MISMA ruta y
   *  no desmonta DuelPage, así que su forfeit-on-unmount no se dispara solo —
   *  por eso acá forfeiteamos explícitamente el duelo anterior (idempotente). */
  const doAccept = async (duelId: string) => {
    setBusy(duelId);
    const m = location.pathname.match(/\/duelo\/([^/]+)/);
    const currentDuelId = m?.[1];
    if (currentDuelId && currentDuelId !== duelId) {
      await apiForfeitDuel(currentDuelId).catch(() => {});
    }
    const res = await apiAcceptDuel(duelId);
    setBusy(null);
    if (res && !isApiError(res)) {
      navigate(duelPath(locale, duelId));
    } else {
      // Alguien más lo aceptó, o expiró: sacarlo de la vista, el polling se encarga del resto.
      setDismissed((prev) => new Set(prev).add(duelId));
    }
  };

  const onAcceptClick = () => {
    // Si hay una partida en curso, avisar antes (aceptar = perderla). Si no,
    // aceptar directo.
    if (isGameplayActive()) {
      setConfirmId(top.id);
    } else {
      doAccept(top.id);
    }
  };

  const decline = async () => {
    setBusy(top.id);
    await apiDeclineDuel(top.id);
    setBusy(null);
    setDismissed((prev) => new Set(prev).add(top.id));
  };

  return (
    <>
      <div className="panel flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2.5 border-racing/40 p-4">
        <div className="flex items-center gap-2 text-racing-400">
          <Swords size={18} />
          <span className="text-xs font-semibold uppercase tracking-wide">{t("duel.invitation_label")}</span>
        </div>
        <p className="break-words text-sm text-ink">
          {nat && <span className={`fi fi-${nat.alpha2} mr-1.5`} role="img" aria-label={nat.name} />}
          {t("duel.invitation_from", { name: top.creatorName || t("duel.someone"), game: t(`game.${top.gameId}.name`) })}
        </p>
        <p className="text-xs text-ink-muted">
          {t("duel.expires_in", { seconds: secondsLeft })}
          {visible.length > 1 && ` · ${t("duel.more_pending", { count: visible.length - 1 })}`}
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={onAcceptClick} disabled={busy === top.id} className="flex-1">
            {t("duel.accept_or_reject_accept")}
          </Button>
          <Button variant="ghost" size="sm" onClick={decline} disabled={busy === top.id} className="flex-1">
            {t("duel.accept_or_reject_reject")}
          </Button>
        </div>
      </div>

      {/* Aviso al aceptar estando en una partida: aceptar = perderla. */}
      <Modal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        title={t("duel.accept_while_playing_title")}
      >
        <p className="text-sm text-ink-muted">{t("duel.accept_while_playing_msg")}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            variant="danger"
            block
            disabled={busy === confirmId}
            onClick={() => {
              const id = confirmId;
              setConfirmId(null);
              if (id) doAccept(id);
            }}
          >
            {t("duel.accept_while_playing_confirm")}
          </Button>
          <Button variant="ghost" block onClick={() => setConfirmId(null)}>
            {t("duel.accept_while_playing_cancel")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
