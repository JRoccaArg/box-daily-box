// src/pages/ChallengePage.tsx
//
// Ruta /:lang/reto/:challengeId — el DESAFÍO POR LINK (Etapa 3; backend en
// src/api/challenges.ts). Quien abre el link ve el resultado de quien lo
// compartió, juega el MISMO minijuego con la misma dificultad y el mismo
// tiempo pero con un reto generado para él, y al terminar ve la comparación.
//
// Igual que DuelPage: no se prerenderiza ni entra al sitemap (el id es
// dinámico; vercel.json reescribe la ruta al HTML de "/:lang"), y el juego en
// vivo NO reusa GameShell sino un orquestador propio con el mismo
// GameComponent + useTimer. La diferencia con un duelo: esta partida PUEDE ser
// el reto oficial del día de quien la juega (si todavía no jugó ese juego), y
// en ese caso sí se registra en sus stats locales, como en GameShell.

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { useI18n } from "@/context";
import { useStats } from "@/context/StatsContext";
import {
  apiFinishSharedChallenge,
  apiGetSharedChallenge,
  apiStartSharedChallenge,
  type ChallengeOutcome,
  type OwnerResult,
  type SharedChallenge,
  type SharedChallengeViewer,
} from "@/lib/api";
import { isIdentityComplete } from "@/lib/identity";
import { updateServerPoints } from "@/lib/stats";
import { computeScore } from "@/lib/scoring";
import { formatClock } from "@/lib/share";
import { showToast } from "@/lib/toast";
import { announceAchievements } from "@/lib/achievements";
import { playGameResultFeedback } from "@/lib/audio";
import { getEffectiveNow } from "@/lib/debugDate";
import { setGameplayActive } from "@/lib/gameplayState";
import { setNavGuard } from "@/lib/navGuard";
import { trackEvent } from "@/lib/analytics";
import { challengeSharePath, homePath } from "@/lib/routes";
import { gameById } from "@/components/games/registry";
import { useTimer } from "@/hooks/useTimer";
import { IdentityModal } from "@/components/layout/IdentityModal";
import { emit, Events } from "@/lib/events";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Flag } from "@/components/ui/Flag";
import { TimerDisplay } from "@/components/ui/TimerDisplay";
import { ChevronLeft, Flag as FlagIcon, Swords, Trophy } from "@/components/ui/Icon";
import type { Difficulty, GameStatus } from "@/types";

type Game = NonNullable<ReturnType<typeof gameById>>;

type Loaded =
  | { kind: "loading" }
  | { kind: "network" }
  | { kind: "not_found" }
  | { kind: "ready"; challenge: SharedChallenge; viewer?: SharedChallengeViewer; game: Game };

/** Resultado propio que se muestra en la pantalla final. */
type MyResult = {
  won: boolean;
  points: number;
  timeSeconds: number | null;
  outcome: ChallengeOutcome;
  countedAsDaily: boolean;
  ranked: boolean;
  /**
   * Resultado del dueño contra el que se jugó. Puede diferir del que muestra
   * hoy el desafío: si el dueño ganó después su segunda oportunidad, el link
   * cambia, pero esta comparación no.
   */
  opponent?: OwnerResult;
};

/** Misma regla que el server (compareOutcome en src/api/challenges.ts). Solo
 *  se usa si el finish no llegó a responder, para no dejar la pantalla vacía. */
function localOutcome(mine: { won: boolean; points: number }, theirs: { won: boolean; points: number }): ChallengeOutcome {
  if (mine.won !== theirs.won) return mine.won ? "won" : "lost";
  if (mine.points === theirs.points) return "tied";
  return mine.points > theirs.points ? "won" : "lost";
}

