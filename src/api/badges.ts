// src/api/badges.ts
//
// Lógica del sistema de badges (podio mensual). Aislada y testeable: recibe un
// ejecutor de queries INYECTABLE (`QueryFn`), de modo que la misma lógica SQL
// corre tanto contra el pool de Postgres (producción) como contra PGlite (tests),
// sin duplicar SQL ni divergir del ranking oficial.
//
// Decisiones de diseño (ver plan / roadmap):
//  - Solo se GUARDAN badges de podio mensual. admin/superadmin se DERIVAN de
//    users.role en tiempo de lectura (revocar el rol quita el badge, sin filas huérfanas).
//  - El award es idempotente y SOLO-AGREGA: nunca revoca. Las correcciones (raras y
//    siempre deliberadas) se hacen a mano en la DB.
//  - Un mes solo se premia si está CERRADO (anterior al mes actual del server).

/** Ejecutor de queries mínimo, compatible con `pg` (Pool/Client) y con PGlite. */
export type QueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;

/** Tipos de badge que se persisten en la tabla `badges` (podio mensual). */
export const MONTHLY_BADGE_TYPES = [
  "monthly_gold",
  "monthly_silver",
  "monthly_bronze",
] as const;
export type MonthlyBadgeType = (typeof MONTHLY_BADGE_TYPES)[number];

/** Mapea la posición del podio (1..3) al tipo de badge correspondiente. */
const RANK_TO_BADGE: Record<number, MonthlyBadgeType> = {
  1: "monthly_gold",
  2: "monthly_silver",
  3: "monthly_bronze",
};

/** Orden de jerarquía para el default de destacados (oro > plata > bronce). */
const BADGE_HIERARCHY: readonly string[] = MONTHLY_BADGE_TYPES;

/** Máximo de badges destacados elegibles inline (admin/superadmin va aparte). */
export const MAX_FEATURED = 3;

export function isMonthlyBadgeType(v: unknown): v is MonthlyBadgeType {
  return (
    typeof v === "string" &&
    (MONTHLY_BADGE_TYPES as readonly string[]).includes(v)
  );
}

