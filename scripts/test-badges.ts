/**
 * Test del sistema de badges (podio mensual) — src/api/badges.ts.
 *
 * Corre la lógica REAL de award/desempate/display/validación contra una base
 * Postgres en memoria (PGlite), usando el MISMO SQL que producción vía el
 * ejecutor de queries inyectable. Sin duplicar SQL, sin DB externa.
 *
 * Cubre: podio + desempate, idempotencia (solo-agrega), rechazo de mes no
 * cerrado, derivación de display badges (admin siempre, default, destacados),
 * y validación anti-IDOR/anti-inflado de la selección de destacados.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-badges.ts
 */
import { PGlite } from "@electric-sql/pglite";
import {
  awardMonthlyPodium,
  computeMonthlyPodium,
  deriveDisplayBadges,
  validateFeaturedSelection,
  MonthNotClosedError,
} from "../src/api/badges";

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

const U1 = "11111111-1111-1111-1111-111111111111";
const U2 = "22222222-2222-2222-2222-222222222222";
const U3 = "33333333-3333-3333-3333-333333333333";
const U4 = "44444444-4444-4444-4444-444444444444";

// now fijo en agosto → junio y julio están cerrados; agosto no.
const NOW = new Date("2026-08-10T00:00:00Z");

async function setupSchema() {
  await db.query(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    featured_badges JSONB
  );`);
  await db.query(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, game_id TEXT NOT NULL,
    date_key DATE NOT NULL, difficulty TEXT NOT NULL, won BOOLEAN NOT NULL,
    time_seconds INTEGER, points INTEGER NOT NULL, flagged BOOLEAN DEFAULT false,
    ranked BOOLEAN DEFAULT true, ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, game_id, date_key));`);
  await db.query(`CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL
      CHECK (badge_type IN ('monthly_gold', 'monthly_silver', 'monthly_bronze')),
    reference_month DATE NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_type, reference_month));`);
  await db.query(
    "INSERT INTO users (id, display_name) VALUES ($1,'U1'),($2,'U2'),($3,'U3'),($4,'U4')",
    [U1, U2, U3, U4],
  );
}

