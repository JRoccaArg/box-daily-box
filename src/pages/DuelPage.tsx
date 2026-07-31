// src/pages/DuelPage.tsx
//
// Ruta dedicada /:lang/duelo/:duelId (Roadmap §4). Único punto de entrada
// para TODO el ciclo de vida de un duelo visto desde el navegador: preview
// de un link abierto sin aceptar todavía, pantalla de espera del retador,
// el juego en vivo, y el resultado final. No se agrega al sitemap ni se
// prerenderiza (el duelId es dinámico) — usa <Head> directo con noindex en
// vez del sistema de SEO de páginas estáticas (src/lib/seo.ts).
//
// Identidad: si quien abre el link nunca jugó Box Daily Box, `getIdentity()`
// ya genera un userId anónimo al vuelo (mismo patrón que el resto de la app);
// como los attempts de duelo tienen `ranked=false`, no importa qué nombre
// tenga ni que no esté registrado en ningún ranking.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { useI18n } from "@/context";
import { useDuelPolling, useCountdown } from "@/lib/duelPolling";
import { apiAcceptDuel, apiDeclineDuel, apiCancelDuel, apiForfeitDuel, apiStartDuelChallenge, apiFinishChallenge, isApiError } from "@/lib/api";
import { getIdentity } from "@/lib/identity";
import { homePath } from "@/lib/routes";
import { gameById } from "@/components/games/registry";
import { useTimer } from "@/hooks/useTimer";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { TimerDisplay } from "@/components/ui/TimerDisplay";
import { Swords } from "@/components/ui/Icon";
import { DuelResultScreen } from "@/components/layout/DuelResultScreen";
import type { Difficulty, GameStatus } from "@/types";

export function DuelPage() {
  const { duelId } = useParams<{ duelId: string }>();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { userId } = getIdentity();
  const { duel, loading, notFound, refresh } = useDuelPolling(duelId ?? null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ─── Abandono al cerrar/navegar afuera (bug: "si ambos abandonan, el
  // duelo queda activo para siempre") ─────────────────────────────────
  //
  // Cubre TODAS las pantallas de esta página en las que soy participante y
  // el duelo sigue "vivo" (pending como creador esperando aceptación, o
  // active mientras juego/espero al rival): si cierro la pestaña o navego
  // afuera, `/duels/:id/forfeit` avisa al instante en vez de esperar el TTL
  // (60s en pending, 5min en active). Es idempotente y no requiere
  // sessionToken, así que es seguro llamarlo incluso si mi lado ya estaba
  // resuelto (el server responde "already_settled" y no hace nada) — no
  // hace falta distinguir en qué sub-pantalla exacta estoy parado.
  const abandonRef = useRef<{ duelId: string | null; shouldReport: boolean }>({
    duelId: null,
    shouldReport: false,
  });
  useEffect(() => {
    const isParticipant = !!duel && (userId === duel.creatorId || userId === duel.opponentId);
    const duelIsLive = !!duel && (duel.status === "pending" || duel.status === "active");
    abandonRef.current = {
      duelId: duel?.id ?? null,
      shouldReport: isParticipant && duelIsLive,
    };
  }, [duel, userId]);

  useEffect(() => {
    const reportAbandon = () => {
      const { duelId: id, shouldReport } = abandonRef.current;
      if (!shouldReport || !id) return;
      abandonRef.current.shouldReport = false;
      apiForfeitDuel(id).catch(() => {});
    };
    const onBeforeUnload = () => reportAbandon();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      reportAbandon();
    };
  }, []);

  return (
    <div className="space-y-4">
      <Head defer={false}>
        <title>Box Daily Box — {t("duel.invitation_label")}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {loading && <Panel className="text-center text-ink-muted">{t("duel.loading")}</Panel>}

      {!loading && notFound && (
        <Panel className="text-center">
          <p className="text-ink-muted">{t("duel.not_found")}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(homePath(locale))}>
              {t("duel.go_home")}
            </Button>
          </div>
        </Panel>
      )}

      {!loading && !notFound && duel && (
        <DuelBody
          duel={duel}
          myUserId={userId}
          busy={busy}
          actionError={actionError}
          onAccept={async () => {
            setBusy(true);
            setActionError(null);
            const res = await apiAcceptDuel(duel.id);
            setBusy(false);
            if (!res || isApiError(res)) {
              setActionError(res && "error" in res ? res.error : t("duel.error_generic"));
              return;
            }
            refresh();
          }}
          onDecline={async () => {
            setBusy(true);
            await apiDeclineDuel(duel.id);
            setBusy(false);
            navigate(homePath(locale));
          }}
          onCancel={async () => {
            setBusy(true);
            await apiCancelDuel(duel.id);
            setBusy(false);
            navigate(homePath(locale));
          }}
        />
      )}
    </div>
  );
}

