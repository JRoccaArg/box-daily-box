// src/hooks/useIdentityEditor.ts
//
// Edición de nombre + país para las páginas v2 (tarjeta de piloto en Acceso y
// "Tu identidad" en Perfil). Replica EXACTAMENTE las reglas de IdentityModal:
//  - Nombre 1..30 caracteres (el server además lo sanea), único sin importar
//    mayúsculas: se consulta /username-available con 500 ms de espera. Si la
//    API no responde, no bloquea (el server decide al guardar).
//  - Un cambio de nombre por mes calendario (UTC) una vez que ya tenés uno:
//    `canChangeName` lo informa el server y con él se bloquea el campo.
//  - País: si el server ya tiene uno, queda FIJO (no se envía). Si no, se
//    propone el detectado por IP cuando no hay uno local válido.
//  - Guardar exige respuesta del server (es quien crea/valida la identidad).
//
// Todo lo que lee la identidad local corre en efectos: estas páginas se
// prerenderizan y en el server no existe localStorage.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getIdentity,
  getIdentityToken,
  isIdentityComplete,
  setIdentityToken,
  updateIdentity,
} from "@/lib/identity";
import { apiCheckUsernameAvailable, apiGetUserProfile, apiUpdateUserProfile } from "@/lib/api";
import { detectCountryCode } from "@/lib/geoip";
import { NATIONALITIES } from "@/data/nationalities";
import { profileErrorKey } from "@/lib/v2/apiErrors";
import { emit, Events } from "@/lib/events";

export type NameStatus = "idle" | "checking" | "available" | "taken";

const isValidCountry = (c: string) => c.length === 3 && c in NATIONALITIES;

export function useIdentityEditor() {
  const [ready, setReady] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [savedCountry, setSavedCountry] = useState("");
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [canChangeName, setCanChangeName] = useState(true);
  const [countryLocked, setCountryLocked] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [nameStatus, setNameStatus] = useState<NameStatus>("idle");
  const [saving, setSaving] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [established, setEstablished] = useState(false);
  const savingRef = useRef(false);

  // Carga inicial: identidad local + perfil del server (+ país por IP).
  useEffect(() => {
    let cancelled = false;
    const identity = getIdentity();
    const localCountry = isValidCountry(identity.countryCode ?? "") ? (identity.countryCode as string) : "";
    setUserId(identity.userId);
    setSavedName(identity.displayName);
    setSavedCountry(localCountry);
    setName(identity.displayName);
    setCountry(localCountry);
    setComplete(isIdentityComplete());

    (async () => {
      const profile = await apiGetUserProfile(identity.userId);
      if (cancelled) return;
      if (profile) {
        const serverName = profile.displayName ?? identity.displayName;
        const country = profile.countryCode ?? localCountry;
        setName(serverName);
        setSavedName(serverName);
        setSavedCountry(country);
        setComplete(!!serverName.trim() && isValidCountry(country));
        setEstablished(!!getIdentityToken());
        updateIdentity({ displayName: serverName, countryCode: country });
        emit(Events.PROFILE_CHANGED);
        setCanChangeName(profile.canChangeName);
      }
      const serverCountry = profile?.countryCode ?? null;
      if (serverCountry) {
        setCountry(serverCountry);
        setCountryLocked(true);
        setReady(true);
        return;
      }
      setCountryLocked(false);
      setReady(true);
      if (!localCountry) {
        setDetecting(true);
        const detected = await detectCountryCode();
        if (cancelled) return;
        setDetecting(false);
        if (detected) setCountry((current) => current || detected);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmedName = name.trim();
  const nameValid = trimmedName.length > 0 && trimmedName.length <= 30;
  const countryValid = isValidCountry(country);
  const nameChanged = trimmedName !== savedName;
  // Mismo criterio que IdentityModal: con identidad completa y sin permiso
  // del server para cambiar el nombre este mes, el campo queda bloqueado.
  const nameLocked = !canChangeName && complete;

  // Disponibilidad en tiempo real (debounce 500 ms), solo si el nombre cambió.
  useEffect(() => {
    let cancelled = false;
    if (!ready || !nameChanged || !nameValid) {
      setNameStatus("idle");
      return;
    }
    setNameStatus("checking");
    const timer = window.setTimeout(async () => {
      const available = await apiCheckUsernameAvailable(trimmedName, userId);
      if (cancelled) return;
      setNameStatus(available === null ? "idle" : available ? "available" : "taken");
    }, 500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [ready, trimmedName, nameChanged, nameValid, userId]);

  const canSave =
    ready &&
    nameValid &&
    countryValid &&
    !saving &&
    (canChangeName || !nameChanged) &&
    nameStatus !== "taken" &&
    nameStatus !== "checking";

  /** true si no hay nada que mandar al server (identidad ya completa y sin cambios). */
  const unchanged = ready && complete && established && !nameChanged && country === savedCountry;

  /** Guarda (si hace falta). Devuelve true si la identidad quedó completa y guardada. */
  const save = useCallback(async (): Promise<boolean> => {
    setErrorKey(null);
    if (unchanged) return true;
    if (!canSave || savingRef.current) return false;
    savingRef.current = true;
    setSaving(true);
    const updates: { displayName?: string; countryCode?: string } = {};
    if (nameChanged || !established) updates.displayName = trimmedName;
    if (!countryLocked && countryValid) updates.countryCode = country;
    const result = await apiUpdateUserProfile(userId, updates, getIdentityToken());
    setSaving(false);
    savingRef.current = false;
    if (!result || "error" in result) {
      const key = profileErrorKey(result);
      if (key === "profile.name_taken") setNameStatus("taken");
      setErrorKey(key);
      return false;
    }
    if (result.identityToken) setIdentityToken(result.identityToken);
    const finalName = result.displayName ?? trimmedName;
    const finalCountry = result.countryCode ?? country;
    updateIdentity({ displayName: finalName, countryCode: finalCountry });
    setSavedName(finalName);
    setSavedCountry(finalCountry);
    setName(finalName);
    setCountry(finalCountry);
    setCountryLocked(true);
    setCanChangeName(result.canChangeName);
    setComplete(true);
    setEstablished(true);
    emit(Events.PROFILE_CHANGED);
    return true;
  }, [unchanged, canSave, nameChanged, established, trimmedName, countryLocked, countryValid, country, userId]);

  return {
    ready,
    userId,
    name,
    setName: (value: string) => {
      setErrorKey(null);
      setName(value);
    },
    country,
    setCountry: (value: string) => {
      setErrorKey(null);
      setCountry(value);
    },
    savedName,
    savedCountry,
    complete,
    nameValid,
    nameChanged,
    nameLocked,
    nameStatus,
    canChangeName,
    countryLocked,
    countryValid,
    detecting,
    saving,
    canSave,
    unchanged,
    errorKey,
    save,
  };
}

export type IdentityEditor = ReturnType<typeof useIdentityEditor>;

/** Mes (0..11, UTC) en el que se vuelve a poder cambiar el nombre. */
export function nextNameChangeMonth(now: Date = new Date()): number {
  return (now.getUTCMonth() + 1) % 12;
}
