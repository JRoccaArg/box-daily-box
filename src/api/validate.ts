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
const DATEKEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;
const COUNTRY_RE = /^[A-Z]{3}$/;

/** Valida que un userId sea un UUID o un id anónimo generado por nosotros. */
export function isValidUserId(v: unknown): v is string {
  return typeof v === "string" && (UUID_RE.test(v) || ANON_RE.test(v));
}

/** Valida formato YYYY-MM-DD. */
export function isValidDateKey(v: unknown): v is string {
  if (typeof v !== "string" || !DATEKEY_RE.test(v)) return false;
  const d = new Date(v + "T12:00:00Z");
  return !Number.isNaN(d.getTime());
}

/** Valida formato YYYY-MM. */
export function isValidMonth(v: unknown): v is string {
  return typeof v === "string" && MONTH_RE.test(v);
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
