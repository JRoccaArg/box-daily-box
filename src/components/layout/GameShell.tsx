import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Difficulty, GameDefinition, GameStatus } from "@/types";
import { DIFFICULTY_LABEL } from "@/types";
import { useStats } from "@/context/StatsContext";
import { computeScore } from "@/lib/scoring";
import { apiStartChallenge, apiFinishChallenge } from "@/lib/api";
import { isIdentityComplete } from "@/lib/identity";
import { IdentityModal } from "@/components/layout/IdentityModal";
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

/** Texto descriptivo de cada dificultad para la pantalla de configuracion. */
const DIFFICULTY_HINT: Record<Difficulty, string> = {
  facil: "Parrilla reciente (ultimas temporadas)",
  medio: "Era hibrida y V8 (desde 2006)",
  dificil: "Era moderna (desde 1990)",
  leyenda: "Toda la historia de la F1",
};

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
  const { record, playedStatus } = useStats();
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
  const navigate = useNavigate();

  // Evita doble registro (rendirse + expiracion simultaneos, p.ej.).
  const finishedRef = useRef(false);
  // Token de sesión del servidor (para verificación server-side).
  const sessionTokenRef = useRef<string | null>(null);

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

  const finish = useCallback(
    (outcome: Extract<GameStatus, "won" | "lost">, solution?: Record<string, unknown>) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setStatus(outcome);
      setPhase("finished");
      const meta = buildMeta();
      record(game.id, outcome, meta, date);
      setPointsEarned(
        computeScore({
          won: outcome === "won",
          difficulty: scoreRef.current.difficulty,
          timeSeconds: typeof meta.timeSeconds === "number" ? meta.timeSeconds : null,
          timeLimit: scoreRef.current.timeLimit,
        }),
      );

      // Enviar resultado al servidor (fire-and-forget, no bloquea UI).
      // Si el backend falla, el juego sigue funcionando localmente.
      const token = sessionTokenRef.current;
      if (token && solution) {
        apiFinishChallenge(game.id, token, solution).catch(() => {
          // Silencioso: la UX no depende del backend.
        });
      }

      // Pequena pausa para que el usuario vea el tablero final antes del modal.
      window.setTimeout(() => setResultOpen(true), 650);
    },
    [game.id, record, date, buildMeta],
  );

  // -----------------------------------------------------------------
  // Abandono = derrota.
  // Si el jugador ya empezo y se va por cualquier via (cerrar pestana,
  // recargar, navegar atras), el reto cuenta como perdido. Esto se logra:
  //
  //  1) Un ref siempre actualizado con (phase, finishedRef, gameId, date)
  //     para que el cleanup del effect no quede capturando un valor viejo.
  //  2) Un cleanup que, si al desmontar el shell estaba "playing" sin
  //     terminar, llama a record(lost) de forma sincrona. Esto cubre:
  //     navegacion interna (botones, atras del navegador).
  //  3) Listener "beforeunload" que registra la derrota antes de cerrar
  //     la pestana / recargar, y ademas pide confirmacion nativa.
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

  // beforeunload: registra perdida + dispara la advertencia del navegador.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!abandonRef.current.active) return;
      // Registro sincrono (record usa localStorage de forma sincrona).
      record(abandonRef.current.gameId, "lost", buildMeta(), abandonRef.current.date);
      finishedRef.current = true;
      abandonRef.current.active = false;
      e.preventDefault();
      // returnValue no vacio = navegador muestra su prompt nativo.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [record, buildMeta]);

  // Cleanup al desmontar el shell (cambio de ruta, atras del navegador, etc.).
  useEffect(() => {
    return () => {
      if (abandonRef.current.active) {
        record(abandonRef.current.gameId, "lost", buildMeta(), abandonRef.current.date);
      }
    };
  }, [record, buildMeta]);

  const handleExpire = useCallback(() => finish("lost"), [finish]);

  const timer = useTimer({ seconds: timeLimit, onExpire: handleExpire });
  const { start: startTimer, pause: pauseTimer, reset: resetTimer } = timer;

  // Arranca el cronometro al entrar en juego; lo frena al terminar.
  useEffect(() => {
    if (phase === "playing") startTimer();
    else pauseTimer();
  }, [phase, startTimer, pauseTimer]);

  const beginPlaying = () => {
    // Si no configuró perfil, pedir nombre y pais primero.
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

    // Obtener token del servidor (fire-and-forget, no bloquea UI).
    // Al llegar la respuesta, alineamos nuestro startedAt con el serverNow
    // para que el tiempo medido (y por ende los puntos) coincida con el
    // que calcula el backend. Sin esto, la latencia de red hace que el
    // cliente mida ~1-2s de mas y muestre menos puntos que el ranking global.
    apiStartChallenge(game.id, difficulty).then((res) => {
      if (res) {
        sessionTokenRef.current = res.sessionToken;
        if (typeof res.serverNow === "number") {
          // El server empezo a contar en res.serverNow (su reloj). Traducimos
          // ese instante al reloj local usando el offset de ida y vuelta.
          const rtt = Date.now() - localStart;
          scoreRef.current.startedAt = localStart + Math.round(rtt / 2);
        }
      }
    }).catch(() => {});
  };

  /** Callback del modal de identidad: una vez completado, arrancar. */
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
          <h1 className="font-display text-2xl font-bold text-white">{game.name}</h1>
          <p className="mt-1 text-ink-muted">
            {won ? "Ya resolviste el reto de hoy." : "Ya jugaste el reto de hoy."}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-asphalt-700 px-4 py-2 text-sm text-ink-muted">
            <Lock size={15} />
            Vuelve manana para un nuevo desafio
          </div>
          <div className="mt-6">
            <Link to="/">
              <Button variant="outline">Volver al inicio</Button>
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
            <p className="eyebrow">{game.glyph} &middot; Reto del dia</p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white">
            {game.name}
          </h1>
          <p className="mt-1.5 max-w-prose text-ink-muted">{game.tagline}</p>

          {showDifficulty && (
            <section className="mt-6">
              <label className="eyebrow mb-2 block">Dificultad</label>
              <SegmentedControl
                aria-label="Dificultad"
                stacked
                value={difficulty}
                onChange={setDifficulty}
                options={game.difficulties.map((d) => ({
                  value: d,
                  label: DIFFICULTY_LABEL[d],
                  hint: DIFFICULTY_HINT[d],
                }))}
              />
            </section>
          )}

          {showTimeChoice && (
            <section className="mt-6">
              <label className="eyebrow mb-2 block">Tiempo</label>
              <SegmentedControl
                aria-label="Tiempo"
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
              Tiempo limite: {game.timer.seconds} segundos
            </p>
          )}
          {game.timer.kind === "none" && (
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-ink-muted">
              <TimerIcon size={15} />
              Sin limite de tiempo
            </p>
          )}

          <div className="mt-7">
            <Button size="lg" block onClick={beginPlaying}>
              Comenzar
            </Button>
          </div>
        </Panel>

        {/* Modal de identidad (primera vez) */}
        <IdentityModal open={identityOpen} onClose={handleIdentitySaved} />
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Vista: en juego / terminado (se mantiene el juego montado para
  // que pueda revelar respuestas tras finalizar).
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
          // Si todavia esta jugando, pide confirmacion (la salida sin
          // confirmar tambien se registra como derrota via cleanup, pero el
          // modal le da claridad al jugador). Si ya termino, vuelve directo.
          if (phase === "playing") setLeaveConfirmOpen(true);
          else navigate("/");
        }}
      />

      <GameComponent
        difficulty={difficulty}
        date={date}
        timeLimit={timeLimit}
        secondsLeft={timer.secondsLeft}
        status={status}
        onWin={onWin}
        onLose={onLose}
      />

      {phase === "finished" && (
        <ResultBanner won={won} onOpen={() => setResultOpen(true)} />
      )}

      {/* Confirmacion al intentar abandonar mientras juega. */}
      <Modal
        open={leaveConfirmOpen}
        onClose={() => setLeaveConfirmOpen(false)}
        title="¿Salir y perder el reto?"
      >
        <p className="text-sm text-ink-muted">
          Si salis ahora, este reto cuenta como <strong className="text-white">perdido</strong> y
          ya no podras jugarlo hasta manana. La racha se interrumpe.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            variant="danger"
            block
            onClick={() => {
              // El cleanup del shell registra la derrota; aca solo navegamos.
              setLeaveConfirmOpen(false);
              navigate("/");
            }}
          >
            Si, salir y dar por perdido
          </Button>
          <Button variant="ghost" block onClick={() => setLeaveConfirmOpen(false)}>
            Seguir jugando
          </Button>
        </div>
      </Modal>

      <Modal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title={won ? "Reto superado" : "Fin del intento"}
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
            {won ? "Buen trabajo!" : "No esta vez."}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {won
              ? "Sumaste este reto a tu racha."
              : "Repasa las respuestas correctas en el tablero."}
          </p>

          {won && pointsEarned > 0 && (
            <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-sector-yellow/30 bg-sector-yellow/10 px-4 py-1.5">
              <Trophy size={16} />
              <span className="tnum font-display text-lg text-white">+{pointsEarned}</span>
              <span className="text-xs text-ink-muted">puntos</span>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2">
            <Button variant="outline" block onClick={() => setResultOpen(false)}>
              Ver el tablero
            </Button>
            <Link to="/" className="block">
              <Button variant="ghost" block>
                Volver al inicio
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-ink-faint">Vuelve manana para un nuevo reto</p>
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
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <ChevronLeft size={16} />
      Inicio
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
  /**
   * Click en la flecha "atras". Si el juego sigue en curso, el padre debe
   * mostrar la confirmacion de abandono (= derrota). Si ya termino, navega
   * directo a la home.
   */
  onBackRequest: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const playing = status === "playing";

  return (
    <div className="panel flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackRequest}
          aria-label="Volver al inicio"
          className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="rounded-md border border-white/10 bg-asphalt-700 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-ink-muted">
          {DIFFICULTY_LABEL[difficulty]}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {totalSeconds !== null && (
          <TimerDisplay secondsLeft={secondsLeft} total={totalSeconds} />
        )}

        {playing &&
          (confirm ? (
            <span className="flex items-center gap-1.5">
              <Button variant="danger" size="sm" onClick={onSurrender}>
                Rendirse
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                No
              </Button>
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
              Rendirse
            </Button>
          ))}
      </div>
    </div>
  );
}

function ResultBanner({ won, onOpen }: { won: boolean; onOpen: () => void }) {
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
          {won ? "Reto superado" : "Reto fallido"}
        </span>
        <span className="text-xs text-ink-muted">Ver resumen</span>
      </div>
    </button>
  );
}
