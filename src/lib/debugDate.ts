/**
 * Override de fecha SOLO STAGING (roadmap Box_Daily_Box_Roadmap.md #1).
 *
 * Gateado por VITE_STAGING=true, seteado únicamente en el proyecto Vercel de
 * staging (proyecto separado de producción). Con tree-shaking, `isStagingBuild`
 * es una constante en build time: en producción esta rama nunca se ejecuta,
 * pero además el código completo no aporta nada si igual quedara en el bundle
 * (no hay backend que honre el header sin STAGING_DEBUG del lado servidor).
 */
const OVERRIDE_KEY = "__debug_date_override";

export function isStagingBuild(): boolean {
  return import.meta.env.VITE_STAGING === "true";
}

/** 'YYYY-MM-DD' elegido en el debug panel, o null si no hay override activo. */
export function getDebugDateOverride(): string | null {
  if (!isStagingBuild()) return null;
  try {
    return localStorage.getItem(OVERRIDE_KEY);
  } catch {
    return null;
  }
}

export function setDebugDateOverride(dateKey: string | null): void {
  if (!isStagingBuild()) return;
  try {
    if (dateKey) localStorage.setItem(OVERRIDE_KEY, dateKey);
    else localStorage.removeItem(OVERRIDE_KEY);
  } catch {
    /* localStorage no disponible (modo privado, etc.) — no hay override, ok. */
  }
}

/** "Ahora" efectivo: la fecha overrideada (mediodía local, evita líos de huso) o la real. */
export function getEffectiveNow(): Date {
  const override = getDebugDateOverride();
  if (override) {
    const [y, m, d] = override.split("-").map(Number) as [number, number, number];
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  return new Date();
}
