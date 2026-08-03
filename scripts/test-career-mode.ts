/**
 * Test del motor del Modo Carrera (src/lib/career).
 *
 * El Modo Carrera NO puntua para el ranking ni habla con el server, asi que
 * lo unico que hay que blindar es el motor: que sea determinista, que el
 * estado nunca quede corrupto y que el balance se mantenga en el rango
 * acordado ("dificil pero alcanzable").
 *
 * Cubre:
 *  - Determinismo: misma semilla + mismas decisiones => misma carrera.
 *  - Integridad: la parrilla siempre tiene 20 butacas y el jugador ocupa
 *    exactamente una (o ninguna si esta sin asiento).
 *  - Rangos sanos de las estadisticas (nada de puntos negativos, posiciones
 *    fuera de 1-20, mas abandonos que carreras, etc.).
 *  - Ciclo de vida: toda carrera termina y nunca pasa de MAX_SEASONS.
 *  - Balance: el titulo se logra en una fraccion razonable de partidas.
 *  - La edad pesa MENOS que el azar de una carrera (pedido explicito).
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-career-mode.ts
 */
import {
  acceptOffer,
  advanceSeasons,
  currentCarRanking,
  declineOffers,
  resolveEvent,
  retire,
  seekSeat,
  startCareer,
} from "../src/lib/career/career";
import { ageEffect } from "../src/lib/career/season";
import { flattenGrid, CAREER_TEAM_IDS } from "../src/lib/career/grid";
import { GRID_SIZE, MAX_SEASONS, RACES_PER_SEASON, RACE_NOISE } from "../src/lib/career/constants";
import {
  CAREER_EVENTS,
  MAX_EVENTS_PER_CHUNK,
  getEvent,
  meetsCondition,
  pickEvents,
} from "../src/lib/career/events";
import { Rng } from "../src/lib/seed";
import esContent from "../src/content/career/es";
import enContent from "../src/content/career/en";
import type { CareerState } from "../src/lib/career/types";

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

function newCareer(seed: string, step: 1 | 2 | 3 = 3): CareerState {
  return startCareer({
    firstName: "Test",
    lastName: "Driver",
    nationalityCode: "ARG",
    step,
    seed,
    startYear: 2026,
  });
}

/**
 * Juega una carrera entera con una estrategia fija (siempre el mejor coche
 * disponible). Al ser una politica determinista, sirve para comparar dos
 * corridas con la misma semilla.
 */
function playFullCareer(seed: string, step: 1 | 2 | 3 = 3) {
  let s = newCareer(seed, step);
  s = acceptOffer(s, 0);

  let guard = 0;
  const problems: string[] = [];

  while (s.phase !== "retired" && guard++ < 300) {
    checkIntegrity(s, problems);
    if (s.phase === "ready") {
      s = advanceSeasons(s).state;
    } else if (s.phase === "offers") {
      let best = 0;
      s.offers.forEach((o, i) => {
        if (o.expectedCarRank < (s.offers[best]?.expectedCarRank ?? 99)) best = i;
      });
      s = acceptOffer(s, best);
    } else if (s.phase === "events") {
      // Politica fija: siempre la primera opcion (determinista, comparable).
      const ev = getEvent(s.pendingEvents[0] ?? "");
      const optionId = ev?.options[0]?.id ?? "";
      const before = s.pendingEvents.length;
      s = resolveEvent(s, optionId).state;
      if (s.pendingEvents.length >= before && s.phase === "events") {
        problems.push("la cola de eventos no avanza");
        break;
      }
    } else if (s.phase === "no-seat") {
      const before = s.season;
      s = advanceSeasons(s).state;
      if (s.phase === "no-seat") s = seekSeat(s);
      // Si sigue sin butaca y no avanzo el anio, se retira (evita bucle).
      if (s.phase === "no-seat" && s.season === before) s = retire(s);
    } else {
      break;
    }
  }
  checkIntegrity(s, problems);
  return { state: s, problems, loops: guard };
}

