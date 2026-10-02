// src/api/ranking.ts
//
// Ranking público (diario, mensual y anual): carga, caché, filtro y paginado.
// Mismo patrón que badges.ts: el SQL recibe un `QueryFn` INYECTABLE, así
// scripts/test-ranking-paginated.ts corre exactamente esta query contra PGlite.
//
// Reglas de negocio (no cambian respecto del ranking anterior):
//  - Quién aparece: `NOT flagged AND ranked`. Incluye a quien jugó y perdió
//    (0 puntos). Orden `points DESC, u.id ASC`; el puesto es la posición + 1.
//  - Filtro de país: alpha-3 contra `users.country_code`; el puesto pasa a ser
//    la posición DENTRO del país.
//  - La racha se muestra con `displayStreak` usando el "hoy" del server.
//
// Diseño pensado para ~10.000 jugadores por mes:
//  - Un "snapshot" por (tipo, período), SIN filtro de país, cacheado en memoria
//    con TTL corto. El país se filtra en memoria sobre el snapshot (re-numerando
//    los puestos), así un ranking por país no dispara otra query.
//  - El snapshot guarda la racha CRUDA (`current_streak` + `last_win_date`) y
//    `displayStreak` se aplica al leer: el "hoy" puede cambiar mientras la
//    entrada sigue viva en caché.
//  - Dos requests simultáneos con la caché vencida comparten la MISMA promesa
//    (una sola query a la base).

import type { DisplayBadge, FeaturedSlot } from "./badges";
import { displayStreak, toDateKey } from "./streak";
import {
  isValidCountry,
  isValidDateKey,
  isValidMonth,
  isValidUserId,
  isValidYear,
} from "./validate";

/** Ejecutor de queries mínimo, compatible con `pg` (Pool/Client) y con PGlite. */
export type QueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;

export type RankingKind = "daily" | "monthly" | "annual";

/** Una fila del snapshot (sin puesto: el puesto depende del filtro de país). */
export type RankingRow = {
  userId: string;
  displayName: string;
  countryCode: string | null;
  role: string;
  featured: FeaturedSlot[] | null;
  points: number;
  gamesWon: number;
  daysPlayed: number;
  /** `users.current_streak` crudo (sin el death-check). */
  rawStreak: number;
  /** `users.last_win_date` como 'YYYY-MM-DD', o null. */
  lastWinDate: string | null;
};

export type RankedRow = RankingRow & { rank: number };

/** Entrada pública del ranking (mismo shape que antes de la paginación). */
export type RankingEntry = {
  rank: number;
  userId: string;
  displayName: string;
  countryCode: string | null;
  points: number;
  gamesWon: number;
  daysPlayed: number;
  currentStreak: number;
  displayBadges: DisplayBadge[];
};

/** Tamaño de tanda por defecto y máximo de la paginación. */
export const DEFAULT_PAGE_SIZE = 30;
export const MAX_PAGE_SIZE = 100;

/** TTL del snapshot por tipo de ranking. */
export const RANKING_TTL_MS: Record<RankingKind, number> = {
  daily: 10_000,
  monthly: 30_000,
  annual: 120_000,
};

/** Máximo de snapshots en memoria (se expulsa el más viejo). */
export const RANKING_CACHE_MAX_KEYS = 64;

// Rango de fechas por tipo. Usar rangos (y no date_trunc sobre la columna)
// permite aprovechar los índices por date_key. Constantes nuestras: interpolar
// en el SQL es seguro.
const PERIOD_FILTER: Record<RankingKind, string> = {
  daily: "a.date_key = $1::date",
  monthly: "a.date_key >= $1::date AND a.date_key < ($1::date + INTERVAL '1 month')",
  annual: "a.date_key >= $1::date AND a.date_key < ($1::date + INTERVAL '1 year')",
};

/**
 * Carga el ranking COMPLETO (sin filtro de país) de un período, ya ordenado.
 *
 * @param periodStart día ('YYYY-MM-DD'), primer día del mes ('YYYY-MM-01') o
 *                    primer día del año ('YYYY-01-01') según `kind`.
 */
