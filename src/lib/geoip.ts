// src/lib/geoip.ts
//
// Detección automática de país por IP del cliente.
// Usa el servicio gratuito ipapi.co (10.000 requests/día).
// Fallback: si falla, devuelve null y el usuario elige manualmente.
//
// Sin API key. Sin costo. Sin login.
//
// IMPORTANTE: ipapi.co devuelve códigos ISO alpha-2 (2 letras: "AR"),
// pero nuestro dataset de NATIONALITIES usa ISO alpha-3 (3 letras: "ARG").
// Esta función mapea alpha-2 → alpha-3 antes de devolver, y valida que
// el país mapeado exista en el dataset. Si no existe (ej: país sin pilotos
// F1), devuelve null y el usuario elige manualmente.

import { NATIONALITIES } from "@/data/nationalities";

const GEOIP_URL = "https://ipapi.co/json/";
const TIMEOUT_MS = 3000;

type GeoResponse = {
  country_code?: string; // ISO 3166-1 alpha-2 (ej: "AR", "US")
  error?: boolean;
};

/**
 * Mapa ISO alpha-2 → alpha-3 para los países presentes en NATIONALITIES.
 * Solo incluye los ~40 países que tienen pilotos en el dataset F1.
 * Países no incluidos: el usuario elige manualmente.
 */
const ALPHA2_TO_ALPHA3: Record<string, string> = {
  AR: "ARG", AU: "AUS", AT: "AUT", BE: "BEL", BR: "BRA",
  CA: "CAN", CH: "CHE", CL: "CHL", CN: "CHN", CO: "COL",
  CZ: "CZE", DE: "DEU", DK: "DNK", ES: "ESP", FI: "FIN",
  FR: "FRA", GB: "GBR", HU: "HUN", ID: "IDN", IN: "IND",
  IE: "IRL", IT: "ITA", JP: "JPN", LI: "LIE", MA: "MAR",
  MC: "MCO", MX: "MEX", MY: "MYS", NL: "NLD", NZ: "NZL",
  PL: "POL", PT: "PRT", RU: "RUS", SE: "SWE", TH: "THA",
  UY: "URY", US: "USA", VE: "VEN", ZA: "ZAF", ZW: "ZWE",
};

/**
 * Convierte un código alpha-2 (ej: "AR") al alpha-3 usado por NATIONALITIES
 * (ej: "ARG"). Devuelve null si el país no existe en el dataset.
 */
export function alpha2ToAlpha3(alpha2: string): string | null {
  const up = alpha2.toUpperCase();
  const mapped = ALPHA2_TO_ALPHA3[up];
  if (!mapped) return null;
  // Sanity check: el código mapeado debe existir en NATIONALITIES.
  if (!(mapped in NATIONALITIES)) return null;
  return mapped;
}

/**
 * Detecta el país del cliente por su IP.
 * @returns Country code ISO alpha-3 (ej: "ARG") o null si falla o no está
 *          en el dataset de países F1.
 */
export async function detectCountryCode(): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timeout = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const res = await fetch(GEOIP_URL, {
      signal: ctrl.signal,
      credentials: "omit",
    });
    window.clearTimeout(timeout);

    if (!res.ok) return null;
    const data = (await res.json()) as GeoResponse;

    if (data.error) return null;
    const code = data.country_code;
    if (typeof code !== "string" || code.length !== 2) return null;

    // Convertir alpha-2 → alpha-3 y validar contra el dataset.
    return alpha2ToAlpha3(code);
  } catch {
    return null;
  }
}
