import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DebugDatePanel } from "@/components/dev/DebugDatePanel";
import { DuelBanner } from "./DuelBanner";

/** Marco de pagina: header pegajoso + contenedor centrado + footer. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <Footer />
      <DebugDatePanel />
      <DuelBanner />
    </div>
  );
}
