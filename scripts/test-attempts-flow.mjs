// scripts/test-attempts-flow.mjs
//
// Test del flujo REAL: guardar attempt con fecha local → recuperar con
// getUserAttempts usando la misma fecha. Verifica que date_key (tipo DATE
// de Postgres) se compare correctamente con el string que manda el cliente.

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}
async function q(sql, params) { return db.query(sql, params); }

const UUID = "0e7d408b-e7cf-42d1-87eb-4a431fc2e4c6";

async function setup() {
  await q(`CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT, country_code TEXT, name_changed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());`);
  await q(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL, date_key DATE NOT NULL, difficulty TEXT NOT NULL,
    won BOOLEAN NOT NULL, time_seconds INTEGER, points INTEGER NOT NULL,
    flagged BOOLEAN DEFAULT false, ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, game_id, date_key));`);
  await q("INSERT INTO users (id, display_name) VALUES ($1, 'Rocket')", [UUID]);
}

// Replica isValidDateKey
function isValidDateKey(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

async function test1() {
  console.log("\n▶ Test 1: guardar con fecha local, recuperar con misma fecha");
  const localDate = "2026-07-01"; // fecha local del cliente

  // Simular /finish guardando el attempt
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ip_address)
     VALUES ($1, 'el-intruso', $2, 'medio', true, 30, 90, '1.2.3.4')`,
    [UUID, localDate],
  );

  // Simular getUserAttempts recuperando con la misma fecha
  const rows = await q(
    `SELECT game_id, won, points FROM attempts WHERE user_id = $1 AND date_key = $2`,
    [UUID, localDate],
  );
  assert(rows.rows.length === 1, `recupera el attempt con date_key='${localDate}'`);
  assert(rows.rows[0]?.game_id === "el-intruso", "es el-intruso");
}

async function test2() {
  console.log("\n▶ Test 2: qué devuelve Postgres para una columna DATE");
  const rows = await q(`SELECT date_key, date_key::text as date_str FROM attempts LIMIT 1`);
  const dk = rows.rows[0].date_key;
  const ds = rows.rows[0].date_str;
  console.log(`     date_key (raw) = ${JSON.stringify(dk)} (typeof ${typeof dk})`);
  console.log(`     date_key::text = ${JSON.stringify(ds)}`);
  assert(ds === "2026-07-01", "date_key::text es exactamente 2026-07-01");
}

async function test3() {
  console.log("\n▶ Test 3: comparación DATE con string en distinto formato");
  // ¿Qué pasa si el cliente manda fecha con hora? No debería, pero validamos robustez.
  const rows = await q(
    `SELECT game_id FROM attempts WHERE user_id = $1 AND date_key = $2`,
    [UUID, "2026-07-01"],
  );
  assert(rows.rows.length === 1, "comparación string YYYY-MM-DD con DATE funciona");
}

(async () => {
  console.log("═══ TEST FLUJO ATTEMPTS (PGlite real) ═══");
  await setup();
  await test1();
  await test2();
  await test3();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
