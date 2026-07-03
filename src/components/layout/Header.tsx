import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStats } from "@/context/StatsContext";
import { StatsModal } from "./StatsModal";
import { IdentityModal } from "./IdentityModal";
import { Stat as StatIcon, Flame } from "@/components/ui/Icon";
import { on, Events } from "@/lib/events";

/** Fecha legible en espanol: "miercoles 25 de junio". */
function readableDate(d: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

/** Logo: chevron de velocidad + wordmark. */
function Wordmark() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Box Daily Box - inicio">
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
  const [statsOpen, setStatsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Escuchar el evento global para abrir el modal de stats desde cualquier
  // lugar de la app (ej: botón "Ver ranking del día" del modal de resultado).
  useEffect(() => {
    return on(Events.OPEN_STATS, () => setStatsOpen(true));
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-asphalt-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Wordmark />

        <div className="flex items-center gap-3">
          <span className="hidden text-sm capitalize text-ink-muted sm:inline">
            {readableDate(new Date())}
          </span>

          {summary.currentStreak > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-sector-yellow/30 bg-sector-yellow/10 px-2.5 py-1 font-mono text-xs font-semibold text-sector-yellow"
              title={`Racha de ${summary.currentStreak} dias`}
            >
              <Flame size={13} />
              {summary.currentStreak}
            </span>
          )}

          <button
            onClick={() => setProfileOpen(true)}
            aria-label="Editar perfil"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-ink transition-colors hover:border-white/25 hover:bg-white/5"
          >
            <span className="text-lg">👤</span>
          </button>

          <button
            onClick={() => setStatsOpen(true)}
            aria-label="Ver estadisticas"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-ink transition-colors hover:border-white/25 hover:bg-white/5"
          >
            <StatIcon size={16} />
            <span className="hidden sm:inline">Stats</span>
          </button>
        </div>
      </div>

      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
      <IdentityModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
