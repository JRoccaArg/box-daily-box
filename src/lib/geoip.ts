// src/lib/geoip.ts
//
// Detección automática de país por IP del cliente.
// Usa el servicio gratuito ipapi.co (10.000 requests/día).
// Fallback: si falla, devuelve null y el usuario elige manualmente.
//
// Sin API key. Sin costo. Sin login.

const GEOIP_URL = "https://ipapi.co/json/";
const TIMEOUT_MS = 3000;

type GeoResponse = {
  country_code?: string; // ISO 3166-1 alpha-2 (ej: "AR", "US")
  error?: boolean;
};

/**
 * Detecta el país del cliente por su IP.
 * @returns Country code ISO 3166-1 alpha-2 (ej: "AR") o null si falla.
 */
export async function detectCountryCode(): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timeout = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const res = await fetch(GEOIP_URL, {
      signal: ctrl.signal,
      // No credentials, no cookies.
      credentials: "omit",
    });
    window.clearTimeout(timeout);

    if (!res.ok) return null;
    const data = (await res.json()) as GeoResponse;

    if (data.error) return null;
    const code = data.country_code;
    if (typeof code !== "string" || code.length !== 2) return null;

    return code.toUpperCase();
  } catch {
    return null;
  }
}
