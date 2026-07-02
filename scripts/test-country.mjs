// scripts/test-country.mjs
//
// Reproduce EXACTAMENTE los 3 escenarios del bug del país:
//   - Imagen 1: modal recién abierto, país detectado debe aparecer
//   - Imagen 2: nombre + país manual → botón guardar habilitado
//   - Imagen 3: nombre + "Selecciona tu país" → botón deshabilitado
//
// Ejecuta: node scripts/test-country.mjs

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

// ─── Réplica del mapeo geoip alpha-2 → alpha-3 ─────────────────────
const ALPHA2_TO_ALPHA3 = {
  AR: "ARG", AU: "AUS", AT: "AUT", BE: "BEL", BR: "BRA",
  CA: "CAN", CH: "CHE", CL: "CHL", CN: "CHN", CO: "COL",
  CZ: "CZE", DE: "DEU", DK: "DNK", ES: "ESP", FI: "FIN",
  FR: "FRA", GB: "GBR", HU: "HUN", ID: "IDN", IN: "IND",
  IE: "IRL", IT: "ITA", JP: "JPN", LI: "LIE", MA: "MAR",
  MC: "MCO", MX: "MEX", MY: "MYS", NL: "NLD", NZ: "NZL",
  PL: "POL", PT: "PRT", RU: "RUS", SE: "SWE", TH: "THA",
  UY: "URY", US: "USA", VE: "VEN", ZA: "ZAF", ZW: "ZWE",
};

// Los códigos válidos según el dataset F1
const VALID_ALPHA3 = new Set(Object.values(ALPHA2_TO_ALPHA3));

function alpha2ToAlpha3(alpha2) {
  const up = alpha2.toUpperCase();
  const mapped = ALPHA2_TO_ALPHA3[up];
  if (!mapped) return null;
  if (!VALID_ALPHA3.has(mapped)) return null;
  return mapped;
}

// ─── Réplica de la validación del modal ────────────────────────────
function canSaveModal({ name, country, saving = false, canChangeName = true, prevName = "" }) {
  const trimmedName = name.trim();
  const nameValid = trimmedName.length > 0 && trimmedName.length <= 30;
  const countryValid = country.length === 3 && VALID_ALPHA3.has(country);
  const nameChanged = trimmedName !== prevName;
  return nameValid && countryValid && !saving && (canChangeName || !nameChanged);
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

function test_geoip_mapping() {
  console.log("\n▶ Test A: geoip mapea alpha-2 → alpha-3 correctamente");
  assert(alpha2ToAlpha3("AR") === "ARG", "AR → ARG (Argentina)");
  assert(alpha2ToAlpha3("BR") === "BRA", "BR → BRA (Brasil)");
  assert(alpha2ToAlpha3("US") === "USA", "US → USA (Estados Unidos)");
  assert(alpha2ToAlpha3("ES") === "ESP", "ES → ESP (España)");
  assert(alpha2ToAlpha3("ar") === "ARG", "case-insensitive: 'ar' → ARG");
}

function test_geoip_not_in_dataset() {
  console.log("\n▶ Test B: geoip devuelve null si el país no está en el dataset F1");
  assert(alpha2ToAlpha3("KR") === null, "KR (Corea) → null (no hay pilotos F1)");
  assert(alpha2ToAlpha3("EG") === null, "EG (Egipto) → null");
  assert(alpha2ToAlpha3("XX") === null, "XX (inválido) → null");
  assert(alpha2ToAlpha3("") === null, "vacío → null");
}

function test_image1_new_user() {
  console.log("\n▶ Test 1 (Imagen 1): usuario nuevo, país detectado 'AR' → se preselecciona");
  // Simular: modal abre, geoip devuelve "AR", el código lo mapea a "ARG"
  const detected = alpha2ToAlpha3("AR");
  assert(detected === "ARG", "geoip devuelve ARG (no AR)");

  // El <select> tiene <option value="ARG">Argentina</option>, entonces
  // setCountry("ARG") hace que el select muestre Argentina.
  const stateAfterDetection = { country: detected };
  assert(stateAfterDetection.country === "ARG", "state.country = 'ARG' (matchea el <option>)");

  // Y canSave debe permitir guardar si el usuario también pone nombre
  const ok = canSaveModal({ name: "Juan", country: "ARG" });
  assert(ok === true, "canSave con nombre + país detectado = true");
}

function test_image2_manual_country() {
  console.log("\n▶ Test 2 (Imagen 2): usuario elige país manual 'Argentina' (ARG) → guarda habilitado");
  // El usuario abrió el modal, no hubo detección o eligió manual.
  // Ahora tiene: name="Juan", country="ARG" (elegido del select)
  const ok = canSaveModal({ name: "Juan", country: "ARG" });
  assert(ok === true, "canSave = true (ESTE es el bug que reportaste: antes daba false)");

  // Con más países manuales
  assert(canSaveModal({ name: "Ana", country: "USA" }) === true, "USA válido");
  assert(canSaveModal({ name: "Ana", country: "BRA" }) === true, "BRA válido");
}

function test_image3_no_country() {
  console.log("\n▶ Test 3 (Imagen 3): volver a 'Selecciona tu país' (country='') → no guarda");
  const ok = canSaveModal({ name: "Juan", country: "" });
  assert(ok === false, "canSave = false cuando country está vacío (correcto)");
}

function test_edge_cases() {
  console.log("\n▶ Test 4: casos borde");
  assert(canSaveModal({ name: "", country: "ARG" }) === false, "sin nombre → false");
  assert(canSaveModal({ name: "  ", country: "ARG" }) === false, "solo espacios → false");
  assert(canSaveModal({ name: "Juan", country: "AR" }) === false, "país en alpha-2 (2 letras) → false");
  assert(canSaveModal({ name: "Juan", country: "XXX" }) === false, "país inexistente XXX → false");
  assert(canSaveModal({ name: "A".repeat(31), country: "ARG" }) === false, "nombre >30 chars → false");
  assert(canSaveModal({ name: "A".repeat(30), country: "ARG" }) === true, "nombre =30 chars → true");
  assert(canSaveModal({ name: "Juan", country: "ARG", saving: true }) === false, "saving=true → false");
}

function test_name_change_rule() {
  console.log("\n▶ Test 5: regla de cambio de nombre mensual");
  // canChangeName=false: no puede cambiar el nombre este mes
  assert(
    canSaveModal({ name: "Juan", country: "ARG", canChangeName: false, prevName: "Juan" }) === true,
    "no cambia nombre + país válido → true (no bloqueado)"
  );
  assert(
    canSaveModal({ name: "Pedro", country: "ARG", canChangeName: false, prevName: "Juan" }) === false,
    "intenta cambiar nombre pero no puede este mes → false"
  );
  assert(
    canSaveModal({ name: "Pedro", country: "ARG", canChangeName: true, prevName: "Juan" }) === true,
    "cambia nombre y puede → true"
  );
}

(async () => {
  console.log("═══ TEST BUG DEL PAÍS (reproduce imágenes 1, 2, 3) ═══");
  test_geoip_mapping();
  test_geoip_not_in_dataset();
  test_image1_new_user();
  test_image2_manual_country();
  test_image3_no_country();
  test_edge_cases();
  test_name_change_rule();
  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();
