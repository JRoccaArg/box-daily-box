/**
 * Test de paridad de idiomas (Etapa 7).
 *
 * `Translations = Record<string, string>` no tipa nada: si un idioma se
 * queda sin una key, `translate()` cae en silencio al inglés (o a la key
 * cruda) y nadie se entera hasta que un hablante nativo lo nota. Este test
 * compara los 14 diccionarios contra `en` (idioma de referencia, completo
 * por definición) y falla si falta o sobra una key en cualquiera.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-i18n-parity.ts
 */
import es from "../src/i18n/es";
import en from "../src/i18n/en";
import pt from "../src/i18n/pt";
import hi from "../src/i18n/hi";
import it from "../src/i18n/it";
import fr from "../src/i18n/fr";
import zh from "../src/i18n/zh";
import ja from "../src/i18n/ja";
import de from "../src/i18n/de";
import nl from "../src/i18n/nl";
import ar from "../src/i18n/ar";
import ru from "../src/i18n/ru";
import tr from "../src/i18n/tr";
import sl from "../src/i18n/sl";

const DICTIONARIES: Record<string, Record<string, string>> = {
  es, en, pt, hi, it, fr, zh, ja, de, nl, ar, ru, tr, sl,
};

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

const referenceKeys = new Set(Object.keys(en));
assert(referenceKeys.size > 0, `en.ts tiene keys (${referenceKeys.size})`);

for (const [locale, dict] of Object.entries(DICTIONARIES)) {
  const keys = new Set(Object.keys(dict));
  const missing = [...referenceKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !referenceKeys.has(k));

  assert(
    missing.length === 0,
    `[${locale}] sin keys faltantes respecto a en.ts (encontradas: ${missing.length}${missing.length ? ": " + missing.slice(0, 5).join(", ") + (missing.length > 5 ? "…" : "") : ""})`,
  );
  assert(
    extra.length === 0,
    `[${locale}] sin keys huérfanas (en desuso o typo) respecto a en.ts (encontradas: ${extra.length}${extra.length ? ": " + extra.slice(0, 5).join(", ") + (extra.length > 5 ? "…" : "") : ""})`,
  );

  // Ningún valor debe estar vacío (una key "agregada" con string vacío pasa
  // el chequeo de arriba pero deja al usuario sin texto real).
  const empties = [...keys].filter((k) => dict[k] != null && dict[k]!.trim() === "");
  assert(empties.length === 0, `[${locale}] sin valores vacíos (encontrados: ${empties.length})`);
}

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
if (failed > 0) process.exit(1);
