import { CIRCUITS } from './circuits.js';

const DEFAULT_SECTOR_ENDS = [.326, .654, 1];
const SAFETY_YELLOW = '#FBD442';
const COOLDOWN_LAP_FACTOR = 1.38;
const wrap = value => ((value % 1) + 1) % 1;
const formatLap = ms => {
  const tenths = Math.floor(ms / 100);
  return `${Math.floor(tenths / 600)}:${String(Math.floor(tenths / 10) % 60).padStart(2, '0')}.${tenths % 10}`;
};
const formatSector = ms => (ms / 1000).toFixed(1);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function choosePanelPosition(marker, panel, bounds) {
  const gap = 13;
  const cx = marker.x + marker.width / 2;
  const cy = marker.y + marker.height / 2;
  const candidates = [
    { x: marker.x + marker.width + gap, y: cy - panel.height / 2 },
    { x: marker.x - panel.width - gap, y: cy - panel.height / 2 },
    { x: cx - panel.width / 2, y: marker.y - panel.height - gap },
    { x: cx - panel.width / 2, y: marker.y + marker.height + gap },
  ];
  return candidates.map((candidate, index) => {
    const x = clamp(candidate.x, 8, Math.max(8, bounds.width - panel.width - 8));
    const y = clamp(candidate.y, 8, Math.max(8, bounds.height - panel.height - 8));
    const overlapX = Math.max(0, Math.min(x + panel.width, marker.x + marker.width + 5) - Math.max(x, marker.x - 5));
    const overlapY = Math.max(0, Math.min(y + panel.height, marker.y + marker.height + 5) - Math.max(y, marker.y - 5));
    const displacement = Math.abs(x - candidate.x) + Math.abs(y - candidate.y);
    return { x, y, score: overlapX * overlapY * 100 + displacement * 3 + index * 4 };
  }).sort((a, b) => a.score - b.score)[0];
}

function closestLength(path, target) {
  const length = path.getTotalLength();
  let best = { distance: Infinity, at: 0 };
  for (let step = 0; step <= 1000; step++) {
    const at = length * step / 1000;
    const point = path.getPointAtLength(at);
    const distance = (point.x - target.x) ** 2 + (point.y - target.y) ** 2;
    if (distance < best.distance) best = { distance, at };
  }
  return best.at;
}

