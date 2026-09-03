// src/lib/consent.ts
//
// Estado de consentimiento de cookies/analiticas (RGPD). Mismo espiritu que
// toast.ts: un store a nivel de modulo (sin contexto de React) para que
// cualquier parte de la app pueda leer/cambiar el consentimiento y suscribirse
// a sus cambios sin pasar props ni envolver nada en un Provider.
//
// Alcance: SOLO controla lo nuevo que si usa cookies (Google Analytics, etapa
// 3). La cookie tecnica `bdb_uid` (identidad anonima, ver identity.ts) es
// estrictamente necesaria y queda EXENTA de este consentimiento. Vercel Web
// Analytics no usa cookies y corre siempre (ver Layout.tsx), tampoco depende
// de esto.
//
// Implementa Google Consent Mode v2: se fija `analytics_storage: denied` por
// defecto ANTES de que cargue Google Analytics (etapa 3), y recien se pasa a
// `granted` cuando la persona toca "Aceptar". Si rechaza o ignora el cartel,
// GA nunca guarda cookies.

import { emit, on } from "./events";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Decision guardada. `null` = todavia no decidio (mostrar el cartel). */
export type ConsentValue = "granted" | "denied";

const STORAGE_KEY = "bdb_consent";
const EVENT = "consent:changed";

/** Flag en memoria para reabrir el cartel desde "Gestionar cookies" (footer)
 *  sin borrar la decision previa hasta que elija de nuevo. */
let reopened = false;

/** Lee la decision guardada. Devuelve null si nunca decidio o si no hay acceso
 *  a localStorage (modo privado, SSR). */
export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** true si hay que mostrar el cartel: cuando no hay decision previa, o cuando
 *  el usuario pidio reabrirlo desde el footer. */
export function shouldShowBanner(): boolean {
  return reopened || getConsent() === null;
}

/** Guarda la decision, actualiza Google Consent Mode y avisa a los suscriptores. */
export function setConsent(value: ConsentValue): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Sin localStorage (modo privado): igual actualizamos consent mode en
      // memoria para esta sesion; solo no persiste entre visitas.
    }
    updateConsentMode(value);
  }
  reopened = false;
  emit(EVENT);
}

/** Reabre el cartel (link "Gestionar cookies" del footer) para cambiar la
 *  eleccion. No borra la decision hasta que elija de nuevo. */
export function reopenConsent(): void {
  reopened = true;
  emit(EVENT);
}

export function onConsentChanged(fn: () => void): () => void {
  return on(EVENT, fn);
}

// ─── Google Consent Mode v2 ──────────────────────────────────────────────

let consentModeReady = false;

function gtag(...args: unknown[]): void {
  // GA lee de window.dataLayer; empujamos ahi aunque GA todavia no haya
  // cargado (etapa 3). Cuando cargue, procesa estos comandos en orden.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/** Fija los valores por defecto de Consent Mode (todo denegado) una sola vez,
 *  lo antes posible en el cliente y ANTES de cargar GA. Idempotente. */
export function ensureConsentMode(): void {
  if (typeof window === "undefined" || consentModeReady) return;
  consentModeReady = true;
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
  // Si ya habia una decision guardada de una visita anterior, reflejarla.
  const prev = getConsent();
  if (prev) updateConsentMode(prev);
}

function updateConsentMode(value: ConsentValue): void {
  ensureConsentMode();
  gtag("consent", "update", {
    analytics_storage: value === "granted" ? "granted" : "denied",
  });
}

// Fija los defaults ni bien se importa este modulo en el cliente. Con SSG este
// archivo puede importarse en el servidor: el guard de window lo hace no-op ahi.
ensureConsentMode();