/** Chequeos que deben valer en CUALQUIER punto de la partida. */
function checkIntegrity(s: CareerState, problems: string[]) {
  const seats = flattenGrid(s.grid);
  if (seats.length !== GRID_SIZE) problems.push(`parrilla con ${seats.length} butacas`);

  const playerSeats = seats.filter((x) => x.occupant.kind === "player").length;
  if (s.teamId && playerSeats !== 1) problems.push(`con equipo pero ${playerSeats} butacas del jugador`);
  if (!s.teamId && playerSeats !== 0) problems.push(`sin equipo pero ${playerSeats} butacas del jugador`);

  if (s.season > MAX_SEASONS + 1) problems.push(`temporada ${s.season} supera el tope`);
  if (s.player.age < 19) problems.push(`edad invalida ${s.player.age}`);
  if (s.player.reputation < 0 || s.player.reputation > 100) problems.push(`reputacion ${s.player.reputation}`);
  if (s.player.morale < 0 || s.player.morale > 100) problems.push(`moral ${s.player.morale}`);

  // Los atributos SI pueden superar el techo por premio de un evento (es
  // deliberado), pero nunca salirse de 1..100.
  for (const a of [s.player.attributes.pace, s.player.attributes.consistency, s.player.attributes.racecraft]) {
    if (a < 1 || a > 100) problems.push(`atributo fuera de rango: ${a}`);
  }
  if (s.player.potential < 1 || s.player.potential > 100) problems.push(`techo ${s.player.potential}`);

  // Coherencia de la cola de eventos.
  if (s.phase === "events" && s.pendingEvents.length === 0) problems.push("fase 'events' con cola vacia");
  if (s.phase !== "events" && s.pendingEvents.length > 0) problems.push("cola de eventos fuera de la fase 'events'");
  for (const id of s.pendingEvents) {
    if (!getEvent(id)) problems.push(`evento en cola inexistente: ${id}`);
  }

  for (const h of s.history) {
    if (!h.stats) continue;
    const st = h.stats;
    if (st.points < 0) problems.push(`puntos negativos (${st.points})`);
    if (st.championshipPosition < 1 || st.championshipPosition > GRID_SIZE)
      problems.push(`posicion de campeonato ${st.championshipPosition}`);
    if (st.carRank < 1 || st.carRank > CAREER_TEAM_IDS.length) problems.push(`carRank ${st.carRank}`);
    if (st.wins > st.podiums) problems.push(`mas victorias (${st.wins}) que podios (${st.podiums})`);
    if (st.wins + st.podiums > RACES_PER_SEASON * 2) problems.push(`podios imposibles`);
    if (st.mechanicalDnfs + st.accidents > RACES_PER_SEASON) problems.push(`mas abandonos que carreras`);
    if (st.overtakes < 0) problems.push(`adelantamientos negativos`);
    if (st.teammatePoints < 0) problems.push(`puntos del companiero negativos`);
  }
}

// ─── Parte A: determinismo ──────────────────────────────────────────

console.log("\n=== Parte A: determinismo ===");
{
  const a = playFullCareer("seed-determinismo");
  const b = playFullCareer("seed-determinismo");
  assert(
    JSON.stringify(a.state) === JSON.stringify(b.state),
    "misma semilla + mismas decisiones => carrera identica",
  );

  const c = playFullCareer("otra-semilla-distinta");
  assert(
    JSON.stringify(a.state.history) !== JSON.stringify(c.state.history),
    "semillas distintas => carreras distintas",
  );

  // El estado inicial tambien tiene que ser reproducible.
  const s1 = newCareer("setup-igual");
  const s2 = newCareer("setup-igual");
  assert(JSON.stringify(s1) === JSON.stringify(s2), "el arranque de la partida es reproducible");
  assert(s1.offers.length > 0 && s1.phase === "rookie-offers", "arranca con ofertas de rookie para elegir");
  assert(
    s1.offers.every((o) => o.expectedCarRank >= 6),
    "las ofertas de rookie son de equipos de la parte de atras",
  );
}

