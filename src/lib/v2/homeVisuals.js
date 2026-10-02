import {createPeloton} from './telemetry.js';
import {CIRCUITS} from './circuits.js';
export function initializeHomeVisuals(root, isPaused) {
const controller = new AbortController();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let observer; let stopPeloton = () => {};
const helmetMarkup = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13a9 9 0 0 1 18 0v1a2 2 0 0 1-2 2h-5l-1 3H7a4 4 0 0 1-4-4z" fill="var(--helmet)" opacity=".95"/><path d="M8 13h11" stroke="rgba(0,0,0,.5)" stroke-width="1.4" stroke-linecap="round"/><path d="M3 13a9 9 0 0 1 18 0v1a2 2 0 0 1-2 2h-5l-1 3H7a4 4 0 0 1-4-4z" fill="none" stroke="rgba(255,255,255,.4)" stroke-width=".8"/></svg>';
const radioWave = document.createElement('div');
radioWave.className = 'radio-wave';
radioWave.setAttribute('aria-hidden', 'true');
// Unequal upper/lower amplitudes and irregular phrase bursts, rather than a mirrored envelope.
const waveUpper = [3, 6, 4, 13, 22, 17, 8, 4, 10, 19, 25, 12, 7, 3, 5, 9, 17, 23, 14, 8, 20, 11, 5, 3, 12, 18, 8, 4, 7, 2, 5];
const waveLower = [5, 3, 9, 18, 12, 24, 15, 6, 4, 12, 17, 22, 11, 5, 3, 15, 9, 18, 25, 13, 7, 19, 12, 5, 4, 11, 16, 9, 3, 6, 2];
waveUpper.forEach((height, index) => {
  const bar = document.createElement('i');
  bar.style.setProperty('--upper', `${height}px`);
  bar.style.setProperty('--lower', `${waveLower[index]}px`);
  bar.style.setProperty('--delay', `${((index * 13) % 19) * -.13}s`);
  bar.style.setProperty('--duration', `${1.7 + (index * 7 % 11) * .11}s`);
  bar.append(document.createElement('b'), document.createElement('em'));
  radioWave.append(bar);
});
root.querySelector('.radio').append(radioWave);

function applyPreviewScene(scene) {
  root.dataset.previewScene = String(scene.id);
  root.querySelector('.radio-preview p').textContent = scene.radio.quote;
  root.querySelector('.radio-byline').textContent = `${scene.radio.driver.toUpperCase()} · ¿EN QUÉ GP?`;
  root.querySelectorAll('.radio-choices i').forEach((choice, index) => {
    choice.textContent = scene.radio.options[index];
    choice.classList.toggle('is-selected', index === scene.radio.selected - 1);
  });

  const grid = root.querySelector('.letter-grid');
  grid.style.setProperty('--cols', String(scene.wordle.answer.length));
  const tiles = [];
  for (const [row, word] of [scene.wordle.guess, scene.wordle.answer, ' '.repeat(scene.wordle.answer.length)].entries()) {
    [...word].forEach((letter, index) => {
      const tile = document.createElement('i');
      tile.textContent = letter;
      if (row === 1 || (row === 0 && scene.wordle.states[index] === 'correct')) tile.className = 'hit';
      else if (row === 0 && scene.wordle.states[index] === 'present') tile.className = 'near';
      tiles.push(tile);
    });
  }
  grid.replaceChildren(...tiles);

  const heat = root.querySelector('.pit-heat');
  heat.replaceChildren(document.createTextNode(String(scene.pit.percent)), Object.assign(document.createElement('small'), { textContent: '%' }));
  root.querySelector('.pit-caption').textContent = `Intento ${String(scene.pit.attempt).padStart(2, '0')} de 08`;
  const identity = root.querySelector('.pit-identity strong');
  const flag = document.createElement('img');
  flag.src = `/v2/assets/flags/${scene.pit.flag}.svg`;
  flag.alt = '';
  identity.replaceChildren(flag, document.createTextNode(` ${scene.pit.guess}`));
  heat.style.setProperty('--heat-color', scene.pit.heatColor);
  const chips = scene.pit.chips.map(factor => {
    const chip = document.createElement('i');
    chip.className = `pit-chip is-${factor.state}`;
    chip.dataset.factor = factor.key;
    const label = Object.assign(document.createElement('span'), { textContent: factor.label });
    const value = Object.assign(document.createElement('strong'), { textContent: factor.value });
    if (factor.dir && factor.dir !== 'eq') {
      const arrow = Object.assign(document.createElement('em'), { textContent: factor.dir === 'up' ? '▲' : '▼' });
      value.append(arrow);
    }
    if (factor.key === 'mates') {
      const mark = Object.assign(document.createElement('em'), { textContent: factor.state === 'match' ? '✓' : '×' });
      value.append(mark);
    }
    chip.append(label, value);
    return chip;
  });
  root.querySelector('.pit-factors').replaceChildren(...chips);

  const helmets = scene.intruso.map(driver => {
    const tile = document.createElement('span');
    tile.style.setProperty('--helmet', driver.color);
    tile.innerHTML = helmetMarkup;
    const label = document.createElement('b');
    label.textContent = driver.abbr;
    const flag = document.createElement('img');
    flag.src = `/v2/assets/flags/${driver.flag}.svg`;
    flag.alt = '';
    tile.append(label, flag);
    return tile;
  });
  root.querySelector('.intruder-preview').replaceChildren(...helmets);
  root.querySelectorAll('.bingo-row').forEach((row, index) => { row.textContent = scene.bingo[index]; });
  root.querySelector('.result-preview>span').textContent = `${scene.gp.circuit} · ${scene.gp.year} · Top 10`;
  root.querySelectorAll('.result-preview i')[0].lastChild.textContent = ` ${scene.gp.first}`;
  root.querySelectorAll('.result-preview i')[3].lastChild.textContent = ` ${scene.gp.fourth}`;
  const resultArt = root.querySelector('.result');
  resultArt.style.setProperty('--team-accent', scene.gp.colors[0]);
  root.querySelectorAll('.result-preview i')[0].style.setProperty('--row-accent', scene.gp.colors[0]);
  root.querySelectorAll('.result-preview i')[3].style.setProperty('--row-accent', scene.gp.colors[1]);
  root.querySelector('.standings-preview>span').textContent = `Campeonato · ${scene.standings.years}`;
  root.querySelector('.standings').style.setProperty('--team-accent', scene.standings.colors[0]);
  root.querySelectorAll('.standings-preview i').forEach((column, index) => {
    column.style.setProperty('--bar-width', `${100 - index * 16}%`);
    column.style.setProperty('--column-color', scene.standings.colors[index]);
    column.classList.toggle('is-unrevealed', index === 1);
    column.querySelector('em').textContent = index === 1 ? '¿Qué piloto?' : scene.standings.entries[index].name;
    column.querySelector('small').textContent = `${scene.standings.entries[index].points} pts`;
  });

  const chain = [];
  scene.career.teams.forEach((team, index) => {
    if (index) chain.push(Object.assign(document.createElement('span'), { textContent: '→' }));
    const logo = document.createElement('img');
    logo.src = `/team-logos/${team}.png`;
    logo.alt = '';
    chain.push(logo);
  });
  const career = root.querySelector('.career-path');
  career.replaceChildren(...chain);
  career.title = `Escuderías de ${scene.career.driver}`;
  career.style.setProperty('--team-count', String(scene.career.teams.length));
}

function dailyPilots(pool) {
  const today = new Date();
  const day = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 2166136261;
  for (const letter of day) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619);
  const chosen = [...pool];
  for (let i = chosen.length - 1; i > 0; i--) {
    hash = Math.imul(hash ^ i, 16777619);
    const j = (hash >>> 0) % (i + 1);
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  return chosen.slice(0, 3);
}

async function initializeVisuals() {
  const response = await fetch('/v2/assets/preview-scenes.json?v=4', { signal: controller.signal });
  if (!response.ok) throw new Error('No se pudieron cargar las escenas');
  const { scenes, markerPilots, dailyMarkers } = await response.json();
  let previous = 0; try { previous = Number(sessionStorage.getItem('preview-scene')); } catch { /* Optional variation memory. */ }
  const available = scenes.filter(scene => scene.id !== previous);
  const scene = available[Math.floor(Math.random() * available.length)];
  try { sessionStorage.setItem('preview-scene', String(scene.id)); } catch { /* Optional variation memory. */ }
  applyPreviewScene(scene);
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const daily = dailyMarkers?.[key] ?? dailyPilots(markerPilots);
  const extras = markerPilots.filter(pilot => !daily.some(item => item.id === pilot.id));
  for (let i = extras.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [extras[i], extras[j]] = [extras[j], extras[i]];
  }
  const count = 7 + Math.floor(Math.random() * 6);
  const pilots = [...daily, ...extras.slice(0, count - daily.length)];
  root.dataset.dailyPilots = daily.map(pilot => pilot.code).join(',');
  root.dataset.pelotonCount = String(pilots.length);
  const requestedCircuit = new URLSearchParams(location.search).get('circuit');
  const circuits = Object.keys(CIRCUITS);
  const circuit = circuits.includes(requestedCircuit) ? requestedCircuit : circuits[Math.floor(Math.random() * circuits.length)];
  if (!controller.signal.aborted) await mountCircuit(circuit, pilots);
}
root.querySelectorAll('.game').forEach(card => {
  const artwork = card.querySelector('.art');
  card.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const rect = artwork.getBoundingClientRect();
    artwork.style.setProperty('--px', `${event.clientX - rect.left}px`);
    artwork.style.setProperty('--py', `${event.clientY - rect.top}px`);
  }, { signal: controller.signal });
});

