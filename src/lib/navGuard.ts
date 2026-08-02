// src/lib/navGuard.ts
//
// Guard de navegación registrable. Cuando una pantalla está en un estado donde
// IRSE debería avisar antes (hoy: un duelo en curso), registra un handler acá.
// Los elementos de navegación "globales" que viven FUERA de esa pantalla —el
// logo del header— consultan el guard: si hay uno activo, invocan su handler
// (que abre el cartel de confirmación) EN VEZ de navegar.
//
// Mismo espíritu que `src/lib/gameplayState.ts`: un singleton a nivel de módulo,
// sin estado de React, para poder coordinar dos componentes lejanos (el logo en
// `Header` y la pantalla de juego del duelo en `DuelPage`) sin subir estado por
// todo el árbol. A propósito NO es genérico de más: hay un solo guard a la vez
// (solo puede haber una pantalla de juego montada).

let guard: (() => void) | null = null;

/** Registra (o limpia con null) el handler que intercepta la navegación. */
export function setNavGuard(fn: (() => void) | null): void {
  guard = fn;
}

/**
 * Si hay un guard activo, lo invoca y devuelve true (quien llama NO debe
 * navegar). Si no hay guard, devuelve false (navegación normal).
 */
export function runNavGuard(): boolean {
  if (guard) {
    guard();
    return true;
  }
  return false;
}
