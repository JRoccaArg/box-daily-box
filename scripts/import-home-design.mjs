// Reproduce the approved study. Run with the path to its boceto directory.
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';

const source = resolve(process.argv[2]);
const html = readFileSync(resolve(source, 'index.html'), 'utf8');
const read = file => readFileSync(resolve(source, file), 'utf8');
const write = (file, content) => writeFileSync(file, content);
mkdirSync('public/v2', {recursive: true});
cpSync(resolve(source, 'assets'), 'public/v2/assets', {recursive: true});
const cssFiles = ['refined.css','ad-layout.css','aesthetic.css','interaction.css','polish.css','iteration.css','iteration-2.css','iteration-3.css','iteration-4.css','iteration-5.css','thumbnail-polish.css','home-position.css'];
const css = postcss.parse(html.match(/<style>([\s\S]*?)<\/style>/)[1] + '\n' + cssFiles.map(read).join('\n'));
const names = new Set();
css.walkAtRules('font-face', at => at.remove());
css.walkAtRules(/keyframes$/, at => {names.add(at.params); at.params = 'home-' + at.params;});
css.walkRules(rule => {
  if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
  rule.selectors = rule.selectors.map(selector => {
    const s = selector.trim();
    if (s === ':root' || s === 'body' || s === 'html') return '.bdb-home';
    if (/^(html|body)[\s>.:#[]/.test(s)) return '.bdb-home' + s.replace(/^(html|body)/,'');
    return '.bdb-home ' + s;
  });
});
css.walkDecls(/^(font|font-family)$/, d => {d.value = d.value.replace(/(['"])Saira\1/g, '$1BDB V2 Saira$1');});
const re = new RegExp('\\b(' + [...names].join('|') + ')\\b','g');
css.walkDecls(/^animation(-name)?$/, d => {d.value = d.value.replace(re, 'home-$1');});
css.walkDecls(d => {d.value = d.value.replace(/\.\/assets\//g,'/v2/assets/');});
write('src/styles/v2/home.css', '/* Generated from the approved home study. */\n' + css.toString());
// Legal/cookies use the account palette and have their own scope.
const extra = postcss.parse(read('legal-previews.css') + '\n' + read('cookie-preview.css') + '\n' + read('extended-previews.css'));
extra.walkRules(rule => {
  if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
  rule.selectors = rule.selectors.map(s => /^(html|body)(?=[\s.:#[]|$)/.test(s.trim()) ? '.bdb-v2' + s.trim().replace(/^(html|body)/,'') : '.bdb-v2 ' + s);
});
extra.walkAtRules(/keyframes$/, at => {at.params = 'extra-' + at.params;});
extra.walkDecls(/^animation(-name)?$/, d => {d.value = d.value.replace(/\b(cookie-arrive|preview-shimmer)\b/g,'extra-$1');});
write('src/styles/v2/extras.css', extra.toString());
const arts = [...html.matchAll(/<article class="game[^\"]*"><a[^>]*>([\s\S]*?)<div class="game-meta">/g)].map(m => m[1]);
const descriptions = [...html.matchAll(/<div class="game-meta"><div><h3>[^<]+<\/h3><p>([^<]+)<\/p>/g)].map(m=>m[1]);
const ids = ['team-radio','polewordle','pittexto','el-intruso','parrilla-bingo','gp-resultado','top10-standings','career-path'];
write('src/lib/v2/homeArtwork.ts', '// Trusted, static artwork from the approved study; never contains API/user HTML.\nexport const HOME_ARTWORK: Record<string, string> = ' + JSON.stringify(Object.fromEntries(ids.map((id,i)=>[id, arts[i]])),null,2) + ';\nexport const HOME_DESCRIPTIONS: Record<string,string> = ' + JSON.stringify(Object.fromEntries(ids.map((id,i)=>[id,descriptions[i]])),null,2) + ';\n');

let visual = read('interaction.js');
visual = visual.slice(visual.indexOf('const helmetMarkup'), visual.indexOf('// The response Date'));
visual = visual.replaceAll('document.querySelectorAll', 'root.querySelectorAll').replaceAll('document.querySelector', 'root.querySelector');
visual = visual.replaceAll('document.body', 'root').replaceAll('./assets/', '/v2/assets/');
visual = visual.replace(/card.addEventListener\('pointermove',([\s\S]*?)\n  \}\);/g, "card.addEventListener('pointermove',$1\n  }, { signal: controller.signal });");
visual = visual.replace("  const observer = new IntersectionObserver", "  observer = new IntersectionObserver");
visual = visual.replace("  await mountCircuit(circuit, pilots);", "  if (!controller.signal.aborted) await mountCircuit(circuit, pilots);");
visual = visual.replace("{ cache: 'no-store' }", "{ signal: controller.signal }");
visual = visual.replace("fetch(`/v2/assets/${circuit}.svg`)", "fetch(`/v2/assets/${circuit}.svg`, { signal: controller.signal })");
visual = visual.replace("  const original = source.querySelector('path');", "  if (controller.signal.aborted) return;\n  const original = source.querySelector('path');");
visual = visual.replace("  peloton.start();", "  stopPeloton = () => peloton.stop();\n  if (!controller.signal.aborted) peloton.start();");
visual = visual.replace('createPeloton({ circuit,', 'createPeloton({ hero: root.querySelector(\'.hero\'), root, signal: controller.signal, circuit,');
visual = visual.replace('isPaused: () => paused', 'isPaused: () => isPaused() || document.hidden');
visual = visual.replace('initializeVisuals().catch(error => console.error(error));', "initializeVisuals().catch(error => {if (error.name !== 'AbortError') root.dataset.visualState = 'unavailable';});");
// Storage may be unavailable; decorative variation must still render.
visual = visual.replace("const previous = Number(sessionStorage.getItem('preview-scene'));", "let previous = 0; try { previous = Number(sessionStorage.getItem('preview-scene')); } catch { /* Optional variation memory. */ }");
visual = visual.replace("sessionStorage.setItem('preview-scene', String(scene.id));", "try { sessionStorage.setItem('preview-scene', String(scene.id)); } catch { /* Optional variation memory. */ }");
write('src/lib/v2/homeVisuals.js', "import {createPeloton} from './telemetry.js';\nimport {CIRCUITS} from './circuits.js';\nexport function initializeHomeVisuals(root, isPaused) {\nconst controller = new AbortController();\nconst reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');\nlet observer; let stopPeloton = () => {};\n" + visual + '\nreturn () => {controller.abort(); observer?.disconnect(); stopPeloton(); root.getAnimations({subtree:true}).forEach(a=>a.cancel());};\n}\n');
let telemetry = read('telemetry.js');
telemetry = telemetry.replace('createPeloton({ circuit,', 'createPeloton({ hero, root, signal, circuit,');
telemetry = telemetry.replace("  const hero = document.querySelector('.hero');", '  let raf = 0;');
telemetry = telemetry.replaceAll('requestAnimationFrame(frame)', 'raf = requestAnimationFrame(frame)');
telemetry = telemetry.replace(/document.addEventListener\('click',([\s\S]*?)\n  \}\);/, "document.addEventListener('click',$1\n  }, {signal});");
telemetry = telemetry.replace(/document.addEventListener\('keydown',([\s\S]*?)\n  \}\);/, "document.addEventListener('keydown',$1\n  }, {signal});");
telemetry = telemetry.replace("  return { start: () => raf = requestAnimationFrame(frame) };", "  return {start: () => {raf = requestAnimationFrame(frame);}, stop: () => {cancelAnimationFrame(raf); panel.remove(); safetyStatus.remove();}};");
write('src/lib/v2/telemetry.js', telemetry);
cpSync(resolve(source,'circuits.js'),'src/lib/v2/circuits.js');
console.log('Imported approved artwork, scoped styles, tracks and animation lifecycle.');