export async function loadRankingRows(
  q: QueryFn,
  kind: RankingKind,
  periodStart: string,
): Promise<RankingRow[]> {
  const res = await q(
    `SELECT u.id, u.display_name, u.country_code, u.role, u.featured_badges,
            u.current_streak, to_char(u.last_win_date, 'YYYY-MM-DD') AS last_win_date,
            SUM(a.points) AS points,
            COUNT(*) FILTER (WHERE a.won) AS games_won,
            COUNT(DISTINCT a.date_key) AS days_played
       FROM attempts a
       JOIN users u ON a.user_id = u.id
      WHERE NOT a.flagged AND a.ranked
        AND ${PERIOD_FILTER[kind]}
      GROUP BY u.id, u.display_name, u.country_code, u.role, u.featured_badges,
               u.current_streak, u.last_win_date
      ORDER BY points DESC, u.id ASC`,
    [periodStart],
  );
  return res.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      userId: row.id as string,
      displayName: row.display_name as string,
      countryCode: (row.country_code as string) || null,
      role: (row.role as string) || "user",
      featured: (row.featured_badges as FeaturedSlot[] | null) ?? null,
      points: Number(row.points ?? 0),
      gamesWon: Number(row.games_won ?? 0),
      daysPlayed: Number(row.days_played ?? 0),
      rawStreak: Number(row.current_streak ?? 0),
      lastWinDate: toDateKey(row.last_win_date as string | Date | null),
    };
  });
}

/**
 * Filtra por país y pagina (función pura).
 *
 *  - `country` null = ranking global. Con país, el puesto se re-numera dentro
 *    del país.
 *  - `limit` null = lista completa (respuesta legacy, sin paginar).
 *  - `me` = la entrada de `userId` dentro de la lista filtrada (esté o no en la
 *    página), o null.
 */
export function paginateRanking(
  rows: readonly RankingRow[],
  opts: { country: string | null; limit: number | null; offset: number; userId: string | null },
): { total: number; top: RankedRow[]; me: RankedRow | null } {
  const filtered = opts.country ? rows.filter((r) => r.countryCode === opts.country) : rows;
  const offset = Math.max(0, opts.offset);
  const end = opts.limit === null ? filtered.length : offset + opts.limit;
  const top = filtered.slice(offset, end).map((r, i) => ({ ...r, rank: offset + i + 1 }));
  let me: RankedRow | null = null;
  if (opts.userId) {
    const idx = filtered.findIndex((r) => r.userId === opts.userId);
    const row = idx >= 0 ? filtered[idx] : undefined;
    if (row) me = { ...row, rank: idx + 1 };
  }
  return { total: filtered.length, top, me };
}

/** Arma la entrada pública aplicando el death-check de la racha con el "hoy" actual. */
export function toRankingEntry(
  r: RankedRow,
  todayKey: string,
  displayBadges: DisplayBadge[],
): RankingEntry {
  return {
    rank: r.rank,
    userId: r.userId,
    displayName: r.displayName,
    countryCode: r.countryCode,
    points: r.points,
    gamesWon: r.gamesWon,
    daysPlayed: r.daysPlayed,
    currentStreak: displayStreak(r.rawStreak, r.lastWinDate, todayKey),
    displayBadges,
  };
}

// ─── Parámetros del request ──────────────────────────────────────────

export type RankingQuery = {
  /** Clave pública del período: 'YYYY-MM-DD' | 'YYYY-MM' | 'YYYY'. */
  periodKey: string;
  /** Primer día del período como 'YYYY-MM-DD' (parámetro de loadRankingRows). */
  periodStart: string;
  country: string | null;
  /** null = respuesta legacy (lista completa, sin paginar). */
  limit: number | null;
  offset: number;
  userId: string | null;
};

const INT_RE = /^\d{1,9}$/;

/** Entero no negativo desde la query string, o null si no lo es. */
function parseNonNegativeInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isInteger(v) && v >= 0) return v;
  if (typeof v === "string" && INT_RE.test(v)) return Number(v);
  return null;
}

/**
 * Interpreta la query string del ranking. Nunca lanza: cualquier período
 * inválido o imposible (2026-02-30, 2026-13, año 0) cae al período ACTUAL, así
 * nunca llega una fecha rota al `::date` de Postgres (que respondería 500).
 *
 *  - `limit` ausente o vacío → modo legacy (null). Presente → modo paginado,
 *    acotado a 1..MAX_PAGE_SIZE; si no es un entero → DEFAULT_PAGE_SIZE.
 *  - `offset` entero >= 0; inválido → 0.
 *  - `userId` inválido → se ignora (me: null).
 */
