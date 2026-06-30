import type { Difficulty, Driver } from "@/types";
import { DRIVERS, DRIVERS_BY_ID, teamName, TEAMS, DATA_AS_OF_SEASON } from "@/data";
import { difficultyFloor } from "@/lib/filters";
import { dailyRng } from "@/lib/daily";
import type { Rng } from "@/lib/seed";

export type Constraint = {
  key: string;
  /** Tipo de cabecera para la presentacion. */
  kind: "team" | "nat" | "champion" | "stat";
  /** Id de escuderia (kind=team) o codigo de nacionalidad (kind=nat). */
  ref?: string;
  label: string;
  /** Ids de pilotos del pool que cumplen la restriccion. */
  ids: Set<string>;
  match: (d: Driver) => boolean;
};

export type BingoPuzzle = {
  rows: Constraint[]; // 3 escuderias
  cols: Constraint[]; // 3 (nacionalidad o campeon)
  pool: Driver[];
  /**
   * Solucion canonica: 9 pilotos DISTINTOS (uno por celda, en orden
   * fila*3+columna). Se garantiza en la generacion, de modo que el reto
   * siempre es resoluble sin repetir pilotos.
   */
  solution: string[];
};

function intersects(a: Set<string>, b: Set<string>): boolean {
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  for (const x of small) if (big.has(x)) return true;
  return false;
}

/** Ids que cumplen fila y columna. Intersecta el set mas chico (rapido). */
function candidatesFor(row: Constraint, col: Constraint): string[] {
  const [small, big] = row.ids.size < col.ids.size ? [row.ids, col.ids] : [col.ids, row.ids];
  const out: string[] = [];
  for (const id of small) if (big.has(id)) out.push(id);
  return out;
}

/** Un piloto cualquiera que cumpla ambas restricciones (sin distincion). */
export function sampleFor(row: Constraint, col: Constraint): Driver | null {
  const [small, big] = row.ids.size < col.ids.size ? [row.ids, col.ids] : [col.ids, row.ids];
  for (const id of small) if (big.has(id)) return DRIVERS_BY_ID[id] ?? null;
  return null;
}

/**
 * Emparejamiento perfecto celda->piloto con pilotos DISTINTOS (algoritmo de
 * Kuhn / caminos aumentantes). Devuelve 9 ids o null si no existe.
 */
function perfectMatching(rows: Constraint[], cols: Constraint[]): string[] | null {
  const cand: string[][] = [];
  for (let i = 0; i < 9; i++) {
    const r = rows[Math.floor(i / 3)];
    const c = cols[i % 3];
    if (!r || !c) return null;
    cand.push(candidatesFor(r, c));
  }
  // Procesar celdas con menos candidatos primero acelera el emparejamiento.
  const order = [...cand.keys()].sort((a, b) => cand[a]!.length - cand[b]!.length);

  const cellOf = new Map<string, number>(); // driverId -> celda asignada
  const assignedTo: (string | null)[] = new Array(9).fill(null);

  const augment = (cell: number, visited: Set<string>): boolean => {
    for (const id of cand[cell]!) {
      if (visited.has(id)) continue;
      visited.add(id);
      const occ = cellOf.get(id);
      if (occ === undefined || augment(occ, visited)) {
        assignedTo[cell] = id;
        cellOf.set(id, cell);
        return true;
      }
    }
    return false;
  };

  for (const cell of order) {
    if (!augment(cell, new Set())) return null;
  }
  return assignedTo as string[];
}

/**
 * ¿El piloto `d` corrió para la escudería `teamId` dentro del rango
 * `[floor, ceil]` de años? Se usa para GENERAR (que la solucion de ejemplo y la
 * factibilidad sean coherentes con la epoca de la dificultad).
 */
function droveForInRange(d: Driver, teamId: string, floor: number, ceil: number): boolean {
  for (const t of d.teams) {
    if (t.teamId !== teamId) continue;
    const start = t.years.start;
    const end = t.years.end ?? ceil;
    // intersección [start,end] con [floor,ceil]
    if (start <= ceil && end >= floor) return true;
  }
  return false;
}

/**
 * ¿El piloto corrió para esa escudería ALGUNA VEZ? Se usa para ACEPTAR la
 * respuesta del jugador: si la cabecera dice "Red Bull", vale cualquiera que
 * haya corrido en Red Bull (p. ej. Vettel), sin importar la epoca.
 */
function droveFor(d: Driver, teamId: string): boolean {
  return d.teams.some((t) => t.teamId === teamId);
}

