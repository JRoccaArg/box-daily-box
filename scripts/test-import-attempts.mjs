// scripts/test-import-attempts.mjs
//
// Test REAL de importLocalAttempts (FIX 3): al loguearse, los intentos locales
// se importan al server SOLO si la cuenta no los tiene, re-verificando la
// solution server-side (no se confía en puntos del cliente).
//
// Reglas validadas:
//  - Cuenta ya tiene el juego → local descartado (inmutabilidad)
//  - Cuenta NO tiene el juego → se importa, puntos recalculados server-side
//  - Solution inválida/ausente → importado como perdido (0 pts)
//  - Puntos del cliente IGNORADOS (no se pueden inyectar)

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}
async function q(sql, params) { return db.query(sql, params); }

const TODAY = "2026-07-02";
const USER = "cccccccc-cccc-cccc-cccc-cccccccccccc";

// Simulación de verifyChallenge: para el test, "ganó" si solution.correct === true
function fakeVerifyChallenge(gameId, difficulty, dateKey, solution) {
  if (!solution || typeof solution !== "object") return { won: false };
  return { won: solution.correct === true };
}

// Simulación de computeScore (determinística para el test)
function fakeComputeScore({ won, difficulty }) {
  if (!won) return 0;
  const base = { facil: 50, medio: 100, dificil: 150, leyenda: 200 };
  return base[difficulty] ?? 100;
}

const VALID_GAME_IDS = new Set(["pittexto", "polewordle", "el-intruso", "parrilla-bingo"]);
const VALID_DIFFICULTIES = new Set(["facil", "medio", "dificil", "leyenda"]);

// Réplica de importLocalAttempts (auth.ts)
async function importLocalAttempts(userId, dateKeyStr, localAttempts, clientIp) {
  if (!Array.isArray(localAttempts) || localAttempts.length === 0) return 0;
  let imported = 0;

  for (const att of localAttempts) {
    const gameId = att.gameId;
    const difficulty = att.difficulty;
    if (typeof gameId !== "string" || !VALID_GAME_IDS.has(gameId)) continue;
    if (typeof difficulty !== "string" || !VALID_DIFFICULTIES.has(difficulty)) continue;

    const existing = await q(
      "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3::date",
      [userId, gameId, dateKeyStr],
    );
    if (existing.rows.length > 0) continue;

    let won = false;
    if (att.solution && typeof att.solution === "object") {
      const vr = fakeVerifyChallenge(gameId, difficulty, dateKeyStr, att.solution);
      won = vr.won;
    }

    const timeLimit = 300;
    const points = fakeComputeScore({ won, difficulty });

    try {
      await q(
        `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, flagged, ip_address)
         VALUES ($1, $2, $3::date, $4, $5, $6, $7, false, $8)`,
        [userId, gameId, dateKeyStr, difficulty, won, timeLimit, points, clientIp],
      );
      imported++;
    } catch (err) {
      if (err.code !== "23505") throw err;
    }
  }
  return imported;
}

async function setup() {
  await q(`CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT);`);
  await q(`CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL, date_key DATE NOT NULL, difficulty TEXT NOT NULL,
    won BOOLEAN NOT NULL, time_seconds INTEGER, points INTEGER NOT NULL,
    flagged BOOLEAN DEFAULT false, ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, game_id, date_key));`);
  await q("INSERT INTO users (id, display_name) VALUES ($1, 'Juan')", [USER]);
}

async function reset() {
  await q("DELETE FROM attempts WHERE user_id = $1", [USER]);
}

async function pointsOf(gameId) {
  const r = await q(
    "SELECT won, points FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3::date",
    [USER, gameId, TODAY],
  );
  return r.rows[0] ?? null;
}

// ═══════════════════════════════════════════════════════════════════

async function test1_ImportWhenNotPresent() {
  console.log("\n▶ Test 1: cuenta NO tiene el juego → se importa con puntos re-calculados");
  await reset();

  const imported = await importLocalAttempts(USER, TODAY, [
    { gameId: "pittexto", difficulty: "medio", solution: { correct: true } },
  ], "1.1.1.1");

  assert(imported === 1, "importó 1 intento");
  const row = await pointsOf("pittexto");
  assert(row && row.won === true, "pittexto quedó como ganado");
  assert(row.points === 100, "puntos recalculados server-side (100 para medio)");
}

