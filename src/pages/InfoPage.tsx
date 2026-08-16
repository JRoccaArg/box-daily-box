// src/pages/InfoPage.tsx
//
// Página informativa "Cómo jugar" (Roadmap #7). A diferencia de las páginas
// legales, ESTA sí se indexa en Google en los 14 idiomas: incluye JSON-LD
// FAQPage para potenciar rich snippets. Reutiliza al máximo claves i18n YA
// traducidas en toda la app (nombre/tagline de cada juego, etiquetas y pistas
// de dificultad, la fórmula de puntaje) para no duplicar textos que podrían
// divergir; el contenido nuevo (traducido en los 14 idiomas) vive en
// `src/content/info`.

import { Link } from "react-router-dom";
import { Seo } from "@/components/layout/Seo";
import { Panel } from "@/components/ui/Panel";
import { ChevronLeft } from "@/components/ui/Icon";
import { useI18n } from "@/context";
import { homePath, gamePath } from "@/lib/routes";
import { GAMES } from "@/components/games/registry";
import { BASE_POINTS } from "@/lib/scoring";
import { getInfoContent } from "@/content/info";
import type { InfoGameId } from "@/content/info";

const DIFFICULTIES = ["facil", "medio", "dificil", "leyenda"] as const;

export function InfoPage() {
  const { locale, t } = useI18n();
  const info = getInfoContent(locale);

  return (
    <div className="space-y-5">
      <Seo
        locale={locale}
        route={{ kind: "info" }}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: info.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <Link
        to={homePath(locale)}
        className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft size={16} />
        {t("shell.back")}
      </Link>

      <Panel>
        <article className="space-y-8">
          <header className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {info.title}
            </h1>
            <p className="leading-relaxed text-ink-muted">{info.subtitle}</p>
            <p className="rounded-lg border border-white/10 bg-asphalt-700 px-3 py-2 text-xs leading-relaxed text-ink-muted">
              {info.dataAsOfNote}
            </p>
          </header>

          {/* Los 6 juegos */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              {info.gamesHeading}
            </h2>
            <p className="leading-relaxed text-ink-muted">{info.gamesIntro}</p>
            <div className="space-y-4">
              {GAMES.map((game) => (
                <div key={game.id} className="border-t border-white/5 pt-4 first:border-0 first:pt-0">
                  <Link
                    to={gamePath(locale, game.id)}
                    className="font-display text-base font-semibold text-white hover:text-racing-400"
                  >
                    {t(`game.${game.id}.name`)}
                  </Link>
                  <p className="mt-1 text-sm italic text-ink-faint">
                    {t(`game.${game.id}.tagline`)}
                  </p>
                  <p className="mt-1.5 leading-relaxed text-ink-muted">
                    {info.gameDetail[game.id as InfoGameId]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Dificultades */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              {info.difficultyHeading}
            </h2>
            <p className="leading-relaxed text-ink-muted">{info.difficultyIntro}</p>
            <ul className="space-y-1.5">
              {DIFFICULTIES.map((d) => (
                <li key={d} className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">{t(`diff.${d}`)}</span>
                  {" — "}
                  {t(`diff.hint.${d}`)}
                </li>
              ))}
            </ul>
          </section>

          {/* Puntaje */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              {info.scoringHeading}
            </h2>
            <p className="leading-relaxed text-ink-muted">{info.scoringIntro}</p>
            <p className="leading-relaxed text-ink-muted">
              {t("monthly.scoring_body", {
                easy: BASE_POINTS.facil,
                medium: BASE_POINTS.medio,
                hard: BASE_POINTS.dificil,
                legend: BASE_POINTS.leyenda,
              })}
            </p>
          </section>

          {/* Ranking */}
          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-semibold text-white">
              {info.rankingHeading}
            </h2>
            {info.rankingBody.map((p, i) => (
              <p key={i} className="leading-relaxed text-ink-muted">
                {p}
              </p>
            ))}
          </section>

          {/* Badges */}
          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-semibold text-white">
              {info.badgesHeading}
            </h2>
            {info.badgesBody.map((p, i) => (
              <p key={i} className="leading-relaxed text-ink-muted">
                {p}
              </p>
            ))}
          </section>

          {/* Racha */}
          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-semibold text-white">
              {info.streakHeading}
            </h2>
            <p className="leading-relaxed text-ink-muted">{info.streakBody}</p>
          </section>

          {/* Amigos y duelos */}
          <section className="space-y-2.5">
            <h2 className="font-display text-lg font-semibold text-white">
              {info.duelsHeading}
            </h2>
            {info.duelsBody.map((p, i) => (
              <p key={i} className="leading-relaxed text-ink-muted">
                {p}
              </p>
            ))}
          </section>

          {/* FAQ (también alimenta el JSON-LD de arriba) */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">FAQ</h2>
            <div className="space-y-3">
              {info.faq.map((item, i) => (
                <div key={i}>
                  <h3 className="font-medium text-ink">{item.q}</h3>
                  <p className="mt-0.5 leading-relaxed text-ink-muted">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </Panel>
    </div>
  );
}
