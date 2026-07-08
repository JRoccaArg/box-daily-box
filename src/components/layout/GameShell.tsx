import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Difficulty, GameDefinition, GameStatus } from "@/types";
import { useStats } from "@/context/StatsContext";
import { useI18n } from "@/context";
import { computeScore } from "@/lib/scoring";
import { apiStartChallenge, apiFinishChallenge } from "@/lib/api";
import { isIdentityComplete } from "@/lib/identity";
import { updateServerPoints, saveSolution } from "@/lib/stats";
import { emit, Events } from "@/lib/events";
import { IdentityModal } from "@/components/layout/IdentityModal";
import { homePath } from "@/lib/routes";
import { useTimer } from "@/hooks/useTimer";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TimerDisplay } from "@/components/ui/TimerDisplay";
import { Modal } from "@/components/ui/Modal";
import {
  ChevronLeft,
  Trophy,
  Flag as FlagIcon,
  Lock,
  Timer as TimerIcon,
} from "@/components/ui/Icon";

type Phase = "config" | "playing" | "finished";

type GameShellProps = {
  game: GameDefinition;
  /** Fecha del reto. Por defecto hoy. Inyectable para pruebas. */
  date?: Date;
};

/**
 * Contenedor que envuelve a CADA juego y centraliza lo comun:
 *  - Seleccion de dificultad y tiempo (segun la definicion del juego).
 *  - Cronometro y boton de rendirse.
 *  - Registro de resultado (idempotente por dia) y modal de cierre.
 *  - Bloqueo cuando el reto del dia ya fue jugado.
 *
 * Cada juego solo implementa su logica y recibe `GameProps`. Asi se evita
 * duplicar el andamiaje y se mantiene un contrato unico y estable.
 */