export function ChallengePage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState<Loaded>({ kind: "loading" });
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [result, setResult] = useState<MyResult | null>(null);
  const [identityOpen, setIdentityOpen] = useState(false);

  const load = useCallback(async () => {
    if (!challengeId) {
      setLoaded({ kind: "not_found" });
      return;
    }
    setLoaded({ kind: "loading" });
    const res = await apiGetSharedChallenge(challengeId);
    if (res === undefined) return setLoaded({ kind: "network" });
    const game = res ? gameById(res.challenge.gameId) : undefined;
    if (!res || !game) return setLoaded({ kind: "not_found" });
    setLoaded({ kind: "ready", challenge: res.challenge, viewer: res.viewer, game });
  }, [challengeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = () => {
    // Misma exigencia que el reto diario: esta partida puede entrar al
    // ranking, y ahí se muestra con nombre y país.
    if (!isIdentityComplete()) {
      setIdentityOpen(true);
      return;
    }
    setPhase("playing");
  };

  return (
    <div className="space-y-4">
      <Head defer={false}>
        <title>Box Daily Box — {t("challenge.page_title")}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {loaded.kind === "loading" && (
        <Panel className="text-center text-ink-muted">{t("challenge.loading")}</Panel>
      )}

      {loaded.kind === "network" && (
        <Panel className="text-center">
          <p className="text-ink-muted">{t("challenge.error_network")}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={() => void load()}>{t("challenge.retry")}</Button>
            <Button variant="ghost" onClick={() => navigate(homePath(locale))}>
              {t("result.go_home")}
            </Button>
          </div>
        </Panel>
      )}

      {loaded.kind === "not_found" && (
        <Panel className="text-center">
          <p className="text-ink-muted">{t("challenge.not_found")}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(homePath(locale))}>
              {t("result.go_home")}
            </Button>
          </div>
        </Panel>
      )}

      {loaded.kind === "ready" && (() => {
        const { challenge, viewer, game } = loaded;
        if (viewer?.isOwner) return <OwnChallenge challenge={challenge} />;
        if (phase === "result" && result) {
          return <ChallengeResult challenge={challenge} mine={result} />;
        }
        if (viewer?.play) {
          return (
            <ChallengeResult
              challenge={challenge}
              mine={{ ...viewer.play, countedAsDaily: false, ranked: false }}
            />
          );
        }
        if (phase === "playing") {
          return (
            <ChallengePlayScreen
              challenge={challenge}
              game={game}
              onDone={(r) => {
                setResult(r);
                setPhase("result");
              }}
              onBlocked={() => {
                // El server dice que es propio o que ya lo jugó (p. ej. en otra
                // pestaña): recargar muestra la pantalla que corresponde.
                setPhase("intro");
                void load();
              }}
            />
          );
        }
        return <ChallengeIntro challenge={challenge} viewer={viewer} onAccept={accept} />;
      })()}

      <IdentityModal
        open={identityOpen}
        onClose={() => {
          setIdentityOpen(false);
          if (isIdentityComplete()) setPhase("playing");
        }}
      />
    </div>
  );
}

// ─── Piezas visuales ─────────────────────────────────────────────────

function ownerName(challenge: SharedChallenge, t: (k: string) => string): string {
  return challenge.owner.displayName?.trim() || t("challenge.someone");
}

/** Chips con las condiciones fijas: dificultad y tiempo. */
function Conditions({ challenge }: { challenge: SharedChallenge }) {
  const { t } = useI18n();
  const chip =
    "rounded-md border border-white/10 bg-asphalt-700 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-ink-muted";
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className={chip}>{t(`diff.${challenge.difficulty}`)}</span>
      <span className={chip}>
        {challenge.untimed || challenge.timeLimit === null ? t("shell.untimed") : `${challenge.timeLimit}s`}
      </span>
    </div>
  );
}

/** La grilla de emojis de quien compartió (decorativa, validada por el server). */
function ShareGridBlock({ challenge }: { challenge: SharedChallenge }) {
  const { t } = useI18n();
  if (!challenge.grid || challenge.grid.length === 0) return null;
  return (
    <div
      className="mx-auto inline-block rounded-lg border border-white/10 bg-asphalt-800 px-4 py-3 text-left font-mono text-lg leading-snug"
      aria-hidden="true"
    >
      {challenge.gameId === "pittexto" && (
        <div className="mb-1 text-[11px] tracking-wider text-ink-faint">{t("share.pittexto_legend")}</div>
      )}
      {challenge.grid.map((row, i) => (
        <div key={i} className="whitespace-pre">{row}</div>
      ))}
    </div>
  );
}

/** "Lo resolvió en 0:48 y sumó 312 puntos." / "No logró resolverlo." */
function theirResultLine(challenge: SharedChallenge, t: (k: string, v?: Record<string, string | number>) => string) {
  if (!challenge.won) return t("challenge.their_lost");
  if (challenge.untimed || challenge.timeSeconds === null) {
    return t("challenge.their_won_untimed", { points: challenge.points });
  }
  return t("challenge.their_won", { time: formatClock(challenge.timeSeconds), points: challenge.points });
}

