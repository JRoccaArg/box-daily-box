/**
 * Test del motor de LOGROS (achievements) — src/api/achievements.ts.
 *
 * Corre la lógica REAL de award/progreso contra Postgres en memoria (PGlite),
 * con el MISMO SQL que producción vía el ejecutor inyectable. El esquema de
 * `badges` acá replica el de db.ts DESPUÉS de la migración de logros:
 * reference_month NULLABLE + dos índices únicos parciales (podio / logros).
 *
 * Cubre: cada logro del catálogo, idempotencia (solo-agrega), modo por-usuario
 * vs todos, filtros (flagged/duelo no cuentan), y el cálculo de progreso (%).
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-achievements.ts
 */
import { PGlite } from "@electric-sql/pglite";
import {
  awardAchievements,
  getAchievementProgress,
  ACHIEVEMENTS,
  ACHIEVEMENT_PRIORITY,
  DAILY_GAME_IDS,
  isAchievementType,
} from "../src/api/achievements";
import {
  deriveDisplayBadges,
  normalizeReferenceMonths,
  validateFeaturedSelection,
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

async function setupSchema() {
  await db.query(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    display_name TEXT
  );`);
  // attempts CON duel_id (los logros filtran duel_id IS NULL).
  await db.query(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, game_id TEXT NOT NULL,
    date_key DATE NOT NULL, difficulty TEXT NOT NULL, won BOOLEAN NOT NULL,
    time_seconds INTEGER, points INTEGER NOT NULL DEFAULT 0,
    flagged BOOLEAN DEFAULT false, ranked BOOLEAN DEFAULT true,
    duel_id TEXT, created_at TIMESTAMPTZ DEFAULT now());`);
  // badges como queda tras la migración de db.ts (reference_month nullable,
  // CHECK con prefijo ach_, dos índices únicos parciales).
  await db.query(`CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL
      CHECK (badge_type IN ('monthly_gold','monthly_silver','monthly_bronze')
             OR badge_type LIKE 'ach\\_%'),
    reference_month DATE,
    awarded_at TIMESTAMPTZ DEFAULT now());`);
  await db.query(`CREATE UNIQUE INDEX idx_badges_monthly_unique
    ON badges (user_id, badge_type, reference_month) WHERE reference_month IS NOT NULL;`);
  await db.query(`CREATE UNIQUE INDEX idx_badges_achievement_unique
    ON badges (user_id, badge_type) WHERE reference_month IS NULL;`);
  await db.query("INSERT INTO users (id, display_name) VALUES ($1,'U1'),($2,'U2')", [U1, U2]);
}

let idSeq = 0;
/** Inserta N victorias de un juego/dificultad para un usuario (fechas distintas). */
async function win(
  uid: string,
  gameId: string,
  n: number,
  opts: {
    difficulty?: string;
    flagged?: boolean;
    duel?: boolean;
    date?: string;
    /** false = el intento no entró al ranking global (otra cuenta de la misma
     *  IP ya jugó ese juego ese día). Desde la auditoría 2026-09 NO cuenta
     *  para logros. */
    ranked?: boolean;
  } = {},
) {
  for (let i = 0; i < n; i++) {
    // Fecha única por inserción salvo que se fije `date` (para día-perfecto).
    const dk = opts.date ?? `2020-01-${String((idSeq % 27) + 1).padStart(2, "0")}`;
    idSeq++;
    await db.query(
      `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, flagged, ranked, duel_id)
       VALUES ($1,$2,$3::date,$4,true,$5,$6,$7)`,
      [
        uid,
        gameId,
        dk,
        opts.difficulty ?? "medio",
        opts.flagged ?? false,
        opts.ranked ?? true,
        opts.duel ? "d1" : null,
      ],
    );
  }
}

async function ownedTypes(uid: string): Promise<string[]> {
  const r = await db.query(
    "SELECT badge_type FROM badges WHERE user_id = $1 AND reference_month IS NULL ORDER BY badge_type",
    [uid],
  );
  return (r.rows as Array<{ badge_type: string }>).map((x) => x.badge_type);
}

async function reset() {
  await db.query("DELETE FROM badges");
  await db.query("DELETE FROM attempts");
  idSeq = 0;
}

