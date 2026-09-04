import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DebugDatePanel } from "@/components/dev/DebugDatePanel";
import { DuelBanner } from "./DuelBanner";
import { ToastContainer } from "./ToastContainer";
import { ConsentBanner } from "./ConsentBanner";
import { GpEventBanner } from "./GpEventBanner";

/** Marco de pagina: header pegajoso + contenedor centrado + footer. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      {/* Evento puntual (GP de Monza 2026). Va ARRIBA del header y no es
          sticky: se lee al entrar y despues deja la pantalla libre. Se
          renderiza solo dentro de su ventana — ver src/lib/gpEvent.ts. */}
      <GpEventBanner />
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <Footer />
      <DebugDatePanel />
      {/* Sin cookies: no dependen del banner de consentimiento (etapa 2). */}
      <Analytics />
      <SpeedInsights />
      {/* Cartel de consentimiento RGPD (gatea Google Analytics, etapa 3). */}
      <ConsentBanner />
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
