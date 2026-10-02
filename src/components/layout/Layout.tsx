import {useEffect, type ReactNode} from "react";
import { useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { V2Header } from "@/components/v2/V2Header";
import { V2Footer } from "@/components/v2/V2Footer";
import { DebugDatePanel } from "@/components/dev/DebugDatePanel";
import { DuelBanner } from "./DuelBanner";
import { ToastContainer } from "./ToastContainer";
import { ConsentBanner } from "./ConsentBanner";
import { GpEventBanner } from "./GpEventBanner";
import { LivesToastWatcher } from "./LivesToastWatcher";

/** Games, challenges and duels keep their current shell until redesigned. */
const LEGACY_ROUTE = /^\/[^/]+\/(juego|duelo|reto)(\/|$)/;

/** Shared shell, with the approved redesign outside game flows. */
export function Layout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  const isV2 = !LEGACY_ROUTE.test(pathname);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let id = '';
      try { id = decodeURIComponent(hash.slice(1)); } catch { /* Invalid anchor. */ }
      const target = id ? document.getElementById(id) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo({top:0,behavior:'instant' as ScrollBehavior});
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return (
    <div className="flex min-h-full flex-col">
      {/* Evento puntual (GP de Monza 2026). Va ARRIBA del header y no es
          sticky: se lee al entrar y despues deja la pantalla libre. Se
          renderiza solo dentro de su ventana — ver src/lib/gpEvent.ts. */}
      <GpEventBanner />
      <V2Header />
      <main
        id="contenido"
        className={
          isV2 ? "flex w-full flex-1 flex-col" : "mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8"
        }
      >
        {children}
      </main>
      <V2Footer />
      <DebugDatePanel />
      {/* Sin cookies: no dependen del banner de consentimiento (etapa 2). */}
      <Analytics />
      <SpeedInsights />
      {/* Cartel de consentimiento RGPD (gatea Google Analytics, etapa 3). */}
      <ConsentBanner />
      {/* Sin UI propia: solo dispara el toast "ganaste una vida" (etapa 5),
          esperando a que termine una partida en curso si hacía falta. */}
      <LivesToastWatcher />
      {/* Apila DuelBanner (persistente mientras haya invitacion) y los
          toasts (transitorios) sin que se tapen entre si: cada uno se
          dimensiona a si mismo, este contenedor solo fija la posicion. */}
      <div className="fixed bottom-3 right-3 z-40 flex flex-col items-end gap-2 sm:bottom-4 sm:right-4">
        <DuelBanner />
        <ToastContainer />
      </div>
    </div>
  );
}
