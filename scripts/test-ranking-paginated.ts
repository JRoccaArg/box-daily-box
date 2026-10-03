/**
 * Test del ranking paginado (diario / mensual / anual) — src/api/ranking.ts.
 *
 * Corre `loadRankingRows` (el SQL REAL de producción) contra Postgres en
 * memoria (PGlite) y las funciones puras de paginado, filtro de país, racha y
 * parseo de la query string.
 *
 * Cubre: orden (points DESC, id ASC), perdedores incluidos, no rankeados y
 * flaggeados excluidos, rangos diario/mensual/anual con sus bordes, daysPlayed
 * anual, paginado (offset/limit/total), `me` dentro y fuera de la página,
 * filtro de país con puesto re-numerado, death-check de la racha al leer y
 * validación estricta de período (fechas imposibles → período actual).
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-ranking-paginated.ts
 */
import { PGlite } from "@electric-sql/pglite";
import {
  RankingSnapshotCache,
  isSettledMonth,
  loadRankingRows,
  mergeMonthlyRows,
  monthsOfYear,
  paginateRanking,
  parseRankingQuery,
  toRankingEntry,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  RANKING_TTL_MS,
  SETTLED_MONTH_TTL_MS,
  type RankingKind,
  type RankingRow,
} from "../src/api/ranking";
import { isValidDateKey, isValidMonth, isValidYear } from "../src/api/validate";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${msg}`);
  }
}

const db = new PGlite();
const q = (sql: string, params?: unknown[]) => db.query(sql, params as any[]);

// Ids con forma de UUID (el orden de desempate es u.id ASC).
const U = (n: number) => `${String(n).repeat(8)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(12)}`;
const [U1, U2, U3, U4, U5, U6, U7] = [1, 2, 3, 4, 5, 6, 7].map(U) as [string, string, string, string, string, string, string];

async function setupSchema() {
  await db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY, display_name TEXT, country_code TEXT,
      role TEXT NOT NULL DEFAULT 'user', featured_badges JSONB,
      current_streak INT NOT NULL DEFAULT 0, best_streak INT NOT NULL DEFAULT 0,
      last_win_date DATE
    );
    CREATE TABLE attempts (
      id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      game_id TEXT NOT NULL, date_key DATE NOT NULL, difficulty TEXT NOT NULL,
      won BOOLEAN NOT NULL, time_seconds INTEGER, points INTEGER NOT NULL,
      flagged BOOLEAN DEFAULT false, ranked BOOLEAN DEFAULT true, duel_id TEXT,
      ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

async function user(id: string, name: string, country: string | null, extra: { streak?: number; lastWin?: string; role?: string } = {}) {
  await q(
    `INSERT INTO users (id, display_name, country_code, role, current_streak, last_win_date)
     VALUES ($1, $2, $3, $4, $5, $6::date)`,
    [id, name, country, extra.role ?? "user", extra.streak ?? 0, extra.lastWin ?? null],
  );
}

async function play(uid: string, game: string, dateKey: string, points: number, opts: { won?: boolean; flagged?: boolean; ranked?: boolean } = {}) {
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, flagged, ranked)
     VALUES ($1, $2, $3::date, 'medio', $4, $5, $6, $7)`,
    [uid, game, dateKey, opts.won ?? points > 0, points, opts.flagged ?? false, opts.ranked ?? true],
  );
}

const ids = (rows: Array<{ userId: string }>) => rows.map((r) => r.userId).join(",");