type DuelBodyProps = {
  duel: NonNullable<ReturnType<typeof useDuelPolling>["duel"]>;
  myUserId: string;
  busy: boolean;
  actionError: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
};

function DuelBody({ duel, myUserId, busy, actionError, onAccept, onDecline, onCancel }: DuelBodyProps) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const game = gameById(duel.gameId);
  const isCreator = myUserId === duel.creatorId;
  const isOpponent = myUserId === duel.opponentId;
  const isParticipant = isCreator || isOpponent;
  // Countdown fluido (no salta de a 3s como el `secondsLeft` que refresca el
  // polling): siempre se llama, aunque solo se muestre en las 2 pantallas de
  // 'pending' de abajo — el resto de estados no lo usan pero no está de más.
  const secondsLeft = useCountdown(duel.expiresAt);

  if (duel.status === "expired") {
    return <TerminalMessage text={t("duel.expired")} onHome={() => navigate(homePath(locale))} />;
  }
  if (duel.status === "cancelled") {
    return <TerminalMessage text={t("duel.cancelled")} onHome={() => navigate(homePath(locale))} />;
  }

  if (duel.status === "pending") {
    // El creador reabre su propio link mientras espera.
    if (isCreator) {
      return (
        <Panel className="text-center">
          <Swords size={26} className="mx-auto mb-3 text-racing-400" />
          <h1 className="font-display text-xl font-bold text-white">{t("duel.waiting_opponent")}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t("duel.condition", { game: game ? t(`game.${game.id}.name`) : duel.gameId, difficulty: t(`diff.${duel.difficulty}`), time: duel.timeLimit ?? 0 })}
          </p>
          <TimerDisplay secondsLeft={secondsLeft} total={60} />
          {actionError && <p className="mt-2 text-sm text-racing-400">{actionError}</p>}
          <div className="mt-5">
            <Button variant="danger" disabled={busy} onClick={onCancel}>
              {t("duel.cancel")}
            </Button>
          </div>
        </Panel>
      );
    }

    // No participante todavía (link abierto) o ya dirigido a mí: mostrar
    // condiciones y Aceptar/Rechazar (isOpenPreview del backend ya permitió leerlo).
    const isOpen = duel.opponentId === null;
    return (
      <Panel className="text-center">
        <Swords size={26} className="mx-auto mb-3 text-racing-400" />
        <h1 className="font-display text-xl font-bold text-white">
          {t("duel.invitation_from", { name: duel.creatorName || t("duel.someone"), game: game ? t(`game.${game.id}.name`) : duel.gameId })}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {t("duel.condition", { game: game ? t(`game.${game.id}.name`) : duel.gameId, difficulty: t(`diff.${duel.difficulty}`), time: duel.timeLimit ?? 0 })}
        </p>
        <p className="mt-2 text-xs text-ink-faint">{t("duel.expires_in", { seconds: secondsLeft })}</p>
        {actionError && <p className="mt-2 text-sm text-racing-400">{actionError}</p>}
        <div className="mt-5 flex flex-col gap-2">
          <Button size="lg" disabled={busy} onClick={onAccept}>
            {t("duel.accept_or_reject_accept")}
          </Button>
          {!isOpen && (
            <Button variant="ghost" disabled={busy} onClick={onDecline}>
              {t("duel.accept_or_reject_reject")}
            </Button>
          )}
        </div>
      </Panel>
    );
  }

  if (duel.status === "active") {
    if (!isParticipant) {
      return <TerminalMessage text={t("duel.not_found")} onHome={() => navigate(homePath(locale))} />;
    }
    if (duel.myResult != null) {
      // Ya jugué, esperando al rival (a ciegas: no sé su resultado todavía).
      return (
        <Panel className="text-center">
          <h1 className="font-display text-xl font-bold text-white">{t("duel.waiting_finish")}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t("duel.your_score", { points: duel.myResult.points, seconds: duel.myResult.timeSeconds })}
          </p>
        </Panel>
      );
    }
    if (!game) {
      return <TerminalMessage text={t("duel.not_found")} onHome={() => navigate(homePath(locale))} />;
    }
    return <DuelPlayScreen duel={duel} game={game} />;
  }

  if (duel.status === "finished") {
    if (!isParticipant) {
      return <TerminalMessage text={t("duel.not_found")} onHome={() => navigate(homePath(locale))} />;
    }
    return <DuelResultScreen duel={duel} myUserId={myUserId} />;
  }

  return null;
}

