// src/pages/v2/FriendsPage.tsx
//
// Amigos (rediseño v2), conectado a los mismos endpoints que FriendsTab:
//  - Sin identityToken (nunca jugó un reto) todo /friends/* da 403: se explica
//    y no se muestran controles que fallarían siempre.
//  - Con token pero sin Google: funciona igual, con el aviso de que la lista
//    se pierde si se borra el navegador.
//  - Código propio de 6 caracteres (sin prefijo), agregar por código,
//    solicitudes entrantes (aceptar/rechazar), lista con presencia (en línea =
//    abrió la web en los últimos 2 min, lo calcula el server), retar a duelo
//    (mismo modal de siempre hasta que se rediseñe Duelos) y eliminar.
//  - Se refresca sola cada 3 s mientras está abierta (igual que antes).

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
import { V2Page } from "@/components/v2/V2Page";
import { ProfileTabs } from "@/components/v2/ProfileTabs";
import { PersonalBack } from "@/components/v2/PersonalBack";
import { V2Flag } from "@/components/v2/V2Flag";
import { DuelChallengeModal } from "@/components/layout/DuelChallengeModal";
import { useLocalIdentity } from "@/hooks/useLocalIdentity";
import {
  apiGetMyFriendCode,
  apiGetFriendsSnapshot,
  apiRemoveFriend,
  apiRespondFriendRequest,
  apiSendFriendRequest,
  isApiError,
  type Friend,
  type FriendRequest,
} from "@/lib/api";
import { friendErrorKey } from "@/lib/v2/apiErrors";
import { avatarTone, initialsOf } from "@/lib/v2/initials";
import { emit, on, Events } from "@/lib/events";
import { accessPath, homePath } from "@/lib/routes";

const POLL_MS = 3000;
const CODE_LENGTH = 6;

type Feedback = { kind: "ok" | "error"; key: string } | null;

