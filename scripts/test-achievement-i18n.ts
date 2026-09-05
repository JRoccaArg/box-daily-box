/**
 * Contrato específico de textos para Logros.
 *
 * La prueba de paridad verifica que todos los idiomas tengan las mismas keys.
 * Esta suma dos garantías que son importantes para la galería: las 7 badges y
 * sus tooltips no pueden quedar vacíos, y los textos con datos dinámicos deben
 * conservar exactamente las mismas variables en cada idioma.
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-achievement-i18n.ts
 */
import ar from "../src/i18n/ar";
import de from "../src/i18n/de";
import en from "../src/i18n/en";
import es from "../src/i18n/es";
import fr from "../src/i18n/fr";
import hi from "../src/i18n/hi";
import it from "../src/i18n/it";
import ja from "../src/i18n/ja";
import nl from "../src/i18n/nl";
import pt from "../src/i18n/pt";
import ru from "../src/i18n/ru";
import sl from "../src/i18n/sl";
import tr from "../src/i18n/tr";
import zh from "../src/i18n/zh";

const DICTIONARIES: Record<string, Record<string, string>> = {
  ar, de, en, es, fr, hi, it, ja, nl, pt, ru, sl, tr, zh,
};

const ACHIEVEMENT_TYPES = [
  "ach_legend_50",
  "ach_wins_500",
  "ach_legend_10",
  "ach_wins_100",
  "ach_specialist_50",
  "ach_perfect_day",
  "ach_complete",
] as const;

const GALLERY_KEYS = [
  "achievement.loading",
  "achievement.load_error",
  "achievement.title",
  "achievement.unlocked_count",
  "achievement.featured_title",
  "achievement.automatic_badge",
  "achievement.automatic_hint",
  "achievement.manual_hint",
  "achievement.remove_featured",
  "achievement.none_selected",
  "achievement.max_reached",
  "achievement.use_automatic",
  "achievement.unlocked",
  "achievement.in_progress",
  "stats.tab_achievements",
] as const;

const REQUIRED_KEYS = [
  ...ACHIEVEMENT_TYPES.flatMap((type) => [
    `badge.${type}`,
    `badge.tooltip_${type}`,
  ]),
  ...GALLERY_KEYS,
];

function placeholders(value: string): string[] {
  return [...value.matchAll(/{{\s*([\w]+)\s*}}/g)]
    .map((match) => match[1])
    .sort();
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ FALLO: ${message}`);
  }
}

for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
  const missingOrEmpty = REQUIRED_KEYS.filter((key) => !dictionary[key]?.trim());
  assert(
    missingOrEmpty.length === 0,
    `[${locale}] tiene los ${REQUIRED_KEYS.length} textos de Logros`,
  );

  const placeholderMismatches = GALLERY_KEYS.filter(
    (key) => JSON.stringify(placeholders(dictionary[key] ?? "")) !== JSON.stringify(placeholders(en[key] ?? "")),
  );
  assert(
    placeholderMismatches.length === 0,
    `[${locale}] conserva las variables dinámicas de la galería`,
  );
}

console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
if (failed > 0) process.exit(1);