function TerminalMessage({ text, onHome }: { text: string; onHome: () => void }) {
  const { t } = useI18n();
  return (
    <Panel className="text-center">
      <p className="text-ink-muted">{text}</p>
      <div className="mt-4">
        <Button variant="outline" onClick={onHome}>
          {t("duel.go_home")}
        </Button>
      </div>
    </Panel>
  );
}

/**
 * Juego en vivo de un duelo. Deliberadamente NO reusa GameShell (el shell del
 * reto diario): evita cualquier riesgo de tocar su lógica de streak/lock/
 * record() local, que no debe verse afectada por un duelo (no ranked, no
 * cuenta para "jugaste hoy"). Reusa el MISMO GameComponent + useTimer que
 * usa GameShell, con su propio orquestador minimalista.
 */
function DuelPlayScreen({
  duel,
  game,
}: {
  duel: NonNullable<ReturnType<typeof useDuelPolling>["duel"]>;
  game: NonNullable<ReturnType<typeof gameById>>;
}) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [status, setStatus] = useState<GameStatus>("idle");
  const [phase, setPhase] = useState<"connecting" | "playing" | "done" | "error">("connecting");
  const sessionTokenRef = useRef<string | null>(null);
  const finishedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  const handleExpire = () => finish("lost");
  const timer = useTimer({ seconds: duel.timeLimit, onExpire: handleExpire });
  const { start: startTimer } = timer;

  useEffect(() => {
    let cancelled = false;
    // Reintenta si el backend estaba frío (Railway) o hubo un blip de red —
    // mismo patrón (y mismo backoff) que `startGameSession` en GameShell.tsx.
    // Sin esto, un fallo transitorio del PRIMER intento dejaba al usuario
    // trabado en "Cargando…" para siempre (bug reportado: la revancha desde
    // PC nunca arrancaba aunque el rival ya estaba jugando en el celu).
    const tryStart = (attempt: number) => {
      apiStartDuelChallenge(duel.gameId, duel.id).then((res) => {
        if (cancelled) return;
        if (res.ok) {
          sessionTokenRef.current = res.sessionToken;
          startedAtRef.current = Date.now();
          setStatus("playing");
          setPhase("playing");
          startTimer();
        } else if (attempt < 2) {
          window.setTimeout(() => tryStart(attempt + 1), 1500 * (attempt + 1));
        } else {
          setPhase("error");
        }
      }).catch(() => {
        if (cancelled) return;
        if (attempt < 2) {
          window.setTimeout(() => tryStart(attempt + 1), 1500 * (attempt + 1));
        } else {
          setPhase("error");
        }
      });
    };
    tryStart(0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr una vez al montar (arranca la sesión del duelo).
  }, []);

  function finish(outcome: Extract<GameStatus, "won" | "lost">, solution?: Record<string, unknown>) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStatus(outcome);
    setPhase("done");
    const token = sessionTokenRef.current;
    if (token) {
      apiFinishChallenge(duel.gameId, token, solution ?? null).catch(() => {});
    }
  }

  if (phase === "connecting") {
    return <Panel className="text-center text-ink-muted">{t("duel.loading")}</Panel>;
  }
  if (phase === "error") {
    return (
      <Panel className="text-center">
        <p className="text-ink-muted">{t("duel.error_start")}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(homePath(locale))}>
            {t("duel.go_home")}
          </Button>
        </div>
      </Panel>
    );
  }

  const GameComponent = game.component;
  return (
    <div className="space-y-4">
      <div className="panel flex items-center justify-between gap-3 px-4 py-2.5">
        <span className="rounded-md border border-white/10 bg-asphalt-700 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-ink-muted">
          {t(`diff.${duel.difficulty}`)}
        </span>
        {duel.timeLimit !== null && <TimerDisplay secondsLeft={timer.secondsLeft} total={duel.timeLimit} />}
      </div>

      {phase === "done" ? (
        <Panel className="text-center text-ink-muted">{t("duel.waiting_finish")}</Panel>
      ) : (
        <GameComponent
          difficulty={duel.difficulty as Difficulty}
          date={new Date()}
          seed={duel.id}
          timeLimit={duel.timeLimit}
          secondsLeft={timer.secondsLeft}
          status={status}
          onWin={(solution) => finish("won", solution)}
          onLose={(solution) => finish("lost", solution)}
        />
      )}
    </div>
  );
}
