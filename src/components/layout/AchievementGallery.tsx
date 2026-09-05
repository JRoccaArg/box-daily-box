import { useEffect, useState } from "react";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/context";
import {
  apiGetUserBadges,
  apiResetFeaturedBadges,
  apiSetFeaturedBadges,
  type AchievementBadgeType,
  type FeaturedSlot,
  type UserBadges,
} from "@/lib/api";
import { formatBadgeTooltip } from "@/lib/badgeFormat";
import { getIdentityToken } from "@/lib/identity";

const MAX_FEATURED = 3;

const TONE: Record<
  AchievementBadgeType,
  { border: string; iconBg: string; progress: string }
> = {
  ach_legend_50: {
    border: "border-t-[#B88912]",
    iconBg: "bg-[#B88912]/10",
    progress: "bg-[#B88912]",
  },
  ach_wins_500: {
    border: "border-t-[#A0A5AF]",
    iconBg: "bg-[#A0A5AF]/10",
    progress: "bg-[#A0A5AF]",
  },
  ach_legend_10: {
    border: "border-t-[#D7A51D]",
    iconBg: "bg-[#D7A51D]/10",
    progress: "bg-[#D7A51D]",
  },
  ach_wins_100: {
    border: "border-t-[#7C818C]",
    iconBg: "bg-[#7C818C]/10",
    progress: "bg-[#7C818C]",
  },
  ach_specialist_50: {
    border: "border-t-[#C7783C]",
    iconBg: "bg-[#C7783C]/10",
    progress: "bg-[#C7783C]",
  },
  ach_perfect_day: {
    border: "border-t-[#2EAD6B]",
    iconBg: "bg-[#2EAD6B]/10",
    progress: "bg-[#2EAD6B]",
  },
  ach_complete: {
    border: "border-t-[#4A86DD]",
    iconBg: "bg-[#4A86DD]/10",
    progress: "bg-[#4A86DD]",
  },
};

/**
 * Fallback para un logro que el backend devuelve pero este bundle todavía no
 * conoce (deploy escalonado: backend agregó un logro nuevo al catálogo antes
 * de que el frontend se actualice). Sin esto, `TONE[item.type]` es `undefined`
 * y `tone.border` tira toda la galería abajo.
 */
const DEFAULT_TONE = {
  border: "border-t-ink-faint",
  iconBg: "bg-white/10",
  progress: "bg-ink-faint",
};

type AchievementGalleryProps = { userId: string };