export function createPeloton({ hero, root, signal, circuit, pilots, layer, path, scale, create, reducedMotion, isPaused }) {
  let raf = 0;
  const panel = document.createElement('div');
  panel.className = 'driver-telemetry';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Tiempos del piloto');
  panel.innerHTML = `<div class="telemetry-head"><span class="telemetry-position"></span><strong class="telemetry-code"></strong><span class="telemetry-live">EN PISTA</span></div><div class="telemetry-person"><strong class="telemetry-name"></strong><span class="telemetry-team"></span></div><div class="telemetry-main"><strong class="telemetry-lap">0:00.0</strong><span class="telemetry-status">VUELTA EN CURSO</span></div><div class="telemetry-sectors"><span><b>S1</b><strong>—</strong></span><span><b>S2</b><strong>—</strong></span><span><b>S3</b><strong>—</strong></span></div>`;
  hero.append(panel);
  const slots = {
    number: panel.querySelector('.telemetry-position'),
    code: panel.querySelector('.telemetry-code'),
    name: panel.querySelector('.telemetry-name'),
    team: panel.querySelector('.telemetry-team'),
    lap: panel.querySelector('.telemetry-lap'),
    live: panel.querySelector('.telemetry-live'),
    status: panel.querySelector('.telemetry-status'),
    sectors: [...panel.querySelectorAll('.telemetry-sectors span')],
  };
  const length = path.getTotalLength();
  const configuration = CIRCUITS[circuit];
  // Space the queue by marker size, so it stays compact on every circuit.
  const safetyGap = 84 * scale / length;
  const finishAt = closestLength(path, configuration.finish);
  const finishFraction = finishAt / length;
  const finishPoint = path.getPointAtLength(finishAt);
  const before = path.getPointAtLength(wrap(finishFraction - .001) * length);
  const after = path.getPointAtLength(wrap(finishFraction + .001) * length);
  const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
  const finish = create('g', { class: 'track-finish', transform: `translate(${finishPoint.x} ${finishPoint.y}) rotate(${angle})`, 'aria-hidden': 'true' });
  for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) {
    finish.append(create('rect', {
      x: String((-7 + col * 7) * scale), y: String((-14 + row * 7) * scale),
      width: String(7 * scale), height: String(7 * scale),
      fill: (row + col) % 2 ? '#171519' : '#fff',
    }));
  }
  layer.append(finish);
  const safetyMarker = create('g', { class: 'safety-car', 'aria-label': 'Safety car en pista', 'aria-hidden': 'true', hidden: 'true' });
  safetyMarker.append(create('circle', { r: String(35 * scale), fill: SAFETY_YELLOW, stroke: '#211a09', 'stroke-width': String(6 * scale) }));
  const safetyText = create('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#15120b', 'font-size': String(24 * scale), 'font-weight': '900', 'font-family': 'Arial, sans-serif' });
  safetyText.textContent = 'SC';
  safetyMarker.append(safetyText);
  layer.append(safetyMarker);
  const safetyStatus = document.createElement('div');
  safetyStatus.className = 'safety-status';
  safetyStatus.innerHTML = '<i aria-hidden="true"></i>SAFETY CAR';
  safetyStatus.hidden = true;
  hero.append(safetyStatus);

  const baseLap = configuration.baseLapMs;
  let elapsed = 0;
  let lastFrame = performance.now();
  let lastPanelUpdate = 0;
  let hovered = null;
  let pinned = null;
  let lineColor = pilots[Math.floor(Math.random() * pilots.length)].color;
  hero.style.setProperty('--hero-line-color', lineColor);
  const safetyParam = new URLSearchParams(location.search).get('safety');
  const safety = {
    active: safetyParam === '1' || (safetyParam !== '0' && Math.random() < .15),
    anchor: .55 + Math.random() * .3,
    order: [],
  };
  const spatialSectorEnds = configuration.sectorTargets
    ? [...configuration.sectorTargets.map(target => wrap(closestLength(path, target) / length - finishFraction)), 1]
    : DEFAULT_SECTOR_ENDS;
  const sectorEnds = safety.active ? spatialSectorEnds : configuration.sectorTimeEnds || spatialSectorEnds;
  function trackProgress(progress) {
    if (safety.active || !configuration.sectorTimeEnds) return progress;
    // Match unequal Monaco sector durations to their actual positions on the map.
    const index = sectorEnds.findIndex(end => progress <= end);
    const timeStart = index ? sectorEnds[index - 1] : 0;
    const spatialStart = index ? spatialSectorEnds[index - 1] : 0;
    return spatialStart + (progress - timeStart) / (sectorEnds[index] - timeStart) * (spatialSectorEnds[index] - spatialStart);
  }
  const bestSectors = [Infinity, Infinity, Infinity];
  const markers = pilots.map((pilot, index) => {
    const group = create('g', {
      class: 'track-driver', role: 'button', tabindex: '0',
      'aria-label': `Ver tiempos de ${pilot.name}, dorsal ${pilot.number}, ${pilot.team}`,
      'data-pilot': pilot.id, 'data-number': String(pilot.number),
    });
    group.append(create('circle', { r: String(37 * scale), fill: pilot.color, stroke: '#131013', 'stroke-width': String(7 * scale) }));
    const code = create('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#fff', 'font-size': String(25 * scale), 'font-weight': '800', 'font-family': 'Arial, sans-serif' });
    code.textContent = pilot.code;
    group.append(code);
    layer.append(group);
    const lapBase = baseLap + (pilot.rank - 1) * 300 + Math.sin(index * 6.8) * 260;
    const lapIndex = index % 2;
    const lapMs = lapBase * (lapIndex ? COOLDOWN_LAP_FACTOR : 1);
    const offset = wrap(index / pilots.length + .016 * Math.sin(index * 3.1));
    const item = {
      pilot, group, distance: offset, lapBase, lapMs,
      lapClockMs: offset * lapMs, sectorStartMs: lapMs * (offset < sectorEnds[0] ? 0 : offset < sectorEnds[1] ? sectorEnds[0] : sectorEnds[1]),
      sectorTimes: [offset >= sectorEnds[0] ? lapMs * sectorEnds[0] : null, offset >= sectorEnds[1] ? lapMs * (sectorEnds[1] - sectorEnds[0]) : null, null], purpleSectors: [false, false, false],
      lastSectorTimes: [null, null, null], lastPurpleSectors: [false, false, false],
      previousLapMs: 0, lastLapMode: null, holdUntil: 0, lapIndex,
    };
    group.dataset.lapMode = lapIndex ? 'cooldown' : 'fast';
    group.addEventListener('pointerenter', () => { hovered = item; updateSelection(); });
    group.addEventListener('pointerleave', () => { if (hovered === item) hovered = null; updateSelection(); });
    group.addEventListener('focus', () => { hovered = item; updateSelection(); });
    group.addEventListener('blur', () => { if (hovered === item) hovered = null; updateSelection(); });
    group.addEventListener('click', event => { event.stopPropagation(); pinned = item; hovered = item; lineColor = pilot.color; if (!safety.active) hero.style.setProperty('--hero-line-color', lineColor); updateSelection(); });
    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); group.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
    return item;
  });
  if (safety.active) startSafety();
  const active = () => pinned || hovered;
  function updateSelection() {
    markers.forEach(item => item.group.classList.toggle('is-selected', item === pinned));
    const item = active();
    panel.hidden = !item;
    if (!item) return;
    panel.style.setProperty('--team-color', item.pilot.color);
    slots.number.textContent = String(item.pilot.number);
    slots.code.textContent = item.pilot.code;
    slots.name.textContent = item.pilot.name;
    slots.team.textContent = item.pilot.team;
    updatePanel(performance.now());
  }
  function updatePanel(now) {
    const item = active();
    if (!item) return;
    const completed = elapsed < item.holdUntil;
    const lapMs = completed ? item.previousLapMs : item.lapClockMs;
    const times = completed ? item.lastSectorTimes : item.sectorTimes;
    const purples = completed ? item.lastPurpleSectors : item.purpleSectors;
    const position = wrap(item.distance);
    const mode = safety.active ? 'safety' : item.lapIndex % 2 ? 'cooldown' : 'fast';
    panel.dataset.lapMode = mode;
    panel.dataset.displayMode = completed ? item.lastLapMode : mode;
    slots.live.textContent = mode === 'safety' ? 'SAFETY CAR' : mode === 'cooldown' ? 'ENFRIAMIENTO' : 'VUELTA RÁPIDA';
    slots.lap.textContent = formatLap(lapMs);
    slots.status.textContent = safety.active ? 'SAFETY CAR' : completed ? 'ÚLTIMA VUELTA' : mode === 'cooldown' ? 'VUELTA LENTA' : 'VUELTA RÁPIDA';
    slots.sectors.forEach((sector, index) => {
      const start = index ? sectorEnds[index - 1] : 0;
      const end = sectorEnds[index];
      const pendingTime = !completed && position >= start && position < end ? item.lapClockMs - item.sectorStartMs : null;
      sector.querySelector('strong').textContent = times[index] !== null ? formatSector(times[index]) : pendingTime !== null ? formatSector(pendingTime) : '—';
      sector.classList.toggle('is-complete', times[index] !== null);
      sector.classList.toggle('is-current', pendingTime !== null);
      sector.classList.toggle('is-purple', purples[index] && times[index] !== null);
    });
    const markerRect = item.group.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const marker = { x: markerRect.left - heroRect.left, y: markerRect.top - heroRect.top, width: markerRect.width, height: markerRect.height };
    const positionPanel = choosePanelPosition(marker, { width: panel.offsetWidth, height: panel.offsetHeight }, { width: heroRect.width, height: heroRect.height });
    panel.style.left = `${positionPanel.x}px`;
    panel.style.top = `${positionPanel.y}px`;
    panel.dataset.state = completed ? 'completed' : 'current';
    lastPanelUpdate = now;
  }
  function recordSector(item, index) {
    const time = item.lapClockMs - item.sectorStartMs;
    item.sectorTimes[index] = time;
    item.sectorStartMs = item.lapClockMs;
    if (!safety.active && item.lapIndex % 2 === 0 && time < bestSectors[index] - 50) {
      bestSectors[index] = time;
      markers.forEach(other => { other.purpleSectors[index] = false; other.lastPurpleSectors[index] = false; });
      item.purpleSectors[index] = true;
    }
  }
  function advanceItem(item, nextDistance, dt) {
    const oldFraction = wrap(item.distance);
    const newFraction = wrap(nextDistance);
    const crossedLine = Math.floor(nextDistance) > Math.floor(item.distance);
    item.distance = nextDistance;
    item.lapClockMs += dt;
    sectorEnds.slice(0, 2).forEach((end, index) => {
      if (!crossedLine && oldFraction < end && newFraction >= end) recordSector(item, index);
    });
    if (crossedLine) {
      recordSector(item, 2);
      item.previousLapMs = item.lapClockMs;
      item.lastLapMode = safety.active ? 'safety' : item.lapIndex % 2 ? 'cooldown' : 'fast';
      item.lastSectorTimes = [...item.sectorTimes];
      item.lastPurpleSectors = [...item.purpleSectors];
      item.holdUntil = elapsed + 5000;
      item.lapIndex++;
      // Slight track evolution leaves room for occasional genuine sector bests.
      const trackGain = Math.min(1200, elapsed / 60000 * 160);
      const fastLap = item.lapBase - trackGain + Math.sin(item.lapIndex * 2.7 + item.lapBase) * 340;
      item.lapMs = fastLap * (item.lapIndex % 2 ? COOLDOWN_LAP_FACTOR : 1);
      item.group.dataset.lapMode = item.lapIndex % 2 ? 'cooldown' : 'fast';
      item.lapClockMs = newFraction * (safety.active ? baseLap * 1.75 : item.lapMs);
      item.sectorStartMs = 0;
      item.sectorTimes = [null, null, null];
      item.purpleSectors = [false, false, false];
    }
  }
  function startSafety() {
    // Establish one fixed order at load; every marker then shares the SC's speed.
    safety.order = [...markers].sort((a, b) => b.distance - a.distance);
    safety.order.forEach((item, index) => {
      item.distance = safety.anchor - (index + 1) * safetyGap;
      alignLapClockToQueue(item);
    });
    safetyMarker.removeAttribute('hidden');
    safetyMarker.setAttribute('aria-hidden', 'false');
    safetyStatus.hidden = false;
    hero.style.setProperty('--hero-line-color', SAFETY_YELLOW);
    hero.dataset.safety = 'true';
  }
  function alignLapClockToQueue(item) {
    const progress = wrap(item.distance);
    const slowLap = baseLap * 1.75;
    item.lapClockMs = progress * slowLap;
    item.sectorStartMs = slowLap * (progress < sectorEnds[0] ? 0 : progress < sectorEnds[1] ? sectorEnds[0] : sectorEnds[1]);
    item.sectorTimes = [progress >= sectorEnds[0] ? slowLap * sectorEnds[0] : null, progress >= sectorEnds[1] ? slowLap * (sectorEnds[1] - sectorEnds[0]) : null, null];
    item.purpleSectors = [false, false, false];
    item.holdUntil = 0;
  }
  function frame(now) {
    const dt = isPaused() ? 0 : Math.min(Math.max(now - lastFrame, 0), 100);
    lastFrame = now;
    elapsed += dt;
    if (safety.active) {
      safety.anchor += dt / (baseLap * 1.75);
      safety.order.forEach((item, index) => {
        advanceItem(item, safety.anchor - (index + 1) * safetyGap, dt);
      });
      const scPoint = path.getPointAtLength(wrap(finishFraction + safety.anchor) * length);
      safetyMarker.setAttribute('transform', `translate(${scPoint.x} ${scPoint.y})`);
    } else {
      markers.forEach(item => advanceItem(item, item.distance + dt / item.lapMs, dt));
    }
    markers.forEach(item => {
      const point = path.getPointAtLength(wrap(finishFraction + trackProgress(wrap(item.distance))) * length);
      item.group.setAttribute('transform', `translate(${point.x} ${point.y})`);
    });
    if (active() && now - lastPanelUpdate > 60) updatePanel(now);
    if (!reducedMotion.matches) raf = requestAnimationFrame(frame);
  }
  document.addEventListener('click', event => {
    if (!event.target.closest('.track-driver')) { pinned = null; hovered = null; updateSelection(); }
  }, {signal});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { pinned = null; hovered = null; updateSelection(); }
  }, {signal});
  return {start: () => {raf = requestAnimationFrame(frame);}, stop: () => {cancelAnimationFrame(raf); panel.remove(); safetyStatus.remove();}};
}
