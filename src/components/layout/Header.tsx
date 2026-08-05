import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStats } from "@/context/StatsContext";
import { useI18n } from "@/context";
import { StatsModal } from "./StatsModal";
import { IdentityModal } from "./IdentityModal";
import { LanguageSelector } from "./LanguageSelector";
import { SoundSettings } from "./SoundSettings";
import { Stat as StatIcon, Flame } from "@/components/ui/Icon";
import { on, Events } from "@/lib/events";
import { runNavGuard } from "@/lib/navGuard";
import { homePath } from "@/lib/routes";
import { useMounted } from "@/lib/useMounted";
import { getEffectiveNow } from "@/lib/debugDate";
import { usePendingFriendRequestsCount } from "@/lib/friendsPolling";
import type { Locale } from "@/i18n";
import type { StatsView } from "./StatsModal";

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
  const { summary } = useStats();
  const { t, locale } = useI18n();
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsInitialView, setStatsInitialView] = useState<StatsView | undefined>(undefined);
  const [profileOpen, setProfileOpen] = useState(false);
  const { pathname } = useLocation();
  const pendingRequests = usePendingFriendRequestsCount();

  // La fecha de "hoy" difiere entre el momento del prerender (build) y la
  // visita real: se muestra solo tras montar para no generar mismatch de
  // hidratación (el HTML prerenderizado no incluye esta fecha).
  const mounted = useMounted();

  // Escuchar el evento global para abrir el modal de stats desde cualquier
  // lugar de la app (ej: botón "Ver ranking del día" del modal de resultado).
  // Este camino siempre abre en la pestaña por defecto (Ranking Global): el
  // salto directo a "Amigos" es solo para cuando se toca el botón CON el
  // globito de notificaciones visible (ver el botón mas abajo).
  useEffect(() => {
    return on(Events.OPEN_STATS, () => {
      setStatsInitialView(undefined);
      setStatsOpen(true);
    });
  }, []);

  // Cerrar los modales al navegar. Header vive dentro de Layout, que NO se
  // desmonta al cambiar de ruta hija (home ↔ juego ↔ duelo) — sin esto, un
  // modal abierto (ej. StatsModal desde el celu) quedaba encima de la
  // pantalla nueva tras aceptar un duelo desde el banner, tapándola. Cubre
  // cualquier navegación futura, no solo la de duelos.
  useEffect(() => {
    setStatsOpen(false);
    setProfileOpen(false);
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
              className="inline-flex items-center gap-1 rounded-full border border-sector-yellow/30 bg-sector-yellow/10 px-2.5 py-1 font-mono text-xs font-semibold text-sector-yellow"
              title={t("header.streak_title", { count: summary.currentStreak })}
            >
              <Flame size={13} />
              {summary.currentStreak}
            </span>
          )}

          <SoundSettings />
          <LanguageSelector />

          <button
            onClick={() => setProfileOpen(true)}
            aria-label={t("header.profile_label")}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-ink transition-colors hover:border-white/25 hover:bg-white/5"
          >
            <span className="text-lg">👤</span>
          </button>

          <button
            onClick={() => {
              // Si hay solicitudes de amistad sin responder, saltar directo
              // a esa pestaña (es lo que el globito esta avisando).
              setStatsInitialView(pendingRequests > 0 ? "friends" : undefined);
              setStatsOpen(true);
            }}
            aria-label={t("header.stats_label")}
            className="relative inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-ink transition-colors hover:border-white/25 hover:bg-white/5"
          >
            <StatIcon size={16} />
            <span className="hidden sm:inline">{t("header.stats")}</span>
            {pendingRequests > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-racing px-1 font-mono text-[10px] font-bold leading-none text-white"
                aria-label={t("header.pending_requests", { count: pendingRequests })}
              >
                {pendingRequests}
              </span>
            )}
          </button>
        </div>
      </div>

      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} initialView={statsInitialView} />
      <IdentityModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
