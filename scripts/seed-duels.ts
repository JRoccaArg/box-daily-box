/**
 * Herramienta de STAGING: puebla la base con amigos y duelos ficticios
 * DIRIGIDOS a tu propia cuenta, para poder probar visualmente (una vez exista
 * la UI, Etapa 3) el banner de invitación, la lista de amigos, las
 * solicitudes pendientes (entrantes y salientes) y un duelo ya resuelto.
 * Mismo patrón de seguridad que scripts/seed-badges.ts.
 *
 * SEGURIDAD:
 *  - Escribe usando process.env.DATABASE_URL (la misma variable que el server).
 *  - Exige el flag --yes y muestra el host de destino ANTES de tocar nada.
 *  - El cleanup SOLO borra filas donde aparece uno de los 3 userId ficticios
 *    fijos (prefijo `anon-d00d...`). Nunca toca datos de tu cuenta real más
 *    allá de las filas de amistad/duelo que este script creó para ella.
 *  - Reusa src/api/db.ts (initializeDatabase/query/transaction): no duplica
 *    SQL de otra parte del sistema.
 *
 * Uso (necesita el userId de tu cuenta real de staging, sacado de la consola
 * del navegador con `JSON.parse(localStorage.getItem('bdb_identity')).userId`
 * o desde el botón "Cargar seed de duelos" del panel de debug, que ya conoce
 * tu userId):
 *   DATABASE_URL=postgresql://... npx tsx --tsconfig tsconfig.app.json scripts/seed-duels.ts --yes --user=<tuUserId>
 *   DATABASE_URL=postgresql://... npx tsx --tsconfig tsconfig.app.json scripts/seed-duels.ts --yes --reset
 */
import { pathToFileURL } from "node:url";
import { initializeDatabase, query } from "../src/api/db";

const args = process.argv.slice(2);
const CONFIRMED = args.includes("--yes");
const RESET_ONLY = args.includes("--reset");
const userArg = args.find((a) => a.startsWith("--user="));
const TARGET_USER_ID = userArg ? userArg.slice("--user=".length) : null;

const FRIENDS = {
  // Ya amigo del target; le manda además un duelo pendiente (para el banner).
  a: "anon-d00d0000-0000-4000-8000-000000000a01",
  // Solicitud de amistad PENDIENTE hacia el target (para probar aceptar/rechazar).
  b: "anon-d00d0000-0000-4000-8000-000000000a02",
  // El target YA le mandó una solicitud a este (para probar "esperando respuesta").
  c: "anon-d00d0000-0000-4000-8000-000000000a03",
} as const;

const DISPLAY_NAMES: Record<string, string> = {
  [FRIENDS.a]: "Seed Friend A",
  [FRIENDS.b]: "Seed Friend B",
  [FRIENDS.c]: "Seed Friend C",
};
const COUNTRIES: Record<string, string> = {
  [FRIENDS.a]: "BRA",
  [FRIENDS.b]: "ESP",
  [FRIENDS.c]: "ITA",
};

const ALL_FRIEND_IDS = Object.values(FRIENDS);
const PENDING_DUEL_ID = "SEEDDL01";
const FINISHED_DUEL_ID = "SEEDDL02";
const ALL_DUEL_IDS = [PENDING_DUEL_ID, FINISHED_DUEL_ID];

function redactedHost(databaseUrl: string): string {
  try {
    const u = new URL(databaseUrl);
    return `${u.hostname}${u.port ? ":" + u.port : ""}${u.pathname}`;
  } catch {
    return "(no se pudo parsear DATABASE_URL)";
  }
}

/**
 * Limpieza ESTRICTA: solo filas donde aparece uno de los 3 userId ficticios
 * (como amigo, solicitante o participante de duelo), sin importar quién sea
 * el otro lado. Nunca borra datos de la cuenta real del que prueba más allá
 * de las relaciones que este script creó para ella.
 */
export async function cleanupSeedData(): Promise<void> {
  await query("DELETE FROM duels WHERE id = ANY($1::text[])", [ALL_DUEL_IDS] as any);
  await query(
    "DELETE FROM friend_requests WHERE from_user = ANY($1::text[]) OR to_user = ANY($1::text[])",
    [ALL_FRIEND_IDS] as any,
  );
  await query(
    "DELETE FROM friendships WHERE user_a = ANY($1::text[]) OR user_b = ANY($1::text[])",
    [ALL_FRIEND_IDS] as any,
  );
  await query("DELETE FROM users WHERE id = ANY($1::text[])", [ALL_FRIEND_IDS] as any);
}

