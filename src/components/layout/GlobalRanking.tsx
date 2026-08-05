import { useEffect, useState } from "react";
import {
  apiGetMonthlyRanking,
  apiGetDailyRanking,
  apiListFriends,
  apiListOutgoingFriendRequests,
  apiSendFriendRequest,
  isApiError,
  friendlyApiError,
  type RankingEntry,
} from "@/lib/api";
import { useI18n } from "@/context";
import { getIdentity, getIdentityToken } from "@/lib/identity";
import { NATIONALITIES } from "@/data/nationalities";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { Trophy, Flame, UserPlus, Timer as ClockIcon, Users } from "@/components/ui/Icon";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { getEffectiveNow } from "@/lib/debugDate";
import { formatBadgeTooltip } from "@/lib/badgeFormat";
import { showToast } from "@/lib/toast";
import { emit, on, Events } from "@/lib/events";

/** Máximo de badges visibles inline antes de colapsar en "+N" (espacio limitado en mobile). */
const MAX_INLINE_BADGES = 2;

// Cadencias elegidas para que la pantalla "reaccione sola" sin gastar de más:
// las posiciones/puntos cambian poco de un momento a otro (pueden esperar
// más), el estado de amistad (ya amigos / solicitud pendiente) se refresca
// más seguido porque es lo que el usuario está mirando/tocando activamente
// en esta pantalla. Ninguno de los dos polls interrumpe ni pausa una
// partida en curso (son solo lecturas en background).
const RANKING_POLL_MS = 30_000;
const FRIEND_STATUS_POLL_MS = 10_000;

type Tab = "monthly" | "daily";

