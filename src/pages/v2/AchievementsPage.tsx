// src/pages/v2/AchievementsPage.tsx
//
// Logros (rediseño v2). Datos reales de GET /user/:id/badges:
//  - Colección = logros que POSEÉS (fila en `badges`), o con progreso completo
//    si el otorgamiento quedó pendiente.
//  - "Tu próxima meta" = el pendiente más cercano a completarse (nextGoal.ts).
//  - Entrar a esta página da por vistos los logros nuevos (antes lo hacía la
//    pestaña Logros del modal de Stats).
// La selección de insignias para el ranking vive en el perfil, no acá.

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
import { V2Page } from "@/components/v2/V2Page";
import { ProfileTabs } from "@/components/v2/ProfileTabs";
import { PersonalBack } from "@/components/v2/PersonalBack";
import { BadgeShape } from "@/components/ui/BadgeIcon";
import { useLocalIdentity } from "@/hooks/useLocalIdentity";
import { apiGetUserBadges, type AchievementProgress, type UserBadges } from "@/lib/api";
import { clearUnseenAchievements } from "@/lib/achievements";
import { homePath, profilePath } from "@/lib/routes";
import { gameById } from "@/components/games/registry";
import {
  achievementTone,
  achievementUnit,
  displayPercent,
  isAchievementOwned,
  pickNextGoal,
} from "@/lib/v2/nextGoal";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const pad2 = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function gameName(gameId: string | null | undefined, t: Translate): string | null {
  if (!gameId) return null;
  return gameById(gameId) ? t(`game.${gameId}.name`) : gameId;
}

/** Frase de "lo que falta" para la próxima meta. */
function goalSentence(item: AchievementProgress, remaining: number, t: Translate): string {
  const n = remaining === 1 ? "one" : "other";
  switch (item.type) {
    case "ach_legend_10":
    case "ach_legend_50":
      return t(`v2.ach.goal_legend_${n}`, { count: remaining });
    case "ach_specialist_50": {
      const game = gameName(item.gameId, t);
      return game
        ? t(`v2.ach.goal_specialist_${n}`, { count: remaining, game })
        : t(`v2.ach.goal_specialist_any_${n}`, { count: remaining });
    }
    case "ach_complete":
      return t(`v2.ach.goal_complete_${n}`, { count: remaining });
    case "ach_perfect_day":
      return t("v2.ach.goal_perfect_day", { target: item.target, current: item.rawCurrent });
    default:
      return t(`v2.ach.goal_wins_${n}`, { count: remaining });
  }
}

function progressLine(item: AchievementProgress, t: Translate): string {
  const vars = { current: Math.min(item.rawCurrent, item.target), target: item.target };
  return achievementUnit(item.type) === "games"
    ? t("v2.ach.progress_games", vars)
    : t("v2.ach.progress_wins", vars);
}

