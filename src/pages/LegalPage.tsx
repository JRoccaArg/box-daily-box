// src/pages/LegalPage.tsx
//
// Renderiza una página legal (Términos o Privacidad) a partir del contenido
// estructurado y tipado de `src/content/legal`. Un mismo componente sirve para
// cualquier documento; `TermsPage`/`PrivacyPage` son wrappers finos (para poder
// referenciarlos como `Component` en el árbol de rutas de vite-react-ssg).
//
// Las páginas van con `noindex` (ver buildSeo): son legales, sin valor de
// búsqueda, y aún no traducidas a los 14 idiomas. Siguen siendo 100% públicas.

import { Link } from "react-router-dom";
import { Seo } from "@/components/layout/Seo";
import { Panel } from "@/components/ui/Panel";
import { ChevronLeft } from "@/components/ui/Icon";
import { useI18n } from "@/context";
import { homePath } from "@/lib/routes";
import { getLegalDoc, type LegalPageId } from "@/content/legal";
import type { LegalBlock } from "@/content/legal/types";

function Block({ block }: { block: LegalBlock }) {
  if ("p" in block) {
    return <p className="leading-relaxed text-ink-muted">{block.p}</p>;
  }
  if ("list" in block) {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-ink-muted marker:text-ink-faint">
        {block.list.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }
  // Email (mailto). `href` es un email constante controlado, no entrada de usuario.
  return (
    <p>
      <a
        href={`mailto:${block.email}`}
        className="font-medium text-racing-400 underline underline-offset-2 hover:text-racing"
      >
        {block.email}
      </a>
    </p>
  );
}

export function LegalPage({ page }: { page: LegalPageId }) {
  const { locale, t } = useI18n();
  const doc = getLegalDoc(locale, page);

  return (
    <div className="space-y-5">
      <Seo locale={locale} route={{ kind: "legal", page }} />

      <Link
        to={homePath(locale)}
        className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft size={16} />
        {t("shell.back")}
      </Link>

      <Panel>
        <article className="space-y-6">
          <header className="space-y-1.5">
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {doc.title}
            </h1>
            <p className="text-xs text-ink-faint">
              {t("legal.updated", { date: doc.lastUpdated })}
            </p>
          </header>

          {doc.intro.map((p, i) => (
            <p key={i} className="leading-relaxed text-ink-muted">
              {p}
            </p>
          ))}

          {doc.sections.map((section, si) => (
            <section key={si} className="space-y-2.5">
              <h2 className="font-display text-lg font-semibold text-white">
                {section.heading}
              </h2>
              {section.blocks.map((block, bi) => (
                <Block key={bi} block={block} />
              ))}
            </section>
          ))}
        </article>
      </Panel>
    </div>
  );
}

/** Wrapper para la ruta /:lang/terms. */
export function TermsPage() {
  return <LegalPage page="terms" />;
}

/** Wrapper para la ruta /:lang/privacy. */
export function PrivacyPage() {
  return <LegalPage page="privacy" />;
}