function ChallengeIntro({
  challenge,
  viewer,
  onAccept,
}: {
  challenge: SharedChallenge;
  viewer?: SharedChallengeViewer;
  onAccept: () => void;
}) {
  const { t } = useI18n();
  const gameName = t(`game.${challenge.gameId}.name`);
  // Sin identidad verificada (visitante nuevo) todavía no jugó nada hoy, así
  // que la partida sería su reto oficial.
  const countsAsDaily = viewer ? viewer.willCountAsDaily : true;

  return (
    <Panel className="text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-racing/15 text-racing-400">
        <Swords size={26} />
      </div>
      <p className="eyebrow">{gameName}</p>
      <h1 className="mt-1 flex items-center justify-center gap-2 font-display text-2xl font-bold text-white">
        {challenge.owner.countryCode && <Flag code={challenge.owner.countryCode} size="md" />}
        <span>{t("challenge.invite_title", { name: ownerName(challenge, t) })}</span>
      </h1>

      <div className="mt-5">
        <ShareGridBlock challenge={challenge} />
      </div>
      <p className="mt-4 text-ink">{theirResultLine(challenge, t)}</p>

      <div className="mt-4">
        <Conditions challenge={challenge} />
      </div>

      <p className="mt-6 font-display text-3xl font-extrabold text-white">{t("challenge.can_you_beat")}</p>

      <p className="mx-auto mt-3 max-w-sm text-sm text-ink-muted">{t("challenge.new_puzzle_note")}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-faint">
        {countsAsDaily
          ? t("challenge.counts_note", { game: gameName })
          : t("challenge.extra_note", { game: gameName })}
      </p>

      <div className="mt-6">
        <Button size="lg" block onClick={onAccept}>
          {t("challenge.accept")}
        </Button>
      </div>
    </Panel>
  );
}

