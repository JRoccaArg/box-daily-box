// src/components/layout/Footer.tsx
//
// Pie de página global: nota de "proyecto de fans" + links legales. Los links
// usan el idioma actual (termsPath/privacyPath). Preparado para sumar más links
// (Info/About) en etapas siguientes del roadmap.

import { Link } from "react-router-dom";
import { useI18n } from "@/context";
import { termsPath, privacyPath, infoPath, contactPath, homePath } from "@/lib/routes";

export function Footer() {
  const { t, locale } = useI18n();

  return (
    <footer className="border-t border-white/5 py-6">
      <div className="mx-auto max-w-3xl space-y-3 px-4">
        <p className="text-center text-xs leading-relaxed text-ink-faint">
          {t("footer.line1")}
          <br className="hidden sm:inline" /> {t("footer.line2")}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
          <Link
            to={infoPath(locale)}
            className="text-ink-faint underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            {t("footer.info")}
          </Link>
          <Link
            to={termsPath(locale)}
            className="text-ink-faint underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            {t("footer.terms")}
          </Link>
          <Link
            to={privacyPath(locale)}
            className="text-ink-faint underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            {t("footer.privacy")}
          </Link>
          <Link
            to={contactPath(locale)}
            className="text-ink-faint underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            {t("footer.contact")}
          </Link>
          {/* Apunta al home (no a un ancla): la tarjeta de apoyo esta cerca
              del final de una pagina corta, no hace falta scroll-to-hash. */}
          <Link
            to={homePath(locale)}
            className="text-ink-faint underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            {t("footer.support")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
