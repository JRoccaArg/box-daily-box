/**
 * Test de "Career Path" (Roadmap: juego nuevo).
 *
 * Cubre:
 *  - Determinismo: mismo dia + dificultad => mismo piloto, siempre.
 *  - hasFullLogoChain filtra correctamente: cadenas con >=1 escuderia sin
 *    logo NUNCA aparecen en el pool jugable.
 *  - Todo target generado tiene cadena >=2 y CADA escuderia de esa cadena
 *    tiene logo en TEAM_IDS_WITH_LOGO.
 *  - Smoke de 90 dias x dificultades habilitadas (facil/medio/dificil; NO
 *    "leyenda", desactivada porque su pool no se diferencia de "dificil"):
 *    sin excepciones, con variedad razonable de pilotos (no siempre el mismo).
 *  - getCareerChain colapsa temporadas consecutivas del mismo equipo pero
 *    preserva un regreso (caso Fisichella: jordan aparece dos veces, no
 *    consecutivas, en su cadena real).
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-career-path.ts
 */
import { DRIVERS, DRIVERS_BY_ID, hasFullLogoChain, getCareerChain, TEAM_IDS_WITH_LOGO } from "../src/data";
import { buildCareerPathTarget, targetChain, getCareerPathPool } from "../src/components/games/CareerPath/careerpath.logic";
import type { Difficulty } from "../src/types";

// Dificultades habilitadas para este juego (debe coincidir con
// src/components/games/registry.ts). No se importa el registry acá: arrastra
// los componentes React de todos los juegos (mismo motivo documentado en
// scripts/gen-sitemap.ts para GAME_IDS).
const CAREER_PATH_DIFFICULTIES: Difficulty[] = ["facil", "medio", "dificil"];

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

// ─── Parte A: hasFullLogoChain ──────────────────────────────────────

console.log("\n=== Parte A: hasFullLogoChain ===");

const fisichella = DRIVERS_BY_ID["giancarlo-fisichella"];
assert(!!fisichella, "Fisichella existe en el dataset");
if (fisichella) {
  const chain = getCareerChain(fisichella);
  assert(
    JSON.stringify(chain) ===
      JSON.stringify(["minardi", "jordan", "benetton", "jordan", "sauber", "renault", "force-india", "ferrari"]),
    `getCareerChain(Fisichella) preserva el regreso a Jordan: ${chain.join(" -> ")}`,
  );
  // Las 7 escuderias de su cadena (minardi/jordan/benetton/sauber/renault/
  // force-india/ferrari) estan TODAS cubiertas por los logos actuales (tier
  // "medio"), asi que a pesar de ser un piloto de 1996-2009 SI es jugable.
  assert(hasFullLogoChain(fisichella), "Fisichella es jugable (las 7 escuderias de su cadena tienen logo)");
}

// Un piloto cuya cadena SI tiene una escuderia sin logo (ninguna del tier
// "medio" cubre equipos como "lotus" de los 60 o "tyrrell") no es jugable.
const jimClark = DRIVERS_BY_ID["jim-clark"];
if (jimClark) {
  assert(!hasFullLogoChain(jimClark), "Jim Clark (F1 de los 60) NO es jugable: sus escuderias no tienen logo");
}

// Ningun piloto "jugable" puede tener una escuderia sin logo en su cadena.
let leakedNoLogo = 0;
for (const d of DRIVERS) {
  if (!hasFullLogoChain(d)) continue;
  for (const teamId of getCareerChain(d)) {
    if (!TEAM_IDS_WITH_LOGO.has(teamId)) leakedNoLogo++;
  }
}
assert(leakedNoLogo === 0, `0 pilotos jugables con escuderia sin logo (encontrados: ${leakedNoLogo})`);

// Un piloto con 1 sola escuderia nunca es jugable (necesita cadena, no un solo logo).
const oneTeamDriver = DRIVERS.find((d) => getCareerChain(d).length === 1);
assert(!!oneTeamDriver && !hasFullLogoChain(oneTeamDriver), "piloto con 1 sola escuderia no es jugable");

// ─── Parte B: determinismo ──────────────────────────────────────────

console.log("\n=== Parte B: determinismo ===");

const sameDate1 = new Date(2026, 5, 15);
const sameDate2 = new Date(2026, 5, 15);
const t1 = buildCareerPathTarget("medio", sameDate1);
const t2 = buildCareerPathTarget("medio", sameDate2);
assert(t1.id === t2.id, `mismo dia + dificultad => mismo piloto (${t1.id})`);

const otherDay = buildCareerPathTarget("medio", new Date(2026, 5, 16));
// No es una garantia absoluta (podria coincidir), pero con >=25 pilotos en pool es
// extremadamente improbable que 2 dias consecutivos den el mismo id.
assert(otherDay.id !== t1.id || getCareerPathPool("medio").length < 2, "dias distintos tienden a dar pilotos distintos");

// Un duelo (seed) da un resultado propio, no ligado a la fecha.
const duelTarget = buildCareerPathTarget("medio", sameDate1, "duelo-abc123");
assert(!!duelTarget.id, "buildCareerPathTarget con seed de duelo no explota");

// ─── Parte C: smoke 90 dias x 4 dificultades ────────────────────────

console.log("\n=== Parte C: smoke (90 dias x dificultades habilitadas) ===");

for (const diff of CAREER_PATH_DIFFICULTIES) {
  const pool = getCareerPathPool(diff as Difficulty);
  assert(pool.length > 0, `[${diff}] pool no vacio (${pool.length} pilotos)`);

  const seen = new Set<string>();
  let allValid = true;
  for (let day = 0; day < 90; day++) {
    const date = new Date(2026, 0, 1 + day);
    const target = buildCareerPathTarget(diff as Difficulty, date);
    const chain = targetChain(target);
    if (chain.length < 2) allValid = false;
    for (const teamId of chain) {
      if (!TEAM_IDS_WITH_LOGO.has(teamId)) allValid = false;
    }
    seen.add(target.id);
  }
  assert(allValid, `[${diff}] las 90 cadenas generadas tienen >=2 escuderias y logo completo`);
  // Con "facil" el pool es chico (~25): solo exigimos variedad real, no un minimo fijo.
  assert(seen.size >= Math.min(10, pool.length), `[${diff}] variedad real en 90 dias (${seen.size} pilotos distintos)`);
}

// ─── Resultado ───────────────────────────────────────────────────────

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
if (failed > 0) process.exit(1);
