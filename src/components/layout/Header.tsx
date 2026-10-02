import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStats } from "@/context/StatsContext";
import { useI18n } from "@/context";
import { LivesModal } from "./LivesModal";
import { LanguageSelector } from "./LanguageSelector";
import { SoundSettings } from "./SoundSettings";
import { Stat as StatIcon, Flame, Heart } from "@/components/ui/Icon";
import { on, Events } from "@/lib/events";
import { runNavGuard } from "@/lib/navGuard";
import { homePath, rankingPath, profilePath, accessPath, friendsPath, achievementsPath } from "@/lib/routes";
import { useLocalIdentity } from "@/hooks/useLocalIdentity";
import { useMounted } from "@/lib/useMounted";
import { getEffectiveNow } from "@/lib/debugDate";
import { usePendingFriendRequestsCount } from "@/lib/friendsPolling";
import { useUnseenAchievementsCount } from "@/lib/achievements";
import { useLives } from "@/hooks/useLives";
import { getStreakVisual } from "@/lib/streakVisual";
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
    <Link
      to={homePath(locale)}
      // Si una pantalla registró un guard (hoy: un duelo en curso), tocar el
      // logo abre su cartel de confirmación en vez de navegar y abandonar en
      // silencio. Sin guard activo, navega normal.
      onClick={(e) => {
        if (runNavGuard()) e.preventDefault();
      }}
      className="group inline-flex items-center gap-2.5"
      aria-label={label}
    >
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
  const navigate = useNavigate();
  const identity = useLocalIdentity();
  const { summary } = useStats();
  const { t, locale } = useI18n();
  const [livesOpen, setLivesOpen] = useState(false);
  const { pathname } = useLocation();
  const pendingRequests = usePendingFriendRequestsCount();
  const unseenAchievements = useUnseenAchievementsCount();
  const { lives } = useLives();
  // El acceso a estadísticas prioriza solicitudes de amigos y logros nuevos.
  const statsBadgeCount = pendingRequests + unseenAchievements;

  // La fecha de "hoy" difiere entre el momento del prerender (build) y la
  // visita real: se muestra solo tras montar para no generar mismatch de
  // hidratación (el HTML prerenderizado no incluye esta fecha).
  const mounted = useMounted();
  const streakVisual = getStreakVisual(summary.currentStreak);

  // Pulso decorativo de "ganaste una vida" (LivesToastWatcher ya disparó el
  // toast; esto solo anima el corazoncito un instante). `animate-pop` es la
  // misma animación de 0.18s que ya usa el resto de la web, respeta
  // prefers-reduced-motion vía la regla global de src/index.css.
  const [celebrate, setCelebrate] = useState(false);
  const celebrateTimeout = useRef<number | undefined>(undefined);
  useEffect(() => {
    return on(Events.LIFE_GAINED, () => {
      window.clearTimeout(celebrateTimeout.current);
      setCelebrate(true);
      celebrateTimeout.current = window.setTimeout(() => setCelebrate(false), 400);
    });
  }, []);
  useEffect(() => () => window.clearTimeout(celebrateTimeout.current), []);

  // Los resultados de juegos conservan su evento y abren el nuevo ranking.
  useEffect(() => {
    return on(Events.OPEN_STATS, () => {
      if (!runNavGuard()) navigate(rankingPath(locale));
    });
  }, [locale, navigate]);

  // Cerrar los modales al navegar. Header vive dentro de Layout, que NO se
  // desmonta al cambiar de ruta hija (home ↔ juego ↔ duelo) — sin esto, un
  // modal abierto (ej. StatsModal desde el celu) quedaba encima de la
  // pantalla nueva tras aceptar un duelo desde el banner, tapándola. Cubre
  // cualquier navegación futura, no solo la de duelos.
  useEffect(() => {
    setLivesOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-asphalt-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Wordmark label={t("header.home_label")} locale={locale} />

        <div className="flex items-center gap-1.5 sm:gap-3">
          <span className="hidden text-sm capitalize text-ink-muted sm:inline">
            {mounted ? readableDate(getEffectiveNow(), locale) : ""}
          </span>

          {summary.currentStreak > 0 && (
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold",
                streakVisual.chipClass,
              ].join(" ")}
              title={t("header.streak_title", { count: summary.currentStreak })}
            >
              <Flame size={13} className={streakVisual.flameClass} />
              {summary.currentStreak}
            </span>
          )}

          {/* Vidas extra (Etapa 5). `lives` es null hasta tener una
              identidad real (nadie jugó todavía): recién ahí "0 vidas"
              significa algo. Con saldo se ve en violeta; en 0, atenuado. */}
          {mounted && lives && lives.balance > 0 && (
            <button
              onClick={() => setLivesOpen(true)}
              aria-label={t("lives.header_label", { count: lives.balance })}
              title={t("lives.header_label", { count: lives.balance })}
              className={[
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold transition-[background-color,border-color,transform] duration-150 active:scale-95",
                lives.balance > 0
                  ? "border-sector-purple/40 bg-sector-purple/10 text-sector-purple hover:border-sector-purple/60 hover:bg-sector-purple/15"
                  : "border-white/10 bg-asphalt-700 text-ink-faint hover:border-white/25",
                celebrate && "animate-pop",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Heart size={13} />
              {lives.balance}
            </button>
          )}

          <SoundSettings />
          <LanguageSelector />

          <button
            onClick={() => { if (!runNavGuard()) navigate(identity?.hasToken ? profilePath(locale) : accessPath(locale)); }}
            aria-label={t("header.profile_label")}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-ink transition-[background-color,border-color,transform] duration-150 active:scale-95 hover:border-white/25 hover:bg-white/5"
          >
            <span className="text-lg">👤</span>
          </button>

          <button
            onClick={() => {
              // Prioridad al saltar de pestaña: una solicitud de amistad es
              // ACCIONABLE (alguien espera una respuesta); un logro no visto
              // es solo un aviso. Si hay de las dos, gana amigos — el logro
              // sigue con su punto en la pestaña hasta que se lo mire.
              if (!runNavGuard()) navigate(pendingRequests > 0 ? friendsPath(locale) : unseenAchievements > 0 ? achievementsPath(locale) : profilePath(locale));
            }}
            aria-label={t("header.stats_label")}
            className="relative inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-ink transition-[background-color,border-color,transform] duration-150 active:scale-95 hover:border-white/25 hover:bg-white/5"
          >
            <StatIcon size={16} />
            <span className="hidden sm:inline">{t("header.stats")}</span>
            {statsBadgeCount > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-racing px-1 font-mono text-[10px] font-bold leading-none text-white"
                aria-label={
                  pendingRequests > 0 && unseenAchievements > 0
                    ? t("header.notifications_badge", { count: statsBadgeCount })
                    : pendingRequests > 0
                      ? t("header.pending_requests", { count: pendingRequests })
                      : t("header.unseen_achievements", { count: unseenAchievements })
                }
              >
                {statsBadgeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <LivesModal open={livesOpen} onClose={() => setLivesOpen(false)} lives={lives} />
    </header>
  );
}
