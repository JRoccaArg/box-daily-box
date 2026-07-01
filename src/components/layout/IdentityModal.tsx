// src/components/layout/IdentityModal.tsx
//
// Modal de perfil del usuario.
// Reglas:
//  - Al crear la cuenta: nombre requerido, país auto-detectado (editable primera vez).
//  - Después de la primera guardada:
//    * País FIJO (no editable). Se muestra como readonly.
//    * Nombre cambiable 1 vez por mes calendario (no acumulables).
//  - Si está logueado con Google, muestra email + botón cerrar sesión.
//  - Si no, muestra botón "Iniciar sesión con Google".

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  getIdentity,
  updateIdentity,
  isIdentityComplete,
} from "@/lib/identity";
import { apiGetUserProfile, apiUpdateUserProfile } from "@/lib/api";
import { detectCountryCode } from "@/lib/geoip";
import { loginWithGoogle, isLoggedIn, logout, getUserEmail } from "@/lib/auth";
import { NATIONALITIES } from "@/data/nationalities";

type IdentityModalProps = {
  open: boolean;
  onClose: () => void;
};

/** Nombre del mes siguiente en español, ej: "agosto". */
function nextMonthName(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 1);
  return new Intl.DateTimeFormat("es-AR", { month: "long" }).format(d);
}

export function IdentityModal({ open, onClose }: IdentityModalProps) {
  const identity = getIdentity();

  const [name, setName] = useState(identity.displayName);
  const [country, setCountry] = useState<string>(identity.countryCode ?? "");
  const [canChangeName, setCanChangeName] = useState(true);
  const [countryLocked, setCountryLocked] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuando se abre el modal, sincronizar con server.
  useEffect(() => {
    if (!open) return;
    setError(null);

    (async () => {
      const profile = await apiGetUserProfile(identity.userId);
      if (profile) {
        // Server es la fuente de verdad
        if (profile.displayName) setName(profile.displayName);
        if (profile.countryCode) {
          setCountry(profile.countryCode);
          setCountryLocked(true); // ya tiene país → fijo
        }
        setCanChangeName(profile.canChangeName);
      } else {
        // Usuario nuevo: intentar detectar país automáticamente
        if (!identity.countryCode) {
          setDetecting(true);
          const detected = await detectCountryCode();
          setDetecting(false);
          if (detected) setCountry(detected);
        }
      }
    })();
  }, [open, identity.userId, identity.countryCode]);

  const countries = Object.values(NATIONALITIES).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const trimmedName = name.trim();
  const nameValid = trimmedName.length > 0 && trimmedName.length <= 30;
  const countryValid = country.length === 2;
  const nameChanged = trimmedName !== identity.displayName;
  const canSave =
    nameValid && countryValid && !saving && (canChangeName || !nameChanged);

  const handleSave = async () => {
    setError(null);
    if (!canSave) return;
    setSaving(true);

    const updates: { displayName?: string; countryCode?: string } = {};
    if (nameChanged) updates.displayName = trimmedName;
    if (!countryLocked && countryValid) updates.countryCode = country;

    const result = await apiUpdateUserProfile(identity.userId, updates);
    setSaving(false);

    if (!result) {
      setError("No se pudo guardar. Intentá de nuevo.");
      return;
    }
    if ("error" in result) {
      setError(result.error);
      return;
    }

    // Guardar en localStorage también (sincronizado con server)
    updateIdentity({
      displayName: result.displayName ?? trimmedName,
      countryCode: result.countryCode ?? country,
    });

    onClose();
  };

  const currentCountry = NATIONALITIES[country];

  return (
    <Modal open={open} onClose={onClose} title="Tu perfil">
      <p className="text-sm text-ink-muted">
        Aparecerás en el ranking global con este nombre y país.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="identity-name"
            className="mb-1 block text-xs font-medium text-ink-muted"
          >
            Nombre (visible en ranking)
          </label>
          <input
            id="identity-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="Tu nombre o apodo"
            autoComplete="off"
            disabled={!canChangeName && isIdentityComplete()}
            className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink placeholder:text-ink-faint focus:border-racing/50 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {!canChangeName && isIdentityComplete() && (
            <p className="mt-1 text-[11px] text-ink-faint">
              Podrás volver a cambiarlo en {nextMonthName()}. Este mes ya usaste tu cambio de nombre.
            </p>
          )}
          {canChangeName && isIdentityComplete() && (
            <p className="mt-1 text-[11px] text-ink-faint">
              ⚠️ Solo podés cambiar tu nombre 1 vez por mes. Elegí bien antes de guardar.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="identity-country"
            className="mb-1 block text-xs font-medium text-ink-muted"
          >
            País {detecting && <span className="text-ink-faint">(detectando...)</span>}
          </label>
          {countryLocked ? (
            <div className="w-full rounded-lg border border-white/10 bg-asphalt-700/60 px-4 py-3 text-ink-muted">
              {currentCountry ? `${currentCountry.flag} ${currentCountry.name}` : country}
              <span className="ml-2 text-[11px] text-ink-faint">(fijo)</span>
            </div>
          ) : (
            <select
              id="identity-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={detecting}
              className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink"
            >
              <option value="">Selecciona tu país</option>
              {countries.map((n) => (
                <option key={n.code} value={n.code}>
                  {n.flag} {n.name}
                </option>
              ))}
            </select>
          )}
          {!countryLocked && (
            <p className="mt-1 text-[11px] text-ink-faint">
              ⚠️ Una vez guardado, no podés cambiarlo.
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
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        {isIdentityComplete() && (
          <Button variant="ghost" block onClick={onClose}>
            Cancelar
          </Button>
        )}
      </div>

      {/* ─── Login con Google ────────────────────────────────────── */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-wider text-ink-faint">
          Sincronizar entre dispositivos
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {isLoggedIn() ? (
        <div className="rounded-lg border border-white/10 bg-asphalt-700/50 p-3">
          <p className="text-xs text-ink-muted mb-1">Sesión iniciada como:</p>
          <p className="text-sm font-medium mb-3 truncate">{getUserEmail()}</p>
          <Button
            variant="ghost"
            block
            onClick={() => {
              logout();
              window.location.reload();
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-white/15 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z"
            />
          </svg>
          Iniciar sesión con Google
        </button>
      )}

      <p className="mt-3 text-center text-[11px] text-ink-faint">
        {isLoggedIn()
          ? "Tu progreso se sincroniza en todos tus dispositivos."
          : "Opcional. Iniciar sesión te permite jugar en varios dispositivos con la misma cuenta."}
      </p>
    </Modal>
  );
}
