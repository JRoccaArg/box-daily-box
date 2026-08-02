// src/components/layout/DuelChallengeModal.tsx
//
// Modal para desafiar a un duelo (Roadmap §4). Dos modos:
//  - "fromGame": ya sabemos gameId/dificultad/tiempo (viene del botón
//    "Desafiar amigo" en GameShell config). Solo falta elegir CONTRA quién:
//    un amigo de la lista, o generar un link abierto (para WhatsApp/DM).
//  - "toFriend": ya sabemos el oponente (viene de la fila de un amigo en la
//    pestaña Amigos del StatsModal). Acá sí hace falta un mini-selector de
//    juego + dificultad + tiempo, porque no venimos desde ningún juego.
//
// Al crear el duelo, navega a /:lang/duelo/:duelId — esa página (DuelPage)
// es la ÚNICA que maneja la pantalla de espera/juego/resultado, tanto para
// el retador como para el que acepta.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Difficulty } from "@/types";
import { useI18n } from "@/context";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Users } from "@/components/ui/Icon";
import { apiListFriends, apiCreateDuel, apiSendFriendRequest, isApiError, type Friend } from "@/lib/api";
import { duelPath } from "@/lib/routes";
import { GAMES } from "@/components/games/registry";
import { NATIONALITIES } from "@/data/nationalities";

type Mode =
  | { kind: "fromGame"; gameId: string; difficulty: Difficulty; timeLimit: number | null }
  | { kind: "toFriend"; opponentUserId: string; opponentName: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  mode: Mode;
};

export function DuelChallengeModal({ open, onClose, mode }: Props) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del mini-selector (solo se usa en modo "toFriend").
  const [gameId, setGameId] = useState(GAMES[0]?.id ?? "");
  const game = useMemo(() => GAMES.find((g) => g.id === gameId) ?? GAMES[0], [gameId]);
  const [difficulty, setDifficulty] = useState<Difficulty>(game?.difficulties[0] ?? "medio");
  const timeOptions = useMemo<number[]>(() => {
    if (!game) return [];
    if (game.timer.kind === "choice") return game.timer.options;
    if (game.timer.kind === "fixed") return [game.timer.seconds];
    return [];
  }, [game]);
  const [timeLimit, setTimeLimit] = useState<number | null>(timeOptions[0] ?? null);

  // Agregar amigo por código (solo si la lista está vacía en modo "fromGame").
  const [codeInput, setCodeInput] = useState("");
  const [codeMsg, setCodeMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCodeMsg(null);
    setCodeInput("");
    if (mode.kind === "fromGame") {
      setFriends(null);
      apiListFriends().then(setFriends);
    }
  }, [open, mode.kind]);

  useEffect(() => {
    if (mode.kind === "toFriend" && game) {
      setDifficulty(game.difficulties[0] ?? "medio");
      const opts = game.timer.kind === "choice" ? game.timer.options : game.timer.kind === "fixed" ? [game.timer.seconds] : [];
      setTimeLimit(opts[0] ?? null);
    }
  }, [gameId, mode.kind]); // eslint-disable-line react-hooks/exhaustive-deps -- `game` deriva de gameId, no hace falta como dep propia.

  async function createAndGo(opponentUserId?: string) {
    setCreating(true);
    setError(null);
    const gId = mode.kind === "fromGame" ? mode.gameId : gameId;
    const diff = mode.kind === "fromGame" ? mode.difficulty : difficulty;
    const tl = mode.kind === "fromGame" ? mode.timeLimit : timeLimit;
    const oid = mode.kind === "toFriend" ? mode.opponentUserId : opponentUserId;

    const res = await apiCreateDuel(gId, diff, tl, oid);
    setCreating(false);
    if (!res || isApiError(res)) {
      setError(res && "error" in res ? res.error : t("duel.error_generic"));
      return;
    }
    onClose();
    navigate(duelPath(locale, res.duelId));
  }

  async function addByCode() {
    setCodeMsg(null);
    const trimmed = codeInput.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setCodeMsg(t("friends.invalid_code"));
      return;
    }
    const res = await apiSendFriendRequest({ targetCode: trimmed });
    if (!res || isApiError(res)) {
      setCodeMsg(res && "error" in res ? res.error : t("duel.error_generic"));
      return;
    }
    setCodeMsg(res.status === "auto_accepted" ? t("friends.request_accepted") : t("friends.request_sent"));
    setCodeInput("");
  }

  const title = mode.kind === "toFriend" ? t("duel.pick_game") : t("duel.challenge_button");

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {mode.kind === "toFriend" && (
        <div className="space-y-5">
          <p className="text-sm text-ink-muted">
            {t("duel.challenging_friend", { name: mode.opponentName || t("duel.someone") })}
          </p>
          <section>
            <label className="eyebrow mb-2 block">{t("duel.game_label")}</label>
            <SegmentedControl
              stacked
              value={gameId}
              onChange={setGameId}
              options={GAMES.map((g) => ({ value: g.id, label: t(`game.${g.id}.name`) }))}
            />
          </section>
          {game && game.difficulties.length > 1 && (
            <section>
              <label className="eyebrow mb-2 block">{t("shell.difficulty")}</label>
              <SegmentedControl
                stacked
                value={difficulty}
                onChange={setDifficulty}
                options={game.difficulties.map((d) => ({ value: d, label: t(`diff.${d}`) }))}
              />
            </section>
          )}
          {game && game.timer.kind === "choice" && (
            <section>
              <label className="eyebrow mb-2 block">{t("shell.time")}</label>
              <SegmentedControl
                value={timeLimit ?? timeOptions[0] ?? 0}
                onChange={setTimeLimit}
                options={timeOptions.map((s) => ({ value: s, label: `${s}s` }))}
              />
            </section>
          )}
          {error && <p className="text-sm text-racing-400">{error}</p>}
          <Button block size="lg" disabled={creating} onClick={() => createAndGo()}>
            {creating ? "…" : t("duel.challenge_button")}
          </Button>
        </div>
      )}

      {mode.kind === "fromGame" && (
        <div className="space-y-4">
          {friends === null && <p className="text-sm text-ink-muted">…</p>}

          {friends !== null && friends.length > 0 && (
            <ul className="space-y-2">
              {friends.map((f) => {
                const nat = f.countryCode ? NATIONALITIES[f.countryCode] : null;
                return (
                  <li
                    key={f.userId}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-asphalt-700 px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-sm text-ink">
                      {nat && <span className={`fi fi-${nat.alpha2}`} role="img" aria-label={nat.name} />}
                      {f.displayName || t("stats.no_name")}
                    </span>
                    <Button size="sm" disabled={creating} onClick={() => createAndGo(f.userId)}>
                      {t("duel.challenge_button")}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          {friends !== null && friends.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-asphalt-700 p-3 text-sm text-ink-muted">
              <p className="mb-2 flex items-center gap-1.5">
                <Users size={16} />
                {t("friends.no_friends")}
              </p>
              <div className="flex gap-2">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={t("friends.code_placeholder")}
                  maxLength={6}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-asphalt-800 px-3 py-2 text-sm uppercase text-ink outline-none focus:border-racing/50"
                />
                <Button size="sm" onClick={addByCode}>{t("friends.add_by_code")}</Button>
              </div>
              {codeMsg && <p className="mt-2 text-xs text-ink-muted">{codeMsg}</p>}
            </div>
          )}

          {error && <p className="text-sm text-racing-400">{error}</p>}

          <Button variant="outline" block disabled={creating} onClick={() => createAndGo()}>
            {creating ? "…" : t("duel.open_link")}
          </Button>
        </div>
      )}
    </Modal>
  );
}