export function AchievementsPage() {
  const { t, locale } = useI18n();
  const identity = useLocalIdentity();
  const userId = identity?.userId;
  const enabled = identity?.hasToken;
  const [data, setData] = useState<UserBadges | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const request = useRef(0);
  const invalidate = useCallback(() => { request.current++; }, []);

  const load = useCallback(async (userId: string) => {
    const id = ++request.current;
    setStatus("loading");
    const res = await apiGetUserBadges(userId);
    if (id !== request.current) return;
    setData(res);
    setStatus(res ? "ready" : "error");
    if (res) clearUnseenAchievements();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setData(null);
    if (enabled) load(userId);
    return invalidate;
  }, [userId, enabled, load, invalidate]);

  const counts = data?.counts ?? {};
  const items = data?.achievements ?? [];
  const owned = items.filter((item) => isAchievementOwned(item, counts));
  const next = data ? pickNextGoal(items, counts) : null;
  const awardedAt = (type: string) => data?.owned.find((b) => b.type === type)?.awardedAt ?? null;
  const shortDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  return (
    <V2Page page="achievements">
      <section className="page-intro">
        <div>
          <p className="eyebrow">{t("v2.ach.eyebrow")}</p>
          <h1>
            {t("v2.ach.title")}
            <span>.</span>
          </h1>
          <p>{t("v2.ach.subtitle")}</p>
        </div>
        <PersonalBack identity={identity} />
      </section>
      <ProfileTabs active="achievements" social />

      {identity && !identity.hasToken && (
        <section className="panel v2-empty">
          <h2>{t("v2.ach.empty_title")}</h2>
          <p>{t("v2.ach.empty_body")}</p>
          <Link className="primary" to={homePath(locale)}>
            {t("v2.common.play_now")}
          </Link>
        </section>
      )}

      {(!identity || (identity.hasToken && status === "loading")) && (
        <div className="v2-skeleton-stack" aria-busy="true" aria-label={t("achievement.loading")}>
          <div className="v2-skeleton" style={{ height: 96 }} />
          <div className="v2-skeleton" style={{ height: 120 }} />
          <div className="v2-skeleton" style={{ height: 220 }} />
        </div>
      )}

      {identity?.hasToken && status === "error" && (
        <section className="panel v2-empty" role="alert">
          <p>{t("achievement.load_error")}</p>
          <button type="button" className="secondary" onClick={() => load(identity.userId)}>
            {t("ranking.retry")}
          </button>
        </section>
      )}

      {data && status === "ready" && (
        <>
          <section className="collection-summary">
            <div>
              <strong>
                {pad2(owned.length)}
                <span> / {pad2(items.length)}</span>
              </strong>
              <p>{t("v2.ach.unlocked_label")}</p>
            </div>
            <div className="collection-earned">
              <span>{t("v2.ach.earned_label")}</span>
              <div className="collection-seals">
                {owned.length === 0 && <em className="v2-muted-note">{t("v2.ach.none_yet")}</em>}
                {owned.map((item) => (
                  <span
                    key={item.type}
                    className={`collection-seal tone-${achievementTone(item.type)}`}
                    title={t(`badge.${item.type}`)}
                  >
                    <BadgeShape type={item.type} size={26} />
                  </span>
                ))}
              </div>
            </div>
            <Link className="secondary" to={`${profilePath(locale)}#insignias`}>
              {t("v2.badges.choose")}
            </Link>
          </section>

          {next ? (
            <section className="next-achievement">
              <span className={`achievement-symbol ${achievementTone(next.item.type)}`}>
                <BadgeShape type={next.item.type} size={26} />
              </span>
              <div>
                <span className="eyebrow">{t("v2.ach.next_eyebrow")}</span>
                <h2>{t(`badge.${next.item.type}`)}</h2>
                <p>{goalSentence(next.item, next.remaining, t)}</p>
                <div className={`achievement-meter ${achievementTone(next.item.type)}`}>
                  <i style={{ ["--progress" as string]: `${displayPercent(next.item, false)}%` }} />
                </div>
                <span className="achievement-progress">{progressLine(next.item, t)}</span>
              </div>
              <strong className="next-count">
                {pad2(next.remaining)}
                <small>{t("v2.ach.to_go")}</small>
              </strong>
            </section>
          ) : (
            <section className="next-achievement is-complete">
              <div>
                <span className="eyebrow">{t("v2.ach.all_eyebrow")}</span>
                <h2>{t("v2.ach.all_title")}</h2>
                <p>{t("v2.ach.all_body")}</p>
              </div>
            </section>
          )}

          <div className="section-label collection-heading">
            <h2>{t("v2.ach.collection")}</h2>
            <span>{t("achievement.unlocked_count", { count: owned.length, total: items.length })}</span>
          </div>
          <section className="achievement-grid" aria-label={t("v2.ach.collection")}>
            {/* Como en el boceto: primero los desbloqueados y después los pendientes (cada grupo, en el orden del catálogo). */}
            {[...owned, ...items.filter((item) => !isAchievementOwned(item, counts))].map((item) => (
              <AchievementCard
                key={item.type}
                item={item}
                owned={isAchievementOwned(item, counts)}
                awardedAt={awardedAt(item.type)}
                formatDate={(iso) => shortDate.format(new Date(iso))}
              />
            ))}
          </section>
          <p className="footnote">{t("v2.ach.footnote")}</p>
        </>
      )}
    </V2Page>
  );
}

function AchievementCard({
  item,
  owned,
  awardedAt,
  formatDate,
}: {
  item: AchievementProgress;
  owned: boolean;
  awardedAt: string | null;
  formatDate: (iso: string) => string;
}) {
  const { t } = useI18n();
  const tone = achievementTone(item.type);
  const percent = displayPercent(item, owned);
  const remaining = Math.max(item.target - item.rawCurrent, 0);
  const unit = achievementUnit(item.type);
  const n = remaining === 1 ? "one" : "other";

  let bottom: string;
  if (owned) {
    bottom = awardedAt ? t("v2.ach.unlocked_on", { date: formatDate(awardedAt) }) : t("achievement.unlocked");
  } else if (item.type === "ach_perfect_day") {
    bottom =
      item.rawCurrent > 0
        ? t("v2.ach.best_day", { current: item.rawCurrent, target: item.target })
        : t("v2.ach.perfect_day_pending");
  } else if (item.type === "ach_specialist_50" && gameName(item.gameId, t)) {
    bottom = t(`v2.ach.specialist_left_${n}`, { game: gameName(item.gameId, t) as string, count: remaining });
  } else {
    bottom = t(unit === "games" ? `v2.ach.left_games_${n}` : `v2.ach.left_wins_${n}`, { count: remaining });
  }

  return (
    <div className="achievement-motion-stage"><article className={`achievement-card ${owned ? "unlocked" : "pending"}`}>
      <div className="achievement-top">
        <span className={`achievement-symbol ${tone}`}>
          <BadgeShape type={item.type} size={26} />
        </span>
        {owned ? (
          <span className="achievement-state">
            <span className="completion-check" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m6 12 4 4 8-9" />
              </svg>
            </span>
            <span>
              {t("achievement.unlocked")}
              <small>{t("v2.ach.completed")}</small>
            </span>
          </span>
        ) : (
          <span className="achievement-state">
            <span>{item.rawCurrent > 0 ? t("achievement.in_progress") : t("v2.ach.not_started")}</span>
            <b>{percent}%</b>
          </span>
        )}
      </div>
      <h2>{t(`badge.${item.type}`)}</h2>
      <p>{t(`badge.tooltip_${item.type}`)}</p>
      <div className={`achievement-meter ${tone}`}>
        <i style={{ ["--progress" as string]: `${percent}%` }} />
      </div>
      <div className="achievement-bottom">
        <span>{bottom}</span>
        <strong>
          {owned ? t("v2.ach.complete_short") : `${Math.min(item.rawCurrent, item.target)} / ${item.target}`}
        </strong>
      </div>
    </article></div>
  );
}