if (!reducedMotion.matches) {
  observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.animate([
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 580, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'none' });
    observer.unobserve(entry.target);
  }), { threshold: .1 });
  root.querySelectorAll('.game,.closing').forEach(element => observer.observe(element));
}

// Los SVG conservan los trazados originales. La elección por GP queda para una futura versión.
async function mountCircuit(circuit, pilots) {
  const response = await fetch(`/v2/assets/${circuit}.svg`, { signal: controller.signal });
  if (!response.ok) return;
  const source = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  if (controller.signal.aborted) return;
  const original = source.querySelector('path');
  if (!original) return;
  const ns = 'http://www.w3.org/2000/svg';
  const create = (name, attrs = {}) => {
    const element = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };
  const viewBox = source.documentElement.getAttribute('viewBox') || '0 0 1423 1047';
  const width = Number(viewBox.split(/\s+/)[2]);
  const scale = width / 1423;
  const svg = create('svg', { viewBox, role: 'group', 'aria-label': 'Pilotos en pista' });
  const layer = create('g', original.hasAttribute('transform') ? { transform: original.getAttribute('transform') } : {});
  svg.append(layer);
  const d = original.getAttribute('d');
  layer.append(create('path', { d, fill: 'none', stroke: '#3b3438', 'stroke-width': String(33 * scale), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  const path = create('path', { d, fill: 'none', stroke: '#f2eeef', 'stroke-width': String(11 * scale), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  layer.append(path);
  root.querySelector('#circuit-stage').replaceChildren(svg);
  root.dataset.circuit = circuit;
  const peloton = createPeloton({ hero: root.querySelector('.hero'), root, signal: controller.signal, circuit, pilots, layer, path, scale, create, reducedMotion, isPaused: () => isPaused() || document.hidden });
  stopPeloton = () => peloton.stop();
  if (!controller.signal.aborted) peloton.start();
}
initializeVisuals().catch(error => {if (error.name !== 'AbortError') root.dataset.visualState = 'unavailable';});


return () => {controller.abort(); observer?.disconnect(); stopPeloton(); root.getAnimations({subtree:true}).forEach(a=>a.cancel());};
}
