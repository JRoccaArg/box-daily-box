// src/pages/CareerModePage.tsx
//
// Orquestador del Modo Carrera. Ruta standalone (/:lang/modo-carrera), NO
// pasa por GameShell: sin timer, sin ranking, sin server. Todo el estado
// vive en localStorage (ver src/lib/career/storage.ts) — una sola partida
// guardada a la vez (decision del usuario).
//
// La UI se decide en 3 capas, en este orden:
//   1. Si no hay partida guardada -> CareerSetup (crear piloto).
//   2. Si hay resumenes de temporada pendientes de mostrar -> se muestran
//      de a UNO (con "Continuar"), aunque el motor ya haya simulado varias
//      de una vez (modo de 2 o 3 anios). Esto es lo que le da tiempo al
//      jugador para asimilar cada resultado, pedido explicito del usuario.
//   3. Si no, se renderiza segun `state.phase` (rookie-offers, offers,
//      no-seat, ready, events, retired).
//
// Un evento a mitad de resolver (el jugador ya eligio pero no toco
// "Continuar" sobre el desenlace) sobrevive a un cierre de pestania: el
// desenlace se sortea y se aplica en el momento de elegir la opcion (ver
// resolveEvent en career.ts), no al continuar. Lo unico efimero es la
// NARRACION del desenlace, que se vuelve a mostrar iterando la cola.

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/context";
import { ChevronLeft } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Seo } from "@/components/layout/Seo";
import { homePath } from "@/lib/routes";
import {
  acceptOffer,
  advanceSeasons,
  declineOffers,
  resolveEvent,
  retire,
  seekSeat,
  startCareer,
} from "@/lib/career/career";
import { loadCareerRun, saveCareerRun, archiveFinishedCareer, clearCareerRun } from "@/lib/career/storage";
import type { CareerState, SeasonResult } from "@/lib/career/types";
import { CareerSetup } from "@/components/career/CareerSetup";
import { CareerOffers } from "@/components/career/CareerOffers";
import { CareerNoSeat } from "@/components/career/CareerNoSeat";
import { CareerDashboard } from "@/components/career/CareerDashboard";
import { CareerSeasonSummary } from "@/components/career/CareerSeasonSummary";
import { CareerEvent } from "@/components/career/CareerEvent";
import { CareerRetired } from "@/components/career/CareerRetired";
import { CareerHistoryPanel } from "@/components/career/CareerHistoryPanel";

/** String unico para sembrar el Rng de la partida (no necesita ser un UUID real). */
function randomSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

type EventReveal = { optionId: string; outcomeId: string };