// Inserta un attempt ganador rankeado para un usuario en una fecha dada.
async function play(
  uid: string,
  gameId: string,
  dateKey: string,
  points: number,
  opts: { won?: boolean; flagged?: boolean; ranked?: boolean } = {},
) {
  await db.query(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, points, flagged, ranked)
     VALUES ($1,$2,$3::date,'medio',$4,$5,$6,$7)`,
    [
      uid,
      gameId,
      dateKey,
      opts.won ?? true,
      points,
      opts.flagged ?? false,
      opts.ranked ?? true,
    ],
  );
}

async function badgeRows() {
  const r = await db.query(
    "SELECT user_id, badge_type, reference_month FROM badges ORDER BY badge_type, user_id",
  );
  return r.rows as Array<{ user_id: string; badge_type: string }>;
}

async function resetData() {
  await db.query("DELETE FROM badges");
  await db.query("DELETE FROM attempts");
  await db.query("UPDATE users SET featured_badges = NULL, role = 'user'");
}

(async () => {
  await setupSchema();

  // ─── Podio limpio + award ─────────────────────────────────────────
  console.log("\n[Podio limpio]");
  await resetData();
  // Junio 2026: U1 > U2 > U3 > U4.
  await play(U1, "pittexto", "2026-06-01", 500);
  await play(U2, "pittexto", "2026-06-01", 400);
  await play(U3, "pittexto", "2026-06-01", 300);
  await play(U4, "pittexto", "2026-06-01", 200);

  const podium = await computeMonthlyPodium(q, "2026-06-01");
  assert(podium.length === 3, "podio tiene 3 entradas (excluye al 4to)");
  assert(
    podium[0].userId === U1 && podium[0].rank === 1,
    "U1 es rank 1",
  );
  assert(podium[2].userId === U3 && podium[2].rank === 3, "U3 es rank 3");

  const res1 = await awardMonthlyPodium(q, "2026-06", NOW);
  assert(res1.awarded.length === 3, "award entrega 3 badges");
  const rows1 = await badgeRows();
  assert(
    rows1.some((r) => r.user_id === U1 && r.badge_type === "monthly_gold"),
    "U1 recibe oro",
  );
  assert(
    rows1.some((r) => r.user_id === U2 && r.badge_type === "monthly_silver"),
    "U2 recibe plata",
  );
  assert(
    rows1.some((r) => r.user_id === U3 && r.badge_type === "monthly_bronze"),
    "U3 recibe bronce",
  );
  assert(!rows1.some((r) => r.user_id === U4), "U4 no recibe nada");

  // ─── Idempotencia (solo-agrega) ───────────────────────────────────
  console.log("\n[Idempotencia]");
  const res2 = await awardMonthlyPodium(q, "2026-06", NOW);
  assert(res2.awarded.length === 0, "segunda corrida no entrega nada");
  assert((await badgeRows()).length === 3, "sigue habiendo 3 badges (no duplica)");

  // ─── Mes no cerrado ───────────────────────────────────────────────
  console.log("\n[Mes no cerrado]");
  let threwCurrent = false;
  try {
    await awardMonthlyPodium(q, "2026-08", NOW);
  } catch (e) {
    threwCurrent = e instanceof MonthNotClosedError;
  }
  assert(threwCurrent, "el mes en curso (2026-08) es rechazado");
  let threwFuture = false;
  try {
    await awardMonthlyPodium(q, "2026-09", NOW);
  } catch (e) {
    threwFuture = e instanceof MonthNotClosedError;
  }
  assert(threwFuture, "un mes futuro es rechazado");

  // ─── Filtros: flagged / no-ranked / perdidas no cuentan ───────────
  console.log("\n[Filtros del ranking]");
  await resetData();
  await play(U1, "pittexto", "2026-07-01", 999, { flagged: true }); // no cuenta
  await play(U2, "pittexto", "2026-07-01", 800, { ranked: false }); // no cuenta
  await play(U3, "pittexto", "2026-07-01", 100); // válida
  const podiumJul = await computeMonthlyPodium(q, "2026-07-01");
  assert(
    podiumJul.length === 1 && podiumJul[0].userId === U3,
    "solo cuenta la partida válida (U3); flagged y no-ranked excluidas",
  );

  // ─── Empate en el primer puesto ───────────────────────────────────
  console.log("\n[Empate en 1er puesto]");
  await resetData();
  // U1 y U2 empatan exacto (points, games, days); U3 debajo.
  await play(U1, "pittexto", "2026-06-01", 300);
  await play(U2, "pittexto", "2026-06-01", 300);
  await play(U3, "pittexto", "2026-06-01", 100);
  const podiumTie = await computeMonthlyPodium(q, "2026-06-01");
  const rank1 = podiumTie.filter((p) => p.rank === 1).map((p) => p.userId).sort();
  assert(
    rank1.length === 2 && rank1[0] === U1 && rank1[1] === U2,
    "U1 y U2 comparten rank 1",
  );
  assert(
    podiumTie.some((p) => p.userId === U3 && p.rank === 3),
    "U3 queda en rank 3 (plata se saltea por el empate)",
  );
  const resTie = await awardMonthlyPodium(q, "2026-06", NOW);
  const goldWinners = resTie.awarded.filter((a) => a.badgeType === "monthly_gold");
  assert(goldWinners.length === 2, "ambos empatados reciben oro");
  assert(
    !resTie.awarded.some((a) => a.badgeType === "monthly_silver"),
    "no se entrega plata en el empate de 1ro",
  );

  // ─── deriveDisplayBadges ──────────────────────────────────────────
  console.log("\n[deriveDisplayBadges]");
  const defGold = deriveDisplayBadges({ monthly_gold: 3 }, "user", null);
  assert(
    defGold.length === 1 && defGold[0].type === "monthly_gold" && defGold[0].count === 3,
    "default: oro agrupado con contador 3",
  );

  const adminDisp = deriveDisplayBadges({ monthly_gold: 1 }, "admin", null);
  assert(
    adminDisp[0].type === "admin" && adminDisp[1].type === "monthly_gold",
    "admin va primero y no consume el límite",
  );
  const superDisp = deriveDisplayBadges({}, "superadmin", null);
  assert(
    superDisp.length === 1 && superDisp[0].type === "superadmin",
    "superadmin se muestra aunque no tenga otros badges",
  );

  const grouped = deriveDisplayBadges(
    { monthly_gold: 3 },
    "user",
    [{ type: "monthly_gold", grouped: true }],
  );
  assert(
    grouped.length === 1 && grouped[0].count === 3,
    "destacado agrupado: 1 icono con contador 3",
  );

  const individual = deriveDisplayBadges(
    { monthly_gold: 2 },
    "user",
    [{ type: "monthly_gold" }, { type: "monthly_gold" }],
  );
  assert(
    individual.length === 2 && individual.every((b) => b.count === 1),
    "destacado individual: 2 iconos separados con contador 1",
  );

  const overOwned = deriveDisplayBadges(
    { monthly_gold: 2 },
    "user",
    [{ type: "monthly_gold" }, { type: "monthly_gold" }, { type: "monthly_gold" }],
  );
  assert(
    overOwned.length === 2,
    "lectura defensiva: descarta el 3er oro individual que no posee",
  );

  const limited = deriveDisplayBadges(
    { monthly_gold: 5 },
    "admin",
    [
      { type: "monthly_gold" },
      { type: "monthly_gold" },
      { type: "monthly_gold" },
      { type: "monthly_gold" },
    ],
  );
  assert(
    limited.filter((b) => b.type === "monthly_gold").length === 3 &&
      limited[0].type === "admin",
    "tope de 3 destacados + admin aparte (4 total)",
  );

  // ─── validateFeaturedSelection ────────────────────────────────────
  console.log("\n[validateFeaturedSelection]");
  const counts = { monthly_gold: 2, monthly_silver: 1 };
  assert(!validateFeaturedSelection("nope", counts).ok, "rechaza no-array");
  assert(
    !validateFeaturedSelection(
      [
        { type: "monthly_gold" },
        { type: "monthly_gold" },
        { type: "monthly_silver" },
        { type: "monthly_silver" },
      ],
      counts,
    ).ok,
    "rechaza más de 3 slots",
  );
  assert(
    !validateFeaturedSelection([{ type: "monthly_bronze" }], counts).ok,
    "rechaza un badge que no posee",
  );
  assert(
    !validateFeaturedSelection(
      [{ type: "monthly_gold" }, { type: "monthly_gold" }, { type: "monthly_gold" }],
      counts,
    ).ok,
    "rechaza más individuales que los poseídos (anti-inflado)",
  );
  assert(
    !validateFeaturedSelection([{ type: "admin" }], counts).ok,
    "rechaza admin como destacado (no elegible)",
  );
  const okSel = validateFeaturedSelection(
    [{ type: "monthly_gold", grouped: true }, { type: "monthly_silver" }],
    counts,
  );
  assert(okSel.ok, "acepta una selección válida (grouped + individual)");

  // ─── Resultado ────────────────────────────────────────────────────
  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} fallidos`);
  await db.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Error inesperado en el test:", err);
  process.exit(1);
});
