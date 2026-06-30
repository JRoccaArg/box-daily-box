import type { ReactNode } from "react";
import { Header } from "./Header";

/** Marco de pagina: header pegajoso + contenedor centrado + footer. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <footer className="border-t border-white/5 py-6">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-center text-xs leading-relaxed text-ink-faint">
            Box Box Daily &middot; Proyecto de fans, sin afiliacion oficial con la Formula 1.
            <br className="hidden sm:inline" /> Un reto nuevo cada dia a la medianoche.
          </p>
        </div>
      </footer>
    </div>
  );
}