export function CareerModePage() {
  const { locale, t } = useI18n();

  const [careerState, setCareerState] = useState<CareerState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [seasonQueue, setSeasonQueue] = useState<SeasonResult[]>([]);
  // El evento que se esta mostrando AHORA, con su posicion ya congelada
  // ("Evento 2 de 3"). A proposito NO se lee directo de
  // `careerState.pendingEvents[0]`: resolveEvent avanza la cola apenas se
  // elige una opcion (para que el estado quede correcto de inmediato), pero
  // la UI todavia tiene que narrar el desenlace de ESE evento antes de
  // pasar al siguiente. Mientras `eventReveal` este activo, esto se
  // mantiene fijo aunque `careerState.pendingEvents` ya haya avanzado.
  const [currentEvent, setCurrentEvent] = useState<{ id: string; position: number } | null>(null);
  const [eventReveal, setEventReveal] = useState<EventReveal | null>(null);
  const [eventChunkTotal, setEventChunkTotal] = useState(1);
  const [confirmingAbandon, setConfirmingAbandon] = useState(false);
  const archivedRef = useRef(false);

  // Cargar la partida guardada (si hay) al montar. Si quedo a mitad de una
  // tanda de eventos (el usuario cerro la pestania justo ahi), retomamos
  // mostrando ese mismo evento pendiente (la posicion exacta dentro de la
  // tanda original no se conserva entre sesiones; se aproxima a 1).
  useEffect(() => {
    const run = loadCareerRun();
    setCareerState(run);
    if (run && run.phase === "events" && run.pendingEvents[0]) {
      setEventChunkTotal(run.pendingEvents.length);
      setCurrentEvent({ id: run.pendingEvents[0], position: 1 });
    }
    setLoaded(true);
  }, []);

  // Al liberarse el evento actual (recien continuado), si la partida sigue
  // en fase "events" tomamos el proximo de la cola, calculando su posicion
  // real dentro de la tanda. Si la fase ya cambio (era el ultimo evento),
  // queda en null y el render cae naturalmente a la vista de esa fase.
  useEffect(() => {
    if (!careerState || seasonQueue.length > 0 || currentEvent !== null) return;
    if (careerState.phase === "events" && careerState.pendingEvents[0]) {
      const position = eventChunkTotal - careerState.pendingEvents.length + 1;
      setCurrentEvent({ id: careerState.pendingEvents[0], position: Math.max(1, position) });
    }
  }, [careerState, seasonQueue, currentEvent, eventChunkTotal]);

  // Autoguardado: cada cambio de estado se persiste. Al llegar a "retired"
  // se archiva en el historial UNA sola vez (guard con ref) en vez de
  // seguir guardando "career_run" indefinidamente.
  useEffect(() => {
    if (!loaded || !careerState) return;
    if (careerState.phase === "retired") {
      if (!archivedRef.current) {
        archivedRef.current = true;
        archiveFinishedCareer(careerState);
      }
      return;
    }
    archivedRef.current = false;
    saveCareerRun(careerState);
  }, [careerState, loaded]);

  if (!loaded) return null;

  function handleStart(params: { firstName: string; lastName: string; nationalityCode: string; step: 1 | 2 | 3 }) {
    const s = startCareer({ ...params, seed: randomSeed(), startYear: new Date().getFullYear() });
    setCareerState(s);
  }

  function handleAcceptOffer(index: number) {
    if (!careerState) return;
    setCareerState(acceptOffer(careerState, index));
  }

  function handleDeclineAll() {
    if (!careerState) return;
    setCareerState(declineOffers(careerState));
  }

  function handleSimulate() {
    if (!careerState) return;
    const { state, seasons } = advanceSeasons(careerState);
    setCareerState(state);
    setSeasonQueue(seasons);
    if (state.phase === "events") setEventChunkTotal(state.pendingEvents.length);
  }

  function handleSeasonContinue() {
    setSeasonQueue((q) => q.slice(1));
  }

  function handleSeekSeat() {
    if (!careerState) return;
    setCareerState(seekSeat(careerState));
  }

  function handleChooseEventOption(optionId: string) {
    if (!careerState) return;
    // `careerState.pendingEvents[0]` en este momento es exactamente
    // `currentEventId` (recien lo estamos resolviendo). resolveEvent avanza
    // la cola YA MISMO, pero mantenemos `currentEventId` fijo para poder
    // narrar el desenlace de ESTE evento antes de pasar al siguiente.
    const res = resolveEvent(careerState, optionId);
    setCareerState(res.state);
    if (res.outcomeId) setEventReveal({ optionId, outcomeId: res.outcomeId });
  }

  function handleEventContinue() {
    setEventReveal(null);
    // Libera el evento actual: el efecto de arriba toma el siguiente de la
    // cola (o lo deja en null si era el ultimo, y el render cae a la fase).
    setCurrentEvent(null);
  }

  function handleRetire() {
    if (!careerState) return;
    setCareerState(retire(careerState));
  }

  function handleNewCareer() {
    clearCareerRun();
    setCareerState(null);
    setSeasonQueue([]);
    setCurrentEvent(null);
    setEventReveal(null);
  }

  function handleAbandonConfirmed() {
    setConfirmingAbandon(false);
    handleNewCareer();
  }

  const showHistoryPanel = careerState !== null;
  const visibleHistory = careerState ? careerState.history.slice(0, careerState.history.length - seasonQueue.length) : [];

  function renderMain() {
    if (!careerState) {
      return <CareerSetup onStart={handleStart} />;
    }

    if (seasonQueue.length > 0) {
      return <CareerSeasonSummary result={seasonQueue[0] as SeasonResult} onContinue={handleSeasonContinue} />;
    }

    // Tiene prioridad sobre el switch de fase: al elegir la opcion del
    // ULTIMO evento de una tanda, `careerState.phase` ya cambio (a
    // "ready"/"offers"/etc — ver resolveEvent en career.ts), pero todavia
    // hay que narrar su desenlace antes de mostrar esa fase nueva.
    if (currentEvent) {
      return (
        <CareerEvent
          eventId={currentEvent.id}
          position={{ current: currentEvent.position, total: eventChunkTotal }}
          revealedOutcome={eventReveal}
          onChoose={handleChooseEventOption}
          onContinue={handleEventContinue}
        />
      );
    }

    switch (careerState.phase) {
      case "rookie-offers":
        return <CareerOffers offers={careerState.offers} isRookie onAccept={handleAcceptOffer} />;
      case "offers":
        return (
          <CareerOffers
            offers={careerState.offers}
            isRookie={false}
            onAccept={handleAcceptOffer}
            onDeclineAll={handleDeclineAll}
          />
        );
      case "no-seat":
        return <CareerNoSeat onSimulate={handleSeekSeat} onRetire={handleRetire} />;
      case "ready":
        return <CareerDashboard state={careerState} onSimulate={handleSimulate} onRetire={handleRetire} />;
      case "events":
        // Sin currentEvent asignado todavia (el efecto lo hace en el
        // siguiente render); no hay nada razonable que mostrar por 1 tick.
        return null;
      case "retired":
        return <CareerRetired state={careerState} onNewCareer={handleNewCareer} />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-5">
      <Seo locale={locale} route={{ kind: "career" }} />

      <div className="flex items-center justify-between">
        <Link
          to={homePath(locale)}
          className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} />
          {t("shell.back")}
        </Link>
        {careerState && careerState.phase !== "retired" && (
          <button
            type="button"
            onClick={() => setConfirmingAbandon(true)}
            className="text-xs text-ink-faint underline-offset-2 hover:text-ink hover:underline"
          >
            {t("career.abandon.link")}
          </button>
        )}
      </div>

      <div className={showHistoryPanel ? "grid gap-4 lg:grid-cols-[1fr_320px]" : ""}>
        <div>{renderMain()}</div>
        {showHistoryPanel && <CareerHistoryPanel history={visibleHistory} />}
      </div>

      <Modal
        open={confirmingAbandon}
        onClose={() => setConfirmingAbandon(false)}
        title={t("career.abandon.confirm_title")}
      >
        <p className="text-sm text-ink-muted">{t("career.abandon.confirm_body")}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" block onClick={() => setConfirmingAbandon(false)}>
            {t("career.abandon.confirm_no")}
          </Button>
          <Button variant="danger" block onClick={handleAbandonConfirmed}>
            {t("career.abandon.confirm_yes")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
