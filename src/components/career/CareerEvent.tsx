// src/components/career/CareerEvent.tsx
//
// Pantalla de UN evento: historia + 2 opciones. Al elegir, el padre ya
// resolvio el desenlace (motor determinista) y nos pasa `revealedOutcome`
// para narrarlo con un "Continuar" antes de pasar al siguiente evento o
// fase. Las probabilidades NUNCA se muestran (decision del usuario): el
// jugador solo ve la historia y, despues, que paso.

import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { getEventText } from "@/content/career";
import { getEvent } from "@/lib/career/events";

type CareerEventProps = {
  eventId: string;
  /** Progreso dentro de la tanda actual, para "Evento 2 de 4". */
  position: { current: number; total: number };
  /** Si esta presente, ya se eligio una opcion y hay que narrar el desenlace. */
  revealedOutcome: { optionId: string; outcomeId: string } | null;
  onChoose: (optionId: string) => void;
  onContinue: () => void;
};

export function CareerEvent({ eventId, position, revealedOutcome, onChoose, onContinue }: CareerEventProps) {
  const { locale, t } = useI18n();
  const event = getEvent(eventId);
  const text = getEventText(locale, eventId);

  if (!event || !text) return null;

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">
        {t("career.event.progress", { current: position.current, total: position.total })}
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{text.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{text.story}</p>

      {!revealedOutcome ? (
        <div className="mt-5 space-y-2.5">
          {event.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChoose(opt.id)}
              className="w-full rounded-lg border border-white/10 bg-asphalt-700 px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:border-racing/40 hover:bg-asphalt-600"
            >
              {text.options[opt.id]}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-lg border border-racing/30 bg-racing/5 p-4">
            <p className="text-sm font-medium text-ink">{text.options[revealedOutcome.optionId]}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {text.outcomes[revealedOutcome.outcomeId]}
            </p>
          </div>
          <Button block size="lg" className="mt-5" onClick={onContinue}>
            {t("career.event.continue")}
          </Button>
        </>
      )}
    </Panel>
  );
}