// ─── Parte B: integridad del estado ─────────────────────────────────

console.log("\n=== Parte B: integridad del estado ===");
{
  const allProblems: string[] = [];
  for (let i = 0; i < 12; i++) {
    const r = playFullCareer(`integridad-${i}`);
    allProblems.push(...r.problems);
  }
  assert(allProblems.length === 0, `12 carreras completas sin estado invalido (${allProblems.slice(0, 3).join("; ")})`);

  const s = newCareer("ranking-coches");
  const ranking = currentCarRanking(s);
  const puestos = Object.values(ranking).sort((a, b) => a - b);
  assert(
    JSON.stringify(puestos) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    "el ranking de coches es una permutacion de 1..10 (sin empates ni huecos)",
  );
}

// ─── Parte C: ciclo de vida ─────────────────────────────────────────

console.log("\n=== Parte C: ciclo de vida ===");
{
  let ended = 0;
  let maxSeasonSeen = 0;
  for (let i = 0; i < 12; i++) {
    const r = playFullCareer(`ciclo-${i}`);
    if (r.state.phase === "retired") ended++;
    maxSeasonSeen = Math.max(maxSeasonSeen, r.state.totals.seasonsRaced);
    if (r.state.phase !== "retired") console.log(`     (carrera ${i} quedo en fase ${r.state.phase})`);
  }
  assert(ended === 12, "las 12 carreras terminan en fase 'retired'");
  assert(maxSeasonSeen <= MAX_SEASONS, `nunca se superan las ${MAX_SEASONS} temporadas (max visto: ${maxSeasonSeen})`);

  const r = playFullCareer("retiro-motivo");
  assert(r.state.retirementReason !== null, "toda carrera terminada tiene un motivo de retiro");

  // Retiro voluntario en cualquier momento.
  let s = newCareer("retiro-voluntario");
  s = acceptOffer(s, 0);
  s = advanceSeasons(s).state;
  const retirado = retire(s);
  assert(
    retirado.phase === "retired" && retirado.retirementReason === "voluntary",
    "el jugador puede retirarse voluntariamente cuando quiera",
  );

  // Rechazar todas las ofertas deja sin butaca (y sin butaca en la parrilla).
  let s2 = newCareer("rechazo");
  s2 = declineOffers(s2);
  const playerSeats = flattenGrid(s2.grid).filter((x) => x.occupant.kind === "player").length;
  assert(
    s2.phase === "no-seat" && s2.teamId === null && playerSeats === 0,
    "rechazar las ofertas deja al piloto sin butaca en la parrilla",
  );
}

// ─── Parte D: los modos avanzan lo que dicen ────────────────────────

console.log("\n=== Parte D: modos de juego (1/2/3 temporadas por paso) ===");
{
  for (const step of [1, 2, 3] as const) {
    let s = newCareer(`modo-${step}`, step);
    s = acceptOffer(s, 0);
    const { seasons } = advanceSeasons(s);
    assert(
      seasons.length >= 1 && seasons.length <= step,
      `modo de ${step}: avanza como mucho ${step} temporada(s) por paso (avanzo ${seasons.length})`,
    );
  }

  // Un anio sin butaca queda registrado en el historial como tal.
  let s = newCareer("sin-butaca");
  s = declineOffers(s);
  const { seasons } = advanceSeasons(s);
  assert(
    seasons.length > 0 && seasons[0]?.stats === null && seasons[0]?.teamId === null,
    "un anio sin asiento se registra en el historial sin estadisticas",
  );
}

// ─── Parte E: la edad pesa menos que el azar ────────────────────────

console.log("\n=== Parte E: curva de edad suave (pedido explicito) ===");
{
  assert(ageEffect(28) === 0, "en el pico (28 anios) la edad no penaliza");
  assert(ageEffect(19) < 0 && ageEffect(19) > -10, "de rookie penaliza, pero poco");
  assert(ageEffect(42) < 0 && ageEffect(42) > -10, "de veterano penaliza, pero poco");
  const peorEdad = Math.min(ageEffect(19), ageEffect(45));
  assert(
    Math.abs(peorEdad) < RACE_NOISE,
    `el peor efecto de la edad (${peorEdad.toFixed(1)}) pesa menos que el azar de una carrera (${RACE_NOISE})`,
  );
  assert(ageEffect(26) === 0 && ageEffect(32) === 0, "toda la franja de pico (26-32) rinde al maximo");
}

