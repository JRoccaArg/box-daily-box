// src/components/v2/BadgeMenu.tsx
//
// Desplegable para elegir la insignia de UNA casilla del ranking (perfil v2).
// Lista primero los 7 logros (todos, marcados "Desbloqueado" o "Bloqueado" con
// su avance) y después los podios que ya ganó. Solo se puede elegir lo que se
// posee; lo bloqueado y lo que ya está en otra casilla se ve pero no se elige.
// La lógica de qué es elegible vive en lib/v2/badgeSelection.ts (probada).

import { useEffect, useRef, type KeyboardEvent } from "react";
import { BadgeShape } from "@/components/ui/BadgeIcon";
import { useV2I18n } from "@/hooks/useV2I18n";
import { formatBadgePeriod, formatBadgeTooltip } from "@/lib/badgeFormat";
import { badgeTone, isPickable, pickerOptions, type PickerOption } from "@/lib/v2/badgeSelection";
import type { FeaturedSlot, UserBadges } from "@/lib/api";

type Props = {
  id: string;
  data: UserBadges;
  selection: FeaturedSlot[];
  /** Casilla (0..2) que se está editando. */
  slot: number;
  busy: boolean;
  onPick: (value: FeaturedSlot | null) => void;
  onClose: () => void;
};

export function BadgeMenu({ id, data, selection, slot, busy, onPick, onClose }: Props) {
  const { t } = useV2I18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const { achievements, podiums } = pickerOptions(data, selection, slot);

  // Al abrir (o cambiar de casilla) el foco va a la opción actual o, si no hay, a la primera elegible.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const target =
      root.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ??
      root.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])');
    target?.focus();
  }, [slot]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const options = [...(rootRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? [])];
    if (options.length === 0) return;
    event.preventDefault();
    const at = options.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "ArrowDown" ? at + 1 : at - 1;
    options[(next + options.length) % options.length]?.focus();
  }

  function stateText(o: PickerOption): string {
    if (o.state === "current") return t("v2.badges.state_current");
    if (o.state === "in-use") return t("v2.badges.state_in_use");
    if (o.podium) {
      if (o.grouped) return t("v2.badges.group_all", { count: o.count });
      if (o.count > 1) return t("v2.badges.group_one");
      const period = o.periods[0];
      return period ? t("v2.badges.won_once", { period: formatBadgePeriod(o.type, period, t) }) : t("v2.badges.state_unlocked");
    }
    if (o.state === "locked") {
      return o.progress
        ? `${t("v2.badges.state_locked")} · ${o.progress.current} / ${o.progress.target}`
        : t("v2.badges.state_locked");
    }
    return t("v2.badges.state_unlocked");
  }

  function renderOption(o: PickerOption) {
    const pickable = isPickable(o);
    const name = t(`badge.${o.type}`) + (o.podium && o.grouped ? ` ×${o.count}` : "");
    const silver = badgeTone(o.type) === "silver";
    return (
      <button
        key={o.key}
        type="button"
        role="option"
        tabIndex={-1}
        aria-selected={o.state === "current"}
        aria-disabled={pickable ? undefined : true}
        title={formatBadgeTooltip(o.type, o.periods.map((p) => p.substring(0, 7)), t)}
        className={`v2-badge-opt${o.state === "locked" ? " is-locked" : ""}${o.state === "in-use" ? " is-use" : ""}${o.state === "current" ? " is-current" : ""}`}
        disabled={busy}
        onClick={() => {
          if (!pickable) return;
          if (o.state === "current") {
            onClose();
            return;
          }
          onPick(o.grouped ? { type: o.type, grouped: true } : { type: o.type });
        }}
      >
        <span className={`v2-opt-medal${silver ? " silver" : ""}`}>
          <BadgeShape type={o.type} size={21} />
        </span>
        <span className="v2-opt-text">
          <strong>{name}</strong>
          <span className="v2-opt-state">{stateText(o)}</span>
        </span>
        {o.state === "current" && (
          <i className="v2-opt-tick" aria-hidden="true">
            ✓
          </i>
        )}
      </button>
    );
  }

  return (
    <div
      className="v2-badge-menu"
      id={id}
      ref={rootRef}
      style={{ ["--slot" as string]: slot }}
      onKeyDown={onKeyDown}
    >
      <div className="v2-badge-menu-head">
        <strong>{t("v2.badges.menu_title", { n: slot + 1 })}</strong>
        <button type="button" className="v2-badge-close" onClick={onClose} aria-label={t("v2.badges.close")}>
          ×
        </button>
      </div>
      <div role="listbox" aria-label={t("v2.badges.menu_title", { n: slot + 1 })}>
        <div role="group" aria-labelledby={`${id}-ach`}>
          <span className="v2-badge-menu-label" id={`${id}-ach`}>
            {t("v2.badges.menu_achievements")}
          </span>
          <div className="v2-badge-menu-grid">{achievements.map(renderOption)}</div>
        </div>
        <div role="group" aria-labelledby={`${id}-pod`}>
          <span className="v2-badge-menu-label" id={`${id}-pod`}>
            {t("v2.badges.menu_podiums")}
          </span>
          {podiums.length === 0 ? (
            <span className="v2-badge-menu-empty">{t("v2.badges.none_podium")}</span>
          ) : (
            <div className="v2-badge-menu-grid">{podiums.map(renderOption)}</div>
          )}
        </div>
      </div>
      {selection[slot] && (
        <button type="button" className="v2-badge-clear" disabled={busy} onClick={() => onPick(null)}>
          {t("v2.badges.clear")}
        </button>
      )}
    </div>
  );
}
