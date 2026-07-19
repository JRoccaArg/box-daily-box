import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStats } from "@/context/StatsContext";
import { useI18n } from "@/context";
import { StatsModal } from "./StatsModal";
import { IdentityModal } from "./IdentityModal";
import { LanguageSelector } from "./LanguageSelector";
import { Stat as StatIcon, Flame, Check } from "@/components/ui/Icon";
import { on, Events } from "@/lib/events";
import { homePath } from "@/lib/routes";
import { useMounted } from "@/lib/useMounted";
import { GAMES } from "@/components/games/registry";
import type { Locale } from "@/i18n";

/** Fecha legible en el idioma actual. */
function readableDate(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

/** Logo: chevron de velocidad + wordmark. */
function Wordmark({ label, locale }: { label: string; locale: Locale }) {
  return (
    <Link to={homePath(locale)} className="group inline-flex items-center gap-2.5" aria-label={label}>
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M3 4l7 8-7 8h5l7-8-7-8z" className="fill-racing" />
        <path d="M11 4l7 8-7 8h3l7-8-7-8z" className="fill-white/85" />
      </svg>
      <span className="font-display text-lg font-extrabold uppercase leading-none tracking-tight text-white">
        Box Daily
        <span className="ml-1 align-top font-mono text-[10px] font-medium tracking-widest text-racing-400">
          BOX
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const { summary, playedStatus } = useStats();
  const { t, locale } = useI18n();
  const [statsOpen, setStatsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // La fecha de "hoy" difiere entre el momento del prerender (build) y la
  // visita real: se muestra solo tras montar para no generar mismatch de
  // hidratación (el HTML prerenderizado no incluye esta fecha).
  const mounted = useMounted();

  // Progreso del día: cuántos de los juegos ya se jugaron hoy. Solo tras
  // montar (lee localStorage): en el HTML prerenderizado no existe.
  const totalGames = GAMES.length;
  const playedToday = mounted
    ? GAMES.reduce((n, g) => (playedStatus(g.id) ? n + 1 : n), 0)
    : 0;
  const allDone = mounted && playedToday === totalGames;

  // Escuchar el evento global para abrir el modal de stats desde cualquier
  // lugar de la app (ej: botón "Ver ranking del día" del modal de resultado).
  useEffect(() => {
    return on(Events.OPEN_STATS, () => setStatsOpen(true));
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-asphalt-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Wordmark label={t("header.home_label")} locale={locale} />

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm capitalize text-ink-muted sm:inline">
            {mounted ? readableDate(new Date(), locale) : ""}
          </span>

          {mounted && playedToday > 0 && (
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold",
                allDone
                  ? "border-sector-green/40 bg-sector-green/10 text-sector-green"
                  : "border-white/15 bg-white/5 text-ink-muted",
              ].join(" ")}
              title={t("header.progress", { played: playedToday, total: totalGames })}
            >
              {allDone ? <Check size={13} /> : null}
              {playedToday}/{totalGames}
            </span>
          )}

          {summary.currentStreak > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-sector-yellow/30 bg-sector-yellow/10 px-2.5 py-1 font-mono text-xs font-semibold text-sector-yellow"
              title={t("header.streak_title", { count: summary.currentStreak })}
            >
              <Flame size={13} />
              {summary.currentStreak}
            </span>
          )}

          <LanguageSelector />

          <button
            onClick={() => setProfileOpen(true)}
            aria-label={t("header.profile_label")}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-ink transition-colors hover:border-white/25 hover:bg-white/5"
          >
            <span className="text-lg">👤</span>
          </button>

          <button
            onClick={() => setStatsOpen(true)}
            aria-label={t("header.stats_label")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-ink transition-colors hover:border-white/25 hover:bg-white/5"
          >
            <StatIcon size={16} />
            <span className="hidden sm:inline">{t("header.stats")}</span>
          </button>
        </div>
      </div>

      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
      <IdentityModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
