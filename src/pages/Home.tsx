import { Link } from "react-router-dom";
import type { GameDefinition, DailyGameResult } from "@/types";
import { GAMES } from "@/components/games/registry";
import { useStats } from "@/context/StatsContext";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Check, Flag as FlagIcon, ChevronRight, Flame, Trophy } from "@/components/ui/Icon";
import { RankBadge } from "@/components/layout/RankBadge";
import { Seo } from "@/components/layout/Seo";
import { gamePath } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";
import { useMounted } from "@/lib/useMounted";

/** Pagina principal: lista de los retos del dia con su estado. */
export function Home() {
  const { resultFor, summary } = useStats();
  const { locale, t } = useI18n();

  const results = GAMES.map((g) => ({ game: g, result: resultFor(g.id) }));
  const done = results.filter((r) => r.result).length;
  const total = GAMES.length;

  return (
    <div className="space-y-6">
      <Seo
        locale={locale}
        route={{ kind: "home" }}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Box Daily Box",
          url: SITE_URL,
          description: t("seo.home.description"),
          applicationCategory: "GameApplication",
          genre: "Puzzle Game",
          operatingSystem: "Web Browser",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          isAccessibleForFree: true,
          inLanguage: locale,
        }}
      />
      <Hero done={done} total={total} streak={summary.currentStreak} />

      {/* Posición del usuario en el ranking diario global.
          Se muestra solo si el usuario tiene puntos (rank !== null). */}
      <RankBadge />

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map(({ game, result }) => (
          <GameCard key={game.id} game={game} result={result} />
        ))}
      </div>
    </div>
  );
}

function Hero({ done, total, streak }: { done: number; total: number; streak: number }) {
  const { t } = useI18n();
  // El progreso/racha es dato PERSONAL (localStorage), no contenido SEO. Se
  // oculta hasta montar para que no quede horneado en el HTML prerenderizado
  // (Google lo tomaba como snippet: "0 de 6 completados" en vez de la
  // descripción real de la página) y para evitar mismatch de hidratación.
  const mounted = useMounted();
  const allDone = done === total;
  const countWord = t(`home.num.${total}`) || String(total);
  const dayLabel = streak === 1 ? t("home.day_singular") : t("home.day_plural");

  return (
    <Panel>
      <div className="speed-bar mb-1 pl-1">
        <p className="eyebrow">{t("home.eyebrow")}</p>
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {t("home.title", { count: countWord })}
      </h1>
      <p className="mt-2 max-w-prose text-ink-muted">
        {t("home.subtitle")}
      </p>

      {mounted && (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium",
              allDone
                ? "border-sector-green/40 bg-sector-green/10 text-sector-green"
                : "border-white/10 bg-asphalt-700 text-ink-muted",
            ].join(" ")}
          >
            {allDone ? <Trophy size={15} /> : <Check size={15} />}
            {t("home.completed", { done, total })}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-racing/30 bg-racing/10 px-3 py-1.5 text-sm font-medium text-racing-400">
              <Flame size={15} />
              {t("home.streak", { count: streak, day: dayLabel })}
            </span>
          )}
        </div>
      )}
    </Panel>
  );
}

function GameCard({
  game,
  result,
}: {
  game: GameDefinition;
  result: DailyGameResult | null;
}) {
  const { t, locale } = useI18n();
  const won = result?.status === "won";
  const lost = result?.status === "lost";

  return (
    <Link
      to={gamePath(locale, game.id)}
      className="group block rounded-2xl border border-white/10 bg-asphalt-800 p-4 transition-colors hover:border-white/25 hover:bg-asphalt-700 focus-visible:border-racing/50"
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-bold tracking-tight",
            won
              ? "border-sector-green/40 bg-sector-green/10 text-sector-green"
              : lost
                ? "border-racing/40 bg-racing/10 text-racing-400"
                : "border-white/10 bg-asphalt-700 text-ink-muted",
          ].join(" ")}
          aria-hidden="true"
        >
          {game.glyph}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold tracking-tight text-white">
            {t(`game.${game.id}.name`)}
          </h2>
          <p className="mt-0.5 text-sm leading-snug text-ink-muted">
            {t(`game.${game.id}.tagline`)}
          </p>
        </div>

        <ChevronRight
          size={18}
          className="mt-1 shrink-0 text-ink-faint transition-colors group-hover:text-ink"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <StatusTag won={won} lost={lost} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          {result ? t("home.come_back") : t("home.play_now")}
        </span>
      </div>
    </Link>
  );
}

function StatusTag({ won, lost }: { won: boolean; lost: boolean }) {
  const { t } = useI18n();
  if (won) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-sector-green">
        <Check size={15} />
        {t("home.solved")}
      </span>
    );
  }
  if (lost) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-racing-400">
        <FlagIcon size={15} />
        {t("home.played")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted">
      <span className="h-2 w-2 rounded-full bg-sector-purple" aria-hidden="true" />
      {t("home.unplayed")}
    </span>
  );
}
