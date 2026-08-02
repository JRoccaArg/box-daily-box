// src/pages/ContactPage.tsx
//
// Página simple de contacto: mail para reportar problemas o sugerir ideas.
// Mismo mail que figura en los Términos (src/content/legal), pero accesible
// desde una página propia (no solo dentro del texto legal). Contenido corto,
// así que va directo en i18n (a diferencia de legal/info, que usan su propio
// directorio de contenido estructurado).

import { Link } from "react-router-dom";
import { Seo } from "@/components/layout/Seo";
import { Panel } from "@/components/ui/Panel";
import { ChevronLeft } from "@/components/ui/Icon";
import { useI18n } from "@/context";
import { homePath } from "@/lib/routes";

const CONTACT_EMAIL = "boxdailybox@gmail.com";

export function ContactPage() {
  const { locale, t } = useI18n();

  return (
    <div className="space-y-5">
      <Seo locale={locale} route={{ kind: "contact" }} />

      <Link
        to={homePath(locale)}
        className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft size={16} />
        {t("shell.back")}
      </Link>

      <Panel>
        <article className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {t("contact.title")}
          </h1>
          <p className="leading-relaxed text-ink-muted">{t("contact.intro")}</p>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-racing-400 underline underline-offset-2 hover:text-racing"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </article>
      </Panel>
    </div>
  );
}
