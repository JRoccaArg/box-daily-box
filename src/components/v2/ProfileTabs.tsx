// src/components/v2/ProfileTabs.tsx
//
// Pestañas personales del boceto: Mi recorrido / Logros / Amigos. Llevan el
// aviso de lo que "necesita mirada" (antes era el globito del botón Stats):
// punto en Logros si hay logros sin ver en este dispositivo, y contador en
// Amigos si hay solicitudes entrantes sin responder.

import { Link } from "react-router-dom";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
import { achievementsPath, friendsPath, profilePath } from "@/lib/routes";
import { useUnseenAchievementsCount } from "@/lib/achievements";
import { usePendingFriendRequestsCount } from "@/lib/friendsPolling";
import { useMounted } from "@/lib/useMounted";

type Tab = "profile" | "achievements" | "friends";

export function ProfileTabs({ active, social = false }: { active: Tab; social?: boolean }) {
  const { t, locale } = useI18n();
  const mounted = useMounted();
  const unseen = useUnseenAchievementsCount();
  const pending = usePendingFriendRequestsCount();

  const tabs: Array<{ id: Tab; to: string; label: string; notice?: string; count?: number }> = [
    { id: "profile", to: profilePath(locale), label: t("v2.tabs.journey") },
    {
      id: "achievements",
      to: achievementsPath(locale),
      label: t("stats.tab_achievements"),
      notice: mounted && unseen > 0 && active !== "achievements" ? t("header.unseen_achievements_dot") : undefined,
    },
    {
      id: "friends",
      to: friendsPath(locale),
      label: t("friends.tab_title"),
      count: mounted && pending > 0 ? pending : undefined,
    },
  ];

  return (
    <nav className={`profile-tabs${social ? " social-tabs" : ""}`} aria-label={t("v2.tabs.aria")}>
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.to}
          className={tab.id === active ? "active" : undefined}
          aria-current={tab.id === active ? "page" : undefined}
        >
          {tab.label}
          {tab.notice && <i className="v2-tab-dot" role="img" aria-label={tab.notice} />}
          {tab.count !== undefined && (
            <b className="v2-tab-count" aria-label={t("header.pending_requests", { count: tab.count })}>
              {tab.count}
            </b>
          )}
        </Link>
      ))}
    </nav>
  );
}
