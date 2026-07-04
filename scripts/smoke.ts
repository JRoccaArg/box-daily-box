/* Smoke test de generacion diaria: verifica que ningun juego lance ni
 * produzca puzzles malformados a lo largo de muchas fechas y las 4
 * dificultades, con el dataset actual. */
import type { Difficulty } from "@/types";
import { DRIVERS, TEAMS } from "@/data";
import { difficultyFloor } from "@/lib/filters";
import { buildTarget, scoreGuess } from "@/components/games/PitTexto/pittexto.logic";
import { buildIntruso } from "@/components/games/ElIntruso/intruso.logic";
import { buildBingo, completeGrid } from "@/components/games/ParrillaBingo/bingo.logic";
import { buildGPChallenge, verifyGPResultado } from "@/components/games/GPResultado/gpresultado.logic";

const DIFFS: Difficulty[] = ["facil", "medio", "dificil", "leyenda"];
const DAYS = 90;
let fails = 0;
const fail = (m: string) => { fails++; if (fails <= 15) console.error("  x", m); };

function dates(): Date[] {
  const out: Date[] = [];
  const base = new Date(2026, 0, 1);
  for (let i = 0; i < DAYS; i++) out.push(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i));
  return out;
}

console.log(`Dataset: ${DRIVERS.length} pilotos | campeones: ${DRIVERS.filter(d => d.championships > 0).length}`);

for (const diff of DIFFS) {
  let bingoRepeats = 0;
  let bingoAnachro = 0;
  const rawFloor = difficultyFloor(diff);
  const floor = rawFloor === -Infinity ? 1950 : rawFloor;
  for (const date of dates()) {
    // PitTexto
    try {
      const t = buildTarget(diff, date);
      if (!t) fail(`pittexto sin objetivo`);
      else if (scoreGuess(t, t).total !== 100) fail(`pittexto: acierto exacto != 100 (${t.id})`);
    } catch (e) { fail(`pittexto throw: ${(e as Error).message}`); }

    // El Intruso
    try {
      const p = buildIntruso(diff, date);
      if (p.tiles.length !== 10) fail(`intruso: ${p.tiles.length} tiles`);
      if (!p.tiles.some((d) => d.id === p.intruderId)) fail(`intruso: intruso ausente`);
    } catch (e) { fail(`intruso throw: ${(e as Error).message}`); }

    // Bingo: solucion de 9 pilotos DISTINTOS, cada uno cumpliendo su celda.
    try {
      const b = buildBingo(diff, date);
      if (b.rows.length !== 3 || b.cols.length !== 3) fail(`bingo: dims`);
      if (b.solution.length !== 9) fail(`bingo: solution != 9`);
      const distinct = new Set(b.solution);
      if (distinct.size !== 9) { fail(`bingo: solucion REPITE pilotos`); bingoRepeats++; }
      for (let i = 0; i < 9; i++) {
        const r = b.rows[Math.floor(i / 3)]!;
        const c = b.cols[i % 3]!;
        const id = b.solution[i]!;
        if (!r.ids.has(id) || !c.ids.has(id)) fail(`bingo: celda ${i} no cumple restricciones`);
      }
      // ANACRONISMO: ninguna escuderia de las filas debe haber terminado antes del piso.
      for (const r of b.rows) {
        if (r.kind !== "team" || !r.ref) continue;
        const t = TEAMS[r.ref];
        if (!t) continue;
        const tEnd = t.active.end ?? 9999;
        if (tEnd < floor) {
          fail(`bingo[${diff}]: escuderia anacronica ${t.name} (fin ${tEnd}, piso ${floor})`);
          bingoAnachro++;
        }
      }
      // completeGrid sobre una grilla parcial tampoco debe repetir.
      const partial = b.solution.map((id, i) => (i % 2 === 0 ? id : null));
      const completed = completeGrid(partial, b.rows, b.cols, b.solution);
      const cDistinct = new Set(completed.filter(Boolean));
      if (cDistinct.size !== completed.filter(Boolean).length) fail(`bingo: completeGrid REPITE`);
    } catch (e) { fail(`bingo throw: ${(e as Error).message}`); }

    // GP Resultado: top 10 valido, rango de anio correcto, verificador OK.
    try {
      const gp = buildGPChallenge(diff, date);
      if (gp.t.length !== 10) fail(`gp-resultado: ${gp.t.length} posiciones (esperado 10)`);
      // Rango de anio segun dificultad.
      const RANGES: Record<Difficulty, [number, number]> = {
        facil: [2018, 2025], medio: [2006, 2017], dificil: [1990, 2005], leyenda: [1950, 1989],
      };
      const [minY, maxY] = RANGES[diff];
      if (gp.y < minY || gp.y > maxY) fail(`gp-resultado[${diff}]: anio ${gp.y} fuera de rango [${minY},${maxY}]`);
      // Nombres de piloto no vacios y sin duplicados en el top 10.
      const names = gp.t.map(([n]) => n);
      if (names.some((n) => !n || !n.trim())) fail(`gp-resultado: nombre vacio en ${gp.y} ${gp.g}`);
      if (new Set(names).size !== 10) fail(`gp-resultado: piloto repetido en ${gp.y} ${gp.g}`);
      // Verificador: el top 10 correcto GANA.
      const winSol = { grid: names };
      if (!verifyGPResultado(diff, date, winSol).won) fail(`gp-resultado: top10 correcto NO gana (${gp.y} ${gp.g})`);
      // Verificador: un orden incorrecto (swap P1<->P2) PIERDE.
      if (names[0] !== names[1]) {
        const swapped = [names[1], names[0], ...names.slice(2)];
        if (verifyGPResultado(diff, date, { grid: swapped }).won) fail(`gp-resultado: orden incorrecto gana (${gp.y})`);
      }
      // Verificador: grid incompleto PIERDE.
      const incomplete = [...names.slice(0, 9), null];
      if (verifyGPResultado(diff, date, { grid: incomplete }).won) fail(`gp-resultado: grid incompleto gana (${gp.y})`);
    } catch (e) { fail(`gp-resultado throw: ${(e as Error).message}`); }
  }
  console.log(`[${diff}] OK (${DAYS} dias) — bingo repetidos: ${bingoRepeats} | anacronismos: ${bingoAnachro}`);
}

console.log(`\n${fails === 0 ? "OK SMOKE — sin fallos" : fails + " FALLOS"}`);
process.exit(fails === 0 ? 0 : 1);