/** Primer día del mes (UTC) al que pertenece `d`, como 'YYYY-MM-01'. */
export function monthStartOf(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Mes anterior (UTC) al de `now`, como 'YYYY-MM'. Usado por el cron de cierre automático. */
export function previousMonthKey(now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Calcula el podio (posiciones 1..3, incluyendo empates) de un mes.
 *
 * Reutiliza EXACTAMENTE los filtros del ranking oficial
 * (`won AND NOT flagged AND ranked`) y el mismo rango mensual
 * `[YYYY-MM-01, +1 month)` que `getRankingMonthly`, para no divergir.
 *
 * Desempate determinista: points > games_won > days_played. Los empatados en un
 * mismo puesto comparten el badge de ese puesto (semántica de `RANK()`).
 *
 * @param monthStart primer día del mes objetivo, 'YYYY-MM-01'.
 */
export async function computeMonthlyPodium(
  q: QueryFn,
  monthStart: string,
): Promise<Array<{ userId: string; rank: number }>> {
  const res = await q(
    `WITH ranked AS (
       SELECT u.id AS user_id,
              RANK() OVER (
                ORDER BY SUM(a.points) DESC,
                         COUNT(a.id) DESC,
                         COUNT(DISTINCT a.date_key) DESC
              ) AS rnk
       FROM attempts a
       JOIN users u ON a.user_id = u.id
       WHERE a.won AND NOT a.flagged AND a.ranked
         AND a.date_key >= $1::date
         AND a.date_key < ($1::date + INTERVAL '1 month')
       GROUP BY u.id
     )
     SELECT user_id, rnk FROM ranked WHERE rnk <= 3 ORDER BY rnk`,
    [monthStart],
  );
  return res.rows.map((r) => {
    const row = r as { user_id: string; rnk: number | string };
    return { userId: row.user_id, rank: Number(row.rnk) };
  });
}

/** Error tipado que indica que el mes solicitado todavía no cerró. */
export class MonthNotClosedError extends Error {
  code = "MONTH_NOT_CLOSED" as const;
  constructor(message = "El mes no está cerrado todavía") {
    super(message);
    this.name = "MonthNotClosedError";
  }
}

/**
 * Entrega (idempotente, solo-agrega) los badges de podio de un mes CERRADO.
 *
 *  - Rechaza meses no cerrados (>= mes actual del server) con `MonthNotClosedError`.
 *  - Inserta con `ON CONFLICT DO NOTHING`: dos requests concurrentes no duplican.
 *  - NUNCA revoca badges (las correcciones se hacen a mano en la DB).
 *
 * Para atomicidad en producción, pasá el `client.query` de una transacción como `q`.
 *
 * @param month 'YYYY-MM'
 * @param now   inyectable para tests; por defecto el ahora del server.
 */
export async function awardMonthlyPodium(
  q: QueryFn,
  month: string,
  now: Date = new Date(),
): Promise<{
  month: string;
  monthStart: string;
  awarded: Array<{ userId: string; badgeType: MonthlyBadgeType }>;
}> {
  const monthStart = `${month}-01`;
  const currentMonthStart = monthStartOf(now);
  // Comparación lexicográfica válida porque ambas son 'YYYY-MM-01'.
  if (monthStart >= currentMonthStart) {
    throw new MonthNotClosedError();
  }

  const podium = await computeMonthlyPodium(q, monthStart);
  const awarded: Array<{ userId: string; badgeType: MonthlyBadgeType }> = [];
  for (const { userId, rank } of podium) {
    const badgeType = RANK_TO_BADGE[rank];
    if (!badgeType) continue; // fuera de 1..3 (no debería ocurrir por el WHERE)
    const ins = await q(
      `INSERT INTO badges (user_id, badge_type, reference_month)
       VALUES ($1, $2, $3::date)
       ON CONFLICT (user_id, badge_type, reference_month) DO NOTHING
       RETURNING id`,
      [userId, badgeType, monthStart],
    );
    if (ins.rows.length > 0) awarded.push({ userId, badgeType });
  }
  return { month, monthStart, awarded };
}

// ─── Visualización de badges (inline en el ranking) ──────────────────

/**
 * Un badge listo para renderizar inline junto al nombre. `count > 1` => contador.
 * `months` ('YYYY-MM'[], orden descendente) solo aplica a tipos mensuales
 * (oro/plata/bronce) — alimenta el tooltip ("Ganador de Junio 2026", etc.).
 * admin/superadmin no tienen meses (se derivan del rol, no de un evento puntual).
 */
export type DisplayBadge = { type: string; count: number; months?: string[] };

/** Un slot de la selección de destacados del usuario. */
export type FeaturedSlot = { type: MonthlyBadgeType; grouped?: boolean };

/**
 * Deriva los badges a mostrar inline junto al nombre en el ranking.
 *
 *  - admin/superadmin (derivado de `role`) va SIEMPRE primero y NO cuenta contra
 *    el límite de destacados.
 *  - Luego hasta `MAX_FEATURED` slots según `featured` (o un default por jerarquía
 *    si el usuario no eligió).
 *
 * Es DEFENSIVO: descarta slots inválidos o desactualizados (badges que el usuario
 * ya no posee) para que una selección vieja nunca rompa el ranking.
 *
 * @param ownedCounts   { badge_type -> cantidad } de badges ganados por el usuario.
 * @param role          'user' | 'admin' | 'superadmin'
 * @param featured      selección del usuario o null (usar default).
 * @param monthsByType  { badge_type -> ['YYYY-MM', ...] } para el tooltip (opcional,
 *                      retrocompatible con llamadas/tests que no lo pasan).
 */
export function deriveDisplayBadges(
  ownedCounts: Record<string, number>,
  role: string,
  featured: FeaturedSlot[] | null,
  monthsByType: Record<string, string[]> = {},
): DisplayBadge[] {
  const out: DisplayBadge[] = [];
  if (role === "superadmin") out.push({ type: "superadmin", count: 1 });
  else if (role === "admin") out.push({ type: "admin", count: 1 });

  if (!featured || !Array.isArray(featured) || featured.length === 0) {
    // Default: tipos de mayor jerarquía agrupados con su contador, hasta el límite.
    for (const type of BADGE_HIERARCHY) {
      if (out.length - baseAdminCount(role) >= MAX_FEATURED) break;
      const c = ownedCounts[type] ?? 0;
      if (c > 0) out.push({ type, count: c, months: monthsByType[type] ?? [] });
    }
    return out;
  }

  // Selección explícita: respetar orden, validar propiedad y capacidad.
  const individualUsed: Record<string, number> = {};
  for (const slot of featured) {
    if (out.length - baseAdminCount(role) >= MAX_FEATURED) break;
    if (!slot || !isMonthlyBadgeType(slot.type)) continue;
    const owned = ownedCounts[slot.type] ?? 0;
    if (owned <= 0) continue;
    const months = monthsByType[slot.type] ?? [];
    if (slot.grouped) {
      out.push({ type: slot.type, count: owned, months });
    } else {
      const used = individualUsed[slot.type] ?? 0;
      if (used >= owned) continue; // no puede mostrar más de los que tiene
      individualUsed[slot.type] = used + 1;
      out.push({ type: slot.type, count: 1, months });
    }
  }
  return out;
}

function baseAdminCount(role: string): number {
  return role === "admin" || role === "superadmin" ? 1 : 0;
}

/**
 * Valida ESTRICTAMENTE una selección de destacados recibida del cliente (WRITE).
 * A diferencia de `deriveDisplayBadges` (lectura, defensiva), acá rechazamos con
 * error claro cualquier cosa inválida, para responder 422.
 *
 * Reglas: array de <= MAX_FEATURED slots; cada slot con `type` de badge mensual
 * que el usuario POSEE; sin exceder la cantidad poseída (anti-inflado); admin/
 * superadmin NO son elegibles (se muestran siempre, aparte).
 */
export function validateFeaturedSelection(
  input: unknown,
  ownedCounts: Record<string, number>,
): { ok: true; value: FeaturedSlot[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: "featured debe ser un array" };
  if (input.length > MAX_FEATURED) {
    return { ok: false, error: `Máximo ${MAX_FEATURED} badges destacados` };
  }
  const value: FeaturedSlot[] = [];
  const individualUsed: Record<string, number> = {};
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) {
      return { ok: false, error: "Slot inválido" };
    }
    const { type, grouped } = raw as { type?: unknown; grouped?: unknown };
    if (!isMonthlyBadgeType(type)) {
      return { ok: false, error: "Tipo de badge inválido o no elegible" };
    }
    if (grouped !== undefined && typeof grouped !== "boolean") {
      return { ok: false, error: "grouped debe ser booleano" };
    }
    const owned = ownedCounts[type] ?? 0;
    if (owned <= 0) return { ok: false, error: "No poseés ese badge" };
    if (grouped) {
      value.push({ type, grouped: true });
    } else {
      const used = (individualUsed[type] ?? 0) + 1;
      if (used > owned) {
        return { ok: false, error: "No poseés esa cantidad de ese badge" };
      }
      individualUsed[type] = used;
      value.push({ type });
    }
  }
  return { ok: true, value };
}