// ─── Parte F: balance ("dificil pero alcanzable") ───────────────────

console.log("\n=== Parte F: balance ===");
{
  const N = 40;
  let conTitulo = 0;
  let sinTitulo = 0;
  let totalWins = 0;
  for (let i = 0; i < N; i++) {
    const r = playFullCareer(`balance-${i}`);
    if (r.state.totals.championships > 0) conTitulo++;
    else sinTitulo++;
    totalWins += r.state.totals.wins;
  }
  const pct = Math.round((conTitulo / N) * 100);
  console.log(`     (${pct}% de las carreras lograron al menos un titulo)`);
  // Margen amplio a proposito: el test protege contra que el balance se
  // rompa del todo, no contra variaciones finas de tuneo.
  assert(pct >= 12 && pct <= 45, `el titulo es dificil pero alcanzable (${pct}%, esperado 12-45%)`);
  assert(sinTitulo > 0, "hay carreras que terminan sin ningun titulo");
  assert(conTitulo > 0, "hay carreras que terminan con al menos un titulo");
  assert(totalWins > 0, "se ganan carreras a lo largo de las partidas");
}

// ─── Parte G: catalogo de eventos ───────────────────────────────────

console.log("\n=== Parte G: catalogo de eventos ===");
{
  const ids = CAREER_EVENTS.map((e) => e.id);
  assert(ids.length === new Set(ids).size, `no hay ids de evento duplicados (${ids.length} eventos)`);
  assert(CAREER_EVENTS.length >= 60, `hay al menos 60 eventos (${CAREER_EVENTS.length})`);

  const cats = new Set(CAREER_EVENTS.map((e) => e.category));
  assert(cats.size === 12, `estan las 12 categorias acordadas (${cats.size})`);

  let structureOk = true;
  const structureIssues: string[] = [];
  for (const e of CAREER_EVENTS) {
    if (e.options.length < 2) { structureOk = false; structureIssues.push(`${e.id}: menos de 2 opciones`); }
    if (e.weight <= 0) { structureOk = false; structureIssues.push(`${e.id}: peso <= 0`); }
    const optIds = e.options.map((o) => o.id);
    if (optIds.length !== new Set(optIds).size) { structureOk = false; structureIssues.push(`${e.id}: opciones duplicadas`); }
    // Los ids de desenlace tienen que ser unicos DENTRO del evento: la UI
    // los busca en un unico diccionario plano por evento.
    const outIds = e.options.flatMap((o) => o.outcomes.map((x) => x.id));
    if (outIds.length !== new Set(outIds).size) { structureOk = false; structureIssues.push(`${e.id}: ids de desenlace repetidos`); }
    for (const o of e.options) {
      if (o.outcomes.length < 1) { structureOk = false; structureIssues.push(`${e.id}/${o.id}: sin desenlaces`); }
      if (o.outcomes.reduce((s, x) => s + x.weight, 0) <= 0) {
        structureOk = false;
        structureIssues.push(`${e.id}/${o.id}: los pesos suman 0`);
      }
    }
  }
  assert(structureOk, `todos los eventos estan bien formados (${structureIssues.slice(0, 3).join("; ")})`);

  // Ningun arco puede quedar colgado: si un evento EXIGE una marca, tiene
  // que existir otro evento capaz de activarla, o seria contenido muerto.
  const settable = new Set<string>();
  for (const e of CAREER_EVENTS) {
    for (const o of e.options) for (const oc of o.outcomes) {
      for (const f of oc.effect.setFlags ?? []) settable.add(f);
    }
  }
  const unreachable: string[] = [];
  for (const e of CAREER_EVENTS) {
    for (const f of e.condition?.requiresFlags ?? []) {
      if (!settable.has(f)) unreachable.push(`${e.id} exige "${f}"`);
    }
  }
  assert(unreachable.length === 0, `no hay eventos inalcanzables por marcas huerfanas (${unreachable.join("; ")})`);

  const arcs = [...settable].filter((f) => f.startsWith("arc:"));
  assert(arcs.length >= 4, `hay al menos 4 historias en varias partes (${arcs.length}: ${arcs.join(", ")})`);
}

