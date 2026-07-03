// scripts/test-login-flow.mjs
//
// Test END-TO-END del flujo del frontend después de login con Google.
// Simula:
//  1. Usuario anónimo X juega Wordle perdido + PitTexto ganado (attempts en server bajo X)
//  2. Login con Google G nueva → server vincula X como su userId
//  3. Frontend hace apiGetUserAttempts(X, TODAY)
//  4. syncFromServer aplica los attempts al localStorage
//  5. Home debería mostrar Wordle y PitTexto como jugados
//
// Bug reportado: Wordle aparece "sin jugar" pese a estar en el server.

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html>", { url: "https://box-daily-box.example.com/" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

// ─── Réplica de storage.ts ──────────────────────────────────────────
const NAMESPACE = "bdb", VERSION = "v1";
const prefix = k => `${NAMESPACE}:${VERSION}:${k}`;
const storage = {
  get: (k, fb) => {
    const raw = localStorage.getItem(prefix(k));
    if (raw === null) return fb;
    try { return JSON.parse(raw); } catch { return fb; }
  },
  set: (k, v) => localStorage.setItem(prefix(k), JSON.stringify(v)),
  remove: k => localStorage.removeItem(prefix(k)),
};

// ─── Réplica de dateKey ─────────────────────────────────────────────
function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Réplica de stats.ts ────────────────────────────────────────────
const RESULTS_KEY = "results", PLAYED_KEY = "played";
const loadResults = () => storage.get(RESULTS_KEY, {});
const loadPlayed = () => storage.get(PLAYED_KEY, {});
const getResult = (gameId, date = new Date()) => loadResults()[dateKey(date)]?.[gameId] ?? null;
const getPlayedStatus = (gameId, date = new Date()) => loadPlayed()[dateKey(date)]?.[gameId]?.status ?? null;

function resetForAccountSwitch() {
  storage.remove(RESULTS_KEY);
  storage.remove(PLAYED_KEY);
}

function syncFromServer(serverAttempts, dateKey_) {
  if (serverAttempts.length === 0) return;
  const results = loadResults();
  const played = loadPlayed();
  const resultsDay = results[dateKey_] ?? {};
  const playedDay = played[dateKey_] ?? {};

  for (const att of serverAttempts) {
    const status = att.won ? "won" : "lost";
    const finishedAt = new Date(att.finishedAt).getTime();
    if (!playedDay[att.gameId]) {
      playedDay[att.gameId] = { status, finishedAt };
    }
    if (!resultsDay[att.gameId]) {
      resultsDay[att.gameId] = { status, date: dateKey_, finishedAt, meta: { serverPoints: att.points, timeSeconds: att.timeSeconds } };
    }
  }
  results[dateKey_] = resultsDay;
  played[dateKey_] = playedDay;
  storage.set(RESULTS_KEY, results);
  storage.set(PLAYED_KEY, played);
}

// ─── Simulación del flujo COMPLETO ──────────────────────────────────

async function simulateLoginFlow(serverAttempts, todayFromServer) {
  // Estado inicial: usuario había jugado localmente los mismos juegos.
  // Simular localStorage con esos results ya presentes.
  const today = dateKey(new Date());
  storage.set(RESULTS_KEY, {
    [today]: {
      polewordle: { status: "lost", date: today, finishedAt: Date.now() },
      pittexto: { status: "won", date: today, finishedAt: Date.now(), meta: { serverPoints: 100 } },
    },
  });
  storage.set(PLAYED_KEY, {
    [today]: {
      polewordle: { status: "lost", finishedAt: Date.now() },
      pittexto: { status: "won", finishedAt: Date.now() },
    },
  });

  // === Paso 1: reset local (como hace handleGoogleCallback) ===
  resetForAccountSwitch();

  // Verificar que el reset limpió TODO
  assert(getResult("polewordle") === null, "reset: results vacío");
  assert(getPlayedStatus("polewordle") === null, "reset: played vacío");

  // === Paso 2: sync desde server ===
  syncFromServer(serverAttempts, todayFromServer);

  return { today };
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

async function test_bugA_scenario() {
  console.log("\n▶ Bug A: server tiene Wordle perdido + PitTexto ganado → deben aparecer ambos");
  localStorage.clear();

  const today = dateKey(new Date());
  const serverAttempts = [
    { gameId: "polewordle", won: false, timeSeconds: 60, points: 0, finishedAt: new Date().toISOString() },
    { gameId: "pittexto", won: true, timeSeconds: 45, points: 100, finishedAt: new Date().toISOString() },
  ];

  await simulateLoginFlow(serverAttempts, today);

  const wordlePlayed = getPlayedStatus("polewordle");
  const pittextoPlayed = getPlayedStatus("pittexto");

  assert(wordlePlayed === "lost", `Wordle debe estar como "lost", está: ${wordlePlayed}`);
  assert(pittextoPlayed === "won", `PitTexto debe estar como "won", está: ${pittextoPlayed}`);
  assert(getResult("polewordle") !== null, "getResult(polewordle) devuelve el resultado");
  assert(getResult("pittexto") !== null, "getResult(pittexto) devuelve el resultado");
}

async function test_bugA_serverDateKey_mismatch() {
  console.log("\n▶ Bug A variante: qué pasa si server devuelve dateKey distinto al local?");
  localStorage.clear();

  const localToday = dateKey(new Date());
  // Servidor devuelve fecha en OTRA timezone (UTC vs local)
  const utcToday = new Date().toISOString().slice(0, 10);

  const serverAttempts = [
    { gameId: "polewordle", won: false, timeSeconds: 60, points: 0, finishedAt: new Date().toISOString() },
  ];

  // El backend responde con la fecha que él calculó (podría ser UTC)
  await simulateLoginFlow(serverAttempts, utcToday);

  // getPlayedStatus busca con la fecha local
  const status = getPlayedStatus("polewordle");

  if (localToday === utcToday) {
    assert(status === "lost", "fechas coinciden → encuentra el attempt");
  } else {
    // Este es el bug: si las fechas no coinciden, no encuentra
    console.log(`     ⚠️  localToday=${localToday}, utcToday=${utcToday} — MISMATCH DETECTADO`);
    assert(status === null, `MISMATCH: guardó bajo ${utcToday}, busca bajo ${localToday}`);
  }
}

async function test_bugA_missingAttempt() {
  console.log("\n▶ Bug A extremo: server NO tiene el Wordle (perdido) → no debería aparecer");
  localStorage.clear();

  const today = dateKey(new Date());
  // Simular que el server solo devolvió PitTexto (por alguna razón perdió el Wordle)
  const serverAttempts = [
    { gameId: "pittexto", won: true, timeSeconds: 45, points: 100, finishedAt: new Date().toISOString() },
  ];

  await simulateLoginFlow(serverAttempts, today);

  const wordlePlayed = getPlayedStatus("polewordle");
  const pittextoPlayed = getPlayedStatus("pittexto");

  assert(wordlePlayed === null, "Wordle NO aparece jugado (server no lo devolvió)");
  assert(pittextoPlayed === "won", "PitTexto sí aparece jugado");

  console.log("     → Este es el bug que Juan reportó: si el server no devuelve el Wordle,");
  console.log("       el frontend no lo tiene y permite jugar de nuevo.");
}

(async () => {
  console.log("═══ TEST FLUJO POST-LOGIN (jsdom + localStorage real) ═══");
  await test_bugA_scenario();
  await test_bugA_serverDateKey_mismatch();
  await test_bugA_missingAttempt();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
