// src/components/layout/RankBadge.tsx
//
// Muestra la posición del usuario en el ranking diario global.
//
// Reglas de negocio:
//  - Solo aparece si el usuario TIENE puntos ese día (rank !== null).
//  - Si no rankea (0 puntos, multicuentas bloqueadas por IP, etc.) → no se muestra.
//  - Se refresca cuando cambian los stats (evento STATS_CHANGED).

import { useEffect, useState } from "react";
import { apiGetUserRank } from "@/lib/api";
import { getIdentity } from "@/lib/identity";
import { dateKey } from "@/lib/seed";
import { on, Events } from "@/lib/events";

type RankBadgeProps = {
  /** Variante visual: "inline" (pequeño) o "block" (destacado). */
  variant?: "inline" | "block";
};

export function RankBadge({ variant = "block" }: RankBadgeProps) {
  const [rank, setRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRank = () => {
    const { userId } = getIdentity();
    if (!userId) {
      setLoading(false);
      return;
    }
    const today = dateKey(new Date());
    (async () => {
      const r = await apiGetUserRank(userId, today);
      if (r) {
        setRank(r.rank);
        setTotalPlayers(r.totalPlayers);
      }
      setLoading(false);
    })();
  };

  useEffect(() => {
    fetchRank();
    // Suscribirse a cambios de stats para refrescar la posición cuando
    // se completa un juego (o cuando sync trae datos nuevos).
    return on(Events.STATS_CHANGED, fetchRank);
  }, []);

  // No mostrar nada mientras carga, si no rankea, o si el usuario no jugó.
  if (loading || rank === null) return null;

  if (variant === "inline") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-racing/30 bg-racing/10 px-2.5 py-1 font-mono text-xs font-semibold text-racing"
        title={`Posición en el ranking diario de ${totalPlayers} jugadores`}
      >
        <span aria-hidden>🏆</span>
        Puesto #{rank}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-racing/30 bg-racing/10 px-4 py-3">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-ink-faint">
          Tu posición hoy
        </p>
        <p className="mt-0.5 font-display text-2xl text-ink">
          Puesto #{rank}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[11px] uppercase tracking-wider text-ink-faint">
          Ranking mundial
        </p>
        <p className="mt-0.5 tnum text-sm text-ink-muted">
          de {totalPlayers.toLocaleString("es-AR")}
        </p>
      </div>
    </div>
  );
}