async function insertFriendUsers(): Promise<void> {
  for (const id of ALL_FRIEND_IDS) {
    await query(
      `INSERT INTO users (id, display_name, country_code)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [id, DISPLAY_NAMES[id] as string, COUNTRIES[id] as string],
    );
  }
}

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function seed(targetUserId: string, now: Date): Promise<void> {
  await insertFriendUsers();

  // ─── Amistad ya establecida (Friend A) ────────────────────────────
  const [pa, pb] = orderedPair(targetUserId, FRIENDS.a);
  await query(
    "INSERT INTO friendships (user_a, user_b) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [pa, pb],
  );

  // ─── Solicitud ENTRANTE pendiente (Friend B → target) ─────────────
  await query(
    `INSERT INTO friend_requests (from_user, to_user)
     VALUES ($1, $2)
     ON CONFLICT (from_user, to_user) WHERE status = 'pending' DO NOTHING`,
    [FRIENDS.b, targetUserId],
  );

  // ─── Solicitud SALIENTE pendiente (target → Friend C) ─────────────
  await query(
    `INSERT INTO friend_requests (from_user, to_user)
     VALUES ($1, $2)
     ON CONFLICT (from_user, to_user) WHERE status = 'pending' DO NOTHING`,
    [targetUserId, FRIENDS.c],
  );

  // ─── Duelo PENDIENTE dirigido al target (Friend A te desafía) ─────
  // TTL generoso (5 min, no los 60s reales de producción): esto es un insert
  // directo para poder INSPECCIONAR el estado con calma mientras se prueba la
  // UI, no pasa por createDuel (que sí aplica el TTL real de 60s).
  await query(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status, expires_at)
     VALUES ($1, $2, $3, 'pittexto', 'medio', 180, $1, 'pending', $4)
     ON CONFLICT (id) DO NOTHING`,
    [PENDING_DUEL_ID, FRIENDS.a, targetUserId, new Date(now.getTime() + 5 * 60_000).toISOString()],
  );

  // ─── Duelo YA finalizado entre dos amigos ficticios (para probar la
  //     pantalla de resultado sin depender de jugar en vivo) ──────────
  await query(
    `INSERT INTO duels (id, creator_id, opponent_id, game_id, difficulty, time_limit, seed, status,
                         creator_result, opponent_result, expires_at, finished_at)
     VALUES ($1, $2, $3, 'el-intruso', 'dificil', 60, $1, 'finished',
             $4::jsonb, $5::jsonb, $6, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      FINISHED_DUEL_ID,
      FRIENDS.b,
      FRIENDS.c,
      JSON.stringify({ won: true, points: 480, timeSeconds: 22, finishedAt: now.toISOString() }),
      JSON.stringify({ won: false, points: 0, timeSeconds: 60, finishedAt: now.toISOString() }),
      now.toISOString(),
    ],
  );

  console.log("\n✅ Seed de amigos/duelos completo.\n");
  console.log(`Target (tu cuenta): ${targetUserId}`);
  console.log("Usuarios ficticios (prefijo 'Seed Friend'):");
  for (const [key, id] of Object.entries(FRIENDS)) {
    console.log(`  - ${key.padEnd(2)} ${id}  (${DISPLAY_NAMES[id]}, ${COUNTRIES[id]})`);
  }
  console.log("\nEscenarios creados:");
  console.log("  - Ya sos amigo de Friend A.");
  console.log("  - Friend B te mandó una solicitud de amistad (pendiente, entrante).");
  console.log("  - Le mandaste una solicitud a Friend C (pendiente, saliente).");
  console.log("  - Friend A te desafió a un duelo de PitTexto (pendiente, expira en 5 min).");
  console.log("  - Duelo YA resuelto entre Friend B y Friend C (El Intruso), para probar la pantalla de resultado.");
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "❌ Falta DATABASE_URL. Ejecutá con:\n" +
        "   DATABASE_URL=postgresql://... npx tsx --tsconfig tsconfig.app.json scripts/seed-duels.ts --yes --user=<tuUserId>",
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

  await initializeDatabase();
  await cleanupSeedData();

  if (RESET_ONLY) {
    console.log("\n✅ Datos de seed eliminados (solo los userId ficticios + duelos de este script).");
    process.exit(0);
    return;
  }

  if (!TARGET_USER_ID) {
    console.error(
      "\n❌ Falta --user=<tuUserId>. Los duelos/solicitudes de este seed apuntan a TU cuenta real.",
    );
    process.exit(1);
  }

  await seed(TARGET_USER_ID, new Date());
  process.exit(0);
}

// Mismo guard que seed-badges.ts: solo corre main() al ejecutarse como CLI
// directo, nunca al hacer `import { seed, cleanupSeedData }` desde el
// endpoint /admin/seed-duels (un import no debe poder matar el proceso).
const isDirectRun =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1] as string).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error("Error inesperado en el seed:", err);
    process.exit(1);
  });
}