export function FriendsPage() {
  const { t, locale } = useI18n();
  const identity = useLocalIdentity();
  const enabled = !!identity?.hasToken;
  const userId = identity?.userId;

  const [code, setCode] = useState<string | null>(null);
  const [codeFailed, setCodeFailed] = useState(false);
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [requests, setRequests] = useState<FriendRequest[] | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [copied, setCopied] = useState(false);
  const [busyRequest, setBusyRequest] = useState<number | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [challengeTarget, setChallengeTarget] = useState<Friend | null>(null);
  const [listFailed, setListFailed] = useState(false);
  const request = useRef(0);
  const polling = useRef(false);
  const mutating = useRef(false);
  const cancelPending = useCallback(() => {request.current++; polling.current = false;}, []);

  const refreshLists = useCallback(() => {
    if (!enabled || polling.current) return;
    polling.current = true;
    const id = ++request.current;
    void apiGetFriendsSnapshot().then(snapshot => {
      if (id !== request.current) return;
      polling.current = false;
      setListFailed(!snapshot);
      if (snapshot) { setFriends(snapshot.friends); setRequests(snapshot.requests); }
    });
  }, [enabled]);

  // Código propio: se pide una vez (no rota).
  useEffect(() => {
    setCode(null);
    setCodeFailed(false);
    if (!enabled) return;
    let cancelled = false;
    apiGetMyFriendCode().then((c) => {
      if (cancelled) return;
      setCode(c);
      setCodeFailed(c === null);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  useEffect(() => {
    request.current++;
    polling.current = false;
    setFriends(null);
    setRequests(null);
    setListFailed(false);
    setChallengeTarget(null);
    if (!enabled) return;
    refreshLists();
    const id = window.setInterval(() => { if (!document.hidden) refreshLists(); }, POLL_MS);
    const off = on(Events.FRIENDS_CHANGED, refreshLists);
    return () => {
      window.clearInterval(id);
      off();
      cancelPending();
    };
  }, [enabled, userId, refreshLists, cancelPending]);

  async function addByCode() {
    if (mutating.current) return;
    setFeedback(null);
    const trimmed = codeInput.trim().toUpperCase();
    if (trimmed.length !== CODE_LENGTH) {
      setFeedback({ kind: "error", key: "friends.invalid_code" });
      return;
    }
    if (code && trimmed === code) {
      setFeedback({ kind: "error", key: "v2.friends.err_self" });
      return;
    }
    setAdding(true);
    mutating.current = true;
    const res = await apiSendFriendRequest({ targetCode: trimmed });
    setAdding(false);
    mutating.current = false;
    if (!res || isApiError(res)) {
      setFeedback({ kind: "error", key: friendErrorKey(res && "error" in res ? res.error : null) });
      return;
    }
    setFeedback({
      kind: "ok",
      key: res.status === "auto_accepted" ? "friends.request_accepted" : "friends.request_sent",
    });
    setCodeInput("");
    emit(Events.FRIENDS_CHANGED);
  }

  async function respond(requestId: number, accept: boolean) {
    if (mutating.current) return;
    mutating.current = true;
    setBusyRequest(requestId);
    setRequestError(null);
    const res = await apiRespondFriendRequest(requestId, accept);
    setBusyRequest(null);
    mutating.current = false;
    if (!res || isApiError(res)) {
      setRequestError(friendErrorKey(res && "error" in res ? res.error : null));
    }
    emit(Events.FRIENDS_CHANGED);
  }

  async function remove(friendUserId: string) {
    if (mutating.current) return;
    mutating.current = true;
    setRemoving(friendUserId);
    const result = await apiRemoveFriend(friendUserId);
    setRemoving(null);
    mutating.current = false;
    if (!result || isApiError(result)) {
      setRequestError(friendErrorKey(result && "error" in result ? result.error : null));
      return;
    }
    setConfirmRemove(null);
    emit(Events.FRIENDS_CHANGED);
  }

  function copyCode() {
    if (!code || !navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => undefined,
    );
  }

  const online = friends?.filter((f) => f.online).length ?? 0;

  return (
    <V2Page page="friends">
      <section className="page-intro">
        <div>
          <p className="eyebrow">{t("v2.friends.eyebrow")}</p>
          <h1>
            {t("friends.tab_title")}
            <span>.</span>
          </h1>
          <p>{t("v2.friends.subtitle")}</p>
        </div>
        <PersonalBack identity={identity} />
      </section>
      <ProfileTabs active="friends" social />

      {!identity && <div className="v2-skeleton" style={{ height: 220 }} aria-busy="true" />}

      {identity && !identity.hasToken && (
        <section className="panel v2-empty">
          <h2>{t("v2.friends.locked_title")}</h2>
          <p>{t("friends.need_to_play")}</p>
          <Link className="primary" to={homePath(locale)}>
            {t("v2.common.play_now")}
          </Link>
        </section>
      )}

      {enabled && (
        <>
          {!identity?.loggedIn && (
            <p className="v2-notice" role="note">
              {t("friends.anon_warning")}{" "}
              <Link to={accessPath(locale)}>{t("v2.friends.anon_cta")}</Link>
            </p>
          )}

          <section className="friend-connect panel">
            <div>
              <p className="eyebrow">{t("v2.friends.connect_eyebrow")}</p>
              <h2>{t("v2.friends.connect_title")}</h2>
              <p>{t("v2.friends.connect_body")}</p>
            </div>
            <div className="friend-code">
              <span>{t("v2.friends.your_code")}</span>
              <div>
                <strong aria-live="polite">{code ?? (codeFailed ? "—" : "······")}</strong>
                <button type="button" className="secondary" onClick={copyCode} disabled={!code}>
                  {copied ? t("friends.code_copied") : t("v2.friends.copy_code")}
                </button>
              </div>
              {codeFailed && <p className="v2-inline-error">{t("v2.common.err_network")}</p>}
            </div>
            <form
              className="add-friend"
              onSubmit={(e) => {
                e.preventDefault();
                addByCode();
              }}
            >
              <label htmlFor="friend-code">{t("v2.friends.friend_code")}</label>
              <div>
                <input
                  id="friend-code"
                  value={codeInput}
                  onChange={(e) => {
                    setFeedback(null);
                    setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                  }}
                  placeholder={t("friends.code_placeholder")}
                  maxLength={CODE_LENGTH}
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="friend-code-feedback"
                />
                <button type="submit" className="primary" disabled={adding}>
                  {adding ? t("v2.common.sending") : t("v2.friends.add")}
                </button>
              </div>
              <p
                id="friend-code-feedback"
                className={feedback?.kind === "error" ? "v2-inline-error" : "v2-inline-ok"}
                aria-live="polite"
              >
                {feedback ? t(feedback.key) : ""}
              </p>
            </form>
          </section>

          {requests && requests.length > 0 && (
            <section className="requests" aria-label={t("v2.friends.requests_title")}>
              <div className="section-label">
                <h2>{t("v2.friends.requests_title")}</h2>
                <span className="request-count">
                  {t(requests.length === 1 ? "v2.friends.request_one" : "v2.friends.request_other", {
                    count: requests.length,
                  })}
                </span>
              </div>
              {requests.map((r) => (
                <div className="request-person" key={r.requestId}>
                  <span className="friend-avatar">{initialsOf(r.displayName) || "·"}</span>
                  <div>
                    <strong>{r.displayName || t("stats.no_name")}</strong>
                    <p>
                      <V2Flag code={r.countryCode} />
                      {t("v2.friends.wants_to_join")}
                    </p>
                  </div>
                  <div className="request-actions">
                    <button
                      type="button"
                      className="primary"
                      disabled={busyRequest === r.requestId}
                      onClick={() => respond(r.requestId, true)}
                    >
                      {t("friends.accept")}
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      disabled={busyRequest === r.requestId}
                      onClick={() => respond(r.requestId, false)}
                    >
                      {t("friends.reject")}
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="friend-list" aria-label={t("v2.friends.list_title")}>
            {requestError && <p className="v2-inline-error" role="alert">{t(requestError)}</p>}
            {listFailed && <p className="v2-inline-error" role="alert">{t("v2.common.err_network")} <button className="secondary" onClick={refreshLists}>{t("ranking.retry")}</button></p>}
            <div className="section-label">
              <h2>
                {t("v2.friends.list_title")} <small>{friends?.length ?? ""}</small>
              </h2>
              {friends && friends.length > 0 && <span>{t("v2.friends.online_count", { count: online })}</span>}
            </div>
            {friends === null && !listFailed && <div className="v2-skeleton" style={{ height: 88 }} aria-busy="true" />}
            {friends !== null && friends.length === 0 && <p className="v2-muted-note">{t("friends.no_friends")}</p>}
            {friends?.map((f) => (
              <article className="friend-row" key={f.userId}>
                <span className={`friend-avatar avatar-${avatarTone(f.userId)}`}>
                  {initialsOf(f.displayName) || "·"}
                </span>
                <div className="friend-identity">
                  <strong>
                    <V2Flag code={f.countryCode} />
                    {f.displayName || t("stats.no_name")}
                  </strong>
                  <span className={`presence${f.online ? " is-online" : ""}`}>
                    <i />
                    {f.online ? t("friends.online") : t("friends.offline")}
                  </span>
                </div>
                <div className="friend-actions">
                  {/* Desconectado no deshabilita: la invitación dura 60 s y el
                      otro puede estar abriendo la web justo ahora. */}
                  <button
                    type="button"
                    className={f.online ? "primary" : "secondary"}
                    onClick={() => setChallengeTarget(f)}
                  >
                    {t("v2.friends.challenge")}
                  </button>
                  {confirmRemove === f.userId ? (
                    <span className="v2-confirm">
                      <span>{t("friends.remove_confirm")}</span>
                      <button
                        type="button"
                        className="remove-friend is-danger"
                        disabled={removing === f.userId}
                        onClick={() => remove(f.userId)}
                      >
                        {t("v2.common.yes_remove")}
                      </button>
                      <button type="button" className="remove-friend" onClick={() => setConfirmRemove(null)}>
                        {t("profile.cancel")}
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="remove-friend" onClick={() => setConfirmRemove(f.userId)}>
                      {t("v2.friends.remove")}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {challengeTarget && (
        <DuelChallengeModal
          open
          onClose={() => setChallengeTarget(null)}
          mode={{ kind: "toFriend", opponentUserId: challengeTarget.userId, opponentName: challengeTarget.displayName }}
        />
      )}
    </V2Page>
  );
}
