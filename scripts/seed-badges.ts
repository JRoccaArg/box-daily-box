/**
 * Herramienta de STAGING: puebla una base real con usuarios ficticios y
 * attempts en meses cerrados, para probar visualmente el sistema de badges
 * (podio limpio, empate, múltiples oros, admin/superadmin) una vez exista la
 * UI (Etapa 3). Independiente de la herramienta de debug-date (roadmap #1,
 * todavía no implementada): usa meses relativos a "ahora" (mes actual - 1/2/3),
 * así que un mes cerrado siempre lo sigue siendo sin importar cuándo se corra.
 *
 * SEGURIDAD:
 *  - Escribe usando process.env.DATABASE_URL (la misma variable que el server).
 *    NO asume ningún host: quien lo corre controla a qué DB apunta.
 *  - Exige el flag --yes y muestra el host de destino ANTES de tocar nada.
 *  - Solo toca un conjunto FIJO y conocido de userId (prefijo `anon-`, con
 *    display_name "Seed …"): el cleanup previo borra EXCLUSIVAMENTE esos IDs,
 *    nunca hace un DELETE/TRUNCATE amplio. Re-ejecutable sin duplicar filas.
 *  - Reusa `src/api/db.ts` (initializeDatabase/query/transaction) y
 *    `src/api/badges.ts` (awardMonthlyPodium) — no duplica SQL ni lógica de
 *    award; el estado resultante es idéntico al de un cierre real vía
 *    POST /admin/badges/close-month.
 *  - `--reset` limpia los datos de seed sin volver a insertarlos.
 *
 * Uso:
 *   DATABASE_URL=postgresql://... npx tsx --tsconfig tsconfig.app.json scripts/seed-badges.ts --yes
 *   DATABASE_URL=postgresql://... npx tsx --tsconfig tsconfig.app.json scripts/seed-badges.ts --yes --reset
 */
import { pathToFileURL } from "node:url";
import { initializeDatabase, query, transaction } from "../src/api/db";
import { awardMonthlyPodium } from "../src/api/badges";

const args = process.argv.slice(2);
const CONFIRMED = args.includes("--yes");
const RESET_ONLY = args.includes("--reset");

// ─── Usuarios ficticios fijos (prefijo `anon-`, formato válido de userId) ──
// Los últimos bytes del UUID codifican el "rol" de cada uno en el escenario,
// para que sean reconocibles a simple vista en la DB.
const USERS = {
  goldSolo: "anon-5eed0000-0000-4000-8000-00000000a001", // podio limpio: 1ro
  silver: "anon-5eed0000-0000-4000-8000-00000000a002", // podio limpio: 2do
  bronze: "anon-5eed0000-0000-4000-8000-00000000a003", // podio limpio: 3ro
  fourth: "anon-5eed0000-0000-4000-8000-00000000a004", // no rankea en el podio (top 3)
  fifth: "anon-5eed0000-0000-4000-8000-00000000a00a", // relleno visual del ranking
  sixth: "anon-5eed0000-0000-4000-8000-00000000a00b", // relleno visual del ranking
  tieA: "anon-5eed0000-0000-4000-8000-00000000a005", // empate en 1er puesto
  tieB: "anon-5eed0000-0000-4000-8000-00000000a006", // empate en 1er puesto
  tieBronze: "anon-5eed0000-0000-4000-8000-00000000a00c", // 3ro del mes del empate (no empatado)
  champion: "anon-5eed0000-0000-4000-8000-00000000a007", // oro en 3 meses seguidos (agrupado)
  veteran: "anon-5eed0000-0000-4000-8000-00000000a00d", // oro + plata + bronce en 3 meses distintos (mixto)
  admin: "anon-5eed0000-0000-4000-8000-00000000a008",
  superadmin: "anon-5eed0000-0000-4000-8000-00000000a009",
} as const;

const DISPLAY_NAMES: Record<string, string> = {
  [USERS.goldSolo]: "Seed Gold Solo",
  [USERS.silver]: "Seed Silver",
  [USERS.bronze]: "Seed Bronze",
  [USERS.fourth]: "Seed Fourth Place",
  [USERS.fifth]: "Seed Fifth Place",
  [USERS.sixth]: "Seed Sixth Place",
  [USERS.tieA]: "Seed Tie A",
  [USERS.tieB]: "Seed Tie B",
  [USERS.tieBronze]: "Seed Tie Bronze",
  [USERS.champion]: "Seed Triple Champion",
  [USERS.veteran]: "Seed Veteran Mixto",
  [USERS.admin]: "Seed Admin",
  [USERS.superadmin]: "Seed Superadmin",
};

