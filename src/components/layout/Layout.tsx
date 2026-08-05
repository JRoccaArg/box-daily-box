import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DebugDatePanel } from "@/components/dev/DebugDatePanel";
import { DuelBanner } from "./DuelBanner";
import { ToastContainer } from "./ToastContainer";

/** Marco de pagina: header pegajoso + contenedor centrado + footer. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <Footer />
      <DebugDatePanel />
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