// ─── Parte H: textos en los dos idiomas ─────────────────────────────

console.log("\n=== Parte H: contenido narrativo (es + en) ===");
{
  for (const [lang, content] of [["es", esContent], ["en", enContent]] as const) {
    const missing: string[] = [];
    for (const e of CAREER_EVENTS) {
      const t = content.events[e.id];
      if (!t) { missing.push(`evento ${e.id}`); continue; }
      if (!t.title?.trim()) missing.push(`${e.id}.title`);
      if (!t.story?.trim()) missing.push(`${e.id}.story`);
      for (const o of e.options) {
        if (!t.options[o.id]?.trim()) missing.push(`${e.id}.options.${o.id}`);
        for (const oc of o.outcomes) {
          if (!t.outcomes[oc.id]?.trim()) missing.push(`${e.id}.outcomes.${oc.id}`);
        }
      }
    }
    assert(missing.length === 0, `[${lang}] no falta ningun texto (${missing.slice(0, 3).join(", ")})`);

    const orphans: string[] = [];
    const validIds = new Set(CAREER_EVENTS.map((e) => e.id));
    for (const k of Object.keys(content.events)) if (!validIds.has(k)) orphans.push(k);
    for (const e of CAREER_EVENTS) {
      const t = content.events[e.id];
      if (!t) continue;
      const okOpts = new Set(e.options.map((o) => o.id));
      for (const k of Object.keys(t.options)) if (!okOpts.has(k)) orphans.push(`${e.id}.options.${k}`);
      const okOuts = new Set(e.options.flatMap((o) => o.outcomes.map((x) => x.id)));
      for (const k of Object.keys(t.outcomes)) if (!okOuts.has(k)) orphans.push(`${e.id}.outcomes.${k}`);
    }
    assert(orphans.length === 0, `[${lang}] no sobra ningun texto huerfano (${orphans.slice(0, 3).join(", ")})`);
  }

  // Los dos idiomas tienen que cubrir exactamente el mismo set de eventos.
  const esKeys = Object.keys(esContent.events).sort();
  const enKeys = Object.keys(enContent.events).sort();
  assert(JSON.stringify(esKeys) === JSON.stringify(enKeys), "es y en cubren exactamente los mismos eventos");
}

// ─── Parte I: seleccion y resolucion de eventos ─────────────────────