function OwnChallenge({ challenge }: { challenge: SharedChallenge }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const url = `${window.location.origin}${challengeSharePath(challenge.id)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      showToast(t("challenge.link_copied"), "success");
    } catch {
      showToast(t("share.error"), "error");
    }
  }

  return (
    <Panel className="text-center">
      <p className="eyebrow">{t(`game.${challenge.gameId}.name`)}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-white">{t("challenge.own_title")}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
        {t("challenge.own_body", { game: t(`game.${challenge.gameId}.name`) })}
      </p>
      <div className="mt-5">
        <ShareGridBlock challenge={challenge} />
      </div>
      <p className="mt-4 break-all font-mono text-xs text-ink-faint">{url}</p>
      <div className="mt-5 flex flex-col gap-2">
        <Button block onClick={() => void copy()}>{t("challenge.copy_link")}</Button>
        <Button variant="ghost" block onClick={() => navigate(homePath(locale))}>
          {t("result.go_home")}
        </Button>
      </div>
    </Panel>
  );
}

function ResultRow({
  label,
  won,
  timeSeconds,
  points,
  highlight,
}: {
  label: string;
  won: boolean;
  timeSeconds: number | null;
  points: number;
  highlight: boolean;
}) {
  const { t } = useI18n();
  return (
    <div
      className={[
        "flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5",
        highlight ? "border-sector-green/40 bg-sector-green/10" : "border-white/10 bg-asphalt-700",
      ].join(" ")}
    >
      <span className="min-w-0 truncate text-sm font-semibold text-ink">{label}</span>
      <span className="flex shrink-0 items-center gap-3 font-mono text-xs text-ink-muted">
        <span>{won ? t("challenge.solved") : t("challenge.not_solved")}</span>
        {timeSeconds !== null && <span>{formatClock(timeSeconds)}</span>}
        <span className="text-ink">{t("challenge.points_short", { points })}</span>
      </span>
    </div>
  );
}

function ChallengeResult({ challenge, mine }: { challenge: SharedChallenge; mine: MyResult }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const name = ownerName(challenge, t);
  const theirs = mine.opponent ?? challenge;
  const title =
    mine.outcome === "won"
      ? t("challenge.outcome_won", { name })
      : mine.outcome === "lost"
        ? t("challenge.outcome_lost", { name })
        : t("challenge.outcome_tied", { name });
  const color =
    mine.outcome === "won" ? "text-sector-green" : mine.outcome === "lost" ? "text-racing-400" : "text-sector-yellow";
  const badge =
    mine.outcome === "won"
      ? "bg-sector-green/15 text-sector-green"
      : mine.outcome === "lost"
        ? "bg-racing/15 text-racing-400"
        : "bg-sector-yellow/15 text-sector-yellow";

  return (
    <Panel className="text-center">
      <div className={["mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full", badge].join(" ")}>
        {mine.outcome === "won" ? <Trophy size={26} /> : <FlagIcon size={26} />}
      </div>
      <h1 className={["font-display text-2xl font-bold", color].join(" ")}>{title}</h1>
      <p className="mt-1 text-ink-muted">{t(`game.${challenge.gameId}.name`)}</p>

      <div className="mt-5 space-y-2 text-left">
        <ResultRow
          label={t("challenge.you")}
          won={mine.won}
          timeSeconds={challenge.untimed ? null : mine.timeSeconds}
          points={mine.points}
          highlight={mine.outcome === "won"}
        />
        <ResultRow
          label={name}
          won={theirs.won}
          timeSeconds={challenge.untimed ? null : theirs.timeSeconds}
          points={theirs.points}
          highlight={mine.outcome === "lost"}
        />
      </div>

      {mine.countedAsDaily && !mine.ranked && (
        <p className="mt-4 text-sm text-ink-faint">{t("result.not_ranked")}</p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <Button size="lg" block onClick={() => navigate(homePath(locale))}>
          {t("challenge.play_more")}
        </Button>
      </div>
    </Panel>
  );
}

// ─── Partida en vivo ─────────────────────────────────────────────────

/**
 * Orquestador de la partida del desafío. Mismo esqueleto que DuelPlayScreen
 * (arranque con reintentos, timer, cartel de "¿salir?") y las MISMAS garantías
 * de abandono que GameShell: salir, cerrar la pestaña o navegar afuera cierra
 * la partida como derrota en el server. Sin eso, alguien podría mirar el reto,
 * cerrar, pensarlo con calma y volver: el server le devolvería el mismo reto
 * con el reloj en cero.
 */
function ChallengePlayScreen({
  challenge,
  game,
  onDone,
  onBlocked,
}: {
  challenge: SharedChallenge;
  game: Game;
  onDone: (r: MyResult) => void;
  onBlocked: () => void;
}) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { record, refreshStats } = useStats();
  const [status, setStatus] = useState<GameStatus>("idle");
  const [phase, setPhase] = useState<"connecting" | "playing" | "sending" | "error">("connecting");
  const [seed, setSeed] = useState<string | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const sessionTokenRef = useRef<string | null>(null);
  const countsAsDailyRef = useRef(false);
  const finishedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const timeLimit = challenge.untimed ? null : challenge.timeLimit;
  const difficulty = challenge.difficulty as Difficulty;
  // Fecha del día en que se juega (para las stats locales, si cuenta como reto).
  const playDateRef = useRef<Date>(getEffectiveNow());

  const elapsed = () =>
    startedAtRef.current === null ? 0 : Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000));

  /** Registro local del reto del día (misma forma que GameShell). */
  const recordLocal = useCallback(
    (outcome: "won" | "lost", timeSeconds: number) => {
      const meta: Record<string, number | string> = { difficulty, timeSeconds };
      if (timeLimit !== null) meta.timeLimit = timeLimit;
      if (challenge.untimed) meta.untimed = 1;
      record(game.id, outcome, meta, playDateRef.current);
    },
    [difficulty, timeLimit, challenge.untimed, record, game.id],
  );

  const finish = useCallback(
    (outcome: "won" | "lost", solution?: Record<string, unknown>) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setStatus(outcome);
      setPhase("sending");
      playGameResultFeedback(outcome === "won");
      const timeSeconds = elapsed();
      trackEvent("challenge_completed", { gameId: game.id, outcome });

      // Resultado local de respaldo, por si el finish no llega a responder.
      const fallbackPoints = computeScore({
        won: outcome === "won",
        difficulty,
        timeSeconds,
        timeLimit,
        untimed: challenge.untimed,
      });
      const fallback: MyResult = {
        won: outcome === "won",
        points: fallbackPoints,
        timeSeconds,
        outcome: localOutcome({ won: outcome === "won", points: fallbackPoints }, challenge),
        countedAsDaily: false,
        ranked: false,
      };

      const token = sessionTokenRef.current;
      if (!token) {
        onDone(fallback);
        return;
      }
      apiFinishSharedChallenge(game.id, token, solution ?? null)
        .then((res) => {
          if (!res) return onDone(fallback);
          // Solo si el SERVER confirmó que quedó como su reto oficial se marca
          // en las stats locales (que bloquean re-jugar ese juego hoy).
          if (res.countedAsDaily) {
            recordLocal(res.won ? "won" : "lost", res.timeSeconds);
            updateServerPoints(game.id, res.points, playDateRef.current);
            refreshStats();
          }
          announceAchievements(res.newAchievements, t);
          // Si esta partida le dio una vida, refrescar donde se muestren.
          if (res.lifeEarned) emit(Events.LIVES_CHANGED);
          onDone({
            won: res.won,
            points: res.points,
            timeSeconds: res.timeSeconds,
            outcome: res.outcome,
            countedAsDaily: res.countedAsDaily,
            ranked: res.ranked,
            opponent: res.opponent,
          });
        })
        .catch(() => onDone(fallback));
    },
    [game.id, difficulty, timeLimit, challenge, onDone, recordLocal, refreshStats, t],
  );

  const timer = useTimer({ seconds: timeLimit, onExpire: () => finish("lost") });
  const { start: startTimer } = timer;

  // Abandono por cierre de pestaña / navegación afuera / desmontaje: cuenta
  // como derrota en el server (keepalive), igual que persistAbandon en GameShell.
  const abandon = useCallback(() => {
    if (finishedRef.current || !sessionTokenRef.current) return;
    finishedRef.current = true;
    if (countsAsDailyRef.current) recordLocal("lost", elapsed());
    apiFinishSharedChallenge(game.id, sessionTokenRef.current, null).catch(() => {});
  }, [game.id, recordLocal]);

  // El listener se registra UNA sola vez y llama siempre a la versión más
  // reciente vía ref. Si el efecto dependiera de `abandon`, cualquier cambio de
  // identidad de esa función (p. ej. al refrescarse las stats) correría el
  // cleanup en plena partida y la daría por perdida.
  const abandonRef = useRef(abandon);
  abandonRef.current = abandon;
  useEffect(() => {
    const onBeforeUnload = () => abandonRef.current();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      abandonRef.current();
    };
  }, []);

  // Mientras se juega: silenciar el banner de duelos y hacer que el logo del
  // header pregunte antes de salir (mismo criterio que DuelPlayScreen).
  useEffect(() => {
    if (phase !== "playing") return;
    setGameplayActive(true);
    setNavGuard(() => setLeaveConfirmOpen(true));
    return () => {
      setGameplayActive(false);
      setNavGuard(null);
    };
  }, [phase]);

  useEffect(() => {
    let cancelled = false;
    // Reintentos ante backend frío o blip de red (mismo backoff que GameShell).
    const tryStart = (attempt: number) => {
      apiStartSharedChallenge(game.id, challenge.id)
        .then((res) => {
          if (cancelled) return;
          if (res.ok) {
            sessionTokenRef.current = res.sessionToken;
            countsAsDailyRef.current = res.countsAsDaily;
            startedAtRef.current = Date.now();
            setSeed(res.seed);
            setStatus("playing");
            setPhase("playing");
            startTimer();
            trackEvent("challenge_started", { gameId: game.id, countsAsDaily: res.countsAsDaily });
          } else if (res.code) {
            onBlocked();
          } else if (attempt < 2) {
            window.setTimeout(() => tryStart(attempt + 1), 1500 * (attempt + 1));
          } else {
            setPhase("error");
          }
        })
        .catch(() => {
          if (cancelled) return;
          if (attempt < 2) window.setTimeout(() => tryStart(attempt + 1), 1500 * (attempt + 1));
          else setPhase("error");
        });
    };
    tryStart(0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- arranca UNA vez al montar.
  }, []);

  function confirmLeave() {
    setLeaveConfirmOpen(false);
    abandon();
    navigate(homePath(locale));
  }

  if (phase === "connecting" || phase === "sending") {
    return (
      <Panel className="text-center text-ink-muted">
        {phase === "connecting" ? t("challenge.starting") : t("challenge.sending")}
      </Panel>
    );
  }
  if (phase === "error" || !seed) {
    return (
      <Panel className="text-center">
        <p className="text-ink-muted">{t("challenge.error_start")}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(homePath(locale))}>
            {t("result.go_home")}
          </Button>
        </div>
      </Panel>
    );
  }

  const GameComponent = game.component;
  return (
    <div className="space-y-4">
      <div className="panel flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLeaveConfirmOpen(true)}
            aria-label={t("shell.back_label")}
            className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="rounded-md border border-white/10 bg-asphalt-700 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-ink-muted">
            {t(`diff.${challenge.difficulty}`)}
          </span>
        </div>
        {timeLimit !== null && <TimerDisplay secondsLeft={timer.secondsLeft} total={timeLimit} />}
      </div>

      <GameComponent
        difficulty={difficulty}
        date={playDateRef.current}
        seed={seed}
        timeLimit={timeLimit}
        secondsLeft={timer.secondsLeft}
        untimed={challenge.untimed}
        status={status}
        onWin={(solution) => finish("won", solution)}
        onLose={(solution) => finish("lost", solution)}
      />

      <Modal open={leaveConfirmOpen} onClose={() => setLeaveConfirmOpen(false)} title={t("leave.title")}>
        <p className="text-sm text-ink-muted">{t("challenge.leave_msg")}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button variant="danger" block onClick={confirmLeave}>
            {t("leave.confirm")}
          </Button>
          <Button variant="ghost" block onClick={() => setLeaveConfirmOpen(false)}>
            {t("leave.cancel")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