(async () => {
  await setupSchema();

  // ─── Datos ─────────────────────────────────────────────────────────
  await user(U1, "Uno", "ARG", { streak: 4, lastWin: "2026-07-15" });
  await user(U2, "Dos", "BRA");
  await user(U3, "Tres", "ARG");
  await user(U4, "Cuatro", "ARG");
  await user(U5, "Cinco", "ESP");
  await user(U6, "Seis", "ARG");
  await user(U7, "Siete", null);

  const DAY = "2026-07-15";
  await play(U1, "pittexto", DAY, 300);
  await play(U1, "polewordle", DAY, 0, { won: false }); // suma 0, cuenta día pero no victoria
  await play(U2, "pittexto", DAY, 200);
  await play(U6, "pittexto", DAY, 200); // empata con U2 → desempata u.id ASC (U2 antes)
  await play(U3, "pittexto", DAY, 0, { won: false }); // perdedor: aparece con 0
  await play(U4, "pittexto", DAY, 900, { ranked: false }); // regla de IP: excluido
  await play(U5, "pittexto", DAY, 999, { flagged: true }); // flaggeado: excluido
  await play(U7, "pittexto", DAY, 100);

  // ─── Diario ────────────────────────────────────────────────────────
  console.log("\n[loadRankingRows: diario]");
  const daily = await loadRankingRows(q, "daily", DAY);
  assert(ids(daily) === [U1, U2, U6, U7, U3].join(","), "orden points DESC, empate por u.id ASC, perdedor al fondo");
  assert(!daily.some((r) => r.userId === U4), "intento no rankeado (ranked=false) excluido");
  assert(!daily.some((r) => r.userId === U5), "intento flaggeado excluido");
  const d1 = daily[0]!;
  assert(d1.points === 300 && d1.gamesWon === 1 && d1.daysPlayed === 1, "U1: 300 pts, 1 victoria (la derrota no suma), 1 día");
  assert(d1.rawStreak === 4 && d1.lastWinDate === "2026-07-15", "guarda la racha CRUDA y last_win_date como 'YYYY-MM-DD'");
  assert(d1.countryCode === "ARG" && d1.role === "user" && d1.featured === null, "pasa país, rol y destacados");
  const loser = daily.find((r) => r.userId === U3);
  assert(loser !== undefined && loser.points === 0 && loser.gamesWon === 0, "el perdedor aparece con 0 pts y 0 victorias");
  assert(daily.find((r) => r.userId === U7)?.countryCode === null, "sin país → countryCode null");

  // ─── Mensual: bordes del mes ───────────────────────────────────────
  console.log("\n[loadRankingRows: mensual]");
  await play(U5, "pittexto", "2026-06-30", 500); // mes anterior
  await play(U5, "polewordle", "2026-08-01", 500); // mes siguiente
  await play(U2, "polewordle", "2026-07-31", 50); // último día del mes
  await play(U2, "el-intruso", "2026-07-01", 50); // primer día del mes
  const monthly = await loadRankingRows(q, "monthly", "2026-07-01");
  assert(!monthly.some((r) => r.userId === U5), "julio excluye el 30/6 y el 1/8 (U5 no aparece)");
  const m2 = monthly.find((r) => r.userId === U2)!;
  assert(m2.points === 300 && m2.daysPlayed === 3 && m2.gamesWon === 3, "U2 en julio: 300 pts, 3 días distintos, 3 victorias");
  assert(
    monthly[0]?.userId === U1 && monthly[1]?.userId === U2,
    "julio: U1 y U2 empatan en 300 → desempate u.id ASC (U1 primero)",
  );

  // ─── Anual: rango [YYYY-01-01, YYYY+1-01-01) ───────────────────────
  console.log("\n[loadRankingRows: anual]");
  await play(U3, "pittexto", "2025-12-31", 700); // año anterior
  await play(U3, "polewordle", "2027-01-01", 700); // año siguiente
  await play(U6, "polewordle", "2026-01-01", 10); // primer día del año
  await play(U6, "el-intruso", "2026-12-31", 10); // último día del año
  const annual = await loadRankingRows(q, "annual", "2026-01-01");
  const a3 = annual.find((r) => r.userId === U3)!;
  assert(a3.points === 0, "U3: los 700 del 31/12/2025 y del 1/1/2027 quedan afuera del 2026");
  const a6 = annual.find((r) => r.userId === U6)!;
  assert(a6.points === 220 && a6.daysPlayed === 3, "U6: incluye 1/1 y 31/12; daysPlayed anual = días distintos (3)");
  const a5 = annual.find((r) => r.userId === U5)!;
  assert(a5.points === 1000 && a5.daysPlayed === 2, "U5: 30/6 y 1/8 cuentan en el anual (el flaggeado no)");
  assert(annual[0]?.userId === U5, "anual ordenado por puntos del año");
  const prevYear = await loadRankingRows(q, "annual", "2025-01-01");
  assert(prevYear.length === 1 && prevYear[0]?.userId === U3 && prevYear[0]?.points === 700, "anual 2025 solo trae el 31/12/2025");

  // ─── Anual compuesto con los meses (lo que usa el server) ──────────
  console.log("\n[Anual = suma de snapshots mensuales]");
  const T0 = Date.parse("2026-12-31T12:00:00Z");
  let nowMs = T0;
  const calls: string[] = [];
  const cache = new RankingSnapshotCache(
    (kind: RankingKind, start: string) => {
      calls.push(`${kind}:${start}`);
      return loadRankingRows(q, kind, start);
    },
    { now: () => nowMs },
  );
  const summary = (rows: readonly RankingRow[]) =>
    rows.map((r) => [r.userId, r.displayName, r.countryCode, r.points, r.gamesWon, r.daysPlayed, r.rawStreak].join("|")).join(";");
  const composed = await cache.get("annual", "2026-01-01");
  assert(summary(composed) === summary(annual), "el anual compuesto es idéntico al de la query anual (orden, puntos, victorias, días)");
  assert(calls.length === 12 && calls.every((c) => c.startsWith("monthly:2026-")), "ninguna carga toca más de un mes: 12 queries mensuales y ninguna anual");

  calls.length = 0;
  await cache.get("annual", "2026-01-01");
  assert(calls.length === 0, "segunda lectura dentro del TTL: sin queries");
  nowMs = T0 + RANKING_TTL_MS.annual + 1;
  const refreshed = await cache.get("annual", "2026-01-01");
  assert(calls.join(",") === "monthly:2026-12-01", "vencido el TTL del anual solo se recarga el mes en curso");
  assert(summary(refreshed) === summary(annual), "el anual refrescado sigue siendo idéntico");
  const monthlyShared = calls.length;
  await cache.get("monthly", "2026-12-01");
  assert(calls.length === monthlyShared, "el mes en curso del anual es el MISMO snapshot que el ranking mensual");
  nowMs = T0 + SETTLED_MONTH_TTL_MS + 1;
  calls.length = 0;
  await cache.get("annual", "2026-01-01");
  assert(calls.length === 12, "pasado el TTL de los meses asentados se recargan (11 asentados + el mes en curso)");

  cache.clear();
  assert(cache.size() === 0, "clear() borra también los meses asentados");
  calls.length = 0;
  nowMs = Date.parse("2026-03-15T09:00:00Z");
  const partial = await cache.get("annual", "2026-01-01");
  assert(calls.join(",") === "monthly:2026-01-01,monthly:2026-02-01,monthly:2026-03-01", "año en curso: solo los meses hasta hoy");
  assert(partial.find((r) => r.userId === U6)?.points === 10, "a mitad de año suma solo lo ya jugado (U6: 10 del 1/1)");
  calls.length = 0;
  assert((await cache.get("annual", "2027-01-01")).length === 0 && calls.length === 0, "año futuro: vacío y sin queries");

  assert(monthsOfYear("2026-01-01", Date.parse("2026-12-31T00:00:00Z")).length === 12, "monthsOfYear: año completo");
  assert(monthsOfYear("2025-01-01", Date.parse("2026-02-01T00:00:00Z")).length === 12, "monthsOfYear: año pasado completo");
  assert(!isSettledMonth("2026-11-01", Date.parse("2026-12-02T12:00:00Z")), "un mes cerrado hace menos de 2 días aún NO está asentado (fecha de cliente ±1 día)");
  assert(isSettledMonth("2026-11-01", Date.parse("2026-12-03T00:00:00Z")), "a los 2 días de cerrar queda asentado");
  assert(!isSettledMonth("2026-12-01", Date.parse("2026-12-31T00:00:00Z")), "el mes en curso nunca está asentado");

  const mk = (id: string, name: string, points: number, won: number, days: number): RankingRow => ({
    userId: id, displayName: name, countryCode: null, role: "user", featured: null,
    points, gamesWon: won, daysPlayed: days, rawStreak: 0, lastWinDate: null,
  });
  const merged = mergeMonthlyRows([[mk(U2, "Viejo", 100, 1, 1), mk(U1, "Uno", 100, 2, 2)], [mk(U2, "Nuevo", 50, 1, 3)]]);
  assert(merged[0]?.userId === U2 && merged[0].points === 150 && merged[0].gamesWon === 2 && merged[0].daysPlayed === 4, "suma puntos, victorias y días entre meses");
  assert(merged[0]?.displayName === "Nuevo", "los datos del jugador salen del mes más reciente");
  const tie = mergeMonthlyRows([[mk(U2, "Dos", 70, 1, 1), mk(U1, "Uno", 70, 1, 1)]]);
  assert(ids(tie) === [U1, U2].join(","), "empate de puntos: id ASC, igual que la query");

  // ─── Paginado ──────────────────────────────────────────────────────
  console.log("\n[paginateRanking]");
  const rows: RankingRow[] = daily; // U1, U2, U6, U7, U3
  const p1 = paginateRanking(rows, { country: null, limit: 2, offset: 0, userId: null });
  assert(p1.total === 5 && ids(p1.top) === [U1, U2].join(","), "página 1: 2 entradas, total 5");
  assert(p1.top[0]?.rank === 1 && p1.top[1]?.rank === 2, "ranks 1 y 2");
  const p2 = paginateRanking(rows, { country: null, limit: 2, offset: 2, userId: null });
  assert(ids(p2.top) === [U6, U7].join(",") && p2.top[0]?.rank === 3, "página 2 arranca en el puesto 3");
  const p3 = paginateRanking(rows, { country: null, limit: 2, offset: 4, userId: null });
  assert(p3.top.length === 1 && p3.top[0]?.rank === 5, "última página incompleta");
  const pOut = paginateRanking(rows, { country: null, limit: 2, offset: 50, userId: U1 });
  assert(pOut.top.length === 0 && pOut.total === 5, "offset fuera de rango → top vacío, total intacto");
  assert(pOut.me?.userId === U1 && pOut.me.rank === 1, "me se devuelve aunque la página esté vacía");
  const meIn = paginateRanking(rows, { country: null, limit: 2, offset: 0, userId: U2 });
  assert(meIn.me?.rank === 2 && meIn.top.some((r) => r.userId === U2), "me dentro de la página (rank 2)");
  const meOut = paginateRanking(rows, { country: null, limit: 2, offset: 0, userId: U3 });
  assert(meOut.me?.rank === 5 && !meOut.top.some((r) => r.userId === U3), "me fuera de la página (rank 5)");
  const meNone = paginateRanking(rows, { country: null, limit: 2, offset: 0, userId: U4 });
  assert(meNone.me === null, "me de alguien que no está en la lista → null");
  const legacy = paginateRanking(rows, { country: null, limit: null, offset: 0, userId: null });
  assert(legacy.top.length === 5 && legacy.top[4]?.rank === 5 && legacy.me === null, "limit null → lista completa (legacy)");

  // ─── Filtro de país ────────────────────────────────────────────────
  console.log("\n[Filtro de país]");
  const arg = paginateRanking(rows, { country: "ARG", limit: 10, offset: 0, userId: U3 });
  assert(arg.total === 3 && ids(arg.top) === [U1, U6, U3].join(","), "ARG: U1, U6, U3 (total 3)");
  assert(arg.top.map((r) => r.rank).join(",") === "1,2,3", "puestos re-numerados dentro del país");
  assert(arg.me?.rank === 3, "me (U3) con su puesto dentro del país");
  const argMeOther = paginateRanking(rows, { country: "ARG", limit: 10, offset: 0, userId: U2 });
  assert(argMeOther.me === null, "me de otro país → null con el filtro");
  const argPage2 = paginateRanking(rows, { country: "ARG", limit: 1, offset: 1, userId: null });
  assert(argPage2.top[0]?.userId === U6 && argPage2.top[0]?.rank === 2, "paginado sobre la lista filtrada");
  assert(rows[1]?.userId === U2 && !("rank" in rows[1]!), "el snapshot original no se modifica");

  // ─── Racha al leer + shape de la entrada ───────────────────────────
  console.log("\n[toRankingEntry]");
  const r1 = paginateRanking(rows, { country: null, limit: 1, offset: 0, userId: null }).top[0]!;
  assert(toRankingEntry(r1, "2026-07-15", []).currentStreak === 4, "racha viva (último día ganado = hoy)");
  assert(toRankingEntry(r1, "2026-07-16", []).currentStreak === 4, "racha viva (último día ganado = ayer)");
  assert(toRankingEntry(r1, "2026-07-17", []).currentStreak === 0, "racha muerta (hace 2 días) → 0 sin tocar la columna");
  const entry = toRankingEntry(r1, "2026-07-15", [{ type: "monthly_gold", count: 1, months: ["2026-06"] }]);
  assert(
    Object.keys(entry).join(",") ===
      "rank,userId,displayName,countryCode,points,gamesWon,daysPlayed,currentStreak,displayBadges",
    "Entry con el mismo shape público de siempre (sin role/featured/rawStreak)",
  );
  assert(entry.displayBadges[0]?.type === "monthly_gold", "displayBadges se adjunta tal cual");

  // ─── Validación de período y parámetros ────────────────────────────
  console.log("\n[parseRankingQuery / validadores]");
  const NOW = new Date("2026-10-01T15:00:00Z");
  assert(!isValidDateKey("2026-02-30") && !isValidDateKey("2026-02-29"), "fechas imposibles (30/2, 29/2 no bisiesto) inválidas");
  assert(isValidDateKey("2028-02-29") && isValidDateKey("2026-12-31"), "29/2 bisiesto y 31/12 válidas");
  assert(!isValidDateKey("2026-04-31") && !isValidDateKey("0000-01-01"), "31/4 y año 0 inválidos");
  assert(!isValidMonth("2026-13") && !isValidMonth("2026-00") && isValidMonth("2026-02"), "mes 13 y 00 inválidos");
  assert(isValidYear("2026") && !isValidYear("0000") && !isValidYear("26") && !isValidYear(2026), "año: solo 'YYYY' >= 0001");

  const dBad = parseRankingQuery("daily", { date: "2026-02-30" }, NOW);
  assert(dBad.periodKey === "2026-10-01" && dBad.periodStart === "2026-10-01", "diario 2026-02-30 → hoy");
  assert(parseRankingQuery("daily", { date: "2026-07-15" }, NOW).periodStart === "2026-07-15", "diario válido se respeta");
  const mBad = parseRankingQuery("monthly", { month: "2026-13" }, NOW);
  assert(mBad.periodKey === "2026-10" && mBad.periodStart === "2026-10-01", "mensual 2026-13 → mes actual");
  assert(parseRankingQuery("monthly", { month: "2026-02" }, NOW).periodStart === "2026-02-01", "mensual válido → primer día");
  const yOk = parseRankingQuery("annual", { year: "2025" }, NOW);
  assert(yOk.periodKey === "2025" && yOk.periodStart === "2025-01-01", "anual 2025 → [2025-01-01, ...)");
  assert(parseRankingQuery("annual", { year: "abcd" }, NOW).periodKey === "2026", "anual inválido → año actual");
  assert(parseRankingQuery("annual", {}, NOW).periodStart === "2026-01-01", "anual sin year → año actual");

  assert(parseRankingQuery("daily", {}, NOW).limit === null, "sin limit → legacy (null)");
  assert(parseRankingQuery("daily", { limit: "" }, NOW).limit === null, "limit vacío → legacy");
  assert(parseRankingQuery("daily", { limit: "30" }, NOW).limit === 30, "limit 30");
  assert(parseRankingQuery("daily", { limit: "0" }, NOW).limit === 1, "limit 0 → 1");
  assert(parseRankingQuery("daily", { limit: "500" }, NOW).limit === MAX_PAGE_SIZE, "limit 500 → 100");
  assert(parseRankingQuery("daily", { limit: "abc" }, NOW).limit === DEFAULT_PAGE_SIZE, "limit no numérico → 30");
  assert(parseRankingQuery("daily", { limit: ["5", "6"] }, NOW).limit === DEFAULT_PAGE_SIZE, "limit repetido (array) → 30");
  assert(parseRankingQuery("daily", { limit: "10", offset: "-3" }, NOW).offset === 0, "offset negativo → 0");
  assert(parseRankingQuery("daily", { limit: "10", offset: "x" }, NOW).offset === 0, "offset inválido → 0");
  assert(parseRankingQuery("daily", { limit: "10", offset: "60" }, NOW).offset === 60, "offset 60");
  assert(parseRankingQuery("daily", { userId: U1 }, NOW).userId === U1, "userId UUID válido");
  const anon = "anon-11111111-1111-1111-1111-111111111111";
  assert(parseRankingQuery("daily", { userId: anon }, NOW).userId === anon, "userId anónimo válido");
  assert(parseRankingQuery("daily", { userId: "' OR 1=1" }, NOW).userId === null, "userId inválido → se ignora");
  assert(parseRankingQuery("daily", { country: "ARG" }, NOW).country === "ARG", "país alpha-3");
  assert(parseRankingQuery("daily", { country: "arg" }, NOW).country === null, "país en minúsculas → sin filtro");

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} fallidos`);
  await db.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Error inesperado en el test:", err);
  process.exit(1);
});
