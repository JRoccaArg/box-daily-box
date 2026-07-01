import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiGetMonthlyRanking,
  apiGetDailyRanking,
  type RankingEntry,
} from "@/lib/api";
import { getIdentity } from "@/lib/identity";
import { NATIONALITIES } from "@/data/nationalities";
import { Trophy } from "@/components/ui/Icon";

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

type Tab = "monthly" | "daily";

/** Ranking global que consume la API del servidor. */
export function GlobalRanking({ refreshKey }: { refreshKey?: number }) {
  const [tab, setTab] = useState<Tab>("daily");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { userId } = getIdentity();
  const now = new Date();
  const monthName = MONTHS_ES[now.getMonth()] ?? "";

  // Lista de paises para el filtro (solo los que tienen nombre).
  const countries = useMemo(() => {
    return Object.values(NATIONALITIES)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const country = countryFilter || undefined;
      const data =
        tab === "monthly"
          ? await apiGetMonthlyRanking(undefined, country)
          : await apiGetDailyRanking(undefined, country);

      if (data) {
        setEntries(data.top);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [tab, countryFilter]);

  // Refrescar cuando cambia tab, pais, o refreshKey.
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  return (
    <section className="rounded-xl border border-white/10 bg-gradient-to-b from-asphalt-700 to-asphalt-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} />
          <h3 className="font-display text-sm uppercase tracking-wide text-ink">
            Ranking Global
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex gap-1 rounded-lg border border-white/10 bg-asphalt-800 p-1">
        <TabBtn active={tab === "daily"} onClick={() => setTab("daily")}>
          Hoy
        </TabBtn>
        <TabBtn active={tab === "monthly"} onClick={() => setTab("monthly")}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </TabBtn>
      </div>

      {/* Filtro por pais */}
      <div className="mt-3">
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-asphalt-700 px-3 py-2 text-sm text-ink"
        >
          <option value="">Todos los paises</option>
          {countries.map((n) => (
            <option key={n.code} value={n.code}>
              {n.flag} {n.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contenido */}
      <div className="mt-3">
        {loading && (
          <p className="py-6 text-center text-sm text-ink-faint">Cargando ranking...</p>
        )}

        {error && !loading && (
          <div className="py-6 text-center">
            <p className="text-sm text-ink-faint">No se pudo cargar el ranking</p>
            <button
              onClick={fetchData}
              className="mt-2 text-xs text-racing-400 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-faint">
            {tab === "daily"
              ? "Nadie jugo hoy todavia. Se el primero!"
              : "Sin resultados este mes."}
          </p>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="space-y-1.5">
            {entries.map((entry) => {
              const isMe = entry.userId === userId;
              const flag = entry.countryCode
                ? (NATIONALITIES[entry.countryCode]?.flag ?? "🏁")
                : "🏁";

              return (
                <div
                  key={entry.userId}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    isMe
                      ? "border border-racing/30 bg-racing/10"
                      : "border border-transparent bg-asphalt-700/50",
                  ].join(" ")}
                >
                  {/* Posicion */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-asphalt-600 text-xs font-bold text-ink-muted">
                    {entry.rank <= 3 ? (
                      <span className={MEDAL_COLOR[entry.rank] ?? ""}>
                        {MEDAL[entry.rank] ?? entry.rank}
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </div>

                  {/* Nombre + pais */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{flag}</span>
                      <span
                        className={[
                          "truncate text-sm font-medium",
                          isMe ? "text-white" : "text-ink",
                        ].join(" ")}
                      >
                        {entry.displayName || "Anónimo"}
                        {isMe && (
                          <span className="ml-1.5 text-xs text-racing-400">(vos)</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-ink-faint">
                      {entry.gamesWon} {entry.gamesWon === 1 ? "reto" : "retos"} ganados
                    </span>
                  </div>

                  {/* Puntos */}
                  <div className="text-right">
                    <span className="tnum font-display text-lg font-bold text-white">
                      {entry.points}
                    </span>
                    <span className="ml-1 text-xs text-ink-faint">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        {tab === "monthly"
          ? "El ranking mensual se reinicia el 1 de cada mes."
          : "El ranking diario muestra los resultados de hoy."}
      </p>
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-asphalt-600 text-white"
          : "text-ink-faint hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_COLOR: Record<number, string> = {
  1: "text-lg",
  2: "text-lg",
  3: "text-lg",
};
