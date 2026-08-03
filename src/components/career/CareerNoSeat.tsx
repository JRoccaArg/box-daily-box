// src/components/career/CareerNoSeat.tsx
//
// Pantalla cuando el jugador se quedo sin equipo (rechazo las ofertas, o el
// mercado no le dio ninguna). Simular el anio vuelve a intentar conseguir
// ofertas para el anio siguiente (misma logica que "ready", ver career.ts).

import { useState } from "react";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type CareerNoSeatProps = {
  onSimulate: () => void;
  onRetire: () => void;
};

export function CareerNoSeat({ onSimulate, onRetire }: CareerNoSeatProps) {
  const { t } = useI18n();
  const [confirmingRetire, setConfirmingRetire] = useState(false);

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("career.no_seat.eyebrow")}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
        {t("career.no_seat.title")}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{t("career.no_seat.body")}</p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button size="lg" onClick={onSimulate}>
          {t("career.no_seat.simulate")}
        </Button>
        <Button variant="outline" size="lg" onClick={() => setConfirmingRetire(true)}>
          {t("career.ready.retire_button")}
        </Button>
      </div>

      <Modal
        open={confirmingRetire}
        onClose={() => setConfirmingRetire(false)}
        title={t("career.ready.retire_confirm_title")}
      >
        <p className="text-sm text-ink-muted">{t("career.ready.retire_confirm_body")}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" block onClick={() => setConfirmingRetire(false)}>
            {t("career.ready.retire_confirm_no")}
          </Button>
          <Button
            variant="danger"
            block
            onClick={() => {
              setConfirmingRetire(false);
              onRetire();
            }}
          >
            {t("career.ready.retire_confirm_yes")}
          </Button>
        </div>
      </Modal>
    </Panel>
  );
}