export function GameShell({ game, date = new Date() }: GameShellProps) {
  const { record, playedStatus, refreshStats } = useStats();
  const { t, locale } = useI18n();
  const lockedStatus = playedStatus(game.id, date);

  // Dificultad inicial: la primera permitida por el juego.
  const [difficulty, setDifficulty] = useState<Difficulty>(game.difficulties[0] ?? "medio");

  // Opciones de tiempo derivadas de la config del juego.
  const timeOptions = useMemo<number[]>(() => {
    if (game.timer.kind === "choice") return game.timer.options;
    if (game.timer.kind === "fixed") return [game.timer.seconds];
    return [];
  }, [game.timer]);

  const [chosenTime, setChosenTime] = useState<number | null>(timeOptions[0] ?? null);

  const [phase, setPhase] = useState<Phase>("config");
  const [status, setStatus] = useState<GameStatus>("idle");
  const [resultOpen, setResultOpen] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  // Modal de confirmacion para abandonar (al tocar "Volver" mientras juega).
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  // Modal de identidad (si el usuario no configuró nombre/pais).
  const [identityOpen, setIdentityOpen] = useState(false);
  // true si el resultado NO entró al ranking (otra cuenta de la IP ya jugó).
  const [notRanked, setNotRanked] = useState(false);
  const navigate = useNavigate();

  // Evita doble registro (rendirse + expiracion simultaneos, p.ej.).
  const finishedRef = useRef(false);
  // Token de sesión del servidor (para verificación server-side).
  const sessionTokenRef = useRef<string | null>(null);
  // Ref al contenedor del tablero (para scroll al "Ver el tablero").
  const boardRef = useRef<HTMLDivElement | null>(null);

  const timeLimit = game.timer.kind === "none" ? null : chosenTime;

  // Datos para el puntaje (dificultad, limite y arranque). En un ref para que
  // los callbacks memoizados y los listeners de abandono lean siempre lo actual.
  const scoreRef = useRef<{
    difficulty: Difficulty;
    timeLimit: number | null;
    startedAt: number | null;
  }>({ difficulty, timeLimit, startedAt: null });
  useEffect(() => {
    scoreRef.current.difficulty = difficulty;
    scoreRef.current.timeLimit = timeLimit;
  }, [difficulty, timeLimit]);

  /** Arma la meta del resultado (dificultad, tiempo usado y limite). */
  const buildMeta = useCallback((): Record<string, number | string> => {
    const { difficulty: diff, timeLimit: lim, startedAt } = scoreRef.current;
    const meta: Record<string, number | string> = { difficulty: diff };
    if (startedAt != null) {
      meta.timeSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    }
    if (lim != null) meta.timeLimit = lim;
    return meta;
  }, []);

  const maxTimeOption = useMemo(
    () => game.timer.kind === "choice" ? Math.max(...game.timer.options) : undefined,
    [game.timer],
  );

  const finish = useCallback(
    (outcome: Extract<GameStatus, "won" | "lost">, solution?: Record<string, unknown>) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setStatus(outcome);
      setPhase("finished");
      const meta = buildMeta();
      record(game.id, outcome, meta, date);
      // Guardar la solution para poder re-verificarla en el server si el
      // usuario se loguea más tarde (importación de intentos locales).
      saveSolution(game.id, solution ?? null, date);
      setPointsEarned(
        computeScore({
          won: outcome === "won",
          difficulty: scoreRef.current.difficulty,
          timeSeconds: typeof meta.timeSeconds === "number" ? meta.timeSeconds : null,
          timeLimit: scoreRef.current.timeLimit,
          maxTimeOption,
        }),
      );

      const token = sessionTokenRef.current;
      if (token) {
        apiFinishChallenge(game.id, token, solution ?? null)
          .then((res) => {
            if (res && typeof res.points === "number") {
              updateServerPoints(game.id, res.points, date);
              setPointsEarned(res.points);
              refreshStats();
            }
            if (res && res.ranked === false) {
              setNotRanked(true);
            }
          })
          .catch(() => {});
      }

      window.setTimeout(() => setResultOpen(true), 650);
    },
    [game.id, record, date, buildMeta, refreshStats, maxTimeOption],
  );

  // -----------------------------------------------------------------
  // Abandono = derrota.
  //
  // CRITICO: cualquier camino de derrota (rendirse, timeout, o abandono por
  // navegacion/cierre) debe persistir en el server, no solo en localStorage.
  // Si no, el lock local `played` bloquea re-jugar el reto, pero el server
  // nunca se entera del intento — al desloguearse y borrar localStorage (o
  // simplemente en otro dispositivo), el reto reaparece como no jugado y
  // deja re-jugarlo. `persistAbandon` es el unico punto de salida para los
  // 3 caminos de abandono (leave-confirm, unmount, beforeunload) y por eso
  // llama a apiFinishChallenge igual que `finish()`.
  // -----------------------------------------------------------------
  const abandonRef = useRef<{ active: boolean; gameId: string; date: Date }>({
    active: false,
    gameId: game.id,
    date,
  });
  useEffect(() => {
    abandonRef.current = {
      active: phase === "playing" && !finishedRef.current,
      gameId: game.id,
      date,
    };
  }, [phase, game.id, date]);

  const persistAbandon = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    abandonRef.current.active = false;
    record(game.id, "lost", buildMeta(), date);

    const token = sessionTokenRef.current;
    if (token) {
      apiFinishChallenge(game.id, token, null).catch(() => {});
    }
  }, [game.id, record, buildMeta, date]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!abandonRef.current.active) return;
      persistAbandon();
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [persistAbandon]);

  useEffect(() => {
    return () => {
      if (abandonRef.current.active) {
        persistAbandon();
      }
    };
  }, [persistAbandon]);

  const handleExpire = useCallback(() => finish("lost"), [finish]);

  const timer = useTimer({ seconds: timeLimit, onExpire: handleExpire });
  const { start: startTimer, pause: pauseTimer, reset: resetTimer } = timer;

  useEffect(() => {
    if (phase === "playing") startTimer();
    else pauseTimer();
  }, [phase, startTimer, pauseTimer]);

  const beginPlaying = () => {
    if (!isIdentityComplete()) {
      setIdentityOpen(true);
      return;
    }
    startGameSession();
  };

  const startGameSession = () => {
    finishedRef.current = false;
    const localStart = Date.now();
    scoreRef.current.startedAt = localStart;
    resetTimer(timeLimit);
    setStatus("playing");
    setPhase("playing");

    // Reintenta si el backend estaba frio (Railway) o hubo un blip de red:
    // sin sessionToken, ni `finish()` ni `persistAbandon()` pueden reportar
    // el intento al server (quedaria solo en localStorage).
    const tryStart = (attempt: number) => {
      apiStartChallenge(game.id, difficulty, timeLimit).then((res) => {
        if (res.ok) {
          sessionTokenRef.current = res.sessionToken;
          if (typeof res.serverNow === "number") {
            const rtt = Date.now() - localStart;
            scoreRef.current.startedAt = localStart + Math.round(rtt / 2);
          }
        } else if (attempt < 2 && !finishedRef.current) {
          window.setTimeout(() => tryStart(attempt + 1), 1500 * (attempt + 1));
        }
      }).catch(() => {
        if (attempt < 2 && !finishedRef.current) {
          window.setTimeout(() => tryStart(attempt + 1), 1500 * (attempt + 1));
        }
      });
    };
    tryStart(0);
  };

  const handleIdentitySaved = () => {
    setIdentityOpen(false);
    if (isIdentityComplete()) {
      startGameSession();
    }
  };

  const onWin = useCallback(
    (solution?: Record<string, unknown>) => finish("won", solution),
    [finish],
  );
  const onLose = useCallback(
    (solution?: Record<string, unknown>) => finish("lost", solution),
    [finish],
  );

  // -----------------------------------------------------------------
  // Vista: reto ya jugado hoy (bloqueado hasta manana).
  // -----------------------------------------------------------------
  if (lockedStatus && phase === "config") {
    const won = lockedStatus === "won";
    return (
      <div className="space-y-4">
        <BackLink />
        <Panel className="text-center">
          <div
            className={[
              "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full",
              won ? "bg-sector-green/15 text-sector-green" : "bg-racing/15 text-racing-400",
            ].join(" ")}
          >
            {won ? <Trophy size={26} /> : <FlagIcon size={26} />}
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            {t(`game.${game.id}.name`)}
          </h1>
          <p className="mt-1 text-ink-muted">
            {won ? t("locked.won") : t("locked.lost")}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-asphalt-700 px-4 py-2 text-sm text-ink-muted">
            <Lock size={15} />
            {t("locked.wait")}
          </div>
          <div className="mt-6">
            <Link to={homePath(locale)}>
              <Button variant="outline">{t("result.go_home")}</Button>
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Vista: configuracion previa (dificultad + tiempo).
  // -----------------------------------------------------------------
  if (phase === "config") {
    const showDifficulty = game.difficulties.length > 1;
    const showTimeChoice = game.timer.kind === "choice";

    return (
      <div className="space-y-4">
        <BackLink />
        <Panel>
          <div className="speed-bar mb-1 pl-1">
            <p className="eyebrow">{game.glyph} &middot; {t("shell.daily_challenge")}</p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white">
            {t(`game.${game.id}.name`)}
          </h1>
          <p className="mt-1.5 max-w-prose text-ink-muted">
            {t(`game.${game.id}.tagline`)}
          </p>

          {showDifficulty && (
            <section className="mt-6">
              <label className="eyebrow mb-2 block">{t("shell.difficulty")}</label>
              <SegmentedControl
                aria-label={t("shell.difficulty")}
                stacked
                value={difficulty}
                onChange={setDifficulty}
                options={game.difficulties.map((d) => ({
                  value: d,
                  label: t(`diff.${d}`),
                  hint: t(`diff.hint.${d}`),
                }))}
              />
            </section>
          )}

          {showTimeChoice && (
            <section className="mt-6">
              <label className="eyebrow mb-2 block">{t("shell.time")}</label>
              <SegmentedControl
                aria-label={t("shell.time")}
                value={chosenTime ?? timeOptions[0] ?? 0}
                onChange={(v) => setChosenTime(v)}
                options={timeOptions.map((s) => ({
                  value: s,
                  label: `${s}s`,
                }))}
              />
            </section>
          )}

          {game.timer.kind === "fixed" && (
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-ink-muted">
              <TimerIcon size={15} />
              {t("shell.time_limit", { seconds: game.timer.seconds })}
            </p>
          )}
          {game.timer.kind === "none" && (
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-ink-muted">
              <TimerIcon size={15} />
              {t("shell.no_time_limit")}
            </p>
          )}

          <div className="mt-7">
            <Button size="lg" block onClick={beginPlaying}>
              {t("shell.start")}
            </Button>
          </div>
        </Panel>

        <IdentityModal open={identityOpen} onClose={handleIdentitySaved} />
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Vista: en juego / terminado.
  // -----------------------------------------------------------------
  const GameComponent = game.component;
  const won = status === "won";

  return (
    <div className="space-y-4">
      <ControlBar
        difficulty={difficulty}
        secondsLeft={timer.secondsLeft}
        totalSeconds={timeLimit}
        status={status}
        onSurrender={() => finish("lost")}
        onBackRequest={() => {
          if (phase === "playing") setLeaveConfirmOpen(true);
          else navigate(homePath(locale));
        }}
      />

      <div ref={boardRef}>
        <GameComponent
          difficulty={difficulty}
          date={date}
          timeLimit={timeLimit}
          secondsLeft={timer.secondsLeft}
          status={status}
          onWin={onWin}
          onLose={onLose}
        />
      </div>

      {phase === "finished" && (
        <ResultBanner won={won} onOpen={() => setResultOpen(true)} />
      )}

      {/* Confirmacion al intentar abandonar mientras juega. */}
      <Modal
        open={leaveConfirmOpen}
        onClose={() => setLeaveConfirmOpen(false)}
        title={t("leave.title")}
      >
        <p className="text-sm text-ink-muted">
          {t("leave.msg")}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            variant="danger"
            block
            onClick={() => {
              setLeaveConfirmOpen(false);
              persistAbandon();
              navigate(homePath(locale));
            }}
          >
            {t("leave.confirm")}
          </Button>
          <Button variant="ghost" block onClick={() => setLeaveConfirmOpen(false)}>
            {t("leave.cancel")}
          </Button>
        </div>
      </Modal>

      <Modal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title={won ? t("result.won_title") : t("result.lost_title")}
      >
        <div className="text-center">
          <div
            className={[
              "mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full",
              won ? "bg-sector-green/15 text-sector-green" : "bg-racing/15 text-racing-400",
            ].join(" ")}
          >
            {won ? <Trophy size={30} /> : <FlagIcon size={30} />}
          </div>
          <p className="text-lg font-semibold text-white">
            {won ? t("result.won_msg") : t("result.lost_msg")}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {won ? t("result.won_sub") : t("result.lost_sub")}
          </p>

          {won && pointsEarned > 0 && (
            <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-sector-yellow/30 bg-sector-yellow/10 px-4 py-1.5">
              <Trophy size={16} />
              <span className="tnum font-display text-lg text-white">+{pointsEarned}</span>
              <span className="text-xs text-ink-muted">{t("result.points")}</span>
            </div>
          )}

          {notRanked && (
            <p className="mx-auto mt-3 max-w-xs text-xs text-ink-faint">
              {t("result.not_ranked")}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2">
            <Button
              variant="outline"
              block
              onClick={() => {
                setResultOpen(false);
                window.setTimeout(() => {
                  boardRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 200);
              }}
            >
              {t("result.view_board")}
            </Button>
            <Button
              variant="outline"
              block
              onClick={() => {
                setResultOpen(false);
                window.setTimeout(() => emit(Events.OPEN_STATS), 200);
              }}
            >
              {t("result.view_ranking")}
            </Button>
            <Link to={homePath(locale)} className="block">
              <Button variant="ghost" block>
                {t("result.go_home")}
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-ink-faint">{t("result.come_back")}</p>
        </div>
      </Modal>

      {/* Modal de identidad (primera vez) */}
      <IdentityModal open={identityOpen} onClose={handleIdentitySaved} />
    </div>
  );
}

/* ===================================================================== */
/* Subcomponentes locales                                                 */
/* ===================================================================== */

function BackLink() {
  const { t, locale } = useI18n();
  return (
    <Link
      to={homePath(locale)}
      className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <ChevronLeft size={16} />
      {t("shell.back")}
    </Link>
  );
}

function ControlBar({
  difficulty,
  secondsLeft,
  totalSeconds,
  status,
  onSurrender,
  onBackRequest,
}: {
  difficulty: Difficulty;
  secondsLeft: number | null;
  totalSeconds: number | null;
  status: GameStatus;
  onSurrender: () => void;
  onBackRequest: () => void;
}) {
  const { t } = useI18n();
  const [confirm, setConfirm] = useState(false);
  const playing = status === "playing";

  return (
    <div className="panel flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackRequest}
          aria-label={t("shell.back_label")}
          className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="rounded-md border border-white/10 bg-asphalt-700 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-ink-muted">
          {t(`diff.${difficulty}`)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {totalSeconds !== null && (
          <TimerDisplay secondsLeft={secondsLeft} total={totalSeconds} />
        )}

        {playing &&
          (confirm ? (
            <span className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={onSurrender}>
                {t("shell.surrender")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                {t("shell.no")}
              </Button>
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
              {t("shell.surrender")}
            </Button>
          ))}
      </div>
    </div>
  );
}

function ResultBanner({ won, onOpen }: { won: boolean; onOpen: () => void }) {
  const { t } = useI18n();
  return (
    <button
      onClick={onOpen}
      className={[
        "w-full rounded-xl border px-4 py-3 text-left transition-colors",
        won
          ? "border-sector-green/30 bg-sector-green/10 hover:bg-sector-green/15"
          : "border-racing/30 bg-racing/10 hover:bg-racing/15",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className={["font-semibold", won ? "text-sector-green" : "text-racing-400"].join(" ")}>
          {won ? t("banner.won") : t("banner.lost")}
        </span>
        <span className="text-xs text-ink-muted">{t("banner.summary")}</span>
      </div>
    </button>
  );
}
