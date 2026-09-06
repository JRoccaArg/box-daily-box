// src/lib/share.ts
//
// Compartir el resultado de un minijuego "estilo Wordle": una grilla de
// emojis que refleja el camino del jugador SIN revelar la respuesta, más el
// tiempo y el puntaje. Cada juego arma su propia grilla (ver `ShareGrid` en
// src/types) y el GameShell la pasa por acá.
//
// El mensaje es casi todo emojis + números + el nombre del juego (ya traducido
// por el consumidor) + la fecha (formateada en el locale). Por eso casi no
// necesita i18n: solo el label del botón y el aviso de "copiado" se traducen.
//
// Envío: Web Share API nativa (`navigator.share`) donde exista — en mobile abre
// la hoja de compartir del sistema (WhatsApp, Telegram, etc.). Donde no exista
// (escritorio), cae a copiar al portapapeles y avisa con un toast. Mismo patrón
// de fallback que ya usa FriendsTab para copiar el código de amigo.

import { showToast } from "./toast";
import type { ShareGrid } from "@/types";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Firma de marca al pie del mensaje (placeholder, no es el link de referido). */
const SITE_SIGNATURE = "boxdailybox.com";

export type ShareInput = {
  /** Nombre del juego, ya traducido (t(`game.${id}.name`)). */
  gameName: string;
  /** Fecha del reto, ya formateada en el locale (ej. "6 sept 2026"). */
  dateLabel: string;
  won: boolean;
  /** Segundos que tardó, o null si fue modo "Sin Tiempo" / no aplica. */
  timeSeconds: number | null;
  /** Puntos ganados (solo se muestran si won y > 0). */
  points: number;
  /** Grilla del juego, o null → formato uniforme sin grilla. */
  grid: ShareGrid | null;
};

/** "m:ss" a partir de segundos. */
function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

/**
 * Arma el texto a compartir. Estructura:
 *   🏁 <juego> · <fecha>
 *   <filas de la grilla, si hay>
 *   <✅|❌> · ⏱ <m:ss> · 🏆 <pts>
 *   <firma>
 */
export function buildShareText(input: ShareInput): string {
  const lines: string[] = [];
  lines.push(`🏁 ${input.gameName} · ${input.dateLabel}`);

  if (input.grid && input.grid.rows.length > 0) {
    for (const row of input.grid.rows) lines.push(row);
  }

  // Línea de estadísticas: emojis + números, sin texto traducible.
  const stats: string[] = [input.won ? "✅" : "❌"];
  if (input.timeSeconds != null) stats.push(`⏱ ${formatClock(input.timeSeconds)}`);
  if (input.won && input.points > 0) stats.push(`🏆 ${input.points}`);
  lines.push(stats.join(" · "));

  lines.push("");
  lines.push(SITE_SIGNATURE);
  return lines.join("\n");
}

/**
 * Comparte `text`: Web Share API si está disponible, si no copia al portapapeles
 * y avisa. Silencioso si el usuario cancela la hoja de compartir (AbortError).
 */
export async function shareResult(text: string, t: Translate): Promise<void> {
  // navigator.share puede existir pero fallar si no está permitido en este
  // contexto; por eso el try/catch envuelve todo y cae a clipboard.
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return;
    } catch (err) {
      // El usuario canceló la hoja: no es un error que haya que avisar.
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Cualquier otro fallo: seguimos al fallback de copiar.
    }
  }
  await copyToClipboard(text, t);
}

async function copyToClipboard(text: string, t: Translate): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showToast(t("share.copied"), "success");
      return;
    }
  } catch {
    // cae al aviso de error de abajo
  }
  showToast(t("share.error"), "error");
}
