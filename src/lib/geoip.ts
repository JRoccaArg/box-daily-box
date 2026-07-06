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
// el país mapeado exista en el dataset. Si no existe, devuelve null y
// el usuario elige manualmente.

import { NATIONALITIES } from "@/data/nationalities";

const GEOIP_URL = "https://ipapi.co/json/";
const TIMEOUT_MS = 3000;

type GeoResponse = {
  country_code?: string; // ISO 3166-1 alpha-2 (ej: "AR", "US")
  error?: boolean;
};

/**
 * Mapa ISO alpha-2 → alpha-3 para los países presentes en NATIONALITIES.
 */
const ALPHA2_TO_ALPHA3: Record<string, string> = {
  // Americas
  AW: "ABW", AR: "ARG", AG: "ATG", BS: "BHS", BZ: "BLZ",
  BO: "BOL", BR: "BRA", BB: "BRB", CA: "CAN", CL: "CHL",
  CO: "COL", CR: "CRI", CU: "CUB", CW: "CUW", DM: "DMA",
  DO: "DOM", EC: "ECU", GD: "GRD", GT: "GTM", GY: "GUY",
  HN: "HND", HT: "HTI", JM: "JAM", KN: "KNA", LC: "LCA",
  MX: "MEX", NI: "NIC", PA: "PAN", PE: "PER", PR: "PRI",
  PY: "PRY", SV: "SLV", SR: "SUR", TT: "TTO", UY: "URY",
  US: "USA", VC: "VCT", VE: "VEN",
  // Europe
  AL: "ALB", AD: "AND", AT: "AUT", BE: "BEL", BG: "BGR",
  BA: "BIH", BY: "BLR", CH: "CHE", CY: "CYP", CZ: "CZE",
  DE: "DEU", DK: "DNK", ES: "ESP", EE: "EST", FI: "FIN",
  FR: "FRA", GB: "GBR", GE: "GEO", GR: "GRC", HR: "HRV",
  HU: "HUN", IE: "IRL", IS: "ISL", IT: "ITA", LI: "LIE",
  LT: "LTU", LU: "LUX", LV: "LVA", MC: "MCO", MD: "MDA",
  MK: "MKD", MT: "MLT", ME: "MNE", NL: "NLD", NO: "NOR",
  PL: "POL", PT: "PRT", RO: "ROU", RU: "RUS", SM: "SMR",
  RS: "SRB", SK: "SVK", SI: "SVN", SE: "SWE", TR: "TUR",
  UA: "UKR", XK: "XKO",
  // Middle East & Arab
  AE: "ARE", BH: "BHR", DZ: "DZA", EG: "EGY", IR: "IRN",
  IQ: "IRQ", IL: "ISR", JO: "JOR", KW: "KWT", LB: "LBN",
  LY: "LBY", MA: "MAR", OM: "OMN", PS: "PSE", QA: "QAT",
  SA: "SAU", SD: "SDN", SS: "SSD", SY: "SYR", TN: "TUN",
  YE: "YEM",
  // Asia & Oceania
  AF: "AFG", AM: "ARM", AU: "AUS", AZ: "AZE", BD: "BGD",
  BN: "BRN", BT: "BTN", CN: "CHN", FJ: "FJI", FM: "FSM",
  HK: "HKG", ID: "IDN", IN: "IND", JP: "JPN", KZ: "KAZ",
  KG: "KGZ", KH: "KHM", KI: "KIR", KR: "KOR", LA: "LAO",
  LK: "LKA", MO: "MAC", MV: "MDV", MH: "MHL", MM: "MMR",
  MN: "MNG", MY: "MYS", NP: "NPL", NR: "NRU", NZ: "NZL",
  PK: "PAK", PH: "PHL", PW: "PLW", PG: "PNG", KP: "PRK",
  SG: "SGP", SB: "SLB", TH: "THA", TJ: "TJK", TM: "TKM",
  TL: "TLS", TO: "TON", TV: "TUV", TW: "TWN", UZ: "UZB",
  VN: "VNM", VU: "VUT", WS: "WSM",
  // Africa
  AO: "AGO", BJ: "BEN", BF: "BFA", BW: "BWA", CF: "CAF",
  CI: "CIV", CM: "CMR", CD: "COD", KM: "COM", CV: "CPV",
  DJ: "DJI", ER: "ERI", ET: "ETH", GA: "GAB", GH: "GHA",
  GN: "GIN", GM: "GMB", GW: "GNB", GQ: "GNQ", KE: "KEN",
  LR: "LBR", LS: "LSO", MG: "MDG", ML: "MLI", MZ: "MOZ",
  MR: "MRT", MU: "MUS", MW: "MWI", NA: "NAM", NE: "NER",
  NG: "NGA", RW: "RWA", SN: "SEN", SL: "SLE", SO: "SOM",
  ST: "STP", SZ: "SWZ", TD: "TCD", TG: "TGO", TZ: "TZA",
  UG: "UGA", ZA: "ZAF", ZM: "ZMB", ZW: "ZWE",
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
 *          en el dataset de países.
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