export function AchievementGallery({ userId }: AchievementGalleryProps) {
  const { t } = useI18n();
  const [data, setData] = useState<UserBadges | null>(null);
  const [featured, setFeatured] = useState<FeaturedSlot[]>([]);
  const [automatic, setAutomatic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGetUserBadges(userId).then((res) => {
      if (cancelled) return;
      setData(res);
      setFeatured(res?.featured ?? []);
      setAutomatic(res?.featured === null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-ink-faint">
        {t("achievement.loading")}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="py-8 text-center text-sm text-ink-faint">
        {t("achievement.load_error")}
      </p>
    );
  }

  const unlockedCount = data.achievements.filter((item) => item.unlocked).length;
  const atCap = featured.length >= MAX_FEATURED;
  const original = data.featured;
  const isDirty = automatic
    ? original !== null
    : original === null || JSON.stringify(featured) !== JSON.stringify(original);

  function isSelected(type: AchievementBadgeType): boolean {
    return !automatic && featured.some((slot) => slot.type === type);
  }

  function toggleAchievement(type: AchievementBadgeType) {
    setSavedFlash(false);
    setError(null);
    if (automatic) {
      setAutomatic(false);
      setFeatured([{ type }]);
      return;
    }
    if (isSelected(type)) {
      setFeatured((current) => current.filter((slot) => slot.type !== type));
      return;
    }
    if (atCap) return;
    setFeatured((current) => [...current, { type }]);
  }

  function removeFeatured(index: number) {
    setSavedFlash(false);
    setError(null);
    setAutomatic(false);
    setFeatured((current) => current.filter((_, i) => i !== index));
  }

  async function saveSelection() {
    setSaving(true);
    setError(null);
    const result = await apiSetFeaturedBadges(userId, featured, getIdentityToken());
    setSaving(false);
    if (!result || "error" in result) {
      setError(t("badge.save_error"));
      return;
    }
    setData((current) => (current ? { ...current, featured: result.featured } : current));
    setFeatured(result.featured);
    setAutomatic(false);
    setSavedFlash(true);
  }

  async function resetAutomatic() {
    setSaving(true);
    setError(null);
    const result = await apiResetFeaturedBadges(userId, getIdentityToken());
    setSaving(false);
    if (!result || "error" in result) {
      setError(t("badge.save_error"));
      return;
    }
    setData((current) => (current ? { ...current, featured: null } : current));
    setFeatured([]);
    setAutomatic(true);
    setSavedFlash(true);
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-sm uppercase tracking-wide text-ink">
            {t("achievement.title")}
          </h3>
          <p className="mt-1 text-xs text-ink-faint">
            {t("achievement.unlocked_count", {
              count: unlockedCount,
              total: data.achievements.length,
            })}
          </p>
        </div>
        <span className="tnum text-xs font-semibold text-ink-muted">
          {Math.round(
            data.achievements.reduce((sum, item) => sum + item.percent, 0) /
              Math.max(1, data.achievements.length),
          )}%
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-asphalt-800/70 p-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-display text-xs uppercase tracking-wide text-ink">
            {t("achievement.featured_title")}
          </h4>
          <span className="text-[11px] text-ink-faint">
            {automatic
              ? t("achievement.automatic_badge")
              : t("badge.featured_count", { count: featured.length })}
          </span>
        </div>

        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
          {automatic
            ? t("achievement.automatic_hint")
            : t("achievement.manual_hint")}
        </p>

        {!automatic && featured.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {featured.map((slot, index) => (
              <button
                key={`${slot.type}-${index}`}
                type="button"
                onClick={() => removeFeatured(index)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-asphalt-600 px-2 py-1 text-[11px] text-ink transition-colors hover:border-racing/40 hover:text-white"
                title={t("achievement.remove_featured", {
                  name: t(`badge.${slot.type}`),
                })}
                aria-label={t("achievement.remove_featured", {
                  name: t(`badge.${slot.type}`),
                })}
              >
                <BadgeIcon type={slot.type} size={13} />
                <span>{t(`badge.${slot.type}`)}</span>
                <span aria-hidden className="text-ink-faint">×</span>
              </button>
            ))}
          </div>
        )}

        {!automatic && featured.length === 0 && (
          <p className="mt-2.5 rounded-md border border-dashed border-white/10 px-2.5 py-2 text-[11px] text-ink-faint">
            {t("achievement.none_selected")}
          </p>
        )}

        {atCap && (
          <p className="mt-2 text-[11px] text-sector-yellow/90">
            {t("achievement.max_reached")}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={saveSelection}
            disabled={!isDirty || automatic || saving}
          >
            {saving ? t("badge.saving") : t("badge.save")}
          </Button>
          {!automatic && (
            <button
              type="button"
              onClick={resetAutomatic}
              disabled={saving}
              className="text-[11px] text-ink-faint underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
            >
              {t("achievement.use_automatic")}
            </button>
          )}
          {savedFlash && !isDirty && (
            <span className="text-xs text-sector-green">{t("badge.saved")}</span>
          )}
          {error && <span className="text-xs text-racing-400">{error}</span>}
        </div>
      </div>

      <div className="space-y-2.5">
        {data.achievements.map((item) => {
          const tone = TONE[item.type] ?? DEFAULT_TONE;
          const selected = isSelected(item.type);
          const disabled = !item.unlocked || (!selected && !automatic && atCap);
          const tooltip = formatBadgeTooltip(item.type, undefined, t);
          return (
            <button
              key={item.type}
              type="button"
              disabled={disabled}
              onClick={() => toggleAchievement(item.type)}
              aria-pressed={selected}
              title={tooltip}
              className={[
                "w-full rounded-lg border border-t-2 bg-asphalt-700/70 p-3 text-left transition-all",
                tone.border,
                selected
                  ? "border-racing/50 ring-1 ring-racing/30"
                  : "border-x-white/10 border-b-white/10",
                item.unlocked
                  ? "hover:-translate-y-0.5 hover:bg-asphalt-700"
                  : "cursor-default opacity-65",
                !item.unlocked && !selected ? "saturate-50" : "",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <span
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                    tone.iconBg,
                  ].join(" ")}
                >
                  <BadgeIcon type={item.type} size={25} title={tooltip} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-display text-sm text-ink">
                      {t(`badge.${item.type}`)}
                    </span>
                    <span
                      className={[
                        "shrink-0 text-[10px] font-semibold uppercase tracking-wide",
                        item.unlocked ? "text-sector-green" : "text-ink-faint",
                      ].join(" ")}
                    >
                      {item.unlocked
                        ? t("achievement.unlocked")
                        : t("achievement.in_progress")}
                    </span>
                  </span>

                  <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                    {tooltip}
                  </span>

                  <span className="mt-2.5 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-asphalt-900">
                      <span
                        className={["block h-full rounded-full transition-[width]", tone.progress].join(" ")}
                        style={{ width: `${item.percent}%` }}
                      />
                    </span>
                    <span className="tnum min-w-[58px] text-right text-[10px] font-semibold text-ink-faint">
                      {item.current}/{item.target} · {item.percent}%
                    </span>
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
