// src/components/career/CareerOffers.tsx
//
// Pantalla de ofertas de equipo: se usa tanto para las ofertas iniciales de
// rookie ("rookie-offers") como para las que llegan cuando se termina un
// contrato ("offers"). Reusa los logos de public/team-logos/ ya generados
// para el juego Career Path (Etapa 2 de esa feature) — los 10 equipos
// actuales estan cubiertos.

import { useState } from "react";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { teamName } from "@/data";
import type { SeatOffer } from "@/lib/career/types";

type CareerOffersProps = {
  offers: SeatOffer[];
  isRookie: boolean;
  onAccept: (index: number) => void;
  /** Ausente para las ofertas de rookie: siempre hay que elegir una. */
  onDeclineAll?: () => void;
};

export function CareerOffers({ offers, isRookie, onAccept, onDeclineAll }: CareerOffersProps) {
  const { t } = useI18n();
  const [confirmingDecline, setConfirmingDecline] = useState(false);

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("career.offers.eyebrow")}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
        {t(isRookie ? "career.offers.rookie_title" : "career.offers.title")}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {t(isRookie ? "career.offers.rookie_intro" : "career.offers.intro")}
      </p>

      <div className="mt-5 space-y-3">
        {offers.map((offer, i) => (
          <div
            key={`${offer.teamId}-${i}`}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-asphalt-700 p-4"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/5 p-1.5">
              <img
                src={`/team-logos/${offer.teamId}.png`}
                alt={teamName(offer.teamId)}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-semibold text-white">{teamName(offer.teamId)}</div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                <span>{t("career.offers.car_rank", { rank: offer.expectedCarRank })}</span>
                <span>{t("career.offers.years", { years: offer.years })}</span>
                <span>{t(offer.role === "first" ? "career.offers.role_first" : "career.offers.role_second")}</span>
              </div>
            </div>
            <Button size="sm" onClick={() => onAccept(i)}>
              {t("career.offers.accept")}
            </Button>
          </div>
        ))}
      </div>

      {onDeclineAll && (
        <button
          type="button"
          onClick={() => setConfirmingDecline(true)}
          className="mt-4 text-sm text-ink-faint underline-offset-2 hover:text-ink hover:underline"
        >
          {t("career.offers.decline_all")}
        </button>
      )}

      {onDeclineAll && (
        <Modal
          open={confirmingDecline}
          onClose={() => setConfirmingDecline(false)}
          title={t("career.offers.decline_confirm_title")}
        >
          <p className="text-sm text-ink-muted">{t("career.offers.decline_confirm_body")}</p>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" block onClick={() => setConfirmingDecline(false)}>
              {t("career.offers.decline_confirm_no")}
            </Button>
            <Button
              variant="danger"
              block
              onClick={() => {
                setConfirmingDecline(false);
                onDeclineAll();
              }}
            >
              {t("career.offers.decline_confirm_yes")}
            </Button>
          </div>
        </Modal>
      )}
    </Panel>
  );
}
