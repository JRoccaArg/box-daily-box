// scripts/sync-boceto-css.mjs
//
// Porta el CSS del boceto visual (HTML estático de las pantallas de cuenta:
// ranking, acceso, perfil, logros, amigos) a la app, ACOTADO bajo `.bdb-v2`
// para que sus selectores genéricos (body, h1, table, .panel, .primary…) no
// toquen el resto del sitio.
//
// El boceto es la fuente de verdad visual: cuando cambie, se vuelve a correr
// este script y se commitea el resultado. NO editar a mano el archivo
// generado: los agregados propios de la app (estados de carga/error, cosas
// que el boceto no dibuja) van en src/styles/v2/app.css.
//
// Uso:
//   node scripts/sync-boceto-css.mjs <ruta>/boceto/account-previews.css
//
// Transformaciones:
//   - @font-face del boceto se descartan (las fuentes viven en fonts.css).
//   - :root, html, body           → .bdb-v2
//   - *, :focus-visible, ::x      → .bdb-v2 *, .bdb-v2 :focus-visible, …
//   - cualquier otro selector     → .bdb-v2 <selector>
//   - @keyframes x                → @keyframes v2-x (y sus usos en animation)

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const SCOPE = ".bdb-v2";
const KEYFRAME_PREFIX = "v2-";

const input = process.argv[2];
if (!input) {
  console.error("Uso: node scripts/sync-boceto-css.mjs <ruta a account-previews.css>");
  process.exit(2);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "src/styles/v2/boceto.css");

function scopeSelector(sel) {
  const s = sel.trim();
  if (s === ":root" || s === "html" || s === "body") return SCOPE;
  if (/^(html|body)[\s>.:#[]/.test(s)) return SCOPE + s.replace(/^(html|body)/, "");
  return `${SCOPE} ${s}`;
}

const css = process.argv.slice(2).map(path => readFileSync(path, "utf8")).join("\n");
const parsed = postcss.parse(css);
const keyframeNames = new Set();

parsed.walkAtRules("font-face", (at) => at.remove());
// La Saira del wordmark tiene otro archivo que la fuente del sitio original.
// Un nombre propio evita cambiar medidas y saltos de línea fuera del rediseño.
parsed.walkDecls(/^(font|font-family)$/, (decl) => {
  decl.value = decl.value.replace(/(['"])Saira\1/g, "$1BDB V2 Saira$1");
});
parsed.walkAtRules(/keyframes$/, (at) => {
  keyframeNames.add(at.params.trim());
  at.params = KEYFRAME_PREFIX + at.params.trim();
});

parsed.walkRules((rule) => {
  const parent = rule.parent;
  if (parent && parent.type === "atrule" && /keyframes$/.test(parent.name)) return;
  rule.selectors = rule.selectors.map(scopeSelector);
});

if (keyframeNames.size > 0) {
  const names = [...keyframeNames].map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${names.join("|")})\\b`, "g");
  parsed.walkDecls(/^animation(-name)?$/, (decl) => {
    decl.value = decl.value.replace(re, `${KEYFRAME_PREFIX}$1`);
  });
}

const header = `/* GENERADO por scripts/sync-boceto-css.mjs a partir del boceto visual.
 * NO EDITAR A MANO: los cambios se pierden al re-sincronizar. Los agregados
 * propios de la app van en src/styles/v2/app.css. */
`;
writeFileSync(output, header + parsed.toString().trim() + "\n");
console.log(`OK → ${output} (${parsed.nodes.length} nodos, keyframes: ${[...keyframeNames].join(", ") || "ninguno"})`);