// Países variados para que el ranking se vea vistoso (banderas distintas),
// en vez de todos 'ARG' como antes.
const COUNTRIES: Record<string, string> = {
  [USERS.goldSolo]: "ARG",
  [USERS.silver]: "BRA",
  [USERS.bronze]: "ESP",
  [USERS.fourth]: "GBR",
  [USERS.fifth]: "ITA",
  [USERS.sixth]: "FRA",
  [USERS.tieA]: "DEU",
  [USERS.tieB]: "NLD",
  [USERS.tieBronze]: "MEX",
  [USERS.champion]: "USA",
  [USERS.veteran]: "AUS",
  [USERS.admin]: "JPN",
  [USERS.superadmin]: "CAN",
};

const ALL_USER_IDS = Object.values(USERS);

/** Usuarios de relleno EXCLUSIVOS para dar 2do/3er puesto al "veterano" (abajo). */
const FILLER_A = "anon-5eed0000-0000-4000-8000-00000000a00e";
const FILLER_B = "anon-5eed0000-0000-4000-8000-00000000a00f";

/** Alcance de limpieza: usuarios del escenario + fillers. Nunca toca datos reales. */
const CLEANUP_IDS = [...ALL_USER_IDS, FILLER_A, FILLER_B];

/** 'YYYY-MM-01' del mes actual menos `n` meses (UTC, evita líos de huso horario). */
function monthsAgoStart(n: number, now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function redactedHost(databaseUrl: string): string {
  try {
    const u = new URL(databaseUrl);
    return `${u.hostname}${u.port ? ":" + u.port : ""}${u.pathname}`;
  } catch {
    return "(no se pudo parsear DATABASE_URL)";
  }
}

export async function cleanupSeedData(): Promise<void> {
  // Alcance ESTRICTO: solo estos userId fijos. Nunca toca datos reales.
  await query("DELETE FROM badges WHERE user_id = ANY($1::text[])", [CLEANUP_IDS] as any);
  await query("DELETE FROM attempts WHERE user_id = ANY($1::text[])", [CLEANUP_IDS] as any);
  await query("DELETE FROM users WHERE id = ANY($1::text[])", [CLEANUP_IDS] as any);
}

async function insertUsers(): Promise<void> {
  for (const id of ALL_USER_IDS) {
    await query(
      `INSERT INTO users (id, display_name, country_code)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [id, DISPLAY_NAMES[id] as string, COUNTRIES[id] as string],
    );
  }
  await query("UPDATE users SET role = 'admin' WHERE id = $1", [USERS.admin]);
  await query("UPDATE users SET role = 'superadmin' WHERE id = $1", [USERS.superadmin]);
}

/** Inserta un attempt ganador y rankeado en un día fijo de un mes dado. */
async function playWin(userId: string, monthStart: string, points: number): Promise<void> {
  // Día 5 del mes: lejos de bordes de mes, sin ambigüedad de zona horaria.
  const dateKey = monthStart.slice(0, 8) + "05";
  await query(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ranked)
     VALUES ($1, 'pittexto', $2::date, 'medio', true, 60, $3, false, true)
     ON CONFLICT (user_id, game_id, date_key) DO UPDATE SET points = EXCLUDED.points`,
    [userId, dateKey, points],
  );
}

async function insertFillers(): Promise<void> {
  for (const id of [FILLER_A, FILLER_B]) {
    await query(
      `INSERT INTO users (id, display_name, country_code)
       VALUES ($1, $2, 'PRT')
       ON CONFLICT (id) DO NOTHING`,
      [id, id === FILLER_A ? "Seed Filler A" : "Seed Filler B"],
    );
  }
}

export async function seed(now: Date): Promise<void> {
  const monthMinus1 = monthsAgoStart(1, now); // podio limpio (6 jugadores)
  const monthMinus2 = monthsAgoStart(2, now); // empate en 1er puesto + bronce
  // El "triple campeón" y el "veterano mixto" usan meses APARTE (-3..-8): si
  // compartieran mes con los escenarios de arriba, sus puntos (altos a
  // propósito) le robarían el primer puesto a goldSolo/tieA/tieB y
  // arruinarían esos escenarios. Verificado con un run real: sin este
  // aislamiento, goldSolo termina 2do y tieA/tieB empatan en PLATA en vez
  // de ORO.
  const champMonth1 = monthsAgoStart(3, now);
  const champMonth2 = monthsAgoStart(4, now);
  const champMonth3 = monthsAgoStart(5, now);
  const vetGoldMonth = monthsAgoStart(6, now);
  const vetSilverMonth = monthsAgoStart(7, now);
  const vetBronzeMonth = monthsAgoStart(8, now);

  await insertUsers();
  await insertFillers();

  // ─── Escenario 1: podio limpio con 6 jugadores (mes -1) ───────────
  // Ranking más lleno y vistoso: 3 badges (oro/plata/bronce) + 3 que NO
  // rankean en el podio pero se ven en el ranking global de ese mes.
  await playWin(USERS.goldSolo, monthMinus1, 500);
  await playWin(USERS.silver, monthMinus1, 400);
  await playWin(USERS.bronze, monthMinus1, 300);
  await playWin(USERS.fourth, monthMinus1, 200);
  await playWin(USERS.fifth, monthMinus1, 150);
  await playWin(USERS.sixth, monthMinus1, 100);

  // ─── Escenario 2: empate en 1er puesto + 3er puesto normal (mes -2) ─
  // Antes solo tenía 2 filas (empate); se agrega un 3ro para que el
  // ranking de ese mes no se vea tan vacío.
  await playWin(USERS.tieA, monthMinus2, 350);
  await playWin(USERS.tieB, monthMinus2, 350);
  await playWin(USERS.tieBronze, monthMinus2, 250);

  // ─── Escenario 3: mismo usuario, oro en 3 meses (-3, -4, -5) ──────
  // Único jugador en cada uno de esos meses: siempre gana su propio oro.
  // Prueba agrupado ("oro x3") vs individual en la selección de destacados.
  await playWin(USERS.champion, champMonth1, 999);
  await playWin(USERS.champion, champMonth2, 999);
  await playWin(USERS.champion, champMonth3, 999);

  // ─── Escenario 4: "veterano" con oro + plata + bronce en 3 meses (-6,-7,-8) ─
  // Prueba la combinación de VARIOS tipos de badge distintos en un mismo
  // usuario (a diferencia del campeón, que solo tiene oro).
  await playWin(USERS.veteran, vetGoldMonth, 999); // solo en el mes → oro
  await playWin(FILLER_A, vetSilverMonth, 999);
  await playWin(USERS.veteran, vetSilverMonth, 900); // 2do → plata
  await playWin(FILLER_A, vetBronzeMonth, 999);
  await playWin(FILLER_B, vetBronzeMonth, 900);
  await playWin(USERS.veteran, vetBronzeMonth, 800); // 3ro → bronce

  // ─── Cerrar los meses involucrados (misma lógica que /admin/badges/close-month) ─
  const months = [
    monthMinus1,
    monthMinus2,
    champMonth1,
    champMonth2,
    champMonth3,
    vetGoldMonth,
    vetSilverMonth,
    vetBronzeMonth,
  ].map((m) => m.slice(0, 7));
  const summary: Array<{ month: string; awarded: number }> = [];
  for (const month of months) {
    const res = await transaction((client) =>
      awardMonthlyPodium((sql, params) => client.query(sql, params), month, now),
    );
    summary.push({ month: res.month, awarded: res.awarded.length });
  }

  console.log("\n✅ Seed completo.\n");
  console.log("Usuarios ficticios (prefijo 'Seed'):");
  for (const [key, id] of Object.entries(USERS)) {
    console.log(`  - ${key.padEnd(10)} ${id}  (${DISPLAY_NAMES[id]}, ${COUNTRIES[id]})`);
  }
  console.log("\nMeses cerrados y premiados:");
  for (const s of summary) console.log(`  - ${s.month}: ${s.awarded} badges entregados`);
  console.log(
    "\nEscenarios: podio de 6 jugadores con países variados (mes -1), empate " +
      "de oro + 3er puesto normal (mes -2), triple campeón en oro (meses " +
      "-3,-4,-5, aislado; prueba agrupado 'x3' vs individual), veterano con " +
      "oro+plata+bronce en 3 meses distintos (meses -6,-7,-8; prueba mezcla " +
      "de tipos), admin y superadmin (rol, sin necesidad de jugar).",
  );
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "❌ Falta DATABASE_URL. Ejecutá con:\n" +
        "   DATABASE_URL=postgresql://... npx tsx --tsconfig tsconfig.app.json scripts/seed-badges.ts --yes",
    );
    process.exit(1);
  }

  console.log(`Destino: ${redactedHost(databaseUrl)}`);
  console.log(RESET_ONLY ? "Modo: --reset (solo limpieza)" : "Modo: seed completo");

  if (!CONFIRMED) {
    console.error(
      "\n❌ Falta confirmación. Este script ESCRIBE en la base de arriba.\n" +
        "   Volvé a correr agregando --yes si es la base correcta (staging, nunca producción sin querer).",
    );
    process.exit(1);
  }

  await initializeDatabase(); // asegura que existan las tablas/columnas de badges.
  await cleanupSeedData(); // idempotente: limpia SOLO los IDs fijos de este seed.

  if (RESET_ONLY) {
    console.log("\n✅ Datos de seed eliminados (solo los userId fijos de este script).");
    process.exit(0);
    return;
  }

  await seed(new Date());
  process.exit(0);
}

// Solo corre `main()` (que valida --yes y puede hacer process.exit) cuando el
// archivo se ejecuta directamente como CLI (`tsx scripts/seed-badges.ts`).
// Si en cambio se hace `import { seed, cleanupSeedData }` desde el server
// (endpoint /admin/seed-badges), este bloque NO debe correr — de lo
// contrario un simple import mataría el proceso del backend con
// process.exit(1) por no tener --yes.
const isDirectRun =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1] as string).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error("Error inesperado en el seed:", err);
    process.exit(1);
  });
}
