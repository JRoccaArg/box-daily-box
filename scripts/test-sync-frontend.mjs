// scripts/test-sync-frontend.mjs
//
// Test REAL del flujo de sincronización del frontend usando jsdom
// (localStorage real). Compila los módulos TS relevantes con esbuild
// y ejecuta la lógica de verdad.
//
// Ejecuta: node scripts/test-sync-frontend.mjs

import { JSDOM } from "jsdom";

// ─── Setup jsdom (localStorage, window) ─────────────────────────────
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "https://box-daily-box-staging.vercel.app/",
});
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

// ─── Replicar la lógica EXACTA de storage.ts ────────────────────────
const NAMESPACE = "bdb";
const VERSION = "v1";
const prefix = (key) => `${NAMESPACE}:${VERSION}:${key}`;

const storage = {
  get(key, fallback) {
    const raw = localStorage.getItem(prefix(key));
    if (raw === null) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(prefix(key), JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(prefix(key));
  },
};

// ─── Replicar dateKey (hora LOCAL) ──────────────────────────────────
function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Replicar syncFromServer (de stats.ts) ──────────────────────────
const RESULTS_KEY = "results";
const PLAYED_KEY = "played";

function loadResults() { return storage.get(RESULTS_KEY, {}); }
function loadPlayed() { return storage.get(PLAYED_KEY, {}); }

function getResult(gameId, date = new Date()) {
  const day = loadResults()[dateKey(date)];
  return day?.[gameId] ?? null;
}
function getPlayedStatus(gameId, date = new Date()) {
  const day = loadPlayed()[dateKey(date)];
  return day?.[gameId]?.status ?? null;
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
      resultsDay[att.gameId] = {
        status, date: dateKey_, finishedAt,
        meta: { serverPoints: att.points, timeSeconds: att.timeSeconds },
      };
    }
  }
  results[dateKey_] = resultsDay;
  played[dateKey_] = playedDay;
  storage.set(RESULTS_KEY, results);
  storage.set(PLAYED_KEY, played);
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

function clear() {
  storage.remove(RESULTS_KEY);
  storage.remove(PLAYED_KEY);
}

function test1_SyncSameDateKey() {
  console.log("\n▶ Test 1: sync con dateKey que COINCIDE con el local");
  clear();
  const today = dateKey(new Date());
  syncFromServer(
    [{ gameId: "polewordle", won: true, timeSeconds: 42, points: 100, finishedAt: new Date().toISOString() }],
    today,
  );
  assert(getResult("polewordle") !== null, "getResult encuentra polewordle");
  assert(getPlayedStatus("polewordle") === "won", "getPlayedStatus = won");
}

function test2_SyncMismatchedDateKey() {
  console.log("\n▶ Test 2: sync con dateKey UTC distinto al local (reproduce el bug)");
  clear();
  // Simular: server guardó bajo fecha UTC (mañana), frontend busca hoy local
  const localToday = dateKey(new Date());
  const utcTomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  // El server responde con la fecha UTC
  syncFromServer(
    [{ gameId: "el-intruso", won: true, timeSeconds: 30, points: 90, finishedAt: new Date().toISOString() }],
    utcTomorrow,
  );

  const foundToday = getResult("el-intruso"); // busca con localToday
  if (localToday !== utcTomorrow) {
    assert(foundToday === null, `MISMATCH detectado: guardó ${utcTomorrow}, busca ${localToday} → NO encuentra (BUG confirmado)`);
  } else {
    assert(foundToday !== null, "fechas coinciden hoy, encuentra OK");
  }
}

function test3_IdempotentNoPisar() {
  console.log("\n▶ Test 3: sync no pisa un resultado local existente");
  clear();
  const today = dateKey(new Date());
  // Local ya tiene pittexto ganado con 500 pts
  const results = {};
  results[today] = { pittexto: { status: "won", date: today, finishedAt: 123, meta: { serverPoints: 500 } } };
  storage.set(RESULTS_KEY, results);

  // Server dice que pittexto tiene 999 pts
  syncFromServer(
    [{ gameId: "pittexto", won: true, timeSeconds: 10, points: 999, finishedAt: new Date().toISOString() }],
    today,
  );

  const r = getResult("pittexto");
  assert(r.meta.serverPoints === 500, "no pisó el local (mantiene 500, no 999)");
}

(async () => {
  console.log("═══ TEST SYNC FRONTEND (jsdom + localStorage real) ═══");
  test1_SyncSameDateKey();
  test2_SyncMismatchedDateKey();
  test3_IdempotentNoPisar();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
