import type { ReactNode } from "react";
import { Header } from "./Header";
import { useI18n } from "@/context";

/** Marco de pagina: header pegajoso + contenedor centrado + footer. */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <footer className="border-t border-white/5 py-6">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-center text-xs leading-relaxed text-ink-faint">
            {t("footer.line1")}
            <br className="hidden sm:inline" /> {t("footer.line2")}
          </p>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-ink-faint/70">
            {t("footer.photo_credit")}
          </p>
        </div>
      </footer>
    </div>
  );
}
