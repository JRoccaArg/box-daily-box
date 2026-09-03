// src/lib/analytics.ts
//
// Punto unico para mandar eventos de producto (que juego se juega mas, donde
// abandona la gente, etc). Ningun componente de juego debe llamar a `gtag`
// o al `track` de Vercel directamente: todos pasan por `trackEvent()` aca,
// asi el criterio de consentimiento vive en un solo lugar.
//
// Criterio (decidido con el usuario): Vercel Analytics no usa cookies, asi
// que manda SIEMPRE, apenas haya algo que medir. Google Analytics si usa
// cookies, asi que solo manda si el usuario ya toco "Aceptar" en el cartel
// de consentimiento (ver consent.ts). Si rechaza o no decidio, GA no recibe
// nada — ni siquiera queda en cola esperando.

import { track as vercelTrack } from "@vercel/analytics";
import { getConsent } from "./consent";

type EventValue = string | number | boolean;
export type EventProps = Record<string, EventValue>;

/** Manda un evento de producto. Vercel siempre; GA solo con consentimiento. */
export function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  try {
    vercelTrack(name, props);
  } catch {
    // No bloquear la app si el script de Vercel todavia no cargo.
  }

  if (getConsent() === "granted" && window.gtag) {
    window.gtag("event", name, props);
  }
}
