// src/components/layout/ConsentBanner.tsx
//
// Cartel de consentimiento de cookies (RGPD). Barra discreta pegada al borde
// inferior: no bloquea el juego, la persona puede seguir usando el sitio. Se
// muestra una sola vez (o cuando se reabre desde "Gestionar cookies" en el
// footer). El estado real vive en lib/consent.ts.
//
// Hidratacion (SSG): el servidor no tiene localStorage, asi que renderizamos
// null hasta montar en el cliente. Asi el primer render del cliente coincide
// con el del servidor (ambos null) y recien despues aparece la barra, sin
// mismatch de hidratacion.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/context";
import { privacyPath } from "@/lib/routes";
import { Button } from "@/components/ui/Button";
import { setConsent, shouldShowBanner, onConsentChanged } from "@/lib/consent";

export function ConsentBanner() {
  const { t, locale } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Evaluar recien en el cliente y re-evaluar ante cambios (decision o
    // reapertura desde el footer).
    const sync = () => setVisible(shouldShowBanner());
    sync();
    return onConsentChanged(sync);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("consent.title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-asphalt-800/95 backdrop-blur-sm animate-rise"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:py-3.5">
        <p className="flex-1 text-xs leading-relaxed text-ink-faint sm:text-[13px]">
          {t("consent.message")}{" "}
          <Link
            to={privacyPath(locale)}
            className="text-ink underline underline-offset-2 transition-colors hover:text-racing-400"
          >
            {t("footer.privacy")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setConsent("denied")}>
            {t("consent.reject")}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setConsent("granted")}>
            {t("consent.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