function buildTeamConstraints(
  pool: Driver[],
  floor: number,
  ceil: number,
): Constraint[] {
  // Solo escuderías cuyo período de actividad se solape con la época de la
  // dificultad. Esto evita que en "fácil" aparezcan AGS, Minardi, ATS, etc.
  // que ya no existían en las temporadas recientes.
  const eligibleTeamIds = new Set<string>();
  for (const t of Object.values(TEAMS)) {
    const tEnd = t.active.end ?? ceil;
    if (t.active.start <= ceil && tEnd >= floor) eligibleTeamIds.add(t.id);
  }

  const out: Constraint[] = [];
  for (const id of eligibleTeamIds) {
    // El piloto cumple solo si corrió para esa escudería DENTRO de la época.
    const ids = new Set(
      pool.filter((d) => droveForInRange(d, id, floor, ceil)).map((d) => d.id),
    );
    if (ids.size >= 3) {
      out.push({
        key: `team:${id}`,
        kind: "team",
        ref: id,
        label: teamName(id),
        ids,
        match: (d) => droveFor(d, id),
      });
    }
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

function buildColConstraints(pool: Driver[], teamCols: Constraint[]): Constraint[] {
  const out: Constraint[] = [];

  // Nacionalidades con >=3 pilotos (margen para emparejar sin repetir).
  const byNat = new Map<string, string[]>();
  for (const d of pool) {
    const arr = byNat.get(d.nationalityCode) ?? [];
    arr.push(d.id);
    byNat.set(d.nationalityCode, arr);
  }
  for (const [code, ids] of byNat) {
    if (ids.length >= 3) {
      out.push({
        key: `nat:${code}`,
        kind: "nat",
        ref: code,
        label: code,
        ids: new Set(ids),
        match: (d) => d.nationalityCode === code,
      });
    }
  }

  // Campeon del mundo.
  const champIds = new Set(pool.filter((d) => d.championships > 0).map((d) => d.id));
  if (champIds.size >= 3) {
    out.push({
      key: "champion",
      kind: "champion",
      label: "Campeon",
      ids: champIds,
      match: (d) => d.championships > 0,
    });
  }

  // Columnas de logro (carrera): dan variedad y hacen factible el reto.
  const statCol = (key: string, label: string, pred: (d: Driver) => boolean) => {
    const ids = new Set(pool.filter(pred).map((d) => d.id));
    if (ids.size >= 3) out.push({ key, kind: "stat", label, ids, match: pred });
  };
  statCol("stat:winner", "Ganó un GP", (d) => (d.wins ?? 0) > 0);
  statCol("stat:podium", "Subió al podio", (d) => (d.podiums ?? 0) > 0);
  statCol("stat:pole", "Hizo una pole", (d) => (d.poles ?? 0) > 0);

  // Escuderias como columnas (un piloto que corrió en AMBAS). Es el formato
  // "immaculate grid": muy intuitivo y multiplica las combinaciones posibles.
  // En la busqueda se evita que una columna-escuderia coincida con una fila.
  for (const t of teamCols) out.push(t);

  return out.sort((a, b) => a.key.localeCompare(b.key));
}

/** ¿Toda interseccion fila/columna tiene al menos un piloto? (pre-filtro). */
function everyCellHasOne(rows: Constraint[], cols: Constraint[]): boolean {
  for (const r of rows) for (const c of cols) if (!intersects(r.ids, c.ids)) return false;
  return true;
}

/**
 * Combo valido: ninguna columna-escuderia coincide con una fila-escuderia
 * (evita celdas degeneradas "Ferrari x Ferrari") y toda celda tiene candidato.
 */
function comboOk(rows: Constraint[], cols: Constraint[]): boolean {
  const rowTeams = new Set(rows.map((r) => r.ref));
  for (const c of cols) if (c.kind === "team" && rowTeams.has(c.ref)) return false;
  return everyCellHasOne(rows, cols);
}

/**
 * Busca una grilla que admita 9 pilotos DISTINTOS (emparejamiento perfecto),
 * no solo que cada celda tenga alguno.
 */
function search(
  rng: Rng,
  teams: Constraint[],
  cols: Constraint[],
  attempts = 120,
): { rows: Constraint[]; cols: Constraint[]; solution: string[] } | null {
  for (let i = 0; i < attempts; i++) {
    const r = rng.sample(teams, 3);
    const c = rng.sample(cols, 3);
    if (r.length < 3 || c.length < 3) return null;
    if (!comboOk(r, c)) continue;
    const solution = perfectMatching(r, c);
    if (solution) return { rows: r, cols: c, solution };
  }
  return null;
}

/**
 * Busqueda sistematica garantizada: recorre combinaciones de 3 escuderias
 * (de una lista barajada y acotada) x 3 columnas hasta hallar una grilla con
 * emparejamiento perfecto. Determinista por el rng.
 */
function systematicSearch(
  rng: Rng,
  teams: Constraint[],
  cols: Constraint[],
): { rows: Constraint[]; cols: Constraint[]; solution: string[] } | null {
  if (teams.length < 3 || cols.length < 3) return null;
  // Barajamos (variedad dia a dia) y luego ordenamos por poblacion: probar
  // primero las restricciones con MAS pilotos hace que un emparejamiento
  // perfecto aparezca casi de inmediato (evita agotar el presupuesto).
  const bySize = (a: Constraint, b: Constraint) => b.ids.size - a.ids.size;
  const T = rng.shuffle(teams).sort(bySize).slice(0, 30);
  const C = rng.shuffle(cols).sort(bySize).slice(0, 16);
  let budget = 1_000_000; // tope de evaluaciones de emparejamiento
  for (let a = 0; a < T.length; a++)
    for (let b = a + 1; b < T.length; b++)
      for (let cc = b + 1; cc < T.length; cc++) {
        const rows = [T[a]!, T[b]!, T[cc]!];
        for (let i = 0; i < C.length; i++)
          for (let j = i + 1; j < C.length; j++)
            for (let k = j + 1; k < C.length; k++) {
              const colsTry = [C[i]!, C[j]!, C[k]!];
              if (!comboOk(rows, colsTry)) continue;
              if (--budget < 0) return null;
              const sol = perfectMatching(rows, colsTry);
              if (sol) return { rows, cols: colsTry, solution: sol };
            }
      }
  return null;
}

/** Construye la parrilla del dia de forma determinista. */
export function buildBingo(difficulty: Difficulty, date: Date): BingoPuzzle {
  const ceil = DATA_AS_OF_SEASON;

  // Intenta en la dificultad pedida; si no se logra una grilla VALIDA (9
  // pilotos distintos), ensancha la epoca al siguiente nivel. Esto garantiza
  // siempre una parrilla resoluble sin repetir y sin anacronismos dentro de la
  // epoca efectivamente usada (nunca devuelve una grilla degenerada).
  const order: Difficulty[] = ["facil", "medio", "dificil", "leyenda"];
  const startIdx = order.indexOf(difficulty);

  for (let idx = startIdx; idx < order.length; idx++) {
    const diff = order[idx]!;
    const rawFloor = difficultyFloor(diff);
    const floor = rawFloor === -Infinity ? 1950 : rawFloor;

    // Pool = todos los pilotos que corrieron en la epoca (coherente con las
    // cabeceras). Asi columnas (nacionalidad/campeon) y filas (escuderia)
    // pertenecen a la misma franja temporal.
    const pool = DRIVERS.filter((d) => {
      const dEnd = d.active.end ?? ceil;
      return d.active.start <= ceil && dEnd >= floor;
    });
    const teams = buildTeamConstraints(pool, floor, ceil);
    const cols = buildColConstraints(pool, teams);

    const rng = dailyRng(date, `bingo::${difficulty}::w${idx}`);
    const found =
      search(rng, teams, cols, 1200) ?? systematicSearch(rng, teams, cols);
    if (found) return { rows: found.rows, cols: found.cols, pool, solution: found.solution };
  }

  // Inalcanzable con el dataset real (leyenda = toda la historia siempre
  // resuelve), pero por contrato devolvemos algo coherente.
  const pool = DRIVERS.slice();
  const teams = buildTeamConstraints(pool, 1950, ceil);
  const cols = buildColConstraints(pool, teams);
  const rng = dailyRng(date, `bingo::${difficulty}::last`);
  const found = systematicSearch(rng, teams, cols);
  if (found) return { rows: found.rows, cols: found.cols, pool, solution: found.solution };
  return { rows: teams.slice(0, 3), cols: cols.slice(0, 3), pool, solution: new Array(9).fill("") };
}

/**
 * Completa la grilla para el reveal SIN repetir pilotos: respeta las celdas
 * que el jugador ya coloco y rellena las vacias con pilotos distintos. Si por
 * las elecciones del jugador no se puede completar manteniendolas, cae a la
 * solucion canonica (siempre distinta).
 */
export function completeGrid(
  placed: (string | null)[],
  rows: Constraint[],
  cols: Constraint[],
  solution: string[],
): (string | null)[] {
  if (placed.every(Boolean)) return placed.slice();

  const used = new Set(placed.filter((x): x is string => !!x));
  const emptyCells: number[] = [];
  for (let i = 0; i < 9; i++) if (!placed[i]) emptyCells.push(i);

  // Candidatos por celda vacia (excluyendo ya usados), preferencia a la
  // solucion canonica para mantener coherencia visual.
  const cand: string[][] = emptyCells.map((cellIdx) => {
    const r = rows[Math.floor(cellIdx / 3)]!;
    const c = cols[cellIdx % 3]!;
    const list = candidatesFor(r, c).filter((id) => !used.has(id));
    const pref = solution[cellIdx];
    if (pref && list.includes(pref)) {
      return [pref, ...list.filter((id) => id !== pref)];
    }
    return list;
  });

  const idxOf = new Map<string, number>(); // driverId -> posicion en emptyCells
  const assign: (string | null)[] = new Array(emptyCells.length).fill(null);
  const augment = (k: number, visited: Set<string>): boolean => {
    for (const id of cand[k]!) {
      if (visited.has(id)) continue;
      visited.add(id);
      const occ = idxOf.get(id);
      if (occ === undefined || augment(occ, visited)) {
        assign[k] = id;
        idxOf.set(id, k);
        return true;
      }
    }
    return false;
  };

  let ok = true;
  for (let k = 0; k < emptyCells.length; k++) {
    if (!augment(k, new Set())) {
      ok = false;
      break;
    }
  }

  if (!ok) return solution.slice(); // distinta por construccion

  const result = placed.slice();
  emptyCells.forEach((cellIdx, k) => {
    result[cellIdx] = assign[k]!;
  });
  return result;
}