console.log("\n=== Parte I: motor de eventos ===");
{
  let s = newCareer("eventos", 3);
  s = acceptOffer(s, 0);

  // Condiciones: un evento que exige butaca no puede salir sin butaca.
  const seatOnly = CAREER_EVENTS.find((e) => e.condition?.requiresSeat === true);
  if (seatOnly) {
    assert(meetsCondition(s, seatOnly.condition), "con butaca, un evento que la exige es elegible");
    const noSeat = { ...s, teamId: null };
    assert(!meetsCondition(noSeat, seatOnly.condition), "sin butaca, ese mismo evento deja de ser elegible");
  }

  // Un evento de arco no aparece hasta que la marca existe Y pasaron
  // suficientes temporadas.
  const arcStep2 = CAREER_EVENTS.find(
    (e) => (e.condition?.requiresFlags?.length ?? 0) > 0 && (e.condition?.minSeasonsSinceFlag ?? 0) > 0,
  );
  if (arcStep2) {
    const cond = arcStep2.condition!;
    const need = cond.minSeasonsSinceFlag as number;
    const FLAG_SEASON = 8;

    /**
     * Construye un estado que cumple TODAS las condiciones del evento salvo
     * el paso del tiempo, que es lo que queremos aislar. Generico a
     * proposito: si maniana un evento de arco suma otra condicion, el test
     * la contempla sola en vez de fallar por un motivo equivocado.
     */
    const satisfying = (season: number): CareerState => ({
      ...s,
      season,
      teamId: cond.requiresSeat === false ? null : s.teamId,
      flags: Object.fromEntries((cond.requiresFlags ?? []).map((f) => [f, FLAG_SEASON])),
      player: {
        ...s.player,
        age: Math.min(cond.maxAge ?? 99, Math.max(cond.minAge ?? s.player.age, s.player.age)),
        reputation: Math.min(cond.maxReputation ?? 100, Math.max(cond.minReputation ?? 60, 60)),
        morale: Math.min(cond.maxMorale ?? 100, Math.max(cond.minMorale ?? 60, 60)),
      },
    });

    assert(!meetsCondition(s, cond), `"${arcStep2.id}" no aparece sin su marca`);
    assert(
      !meetsCondition(satisfying(FLAG_SEASON), cond),
      "tampoco aparece el mismo anio en que se activo la marca",
    );
    assert(
      meetsCondition(satisfying(FLAG_SEASON + need), cond),
      `aparece recien ${need} temporada(s) despues (${arcStep2.id})`,
    );
  }

  // pickEvents: cantidad dentro del rango y sin repetidos en la misma tanda.
  const rng = new Rng("pick");
  for (let i = 0; i < 30; i++) {
    const picked = pickEvents(s, rng);
    if (picked.length < 1 || picked.length > MAX_EVENTS_PER_CHUNK) {
      assert(false, `pickEvents devolvio ${picked.length} eventos`);
      break;
    }
    if (picked.length !== new Set(picked).size) {
      assert(false, "pickEvents repitio un evento en la misma tanda");
      break;
    }
  }
  assert(true, `pickEvents siempre devuelve entre 1 y ${MAX_EVENTS_PER_CHUNK} eventos, sin repetir en la tanda`);

  // Resolver un evento aplica efectos, marca el evento como visto y avanza.
  let withEvents = newCareer("resolver", 1);
  withEvents = acceptOffer(withEvents, 0);
  let guard = 0;
  while (withEvents.phase !== "events" && withEvents.phase !== "retired" && guard++ < 40) {
    if (withEvents.phase === "ready") withEvents = advanceSeasons(withEvents).state;
    else if (withEvents.phase === "offers") withEvents = acceptOffer(withEvents, 0);
    else break;
  }
  assert(withEvents.phase === "events", "tras simular aparecen eventos para resolver");

  if (withEvents.phase === "events") {
    const eventId = withEvents.pendingEvents[0] as string;
    const ev = getEvent(eventId)!;
    const before = withEvents.pendingEvents.length;
    const res = resolveEvent(withEvents, ev.options[0]!.id);
    assert(res.eventId === eventId, "resolveEvent informa que evento se resolvio");
    assert(res.outcomeId !== null, "resolveEvent informa el desenlace sorteado");
    assert(res.state.pendingEvents.length === before - 1, "la cola de eventos avanza de a uno");
    assert(`seen::${eventId}` in res.state.flags, "el evento queda marcado como visto");

    // Una opcion inexistente no debe romper ni consumir la cola.
    const bogus = resolveEvent(withEvents, "opcion-que-no-existe");
    assert(
      bogus.state.pendingEvents.length === before && bogus.eventId === null,
      "una opcion invalida no altera el estado",
    );
  }

  // Determinismo con eventos: dos partidas iguales siguen siendo iguales.
  const a = playFullCareer("determinismo-con-eventos");
  const b = playFullCareer("determinismo-con-eventos");
  assert(
    JSON.stringify(a.state) === JSON.stringify(b.state),
    "con eventos incluidos, la partida sigue siendo reproducible",
  );
}

// ─── Resultado ───────────────────────────────────────────────────────

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
if (failed > 0) process.exit(1);