async function test2_DiscardWhenPresent() {
  console.log("\n▶ Test 2: cuenta YA tiene el juego → local descartado (inmutable)");
  await reset();
  // La cuenta ya jugó pittexto (perdido, 0 pts) desde antes
  await q(
    `INSERT INTO attempts (user_id, game_id, date_key, difficulty, won, time_seconds, points, ip_address)
     VALUES ($1, 'pittexto', $2::date, 'medio', false, 60, 0, '1.1.1.1')`,
    [USER, TODAY],
  );

  // El local dice que ganó con muchos puntos → NO debe reemplazar
  const imported = await importLocalAttempts(USER, TODAY, [
    { gameId: "pittexto", difficulty: "medio", solution: { correct: true } },
  ], "1.1.1.1");

  assert(imported === 0, "no importó nada (ya existía)");
  const row = await pointsOf("pittexto");
  assert(row.won === false, "se mantuvo el resultado del server (perdido)");
  assert(row.points === 0, "puntos del server intactos (0), no los del local");
}

async function test3_ClientPointsIgnored() {
  console.log("\n▶ Test 3: SEGURIDAD — puntos del cliente son IGNORADOS");
  await reset();

  // Atacante manda solution que NO gana, pero intenta inyectar 999 pts.
  // El campo "points" del cliente ni siquiera se lee.
  const imported = await importLocalAttempts(USER, TODAY, [
    { gameId: "polewordle", difficulty: "medio", solution: { correct: false, points: 999, won: true } },
  ], "1.1.1.1");

  assert(imported === 1, "se importó el intento");
  const row = await pointsOf("polewordle");
  assert(row.won === false, "el server determinó que NO ganó (solution.correct=false)");
  assert(row.points === 0, "0 puntos, no los 999 que intentó inyectar el cliente");
}

async function test4_NoSolutionIsLost() {
  console.log("\n▶ Test 4: sin solution (abandono) → importado como perdido");
  await reset();

  const imported = await importLocalAttempts(USER, TODAY, [
    { gameId: "el-intruso", difficulty: "medio", solution: null },
  ], "1.1.1.1");

  assert(imported === 1, "se importó");
  const row = await pointsOf("el-intruso");
  assert(row.won === false, "sin solution → perdido");
  assert(row.points === 0, "0 puntos");
}

async function test5_InvalidGamesSkipped() {
  console.log("\n▶ Test 5: juegos/dificultades inválidos se ignoran");
  await reset();

  const imported = await importLocalAttempts(USER, TODAY, [
    { gameId: "juego-hackeado", difficulty: "medio", solution: { correct: true } },
    { gameId: "pittexto", difficulty: "imposible", solution: { correct: true } },
    { gameId: "pittexto", difficulty: "medio", solution: { correct: true } }, // este sí
  ], "1.1.1.1");

  assert(imported === 1, "solo importó el válido (ignoró juego y dificultad inválidos)");
  const all = await q("SELECT game_id FROM attempts WHERE user_id = $1", [USER]);
  assert(all.rows.length === 1, "solo 1 attempt en la BD");
  assert(all.rows[0].game_id === "pittexto", "es pittexto");
}

async function test6_ScenarioReal() {
  console.log("\n▶ Test 6: escenario real de Juan — Wordle perdido + PitTexto ganado local");
  await reset();
  // La cuenta Google es nueva (sin attempts). Juan jugó local:
  //   - Wordle: perdió (solution incorrecta o abandono)
  //   - PitTexto: ganó
  const imported = await importLocalAttempts(USER, TODAY, [
    { gameId: "polewordle", difficulty: "medio", solution: { correct: false } },
    { gameId: "pittexto", difficulty: "medio", solution: { correct: true } },
  ], "1.1.1.1");

  assert(imported === 2, "importó ambos (Wordle perdido + PitTexto ganado)");

  const wordle = await pointsOf("polewordle");
  const pittexto = await pointsOf("pittexto");
  assert(wordle.won === false, "Wordle quedó como perdido (no se puede volver a jugar)");
  assert(pittexto.won === true, "PitTexto quedó como ganado");
  assert(pittexto.points === 100, "PitTexto con puntos correctos");

  // Ahora Juan NO puede volver a jugar el Wordle: ya está registrado
  const retry = await importLocalAttempts(USER, TODAY, [
    { gameId: "polewordle", difficulty: "medio", solution: { correct: true } }, // intenta ganar de nuevo
  ], "1.1.1.1");
  assert(retry === 0, "no puede re-importar el Wordle (ya registrado como perdido)");
  const wordleAfter = await pointsOf("polewordle");
  assert(wordleAfter.won === false, "el Wordle sigue perdido (inmutable, no lo cambió a ganado)");
}

(async () => {
  console.log("═══ TEST importLocalAttempts (PGlite real) ═══");
  await setup();
  await test1_ImportWhenNotPresent();
  await test2_DiscardWhenPresent();
  await test3_ClientPointsIgnored();
  await test4_NoSolutionIsLost();
  await test5_InvalidGamesSkipped();
  await test6_ScenarioReal();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
