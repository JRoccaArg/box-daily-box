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
    <div className="bdb-v2"><div
      role="dialog"
      aria-live="polite"
      aria-label={t("consent.title")}
      className="cookie-preview"
    >
      <div className="cookie-preview-copy"><h2>{t('consent.title')}</h2>
        <p>
          {t("consent.message")}{" "}
          <Link
            to={privacyPath(locale)}
            className="text-ink underline underline-offset-2 transition-colors hover:text-racing-400"
          >
            {t("footer.privacy")}
          </Link>
        </p>
      </div><div className="cookie-preview-actions">
          <button type="button" onClick={() => setConsent("denied")}>
            {t("consent.reject")}
          </button>
          <button type="button" onClick={() => setConsent("granted")}>
            {t("consent.accept")}
          </button>
        </div>
    </div></div>
  );
}
