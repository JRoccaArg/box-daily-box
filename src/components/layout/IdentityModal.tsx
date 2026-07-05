// src/components/layout/IdentityModal.tsx

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/context";
import {
  getIdentity,
  updateIdentity,
  isIdentityComplete,
  getIdentityToken,
  setIdentityToken,
} from "@/lib/identity";
import { apiGetUserProfile, apiUpdateUserProfile, apiCheckUsernameAvailable } from "@/lib/api";
import { detectCountryCode } from "@/lib/geoip";
import { loginWithGoogle, isLoggedIn, logout, getUserEmail } from "@/lib/auth";
import { NATIONALITIES } from "@/data/nationalities";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { RankBadge } from "./RankBadge";

type IdentityModalProps = {
  open: boolean;
  onClose: () => void;
};

export function IdentityModal({ open, onClose }: IdentityModalProps) {
  const { t } = useI18n();
  const identity = getIdentity();

  const initialCountry =
    identity.countryCode && identity.countryCode.length === 3 && identity.countryCode in NATIONALITIES
      ? identity.countryCode
      : "";
  const hasValidLocalCountry = initialCountry.length === 3;

  const [name, setName] = useState(identity.displayName);
  const [country, setCountry] = useState<string>(initialCountry);
  const [canChangeName, setCanChangeName] = useState(true);
  const [countryLocked, setCountryLocked] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameStatus, setNameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  /** Nombre del mes siguiente. */
  function nextMonthName(): string {
    const d = new Date();
    const nextMonth = (d.getUTCMonth() + 1) % 12;
    return t(`month.${nextMonth}`);
  }

  useEffect(() => {
    if (!open) return;
    setError(null);

    (async () => {
      const profile = await apiGetUserProfile(identity.userId);
      const serverCountry = profile?.countryCode ?? null;

      if (profile) {
        if (profile.displayName) setName(profile.displayName);
        setCanChangeName(profile.canChangeName);
      }

      if (serverCountry) {
        setCountry(serverCountry);
        setCountryLocked(true);
      } else {
        setCountryLocked(false);
        if (!hasValidLocalCountry) {
          setDetecting(true);
          const detected = await detectCountryCode();
          setDetecting(false);
          if (detected) setCountry(detected);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, identity.userId, identity.countryCode]);

  const trimmedName = name.trim();
  const nameValid = trimmedName.length > 0 && trimmedName.length <= 30;
  const countryValid = country.length === 3 && country in NATIONALITIES;
  const nameChanged = trimmedName !== identity.displayName;

  // Verificación en tiempo real: solo si el nombre cambió y es válido.
  // Debounce de 500ms para no golpear la API en cada tecla.
  useEffect(() => {
    if (!nameChanged || !nameValid) {
      setNameStatus("idle");
      return;
    }
    setNameStatus("checking");
    const timer = setTimeout(async () => {
      const available = await apiCheckUsernameAvailable(trimmedName, identity.userId);
      // available === null significa que la API no respondió; no bloquear.
      if (available === null) {
        setNameStatus("idle");
      } else {
        setNameStatus(available ? "available" : "taken");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [trimmedName, nameChanged, nameValid, identity.userId]);

  const canSave =
    nameValid &&
    countryValid &&
    !saving &&
    (canChangeName || !nameChanged) &&
    nameStatus !== "taken" &&
    nameStatus !== "checking";

  const handleSave = async () => {
    setError(null);
    if (!canSave) return;
    setSaving(true);

    const updates: { displayName?: string; countryCode?: string } = {};
    if (nameChanged) updates.displayName = trimmedName;
    if (!countryLocked && countryValid) updates.countryCode = country;

    const result = await apiUpdateUserProfile(
      identity.userId,
      updates,
      getIdentityToken(),
    );
    setSaving(false);

    if (!result) {
      setError(t("profile.save_error"));
      return;
    }
    if ("error" in result) {
      // Errores conocidos con clave i18n; el resto muestra el string crudo.
      if (result.code === "username_taken") {
        setNameStatus("taken");
        setError(t("profile.name_taken"));
      } else {
        setError(result.error);
      }
      return;
    }

    if (result.identityToken) {
      setIdentityToken(result.identityToken);
    }

    updateIdentity({
      displayName: result.displayName ?? trimmedName,
      countryCode: result.countryCode ?? country,
    });

    onClose();
  };

  const currentCountry = NATIONALITIES[country];

  return (
    <Modal open={open} onClose={onClose} title={t("profile.title")}>
      <p className="text-sm text-ink-muted">
        {t("profile.subtitle")}
      </p>

      <div className="mt-4">
        <RankBadge />
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="identity-name"
            className="mb-1 block text-xs font-medium text-ink-muted"
          >
            {t("profile.name_label")}
          </label>
          <input
            id="identity-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder={t("profile.name_placeholder")}
            autoComplete="off"
            disabled={!canChangeName && isIdentityComplete()}
            className={[
              "w-full rounded-lg border bg-asphalt-700 px-4 py-3 text-ink placeholder:text-ink-faint focus:border-racing/50 disabled:opacity-60 disabled:cursor-not-allowed",
              nameStatus === "taken"
                ? "border-red-500/60"
                : nameStatus === "available"
                  ? "border-sector-green/60"
                  : "border-white/15",
            ].join(" ")}
          />
          {/* Estado de disponibilidad en tiempo real */}
          {nameChanged && nameValid && nameStatus === "checking" && (
            <p className="mt-1 text-[11px] text-ink-faint">
              {t("profile.name_checking")}
            </p>
          )}
          {nameChanged && nameValid && nameStatus === "available" && (
            <p className="mt-1 text-[11px] text-sector-green">
              {t("profile.name_available")}
            </p>
          )}
          {nameChanged && nameValid && nameStatus === "taken" && (
            <p className="mt-1 text-[11px] text-red-400">
              {t("profile.name_taken")}
            </p>
          )}
          {/* Hint permanente de unicidad */}
          {(nameStatus === "idle" || !nameChanged) && (
            <p className="mt-1 text-[11px] text-ink-faint">
              {t("profile.name_unique_hint")}
            </p>
          )}
          {!canChangeName && isIdentityComplete() && (
            <p className="mt-1 text-[11px] text-ink-faint">
              {t("profile.name_locked", { month: nextMonthName() })}
            </p>
          )}
          {canChangeName && isIdentityComplete() && (
            <p className="mt-1 text-[11px] text-ink-faint">
              {t("profile.name_warn")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="identity-country"
            className="mb-1 block text-xs font-medium text-ink-muted"
          >
            {t("profile.country_label")}{" "}
            {detecting && <span className="text-ink-faint">{t("profile.country_detecting")}</span>}
          </label>
          {countryLocked ? (
            <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-asphalt-700/60 px-4 py-3 text-ink-muted">
              {currentCountry ? (
                <>
                  <span className={`fi fi-${currentCountry.alpha2}`} role="img" aria-label={currentCountry.name} />
                  <span>{currentCountry.name} ({currentCountry.code})</span>
                </>
              ) : (
                <span>{country}</span>
              )}
              <span className="ml-auto text-[11px] text-ink-faint">{t("profile.country_fixed")}</span>
            </div>
          ) : (
            <CountrySelect
              id="identity-country"
              value={country}
              onChange={setCountry}
              placeholder={t("profile.country_select")}
              disabled={detecting}
            />
          )}
          {!countryLocked && (
            <p className="mt-1 text-[11px] text-ink-faint">
              {t("profile.country_warn")}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <Button variant="primary" block onClick={handleSave} disabled={!canSave}>
          {saving ? t("profile.saving") : t("profile.save")}
        </Button>
        {isIdentityComplete() && (
          <Button variant="ghost" block onClick={onClose}>
            {t("profile.cancel")}
          </Button>
        )}
      </div>

      {/* ─── Login con Google ────────────────────────────────────── */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-wider text-ink-faint">
          {t("profile.sync_label")}
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {isLoggedIn() ? (
        <div className="rounded-lg border border-white/10 bg-asphalt-700/50 p-3">
          <p className="text-xs text-ink-muted mb-1">{t("profile.logged_as")}</p>
          <p className="text-sm font-medium mb-3 truncate">{getUserEmail()}</p>
          <Button
            variant="ghost"
            block
            onClick={() => {
              logout();
              window.location.reload();
            }}
          >
            {t("profile.logout")}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-white/15 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          {t("profile.google_login")}
        </button>
      )}

      <p className="mt-3 text-center text-[11px] text-ink-faint">
        {isLoggedIn() ? t("profile.logged_hint") : t("profile.login_hint")}
      </p>
    </Modal>
  );
}
