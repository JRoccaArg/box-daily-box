// src/lib/audio.ts
//
// Feedback sensorial (Roadmap #9): sonidos generados con Web Audio API (sin
// archivos de audio) + vibración con la Vibration API. Alcance de esta primera
// versión (acordado con el usuario): solo victoria/derrota del reto completo
// y un tick en los últimos 10 segundos del cronómetro — no en cada acierto/
// error interno de los 6 juegos (eso queda para una iteración futura).
//
// Ambas señales están gateadas por su propia preferencia (audioPreferences.ts,
// desactivadas por defecto) y son 100% best-effort: si el navegador no soporta
// algo (o estamos en SSR durante el prerender), quedan en silencio sin romper
// nada.

import { isHapticsEnabled, isSoundEnabled } from "./audioPreferences";

// AudioContext único para toda la app (crear uno por sonido agotaría los
// recursos del navegador). `undefined` = todavía no se intentó crear;
// `null` = se intentó y no está disponible (SSR, navegador sin soporte).
let sharedContext: AudioContext | null | undefined;

function getContext(): AudioContext | null {
  if (sharedContext !== undefined) return sharedContext;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    sharedContext = Ctor ? new Ctor() : null;
  } catch {
    sharedContext = null;
  }
  return sharedContext;
}

/** Un tono simple con envolvente (ataque rápido, caída exponencial) para evitar clics. */
function tone(
  context: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  peakGain = 0.12,
): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  const t0 = context.currentTime + startOffset;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain).connect(context.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function playTones(spec: { freq: number; start: number; duration: number; peak?: number }[]): void {
  if (!isSoundEnabled()) return;
  const context = getContext();
  if (!context) return;
  try {
    if (context.state === "suspended") void context.resume();
    for (const s of spec) tone(context, s.freq, s.start, s.duration, s.peak);
  } catch {
    /* best-effort: un fallo de audio nunca debe interrumpir el juego. */
  }
}

/** Vibración best-effort. Silenciosa en navegadores sin soporte (ej. iOS Safari). */
function vibrate(pattern: number | number[]): void {
  if (!isHapticsEnabled()) return;
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* best-effort */
  }
}

/** Arpegio ascendente corto y triunfal (do-mi-sol). */
function playWinTone(): void {
  playTones([
    { freq: 523.25, start: 0, duration: 0.16 },
    { freq: 659.25, start: 0.09, duration: 0.16 },
    { freq: 783.99, start: 0.18, duration: 0.22, peak: 0.14 },
  ]);
}

/** Dos notas descendentes, más apagadas (no punitivo, solo informativo). */
function playLoseTone(): void {
  playTones([
    { freq: 349.23, start: 0, duration: 0.22, peak: 0.1 },
    { freq: 261.63, start: 0.14, duration: 0.28, peak: 0.09 },
  ]);
}

/** Tic breve y suave para la cuenta regresiva final. */
function playTickTone(): void {
  playTones([{ freq: 880, start: 0, duration: 0.05, peak: 0.07 }]);
}

/** Feedback al terminar el reto (ganó o perdió): sonido + vibración, cada uno gateado por su propia preferencia. */
export function playGameResultFeedback(won: boolean): void {
  if (won) playWinTone();
  else playLoseTone();
  vibrate(won ? [40, 60, 40] : [80]);
}

/** Tic de los últimos segundos del cronómetro. Solo sonido (sin vibración: sería repetitivo). */
export function playTickFeedback(): void {
  playTickTone();
}
