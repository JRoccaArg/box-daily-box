// src/components/layout/DuelResultScreen.tsx
//
// Pantalla comparativa de resultado de un duelo (Roadmap §4). Se muestra
// recién cuando AMBOS terminaron (status='finished') — el modo a ciegas ya
// fue aplicado por el server, así que acá simplemente renderizamos lo que
// vino en `duel`. "Revancha" crea un duelo NUEVO (misma condiciones, seed
// distinta) dirigido al mismo rival: es una invitación normal que debe
// volver a aceptarse (confirmado con el usuario, sin atajos especiales).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/context";
import type { DuelState } from "@/lib/api";
import { apiCreateDuel, isApiError } from "@/lib/api";
import { duelPath, homePath } from "@/lib/routes";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Trophy, Flag as FlagIcon } from "@/components/ui/Icon";
import { playGameResultFeedback } from "@/lib/audio";

export function DuelResultScreen({ duel, myUserId }: { duel: DuelState; myUserId: string }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [rematching, setRematching] = useState(false);
  const [rematchMsg, setRematchMsg] = useState<string | null>(null);

  const mine = duel.myResult;
  const theirs = duel.opponentResult;

  // Suena UNA vez, al aparecer esta pantalla (se monta solo cuando el duelo
  // ya está 'finished'). En empate no se reproduce nada: no es ni victoria
  // ni derrota, y forzar uno de los dos tonos sería engañoso. El hook debe ir
  // ANTES del early-return de abajo (regla de hooks: siempre en el mismo orden).
  useEffect(() => {
    if (!mine || !theirs) return;
    const tiedNow = mine.won === theirs.won && mine.points === theirs.points;
    const iWonNow = mine.won !== theirs.won ? mine.won : mine.points > theirs.points;
    if (!tiedNow) playGameResultFeedback(iWonNow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mine || !theirs) return null; // no debería pasar: solo se renderiza con status='finished'.

  // Gana quien ganó su partida; si ambos ganaron o ambos perdieron, desempata
  // por puntos. Empate real solo si además los puntos coinciden.
  const tied = mine.won === theirs.won && mine.points === theirs.points;
  const iWon = mine.won !== theirs.won ? mine.won : mine.points > theirs.points;
  const outcomeLabel = tied ? t("duel.tied") : iWon ? t("duel.you_won") : t("duel.you_lost");
  const outcomeColor = tied ? "text-sector-yellow" : iWon ? "text-sector-green" : "text-racing-400";

  const opponentUserId = myUserId === duel.creatorId ? duel.opponentId : duel.creatorId;

  async function rematch() {
    if (!opponentUserId) return;
    setRematching(true);
    setRematchMsg(null);
    const res = await apiCreateDuel(duel.gameId, duel.difficulty, duel.timeLimit, opponentUserId);
    setRematching(false);
    if (!res || isApiError(res)) {
      setRematchMsg(res && "error" in res ? res.error : t("duel.error_generic"));
      return;
    }
    navigate(duelPath(locale, res.duelId));
  }

  return (
    <div className="space-y-4">
      <Panel className="text-center">
        <div
          className={[
            "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full",
            tied ? "bg-sector-yellow/15 text-sector-yellow" : iWon ? "bg-sector-green/15 text-sector-green" : "bg-racing/15 text-racing-400",
          ].join(" ")}
        >
          {iWon ? <Trophy size={26} /> : <FlagIcon size={26} />}
        </div>
        <h1 className={["font-display text-2xl font-bold", outcomeColor].join(" ")}>{outcomeLabel}</h1>
        <p className="mt-1 text-ink-muted">{t(`game.${duel.gameId}.name`)}</p>

        <div className="mt-5 space-y-2 text-left">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-asphalt-700 px-4 py-2.5">
            <span className="text-sm text-ink">{t("duel.your_score", { points: mine.points, seconds: mine.timeSeconds })}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-asphalt-700 px-4 py-2.5">
            <span className="text-sm text-ink-muted">{t("duel.opponent_score", { points: theirs.points, seconds: theirs.timeSeconds })}</span>
          </div>
        </div>

        {rematchMsg && <p className="mt-3 text-sm text-racing-400">{rematchMsg}</p>}

        <div className="mt-6 flex flex-col gap-2">
          {opponentUserId && (
            <Button size="lg" block disabled={rematching} onClick={rematch}>
              {rematching ? "…" : t("duel.rematch")}
            </Button>
          )}
          <Button variant="outline" block onClick={() => navigate(homePath(locale))}>
            {t("duel.go_home")}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
