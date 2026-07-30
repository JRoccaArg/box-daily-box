// src/components/layout/FriendsTab.tsx
//
// Pestaña "Amigos" del StatsModal (Roadmap §4): código propio, agregar por
// código, solicitudes pendientes (entrantes/salientes), lista de amigos con
// botón "Desafiar", y aviso si la cuenta es anónima.

import { useEffect, useState } from "react";
import { useI18n } from "@/context";
import { getIdentity } from "@/lib/identity";
import {
  apiGetMyFriendCode,
  apiListFriends,
  apiListFriendRequests,
  apiSendFriendRequest,
  apiRespondFriendRequest,
  apiRemoveFriend,
  isApiError,
  type Friend,
  type FriendRequest,
} from "@/lib/api";
import { NATIONALITIES } from "@/data/nationalities";
import { Button } from "@/components/ui/Button";
import { Users } from "@/components/ui/Icon";
import { DuelChallengeModal } from "./DuelChallengeModal";

export function FriendsTab() {
  const { t } = useI18n();
  const { userId } = getIdentity();
  const isAnon = userId.startsWith("anon-");

  const [code, setCode] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [requests, setRequests] = useState<FriendRequest[] | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [challengeTarget, setChallengeTarget] = useState<Friend | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const reload = () => {
    apiGetMyFriendCode().then(setCode);
    apiListFriends().then(setFriends);
    apiListFriendRequests().then(setRequests);
  };

  useEffect(reload, []);

  async function addByCode() {
    setMessage(null);
    const trimmed = codeInput.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setMessage(t("friends.invalid_code"));
      return;
    }
    const res = await apiSendFriendRequest({ targetCode: trimmed });
    if (!res || isApiError(res)) {
      setMessage(res && "error" in res ? res.error : t("duel.error_generic"));
      return;
    }
    setMessage(res.status === "auto_accepted" ? t("friends.request_accepted") : t("friends.request_sent"));
    setCodeInput("");
    reload();
  }

  async function respond(requestId: number, accept: boolean) {
    await apiRespondFriendRequest(requestId, accept);
    reload();
  }

  async function remove(friendUserId: string) {
    setRemoving(friendUserId);
    await apiRemoveFriend(friendUserId);
    setRemoving(null);
    reload();
  }

  function copyCode() {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => setMessage(t("friends.code_copied")));
  }

  return (
    <div className="space-y-4">
      {isAnon && (
        <p className="rounded-lg border border-sector-yellow/30 bg-sector-yellow/10 px-3 py-2 text-xs leading-relaxed text-sector-yellow/90">
          {t("friends.anon_warning")}
        </p>
      )}

      <div className="rounded-lg border border-white/10 bg-asphalt-700 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">
            {code ? t("friends.your_code", { code }) : "…"}
          </span>
          <Button size="sm" variant="ghost" onClick={copyCode} disabled={!code}>
            {t("friends.copy_code")}
          </Button>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder={t("friends.code_placeholder")}
            maxLength={6}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-asphalt-800 px-3 py-2 text-sm uppercase text-ink outline-none focus:border-racing/50"
          />
          <Button size="sm" onClick={addByCode}>{t("friends.add_by_code")}</Button>
        </div>
        {message && <p className="mt-2 text-xs text-ink-muted">{message}</p>}
      </div>

      {requests !== null && requests.length > 0 && (
        <div>
          <p className="eyebrow mb-2">{t("friends.pending_requests", { count: requests.length })}</p>
          <ul className="space-y-2">
            {requests.map((r) => {
              const nat = r.countryCode ? NATIONALITIES[r.countryCode] : null;
              return (
                <li
                  key={r.requestId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-asphalt-700 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm text-ink">
                    {nat && <span className={`fi fi-${nat.alpha2}`} role="img" aria-label={nat.name} />}
                    {r.displayName || t("stats.no_name")}
                  </span>
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => respond(r.requestId, true)}>{t("friends.accept")}</Button>
                    <Button size="sm" variant="ghost" onClick={() => respond(r.requestId, false)}>{t("friends.reject")}</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <p className="eyebrow mb-2">{t("friends.tab_title")}</p>
        {friends === null && <p className="text-sm text-ink-muted">…</p>}
        {friends !== null && friends.length === 0 && (
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Users size={16} />
            {t("friends.no_friends")}
          </p>
        )}
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
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => setChallengeTarget(f)}>
                      {t("duel.challenge_button")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={removing === f.userId}
                      onClick={() => {
                        if (window.confirm(t("friends.remove_confirm"))) remove(f.userId);
                      }}
                    >
                      {t("friends.remove")}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {challengeTarget && (
        <DuelChallengeModal
          open
          onClose={() => setChallengeTarget(null)}
          mode={{ kind: "toFriend", opponentUserId: challengeTarget.userId, opponentName: challengeTarget.displayName }}
        />
      )}
    </div>
  );
}
