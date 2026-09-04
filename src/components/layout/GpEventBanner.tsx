// src/components/layout/GpEventBanner.tsx
//
// Cartel del EVENTO PUNTUAL de puntos dobles del GP de Monza 2026.
// Ver src/lib/gpEvent.ts para la ventana y el porqué de cada decisión.
//
// Es SOLO presentación: no otorga ni calcula nada. Los puntos dobles los aplica
// el backend con su propio reloj. Si el reloj del dispositivo del jugador está
// mal, verá el cartel corrido — pero cobrará exactamente lo que corresponda.
//
// Dos fases (gpEventPhase): "soon" (cuenta regresiva, 24 h antes) y "active"
// (evento en curso). Fuera de eso el componente no renderiza nada.

import { useEffect, useState } from "react";
import { useI18n } from "@/context";
import { useMounted } from "@/lib/useMounted";
import { getEffectiveNow } from "@/lib/debugDate";
import {
  gpEventPhase,
  gpEventMsUntilNextMilestone,
  GP_EVENT_MULTIPLIER,
  type GpEventPhase,
} from "@/lib/gpEvent";

/** "1d 04:32:10" o "04:32:10" si falta menos de un día. */
function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hh = String(Math.floor((total % 86400) / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

/**
 * Re-evalúa fase y cuenta regresiva cada segundo. El tick vive acá y no en el
 * módulo puro para que `gpEvent.ts` siga sin estado ni efectos (lo importa el
 * backend).
 */
function useGpEventTick(): { phase: GpEventPhase; remainingMs: number } {
  const read = () => {
    const now = getEffectiveNow();
    return { phase: gpEventPhase(now), remainingMs: gpEventMsUntilNextMilestone(now) };
  };
  const [state, setState] = useState(read);

  useEffect(() => {
    // Un primer read inmediato: entre el render inicial y el montaje pudo pasar
    // tiempo (hidratación), y el estado inicial se calculó antes.
    setState(read());
    const id = window.setInterval(() => setState(read()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return state;
}

export function GpEventBanner() {
  const { t } = useI18n();
  // El cartel depende de la hora actual: en el prerender SSG no existe una
  // "hora de la visita", así que se monta recién en el cliente. Sin esto habría
  // mismatch de hidratación (y `window`/`setInterval` no existen en el build).
  const mounted = useMounted();
  const { phase, remainingMs } = useGpEventTick();

  if (!mounted || phase === "off") return null;

  const active = phase === "active";
  const title = active ? t("gpEvent.active_title") : t("gpEvent.soon_title");
  const subtitle = active ? t("gpEvent.active_sub") : t("gpEvent.soon_sub");
  const countdownLabel = active ? t("gpEvent.ends_in") : t("gpEvent.starts_in");
  const countdown = formatCountdown(remainingMs);

  return (
    <aside
      // SIN `role="status"` a propósito. `status` implica `aria-live="polite"`,
      // y adentro hay una cuenta regresiva que cambia cada segundo: el lector
      // de pantalla anunciaría el cartel entero una vez por segundo, de forma
      // indefinida. Un `<aside>` con nombre accesible es un landmark
      // "complementary": el usuario lo encuentra y lo lee cuando quiere, y las
      // actualizaciones del reloj no interrumpen nada.
      //
      // El aria-label explica en palabras lo que el diseño dice con el "×2".
      aria-label={t(active ? "gpEvent.aria_active" : "gpEvent.aria_soon", {
        multiplier: GP_EVENT_MULTIPLIER,
        circuit: t("gpEvent.circuit"),
      })}
      className={[
        "relative isolate overflow-hidden border-b",
        active ? "border-racing/30" : "border-white/10",
        "animate-rise",
      ].join(" ")}
    >
      {/* Fondo: asfalto + resplandor rojo que sangra desde la izquierda.
          En fase "soon" el rojo baja de intensidad (anticipación, no fiesta). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-asphalt-900"
        style={{
          backgroundImage: active
            ? "radial-gradient(120% 180% at 0% 50%, rgba(225,6,0,0.34) 0%, rgba(225,6,0,0.10) 42%, rgba(11,11,11,0) 72%)"
            : "radial-gradient(120% 180% at 0% 50%, rgba(225,6,0,0.16) 0%, rgba(11,11,11,0) 68%)",
        }}
      />
      {/* Trama diagonal finísima, como el rayado de una pantalla de tiempos. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.055]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 9px)",
        }}
      />

      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:py-3">
        {/* Tricolore de Monza: la firma visual del evento. */}
        <span
          aria-hidden="true"
          className="h-9 w-[3px] shrink-0 rounded-full sm:h-10"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #009246 0%, #009246 33.33%, #F1F2F1 33.33%, #F1F2F1 66.66%, #CE2B37 66.66%, #CE2B37 100%)",
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {active && (
              <span aria-hidden="true" className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-racing opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-racing" />
              </span>
            )}
            {/* El circuito va PRIMERO: en pantallas angostas el `truncate`
                recorta la cola, y lo que no se puede perder es "Monza" (el
                dato distintivo), no la etiqueta generica del evento. */}
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted sm:text-[11px]">
              <span className="text-ink">{t("gpEvent.circuit")}</span>
              <span className="mx-1.5 text-ink-faint">/</span>
              {t("gpEvent.eyebrow")}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            {/* El x2: el dato que el jugador tiene que retener. */}
            <span
              className={[
                "shrink-0 font-display text-xl font-extrabold leading-none tracking-tight sm:text-2xl",
                active ? "text-racing-400" : "text-ink-muted",
              ].join(" ")}
              // El "×" es un símbolo, no una letra: fuera de la lectura.
              aria-hidden="true"
            >
              ×{GP_EVENT_MULTIPLIER}
            </span>
            <span className="truncate font-display text-sm font-bold uppercase tracking-tight text-ink sm:text-base">
              {title}
            </span>
          </div>

          <p className="mt-0.5 hidden truncate text-xs text-ink-muted sm:block">{subtitle}</p>
        </div>

        {/* Cuenta regresiva, alineada a la derecha como un panel de tiempos. */}
        <div className="shrink-0 text-right">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint sm:text-[10px]">
            {countdownLabel}
          </div>
          <div
            // Siempre LTR: es un tiempo, no texto — en árabe no debe espejarse.
            dir="ltr"
            className={[
              "font-mono text-sm font-semibold tabular-nums sm:text-base",
              active ? "text-ink" : "text-ink-muted",
            ].join(" ")}
          >
            {countdown}
          </div>
        </div>
      </div>
    </aside>
  );
}