(async () => {
  await setupSchema();

  // ─── Catálogo sano ────────────────────────────────────────────────
  console.log("\n[Catálogo]");
  assert(ACHIEVEMENTS.length === 7, "hay 7 logros en el catálogo v1");
  assert(isAchievementType("ach_wins_100"), "isAchievementType reconoce un tipo válido");
  assert(!isAchievementType("monthly_gold"), "isAchievementType rechaza un tipo de podio");
  assert(
    ACHIEVEMENT_PRIORITY["ach_legend_50"] < ACHIEVEMENT_PRIORITY["ach_complete"],
    "prioridad: el más difícil (legend_50) va antes que el más fácil (complete)",
  );

  // ─── Umbrales de victorias totales ────────────────────────────────
  console.log("\n[Victorias totales: 100 / 500]");
  await reset();
  await win(U1, "pittexto", 100); // exactamente 100
  await awardAchievements(q, U1);
  let owned = await ownedTypes(U1);
  assert(owned.includes("ach_wins_100"), "100 victorias → Centurión");
  assert(!owned.includes("ach_wins_500"), "100 victorias → todavía NO 500 Vueltas");
  await win(U1, "pittexto", 400); // ahora 500
  await awardAchievements(q, U1);
  owned = await ownedTypes(U1);
  assert(owned.includes("ach_wins_500"), "500 victorias → 500 Vueltas");

  // ─── Leyenda: 10 / 50 ─────────────────────────────────────────────
  console.log("\n[Leyenda: 10 / 50]");
  await reset();
  await win(U1, "pittexto", 9, { difficulty: "leyenda" });
  await awardAchievements(q, U1);
  assert(!(await ownedTypes(U1)).includes("ach_legend_10"), "9 leyenda → todavía no");
  await win(U1, "pittexto", 1, { difficulty: "leyenda" }); // 10
  await awardAchievements(q, U1);
  assert((await ownedTypes(U1)).includes("ach_legend_10"), "10 leyenda → Leyenda Viviente");
  // 40 victorias 'medio' NO deben sumar a leyenda.
  await win(U1, "pittexto", 40, { difficulty: "medio" });
  await awardAchievements(q, U1);
  assert(
    !(await ownedTypes(U1)).includes("ach_legend_50"),
    "victorias 'medio' NO cuentan para el logro de Leyenda",
  );

  // ─── Especialista: 50 del mismo juego ─────────────────────────────
  console.log("\n[Especialista: 50 del mismo juego]");
  await reset();
  // 30 de un juego + 30 de otro = 60 totales, pero ninguno llega a 50 solo.
  await win(U1, "pittexto", 30);
  await win(U1, "polewordle", 30);
  await awardAchievements(q, U1);
  assert(
    !(await ownedTypes(U1)).includes("ach_specialist_50"),
    "60 victorias repartidas en 2 juegos → NO Especialista",
  );
  await win(U1, "pittexto", 20); // pittexto llega a 50
  await awardAchievements(q, U1);
  assert(
    (await ownedTypes(U1)).includes("ach_specialist_50"),
    "50 victorias del MISMO juego → Especialista",
  );

  // ─── Piloto Completo: los 8 juegos alguna vez ─────────────────────
  console.log("\n[Piloto Completo: los 8 juegos]");
  await reset();
  for (const g of DAILY_GAME_IDS.slice(0, 7)) await win(U1, g, 1);
  await awardAchievements(q, U1);
  assert(
    !(await ownedTypes(U1)).includes("ach_complete"),
    "7 de 8 juegos distintos → todavía no Piloto Completo",
  );
  await win(U1, DAILY_GAME_IDS[7], 1); // el 8vo
  await awardAchievements(q, U1);
  assert((await ownedTypes(U1)).includes("ach_complete"), "los 8 juegos → Piloto Completo");

  // ─── Gran Premio Perfecto: los 8 en un mismo día ──────────────────
  console.log("\n[Gran Premio Perfecto: 8 en un día]");
  await reset();
  // 8 juegos distintos pero en días distintos → NO cuenta como día perfecto.
  for (let i = 0; i < DAILY_GAME_IDS.length; i++) {
    await win(U1, DAILY_GAME_IDS[i], 1, { date: `2021-03-0${(i % 8) + 1}` });
  }
  await awardAchievements(q, U1);
  assert(
    !(await ownedTypes(U1)).includes("ach_perfect_day"),
    "8 juegos en días distintos → NO día perfecto",
  );
  // Ahora los 8 el MISMO día.
  for (const g of DAILY_GAME_IDS) await win(U2, g, 1, { date: "2021-05-05" });
  await awardAchievements(q, U2);
  assert(
    (await ownedTypes(U2)).includes("ach_perfect_day"),
    "los 8 juegos el mismo día → Gran Premio Perfecto",
  );

  // ─── Filtros: flagged / duelo no cuentan ──────────────────────────
  console.log("\n[Filtros: flagged / duelo]");
  await reset();
  await win(U1, "pittexto", 60, { difficulty: "leyenda", flagged: true }); // flaggeadas
  await win(U1, "pittexto", 60, { difficulty: "leyenda", duel: true }); // duelos
  await awardAchievements(q, U1);
  assert(
    (await ownedTypes(U1)).length === 0,
    "120 victorias flaggeadas/duelo → 0 logros (no cuentan)",
  );

  // ─── Filtro: intentos NO rankeados no cuentan ─────────────────────
  // Regla de negocio (decisión del usuario, auditoría 2026-09): un intento con
  // ranked=false (otra cuenta de la misma IP ya jugó ese juego ese día) no suma
  // para logros, igual que no suma para el podio mensual.
  console.log("\n[Filtro: ranked]");
  await reset();
  await win(U1, "pittexto", 120, { difficulty: "leyenda", ranked: false });
  await awardAchievements(q, U1);
  assert(
    (await ownedTypes(U1)).length === 0,
    "120 victorias NO rankeadas → 0 logros (no cuentan)",
  );
  // Y el progreso tiene que contar lo MISMO que el otorgamiento: si divergieran,
  // el jugador vería la barra al 100% y el logro no aparecería nunca.
  const unrankedProgress = await getAchievementProgress(q, U1);
  assert(
    unrankedProgress.every((item) => item.rawCurrent === 0 && !item.unlocked),
    "el progreso ignora los intentos no rankeados (coherente con el otorgamiento)",
  );

  // Mezcla: solo las rankeadas suman.
  await reset();
  await win(U1, "pittexto", 60, { difficulty: "leyenda", ranked: false });
  await win(U1, "pittexto", 10, { difficulty: "leyenda", ranked: true });
  await awardAchievements(q, U1);
  const mixed = await ownedTypes(U1);
  assert(
    mixed.includes("ach_legend_10") && !mixed.includes("ach_legend_50"),
    "60 no rankeadas + 10 rankeadas → solo el logro de 10 en Leyenda",
  );
  const mixedProgress = await getAchievementProgress(q, U1);
  assert(
    mixedProgress.find((p) => p.type === "ach_legend_50")?.rawCurrent === 10,
    "el progreso de Leyenda cuenta 10 (las 60 no rankeadas quedan afuera)",
  );

  // ─── Idempotencia + retroactivo (modo todos) ──────────────────────
  console.log("\n[Idempotencia + backfill de todos]");
  await reset();
  // 100 victorias REPARTIDAS (max 40 por juego) → solo Centurión, no Especialista.
  for (const uid of [U1, U2]) {
    await win(uid, "pittexto", 40);
    await win(uid, "polewordle", 40);
    await win(uid, "el-intruso", 20);
  }
  const first = await awardAchievements(q, null); // todos
  assert(first.length === 2, "backfill otorga Centurión a U1 y U2 (2 nuevos)");
  const second = await awardAchievements(q, null); // otra vez
  assert(second.length === 0, "segunda corrida no otorga nada (idempotente)");
  const totalBadges = await db.query("SELECT COUNT(*)::int c FROM badges");
  assert((totalBadges.rows[0] as { c: number }).c === 2, "no se duplicaron badges");

  // ─── Progreso (%) ─────────────────────────────────────────────────
  console.log("\n[Progreso]");
  await reset();
  await win(U1, "pittexto", 25, { difficulty: "leyenda" }); // 25 leyenda, 25 totales
  const prog = await getAchievementProgress(q, U1);
  const legend10 = prog.find((p) => p.type === "ach_legend_10")!;
  const legend50 = prog.find((p) => p.type === "ach_legend_50")!;
  const wins100 = prog.find((p) => p.type === "ach_wins_100")!;
  assert(legend10.unlocked && legend10.percent === 100, "legend_10: desbloqueado, 100%");
  assert(
    !legend50.unlocked && legend50.rawCurrent === 25 && legend50.percent === 50,
    "legend_50: 25/50 = 50%, bloqueado",
  );
  assert(
    wins100.rawCurrent === 25 && wins100.percent === 25,
    "wins_100: 25/100 = 25%",
  );
  assert(prog.length === 7 && prog[0].type === ACHIEVEMENTS[0].type, "progreso respeta el orden del catálogo");

  // ─── Display: prioridad podio → logros (difícil→fácil) ────────────
  console.log("\n[Display de badges con logros]");
  // Podio SIEMPRE antes que logros: con oro+plata+bronce se llenan los 3 slots.
  const podioLleno = deriveDisplayBadges(
    { monthly_gold: 1, monthly_silver: 1, monthly_bronze: 1, ach_legend_50: 1 },
    "user",
    null,
  );
  assert(
    podioLleno.length === 3 && podioLleno.every((b) => b.type.startsWith("monthly_")),
    "podio llena los 3 slots; el logro no entra (podio tiene prioridad)",
  );
  // Con 1 podio + varios logros: primero el podio, luego logros difícil→fácil.
  const mixto = deriveDisplayBadges(
    { monthly_gold: 2, ach_wins_100: 1, ach_legend_10: 1 },
    "user",
    null,
  );
  assert(
    mixto[0].type === "monthly_gold" && mixto[0].count === 2,
    "primero el oro agrupado (×2)",
  );
  assert(
    mixto[1].type === "ach_legend_10" && mixto[2].type === "ach_wins_100",
    "luego logros por dificultad: legend_10 (más difícil) antes que wins_100",
  );
  // Solo logros (sin podio): se muestran igual, difícil→fácil.
  const soloLogros = deriveDisplayBadges(
    { ach_complete: 1, ach_legend_50: 1 },
    "user",
    null,
  );
  assert(
    soloLogros[0].type === "ach_legend_50" && soloLogros[1].type === "ach_complete",
    "sin podio: legend_50 (difícil) antes que complete (fácil)",
  );
  // Destacar un logro explícitamente.
  const featuredAch = deriveDisplayBadges(
    { ach_wins_100: 1, monthly_gold: 3 },
    "user",
    [{ type: "ach_wins_100" }],
  );
  assert(
    featuredAch.length === 1 && featuredAch[0].type === "ach_wins_100",
    "destacado explícito: muestra solo el logro elegido",
  );
  // Defensivo: destacar un logro que no se posee → se descarta.
  const featuredMissing = deriveDisplayBadges(
    { monthly_gold: 1 },
    "user",
    [{ type: "ach_legend_50" }],
  );
  assert(
    featuredMissing.length === 0,
    "defensivo: descarta un logro destacado que el usuario no posee",
  );
  const manualVacio = deriveDisplayBadges(
    { monthly_gold: 2, ach_legend_50: 1 },
    "user",
    [],
  );
  assert(
    manualVacio.length === 0,
    "selección manual vacía: no muestra badges (null conserva el modo automático)",
  );

  // ─── validateFeaturedSelection con logros ─────────────────────────
  console.log("\n[Validación de destacados con logros]");
  const ownAch = { ach_wins_100: 1, monthly_gold: 2 };
  assert(
    validateFeaturedSelection([{ type: "ach_wins_100" }], ownAch).ok,
    "acepta un logro poseído como destacado",
  );
  assert(
    !validateFeaturedSelection([{ type: "ach_wins_100", grouped: true }], ownAch).ok,
    "rechaza agrupar un logro (los logros son únicos)",
  );
  assert(
    !validateFeaturedSelection([{ type: "ach_legend_50" }], ownAch).ok,
    "rechaza destacar un logro que no se posee",
  );
  assert(
    !validateFeaturedSelection(
      [{ type: "ach_wins_100" }, { type: "ach_wins_100" }],
      ownAch,
    ).ok,
    "rechaza destacar el mismo logro dos veces",
  );
  assert(
    validateFeaturedSelection(
      [{ type: "monthly_gold", grouped: true }, { type: "ach_wins_100" }],
      ownAch,
    ).ok,
    "acepta mezcla válida: podio agrupado + logro",
  );

  // ─── Regresión: logros sin reference_month no rompen el ranking ───
  console.log("\n[Regresión: meses nulos en badges de logros]");
  await reset();
  await db.query(
    `INSERT INTO badges (user_id, badge_type, reference_month)
     VALUES ($1, 'monthly_gold', '2026-08-01'::date),
            ($1, 'ach_wins_100', NULL)`,
    [U1],
  );
  const aggregated = await db.query(
    `SELECT badge_type,
            COALESCE(
              array_agg(reference_month::text ORDER BY reference_month DESC)
                FILTER (WHERE reference_month IS NOT NULL),
              ARRAY[]::text[]
            ) AS months
       FROM badges
      WHERE user_id = $1
      GROUP BY badge_type
      ORDER BY badge_type`,
    [U1],
  );
  const monthRows = aggregated.rows as Array<{ badge_type: string; months: unknown }>;
  const achievementMonths = normalizeReferenceMonths(
    monthRows.find((row) => row.badge_type === "ach_wins_100")?.months,
  );
  const podiumMonths = normalizeReferenceMonths(
    monthRows.find((row) => row.badge_type === "monthly_gold")?.months,
  );
  assert(achievementMonths.length === 0, "un logro con mes NULL produce una lista vacía");
  assert(
    podiumMonths.length === 1 && podiumMonths[0] === "2026-08",
    "un badge mensual conserva el mes para su tooltip",
  );
  assert(
    normalizeReferenceMonths([null, "2026-07-01", 123]).join(",") === "2026-07",
    "la normalización defensiva ignora valores nulos o inesperados",
  );

  // ─── Resultado ────────────────────────────────────────────────────
  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} fallidos`);
  await db.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Error inesperado en el test:", err);
  process.exit(1);
});
