// src/lib/gameplayState.ts
//
// Bandera global mínima: "¿el usuario está jugando un reto ahora mismo?".
// Usada por DuelBanner (Roadmap §4) para NO interrumpir con una invitación
// de duelo mientras GameShell está en fase "playing" — se muestra recién al
// volver a home/config. GameShell es el único que la escribe (un solo efecto
// aditivo, sin tocar su lógica interna); cualquier otra pantalla puede leerla.

import { emit, on } from "./events";

const EVENT = "gameplay:changed";
let active = false;

export function setGameplayActive(value: boolean): void {
  if (active === value) return;
  active = value;
  emit(EVENT);
}

export function isGameplayActive(): boolean {
  return active;
}

export function onGameplayChanged(fn: () => void): () => void {
  return on(EVENT, fn);
}
