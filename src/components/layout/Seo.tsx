// src/components/layout/Seo.tsx
//
// Inyecta el <head> de la página actual (title/meta/canonical/hreflang).
// Se usa TANTO en el prerender (hornea el HTML estático por idioma×ruta)
// COMO en la navegación client-side (mantiene todo actualizado al cambiar
// de idioma o de juego sin recargar). Basado en <Head> de vite-react-ssg
// (wrapper de react-helmet), funciona igual en ambos casos.

import { Head } from "vite-react-ssg";
import type { Locale } from "@/i18n";
import { buildSeo, dirFor, ogLocaleFor, SITE_URL, type SeoRoute } from "@/lib/seo";

type SeoProps = {
  locale: Locale;
  route: SeoRoute;
  /** JSON-LD adicional (solo se usa en home por ahora). */
  jsonLd?: Record<string, unknown>;
};

export function Seo({ locale, route, jsonLd }: SeoProps) {
  const seo = buildSeo(locale, route);

  return (
    <Head defer={false}>
      <html lang={locale} dir={dirFor(locale)} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={seo.noindex ? "noindex, follow" : "index, follow"} />
      <link rel="canonical" href={seo.canonical} />

      {/* hreflang: solo idiomas con traducción completa (evita contenido delgado indexado) */}
      {seo.alternates.map((alt) => (
        <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/`} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.canonical} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Box Daily Box" />
      <meta property="og:locale" content={ogLocaleFor(locale)} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.ogImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Head>
  );
}