export function parseRankingQuery(
  kind: RankingKind,
  raw: Record<string, unknown>,
  now: Date,
): RankingQuery {
  const todayKey = now.toISOString().slice(0, 10);
  let periodKey: string;
  let periodStart: string;
  if (kind === "daily") {
    periodKey = isValidDateKey(raw.date) ? raw.date : todayKey;
    periodStart = periodKey;
  } else if (kind === "monthly") {
    periodKey = isValidMonth(raw.month) ? raw.month : todayKey.slice(0, 7);
    periodStart = `${periodKey}-01`;
  } else {
    periodKey = isValidYear(raw.year) ? raw.year : todayKey.slice(0, 4);
    periodStart = `${periodKey}-01-01`;
  }

  let limit: number | null = null;
  if (raw.limit !== undefined && raw.limit !== "") {
    const n = parseNonNegativeInt(raw.limit);
    limit = n === null ? DEFAULT_PAGE_SIZE : Math.min(MAX_PAGE_SIZE, Math.max(1, n));
  }

  return {
    periodKey,
    periodStart,
    country: isValidCountry(raw.country) ? raw.country : null,
    limit,
    offset: parseNonNegativeInt(raw.offset) ?? 0,
    userId: isValidUserId(raw.userId) ? raw.userId : null,
  };
}

// ─── Caché de snapshots ──────────────────────────────────────────────

type CacheEntry = {
  rows: RankingRow[] | null;
  expiresAt: number;
  inflight: Promise<RankingRow[]> | null;
};

/**
 * Caché en memoria de snapshots del ranking, por (tipo, período).
 *
 *  - TTL por tipo (RANKING_TTL_MS), contado desde que ARRANCA la query: un
 *    snapshot nunca es más viejo que su TTL.
 *  - Requests concurrentes sin snapshot vigente comparten la promesa en vuelo.
 *  - Un error de la base no se cachea: el próximo request reintenta.
 *  - `invalidate` borra la entrada; si había una carga en vuelo, su resultado
 *    (posiblemente anterior a la escritura) ya no se guarda.
 *  - Como mucho `maxKeys` entradas: al pasarse se expulsa la cargada hace más
 *    tiempo (orden de inserción del Map).
 *
 * Es por proceso: con varias instancias del server, cada una tiene la suya y
 * la invalidación solo alcanza a la propia (el resto vive con el TTL).
 */
export class RankingSnapshotCache {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly ttlMs: Record<RankingKind, number>;
  private readonly maxKeys: number;
  private readonly now: () => number;

  constructor(
    private readonly load: (kind: RankingKind, periodStart: string) => Promise<RankingRow[]>,
    opts: { ttlMs?: Record<RankingKind, number>; maxKeys?: number; now?: () => number } = {},
  ) {
    this.ttlMs = opts.ttlMs ?? RANKING_TTL_MS;
    this.maxKeys = opts.maxKeys ?? RANKING_CACHE_MAX_KEYS;
    this.now = opts.now ?? Date.now;
  }

  get(kind: RankingKind, periodStart: string): Promise<RankingRow[]> {
    const key = `${kind}:${periodStart}`;
    const current = this.entries.get(key);
    if (current?.rows && current.expiresAt > this.now()) return Promise.resolve(current.rows);
    if (current?.inflight) return current.inflight;

    const startedAt = this.now();
    const entry: CacheEntry = { rows: null, expiresAt: 0, inflight: null };
    entry.inflight = this.load(kind, periodStart).then(
      (rows) => {
        // Solo se guarda si nadie invalidó/expulsó la entrada mientras tanto.
        if (this.entries.get(key) === entry) {
          entry.rows = rows;
          entry.expiresAt = startedAt + this.ttlMs[kind];
          entry.inflight = null;
        }
        return rows;
      },
      (err: unknown) => {
        if (this.entries.get(key) === entry) this.entries.delete(key);
        throw err;
      },
    );
    // delete + set: la entrada pasa al final del orden de inserción.
    this.entries.delete(key);
    this.entries.set(key, entry);
    while (this.entries.size > this.maxKeys) {
      const oldest = this.entries.keys().next().value as string;
      this.entries.delete(oldest);
    }
    return entry.inflight;
  }

  invalidate(kind: RankingKind, periodStart: string): void {
    this.entries.delete(`${kind}:${periodStart}`);
  }

  size(): number {
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }
}