/** Ranking global que consume la API del servidor. */
export function GlobalRanking({ refreshKey }: { refreshKey?: number }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("daily");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  // Agregar amigo directo desde la fila del ranking (ver Icon.tsx: UserPlus).
  // Cada fila tiene 3 estados posibles (mutuamente excluyentes):
  //  - `friendIds`: ya son amigos -> icono Users, solo indicador.
  //  - `outgoingIds` (server) / `sentIds` (esta sesión, para reflejar el
  //    click al instante sin esperar el round-trip): le mandé solicitud y
  //    sigue pendiente -> icono de reloj, solo indicador.
  //  - ninguno de los dos: botón UserPlus para mandar la solicitud.
  const [friendIds, setFriendIds] = useState<Set<string> | null>(null);
  const [outgoingIds, setOutgoingIds] = useState<Set<string>>(new Set());
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  const { userId } = getIdentity();
  const now = getEffectiveNow();
  const monthName = t(`month.${now.getMonth()}`);

  // Sin identityToken (nunca jugó un reto), /friends/* siempre devuelve 403:
  // ni siquiera pedimos la lista, y el botón de agregar no se muestra.
  const canAddFriends = getIdentityToken() !== null;

  useEffect(() => {
    if (!canAddFriends) return;
    const refreshFriendStatus = () => {
      apiListFriends().then((fs) => setFriendIds(new Set(fs.map((f) => f.userId))));
      apiListOutgoingFriendRequests().then((rs) => setOutgoingIds(new Set(rs.map((r) => r.toUserId))));
    };
    refreshFriendStatus();
    const id = window.setInterval(refreshFriendStatus, FRIEND_STATUS_POLL_MS);
    // Si desde otra pestaña/lugar cambia algo (ej. aceptaste una solicitud
    // en "Amigos"), refresca al instante en vez de esperar el próximo tick.
    const unsubscribe = on(Events.FRIENDS_CHANGED, refreshFriendStatus);
    return () => {
      window.clearInterval(id);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- canAddFriends no cambia durante la vida del componente.
  }, []);

  async function addFriend(targetUserId: string) {
    setAddingId(targetUserId);
    const res = await apiSendFriendRequest({ targetUserId });
    setAddingId(null);
    if (!res || isApiError(res)) {
      showToast(res && "error" in res ? friendlyApiError(res.error, t) : t("duel.error_generic"), "error");
      return;
    }
    setSentIds((prev) => new Set(prev).add(targetUserId));
    showToast(
      res.status === "auto_accepted" ? t("friends.request_accepted") : t("friends.request_sent"),
      "success",
    );
    emit(Events.FRIENDS_CHANGED);
  }

  useEffect(() => {
    let cancelled = false;

    // `showSpinner`: solo el fetch inicial (o un cambio de pestaña/país/
    // reintento manual) muestra "Cargando..."; los refrescos automáticos de
    // fondo (cada 30s) actualizan los números sin parpadear la pantalla.
    const fetchRanking = async (showSpinner: boolean) => {
      if (showSpinner) {
        setLoading(true);
        setError(false);
      }
      try {
        const country = countryFilter || undefined;
        const data =
          tab === "monthly"
            ? await apiGetMonthlyRanking(undefined, country)
            : await apiGetDailyRanking(undefined, country);
        if (cancelled) return;
        if (data) setEntries(data.top);
        else if (showSpinner) setError(true);
      } catch {
        if (!cancelled && showSpinner) setError(true);
      } finally {
        if (!cancelled && showSpinner) setLoading(false);
      }
    };

    fetchRanking(true);
    const id = window.setInterval(() => fetchRanking(false), RANKING_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [tab, countryFilter, refreshKey, retryTick]);

  return (
    <section className="rounded-xl border border-white/10 bg-gradient-to-b from-asphalt-700 to-asphalt-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} />
          <h3 className="font-display text-sm uppercase tracking-wide text-ink">
            {t("ranking.title")}
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex gap-1 rounded-lg border border-white/10 bg-asphalt-800 p-1">
        <TabBtn active={tab === "daily"} onClick={() => setTab("daily")}>
          {t("ranking.tab_today")}
        </TabBtn>
        <TabBtn active={tab === "monthly"} onClick={() => setTab("monthly")}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </TabBtn>
      </div>

      {/* Filtro por pais */}
      <div className="mt-3">
        <CountrySelect
          value={countryFilter}
          onChange={setCountryFilter}
          placeholder={t("ranking.all_countries")}
          size="sm"
          allowClear
        />
      </div>

      {/* Contenido */}
      <div className="mt-3">
        {loading && (
          <p className="py-6 text-center text-sm text-ink-faint">{t("ranking.loading")}</p>
        )}

        {error && !loading && (
          <div className="py-6 text-center">
            <p className="text-sm text-ink-faint">{t("ranking.error")}</p>
            <button
              onClick={() => setRetryTick((v) => v + 1)}
              className="mt-2 text-xs text-racing-400 underline"
            >
              {t("ranking.retry")}
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-faint">
            {tab === "daily" ? t("ranking.empty_daily") : t("ranking.empty_monthly")}
          </p>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="space-y-1.5">
            {entries.map((entry) => {
              const isMe = entry.userId === userId;
              const natData = entry.countryCode ? NATIONALITIES[entry.countryCode] : null;
              const challengeLabel =
                entry.gamesWon === 1
                  ? t("ranking.challenge_singular")
                  : t("ranking.challenge_plural");
              const isLoser = entry.points === 0;

              return (
                <div
                  key={entry.userId}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    isMe
                      ? "border border-racing/30 bg-racing/10"
                      : "border border-transparent bg-asphalt-700/50",
                    isLoser && !isMe ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-asphalt-600 text-xs font-bold text-ink-muted">
                    {entry.rank <= 3 ? (
                      <span className={MEDAL_COLOR[entry.rank] ?? ""}>
                        {MEDAL[entry.rank] ?? entry.rank}
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {natData ? (
                        <span className={`fi fi-${natData.alpha2} text-sm`} role="img" aria-label={natData.name} />
                      ) : (
                        <span className="text-sm">🏁</span>
                      )}
                      <span
                        className={[
                          "truncate text-sm font-medium",
                          isMe ? "text-white" : "text-ink",
                        ].join(" ")}
                      >
                        {entry.displayName || t("ranking.anonymous")}
                        {isMe && (
                          <span className="ml-1.5 text-xs text-racing-400">{t("ranking.you")}</span>
                        )}
                      </span>
                      {entry.displayBadges.length > 0 && (
                        <span className="flex shrink-0 items-center gap-1">
                          {entry.displayBadges.slice(0, MAX_INLINE_BADGES).map((b, i) => (
                            <BadgeIcon
                              key={`${b.type}-${i}`}
                              type={b.type}
                              count={b.count}
                              size={14}
                              title={formatBadgeTooltip(b.type, b.months, t)}
                            />
                          ))}
                          {entry.displayBadges.length > MAX_INLINE_BADGES && (
                            <span className="text-[10px] font-semibold text-ink-faint">
                              {t("badge.more", {
                                count: entry.displayBadges.length - MAX_INLINE_BADGES,
                              })}
                            </span>
                          )}
                        </span>
                      )}
                      {entry.currentStreak >= 2 && (
                        <span
                          className="flex shrink-0 items-center gap-0.5 text-sector-yellow"
                          title={t("ranking.streak_title", { count: entry.currentStreak })}
                        >
                          <Flame size={13} />
                          <span className="text-[11px] font-semibold tnum">
                            {entry.currentStreak}
                          </span>
                        </span>
                      )}
                      {!isMe && canAddFriends && friendIds !== null && (
                        <>
                          {friendIds.has(entry.userId) ? (
                            <span
                              className="shrink-0 text-ink-faint"
                              title={t("ranking.already_friends")}
                              aria-label={t("ranking.already_friends")}
                            >
                              <Users size={14} />
                            </span>
                          ) : outgoingIds.has(entry.userId) || sentIds.has(entry.userId) ? (
                            <span
                              className="shrink-0 text-ink-faint"
                              title={t("ranking.request_pending")}
                              aria-label={t("ranking.request_pending")}
                            >
                              <ClockIcon size={14} />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addFriend(entry.userId)}
                              disabled={addingId === entry.userId}
                              title={t("ranking.add_friend")}
                              aria-label={t("ranking.add_friend_label", {
                                name: entry.displayName || t("ranking.anonymous"),
                              })}
                              className="shrink-0 rounded-md p-0.5 text-ink-faint transition-colors hover:text-racing-400 disabled:opacity-50"
                            >
                              <UserPlus size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <span className="text-xs text-ink-faint">
                      {t("ranking.challenges_won", {
                        count: entry.gamesWon,
                        label: challengeLabel,
                      })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="tnum font-display text-lg font-bold text-white">
                      {entry.points}
                    </span>
                    <span className="ml-1 text-xs text-ink-faint">{t("ranking.pts")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        {tab === "monthly" ? t("ranking.monthly_note") : t("ranking.daily_note")}
      </p>
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-asphalt-600 text-white" : "text-ink-faint hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_COLOR: Record<number, string> = {
  1: "text-lg",
  2: "text-lg",
  3: "text-lg",
};
