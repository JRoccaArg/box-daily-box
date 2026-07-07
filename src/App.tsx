import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import type { RouteRecord } from "vite-react-ssg";
import { I18nProvider } from "@/context";
import { StatsProvider } from "@/context";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { GamePage } from "@/pages/GamePage";
import { AuthCallback } from "@/pages/AuthCallback";
import { RootRedirect } from "@/pages/RootRedirect";
import { GAMES } from "@/components/games/registry";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/types";
import { getStoredLocale } from "@/i18n";

function isLocale(s: string | undefined): s is Locale {
  return !!s && (SUPPORTED_LOCALES as readonly string[]).includes(s);
}

/**
 * Layout de un idioma (/:lang/*). Valida el segmento contra los idiomas
 * soportados (si es inválido, redirige a "/" para que RootRedirect resuelva
 * el idioma correcto) y provee I18n + Stats + el marco visual comun.
 */
// eslint-disable-next-line react-refresh/only-export-components -- este archivo también exporta `routes` (dato, no componente); patrón ya usado en context/StatsContext.tsx.
function LangRoot() {
  const { lang } = useParams<{ lang: string }>();
  if (!isLocale(lang)) {
    return <Navigate to="/" replace />;
  }
  return (
    <I18nProvider locale={lang}>
      <StatsProvider>
        <Layout>
          <Outlet />
        </Layout>
      </StatsProvider>
    </I18nProvider>
  );
}

/**
 * /auth/callback no tiene prefijo de idioma (Google no lo necesita). Usa el
 * idioma guardado localmente; arranca en "en" (determinista para el prerender)
 * y se actualiza al real tras montar, ya que esta pantalla es transitoria
 * (redirige sola) y nunca se indexa.
 */
// eslint-disable-next-line react-refresh/only-export-components -- ver nota en LangRoot.
function AuthCallbackRoot() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);
  return (
    <I18nProvider locale={locale}>
      <AuthCallback />
    </I18nProvider>
  );
}

/**
 * Árbol de rutas usado tanto por el router del cliente como por el prerender
 * (vite-react-ssg). `getStaticPaths` en cada segmento dinámico determina la
 * matriz idioma×página que se genera como HTML estático en el build.
 *
 * Los componentes de juego (GameShell, registry, lógica en components/games)
 * no cambian: solo cambia de dónde sale el prefijo de idioma en la URL.
 */
export const routes: RouteRecord[] = [
  { path: "/auth/callback", Component: AuthCallbackRoot },
  {
    path: "/:lang",
    Component: LangRoot,
    getStaticPaths: () => [...SUPPORTED_LOCALES],
    children: [
      { index: true, Component: Home },
      {
        path: "juego/:gameId",
        Component: GamePage,
        getStaticPaths: () => GAMES.map((g) => `juego/${g.id}`),
      },
    ],
  },
  // "/" (x-default): redirige al idioma preferido. Se prerenderiza con
  // contenido real (enlaces a todos los idiomas) para crawlers/no-JS.
  { path: "/", Component: RootRedirect },
  { path: "*", Component: RootRedirect },
];
