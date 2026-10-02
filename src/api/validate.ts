// src/api/validate.ts
//
// Helpers de validación y sanitización de inputs del cliente.
// Toda entrada del usuario pasa por acá antes de tocar la DB.
//
// Nota sobre SQL injection: usamos SIEMPRE queries parametrizadas ($1, $2...)
// con el driver `pg`, que escapa los valores. Estas validaciones son una
// capa ADICIONAL (defensa en profundidad): limitan longitud y formato para
// evitar abuso de recursos y datos basura, no son la única barrera.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ANON_RE = /^anon-[0-9a-f-]{36}$/i;
const DATEKEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;
const YEAR_RE = /^\d{4}$/;
const COUNTRY_RE = /^[A-Z]{3}$/;

/** Valida que un userId sea un UUID o un id anónimo generado por nosotros. */
export function isValidUserId(v: unknown): v is string {
  return typeof v === "string" && (UUID_RE.test(v) || ANON_RE.test(v));
}

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m: number): number {
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

/**
 * Valida una fecha 'YYYY-MM-DD' que EXISTA en el calendario.
 *
 * El formato solo no alcanza: `new Date("2026-02-30")` en V8 no es inválida,
 * "rueda" al 2 de marzo, así que antes una fecha imposible pasaba esta
 * validación y reventaba recién en Postgres (`::date`) como un 500. El año 0
 * tampoco existe para Postgres.
 */
export function isValidDateKey(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const m = DATEKEY_RE.exec(v);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < 1 || month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(year, month);
}

/** Valida un mes 'YYYY-MM' que exista (mes 01..12, año >= 1). */
export function isValidMonth(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const m = MONTH_RE.exec(v);
  if (!m) return false;
  const month = Number(m[2]);
  return Number(m[1]) >= 1 && month >= 1 && month <= 12;
}

/** Valida un año 'YYYY' (>= 0001; Postgres no tiene año 0). */
export function isValidYear(v: unknown): v is string {
  return typeof v === "string" && YEAR_RE.test(v) && Number(v) >= 1;
}

/** Valida un código de país ISO alpha-3 (3 letras mayúsculas, ej: "ARG"). */
export function isValidCountry(v: unknown): v is string {
  return typeof v === "string" && COUNTRY_RE.test(v);
}

/**
 * Sanitiza un display name: recorta, limita a 30 chars, quita caracteres de
 * control y colapsa espacios. Nunca lanza; siempre devuelve algo usable.
 */
export function sanitizeDisplayName(v: unknown): string {
  if (typeof v !== "string") return "Anónimo";
  // Quitar caracteres de control (incluye newlines, tabs) y trim.
  // eslint-disable-next-line no-control-regex
  const cleaned = v.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
  const limited = cleaned.substring(0, 30);
  return limited.length > 0 ? limited : "Anónimo";
}

/**
 * Sanitiza un sessionToken: debe ser string, longitud acotada, y con el
 * formato "base64.hex". No valida la firma (eso lo hace verifyToken), solo
 * evita procesar basura gigante.
 */
export function isPlausibleToken(v: unknown): v is string {
  if (typeof v !== "string") return false;
  if (v.length < 20 || v.length > 4096) return false;
  return v.includes(".");
}

/**
 * Valida que la solución sea un objeto plano de tamaño razonable.
 * Rechaza arrays gigantes, objetos anidados profundos, etc.
 */
export function isPlausibleSolution(v: unknown): v is Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  if (keys.length === 0 || keys.length > 12) return false;
  // El grid de bingo es el mayor: 9 strings. Limitamos el JSON serializado.
  try {
    if (JSON.stringify(v).length > 4096) return false;
  } catch {
    return false; // referencias circulares, etc.
  }
  return true;
}
