import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import type { RouteRecord } from "vite-react-ssg";
import { I18nProvider } from "@/context";
import { StatsProvider } from "@/context";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { GamePage } from "@/pages/GamePage";
import { DuelPage } from "@/pages/DuelPage";
import { ChallengePage } from "@/pages/ChallengePage";
import { TermsPage, PrivacyPage } from "@/pages/LegalPage";
import { InfoPage } from "@/pages/InfoPage";
import { ContactPage } from "@/pages/ContactPage";
import { AuthCallback } from "@/pages/AuthCallback";
import { RootRedirect } from "@/pages/RootRedirect";
import { RankingPage } from "@/pages/v2/RankingPage";
import { AccessPage } from "@/pages/v2/AccessPage";
import { ProfilePage } from "@/pages/v2/ProfilePage";
import { AchievementsPage } from "@/pages/v2/AchievementsPage";
import { FriendsPage } from "@/pages/v2/FriendsPage";
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
      // Sin getStaticPaths: el duelId es dinámico, no existe en build-time.
      // vercel.json reescribe esta ruta al HTML ya generado de "/:lang" para
      // que el link de invitación no dé 404 al abrirse en frío; el router
      // client-side monta DuelPage normalmente después de hidratar.
      { path: "duelo/:duelId", Component: DuelPage },
      // Desafío por link: mismo tratamiento que el duelo (id dinámico, sin
      // prerender, reescrito por vercel.json al HTML de "/:lang").
      { path: "reto/:challengeId", Component: ChallengePage },
      // Páginas legales (Roadmap #6). Rutas estáticas: se prerenderizan una vez
      // por idioma (la matriz de locales viene del getStaticPaths del padre).
      // Van con noindex (ver buildSeo), no entran al sitemap.
      { path: "terms", Component: TermsPage },
      { path: "privacy", Component: PrivacyPage },
      // Página de info / cómo jugar (Roadmap #7). A diferencia de las legales,
      // SÍ se indexa y entra al sitemap (contenido propio en los 14 idiomas).
      { path: "info", Component: InfoPage },
      // Página de contacto (mail para reportes/ideas). Se indexa igual que info.
      { path: "contact", Component: ContactPage },
      // Páginas de cuenta del rediseño v2 (antes eran modales). Se prerenderiza
      // solo el "cascarón" por idioma: los datos son de quien mira y se cargan
      // en el cliente. noindex y fuera del sitemap (ver buildSeo).
      { path: "ranking", Component: RankingPage },
      { path: "acceso", Component: AccessPage },
      { path: "perfil", Component: ProfilePage },
      { path: "perfil/logros", Component: AchievementsPage },
      { path: "perfil/amigos", Component: FriendsPage },
    ],
  },
  // "/" (x-default): redirige al idioma preferido. Se prerenderiza con
  // contenido real (enlaces a todos los idiomas) para crawlers/no-JS.
  { path: "/", Component: RootRedirect },
  // Link PÚBLICO de un desafío, sin idioma (es lo que se comparte): RootRedirect
  // lo manda a "/<idioma de quien lo abre>/reto/<id>".
  { path: "/reto/:challengeId", Component: RootRedirect },
  { path: "*", Component: RootRedirect },
];
