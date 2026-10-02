import { BadgeShape } from "@/components/ui/BadgeIcon";
import type { DisplayBadge } from "@/lib/api";
import { formatBadgeTooltip } from "@/lib/badgeFormat";
import { useV2I18n } from "@/hooks/useV2I18n";

export function InlineBadges({ badges }: { badges: DisplayBadge[] }) {
 const { t } = useV2I18n();
 return <span className="v2-inline-badges">{badges.map((badge, index) =>
  <span key={index} className="mini-badge" title={formatBadgeTooltip(badge.type, badge.months, t)}
   role="img" aria-label={formatBadgeTooltip(badge.type, badge.months, t)}>
   <BadgeShape type={badge.type} size={16}/>{badge.count > 1 && <small>×{badge.count}</small>}
  </span>)}</span>;
}
