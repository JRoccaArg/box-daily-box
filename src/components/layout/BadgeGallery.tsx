// src/components/layout/BadgeGallery.tsx
//
// Galería de badges propios + selector de "destacados" (los que se muestran
// inline junto al nombre en el ranking global). Interacción confirmada con el
// usuario: tap para agregar/quitar (hasta 3), toggle "Agrupar" por tipo cuando
// hay más de un ejemplar de ese tipo. Guardado explícito (botón "Guardar"),
// igual que IdentityModal, no autosave por tap.

import { useEffect, useState } from "react";
import { useI18n } from "@/context";
import { Button } from "@/components/ui/Button";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { getIdentityToken } from "@/lib/identity";
import {
  apiGetUserBadges,
  apiSetFeaturedBadges,
  type UserBadges,
  type FeaturedSlot,
} from "@/lib/api";

const MONTHLY_TYPES: FeaturedSlot["type"][] = [
  "monthly_gold",
  "monthly_silver",
  "monthly_bronze",
];
const MAX_FEATURED = 3;

type BadgeGalleryProps = { userId: string };

export function BadgeGallery({ userId }: BadgeGalleryProps) {
  const { t } = useI18n();
  const [data, setData] = useState<UserBadges | null>(null);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<FeaturedSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const res = await apiGetUserBadges(userId);
      if (cancelled) return;
      setData(res);
      setFeatured(res?.featured ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading || !data) return null; // fire-and-forget: si no responde, no se muestra nada.

  const ownedTypes = MONTHLY_TYPES.filter((ty) => (data.counts[ty] ?? 0) > 0);
  const hasRoleBadge = data.role === "admin" || data.role === "superadmin";

  if (ownedTypes.length === 0 && !hasRoleBadge) {
    return (
      <div className="mb-4 rounded-lg border border-white/5 bg-asphalt-700/50 px-4 py-3">
        <p className="text-xs text-ink-faint">{t("badge.gallery_empty")}</p>
      </div>
    );
  }

  const isGrouped = (ty: FeaturedSlot["type"]) =>
    featured.some((f) => f.type === ty && f.grouped);
  const individualCount = (ty: FeaturedSlot["type"]) =>
    featured.filter((f) => f.type === ty && !f.grouped).length;
  const isFeatured = (ty: FeaturedSlot["type"]) =>
    isGrouped(ty) || individualCount(ty) > 0;
  const atCap = featured.length >= MAX_FEATURED;
  const isDirty = JSON.stringify(featured) !== JSON.stringify(data.featured ?? []);

  function toggleFeatured(ty: FeaturedSlot["type"]) {
    setSavedFlash(false);
    if (isFeatured(ty)) {
      setFeatured((f) => f.filter((s) => s.type !== ty));
      return;
    }
    if (atCap) return; // el botón ya está deshabilitado; guarda extra.
    const owned = data!.counts[ty] ?? 0;
    const slot: FeaturedSlot = owned > 1 ? { type: ty, grouped: true } : { type: ty };
    setFeatured((f) => [...f, slot]);
  }

  function toggleGrouping(ty: FeaturedSlot["type"]) {
    setSavedFlash(false);
    const owned = data!.counts[ty] ?? 0;
    const without = featured.filter((s) => s.type !== ty);
    if (isGrouped(ty)) {
      const capacityLeft = MAX_FEATURED - without.length;
      const n = Math.max(1, Math.min(owned, capacityLeft));
      setFeatured([...without, ...Array.from({ length: n }, () => ({ type: ty }))]);
    } else {
      setFeatured([...without, { type: ty, grouped: true }]);
    }
  }

  function monthsLabel(ty: FeaturedSlot["type"]): string {
    const months = data!.owned
      .filter((b) => b.type === ty && b.referenceMonth)
      .map((b) => {
        const [y, m] = b.referenceMonth!.split("-");
        const monthName = t(`month.${Number(m) - 1}`);
        return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${y}`;
      });
    return months.join(", ");
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await apiSetFeaturedBadges(userId, featured, getIdentityToken());
    setSaving(false);
    if (!result) {
      setError(t("badge.save_error"));
      return;
    }
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setData((d) => (d ? { ...d, featured: result.featured } : d));
    setFeatured(result.featured);
    setSavedFlash(true);
  }

  return (
    <div className="mb-4 rounded-lg border border-white/5 bg-asphalt-700/50 p-3">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-xs uppercase tracking-wide text-ink">
          {t("badge.gallery_title")}
        </h4>
        {ownedTypes.length > 0 && (
          <span className="text-[11px] text-ink-faint">
            {t("badge.featured_count", { count: featured.length })}
          </span>
        )}
      </div>

      {hasRoleBadge && (
        <div className="mt-2 flex items-center gap-2 rounded-md bg-asphalt-800/60 px-2.5 py-1.5">
          <BadgeIcon type={data.role as "admin" | "superadmin"} size={16} />
          <span className="text-xs font-medium text-ink">{t(`badge.${data.role}`)}</span>
        </div>
      )}

      {ownedTypes.length > 0 && (
        <>
          <p className="mt-2 text-[11px] text-ink-faint">{t("badge.gallery_hint")}</p>

          <div className="mt-2 space-y-1.5">
            {ownedTypes.map((ty) => {
              const owned = data.counts[ty] ?? 0;
              const featuredNow = isFeatured(ty);
              const disabled = !featuredNow && atCap;
              return (
                <div key={ty}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleFeatured(ty)}
                    className={[
                      "flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-colors",
                      featuredNow
                        ? "border-racing/40 bg-racing/10"
                        : "border-white/10 bg-asphalt-800/40 hover:bg-asphalt-800",
                      disabled ? "cursor-not-allowed opacity-40" : "",
                    ].join(" ")}
                  >
                    <BadgeIcon type={ty} count={owned} size={18} />
                    <span className="text-sm font-medium text-ink">{t(`badge.${ty}`)}</span>
                    {owned > 1 && (
                      <span className="text-xs text-ink-faint">×{owned}</span>
                    )}
                  </button>
                  {owned > 1 && featuredNow && (
                    <div className="mt-1 flex gap-1 pl-1">
                      <button
                        type="button"
                        onClick={() => toggleGrouping(ty)}
                        className={[
                          "rounded px-2 py-0.5 text-[11px]",
                          isGrouped(ty)
                            ? "bg-asphalt-600 text-white"
                            : "text-ink-faint hover:text-ink",
                        ].join(" ")}
                      >
                        {t("badge.show_grouped", { count: owned })}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleGrouping(ty)}
                        className={[
                          "rounded px-2 py-0.5 text-[11px]",
                          !isGrouped(ty)
                            ? "bg-asphalt-600 text-white"
                            : "text-ink-faint hover:text-ink",
                        ].join(" ")}
                      >
                        {t("badge.show_individual")}
                      </button>
                    </div>
                  )}
                  <p className="mt-0.5 pl-1 text-[10px] text-ink-faint">
                    {t("badge.won_months", { months: monthsLabel(ty) })}
                  </p>
                </div>
              );
            })}
          </div>

          {atCap && (
            <p className="mt-1.5 text-[11px] text-sector-yellow/90">{t("badge.max_reached")}</p>
          )}

          <div className="mt-2.5 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              {saving ? t("badge.saving") : t("badge.save")}
            </Button>
            {savedFlash && !isDirty && (
              <span className="text-xs text-sector-green">{t("badge.saved")}</span>
            )}
            {error && <span className="text-xs text-racing-400">{error}</span>}
          </div>
        </>
      )}
    </div>
  );
}
