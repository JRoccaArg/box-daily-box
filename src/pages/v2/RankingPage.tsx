import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { V2Page } from "@/components/v2/V2Page";
import { V2Flag } from "@/components/v2/V2Flag";
import { V2Streak } from "@/components/v2/V2Streak";
import { CountryPicker } from "@/components/v2/CountryPicker";
import { InlineBadges } from "@/components/v2/InlineBadges";
import { useLocalIdentity } from "@/hooks/useLocalIdentity";
import { useV2I18n } from "@/hooks/useV2I18n";
import { apiGetRankingPage, currentPeriodKey, type RankingEntry, type RankingPage as RankingData, type RankingPeriod } from "@/lib/api";
import { homePath } from "@/lib/routes";

const LIMIT = 30;
const PERIODS: Array<{ value: RankingPeriod; label: string }> = [
 { value: "daily", label: "Hoy" }, { value: "monthly", label: "Mensual" }, { value: "annual", label: "Anual" }
];

export function RankingPage() {
 const { t, locale } = useV2I18n();
 const identity = useLocalIdentity();
 const [period, setPeriod] = useState<RankingPeriod>("daily");
 const [key, setKey] = useState("");
 const [country, setCountry] = useState("");
 const [offset, setOffset] = useState(0);
 const [data, setData] = useState<RankingData | null>(null);
 const [leader, setLeader] = useState<RankingEntry | null>(null);
 const [status, setStatus] = useState<"loading" | "ready" | "error" | "invalid">("loading");
 const [retry, setRetry] = useState(0);
 const userId = identity?.userId;
 const mounted = identity !== null;

 useEffect(() => {
  if (!mounted) return;
  let cancelled = false;
  let busy = false;
  setData(null);
  if (period === "annual" && key && !/^(?!0000)\d{4}$/.test(key)) {
   setLeader(null);
   setStatus("invalid");
   return;
  }
  setStatus("loading");
  const load = async () => {
   if (busy) return;
   busy = true;
   const options = { key: key || currentPeriodKey(period), country, limit: LIMIT, offset, userId };
   const [page, first] = await Promise.all([
    apiGetRankingPage(period, options),
    offset > 0 ? apiGetRankingPage(period, { ...options, limit: 1, offset: 0 }) : Promise.resolve(null)
   ]);
   busy = false;
   if (cancelled) return;
   if (!page) { setStatus("error"); return; }
   // A removal can make the final page disappear between visits.
   if (offset > 0 && offset >= page.total) { setOffset(Math.max(0, Math.floor((page.total - 1) / LIMIT) * LIMIT)); return; }
   setData(page);
   setLeader(offset === 0 ? page.top[0] ?? null : first?.top[0] ?? null);
   setStatus("ready");
  };
  void load();
  const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 30_000);
  return () => { cancelled = true; window.clearInterval(timer); };
 }, [period, key, country, offset, userId, retry, mounted]);

 const number = (n: number) => n.toLocaleString(locale);
 const activeKey = key || (data?.period ?? "");
 const me = data?.me;
 const row = (entry: RankingEntry) => <tr key={entry.userId} className={entry.userId === userId ? "is-you" : ""}>
  <td className="place">{number(entry.rank).padStart(2, "0")}</td>
  <td><div className="driver"><V2Flag code={entry.countryCode}/><span>{entry.displayName || t("stats.no_name")}{entry.userId === userId && <small>Tú</small>}</span><InlineBadges badges={entry.displayBadges}/></div><span className="mobile-wins">{number(entry.gamesWon)} ganados</span></td>
  <td>{entry.currentStreak > 0 ? <V2Streak days={entry.currentStreak}/> : <span className="muted">—</span>}</td>
  <td className="retos">{number(entry.gamesWon)}</td><td className="points">{number(entry.points)}</td>
 </tr>;

 return <V2Page page="ranking">
  <section className="page-intro"><div><p className="eyebrow">La grilla fuera de la pista</p><h1>Clasificación<span>.</span></h1><p>Un reto a la vez. Cada punto cuenta.</p></div><span className="live"><i/>Ranking en vivo</span></section>
  {status === "ready" && leader && <section className="rank-lead" aria-label="Primera posición">
   <div className="leader-rank">01<span>Líder {period === "daily" ? "del día" : period === "monthly" ? "del mes" : "del año"}</span></div>
   <div className="leader-person"><V2Flag code={leader.countryCode}/><div><h2>{leader.displayName || t("stats.no_name")}</h2><p>{number(leader.gamesWon)} retos ganados</p></div></div>
   <div className="leader-score"><strong>{number(leader.points)}</strong><span>puntos</span></div>
   {leader.currentStreak > 0 && <div className="leader-streak"><V2Streak days={leader.currentStreak}/><small>días seguidos</small></div>}
   <div className="laurel" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v6a5 5 0 0 1-10 0V4ZM7 6H3v3c0 3 2 4 5 4M17 6h4v3c0 3-2 4-5 4M12 15v5M8 21h8"/></svg></div>
  </section>}
  <section className="rank-board" aria-label="Clasificación">
   <div className="board-tools">
    <div className="segments" role="group" aria-label="Período">{PERIODS.map(p => <button key={p.value} type="button" className={period === p.value ? "selected" : ""} aria-pressed={period === p.value} onClick={() => { setPeriod(p.value); setKey(""); setOffset(0); }}>{p.label}</button>)}</div>
    <label className="v2-period-input"><span>Período</span><input aria-label="Período de la clasificación" type={period === "daily" ? "date" : period === "monthly" ? "month" : "number"} min={period === "annual" ? "1" : undefined} max={period === "annual" ? "9999" : undefined} value={activeKey} onChange={e => { setKey(e.target.value); setOffset(0); }}/></label>
    <CountryPicker value={country} onChange={value => { setCountry(value); setOffset(0); }} variant="filter" label="Filtrar por país" placeholder="Todos los países"/>
   </div>
   {status === "loading" && <div className="v2-skeleton" style={{height: 300}} aria-label="Cargando clasificación" aria-busy="true"/>}
   {status === "invalid" && <p className="v2-empty" role="alert">Introduce un año de cuatro cifras.</p>}
   {status === "error" && <div className="v2-empty" role="alert"><p>No pudimos actualizar la clasificación.</p><button className="secondary" onClick={() => setRetry(n => n + 1)}>Reintentar</button></div>}
   {data && status === "ready" && <><div className="table-wrap"><table><caption className="sr-only">Clasificación {data.period}{country ? " por país" : " global"}</caption><thead><tr><th scope="col">Puesto</th><th scope="col">Piloto</th><th scope="col">Racha</th><th scope="col" className="retos">Ganados</th><th scope="col">Puntos</th></tr></thead><tbody>{data.top.map(row)}</tbody></table></div>
    {data.total === 0 && <p className="v2-empty">Todavía no hay pilotos en este período{country ? " y país" : ""}.</p>}
    <div className="board-bottom"><span>{data.period} · {number(data.total)} pilotos</span><div className="v2-pagination"><button className="secondary" disabled={offset === 0} onClick={() => setOffset(n => Math.max(0, n - LIMIT))}>Anterior</button><span aria-live="polite">{data.total ? offset + 1 : 0}–{Math.min(offset + data.top.length, data.total)} / {number(data.total)}</span><button className="secondary" disabled={offset + LIMIT >= data.total} onClick={() => setOffset(n => n + LIMIT)}>Siguiente</button></div></div>
   </>}
  </section>
  {data && status === "ready" && <section className="your-position"><div className="position-number">{me ? "#" + number(me.rank) : "—"}</div><div><p>Tu puesto{country ? " en este país" : ""}</p><strong>{identity?.displayName || t("stats.no_name")} <V2Flag code={identity?.countryCode}/></strong></div><div className="position-score"><strong>{me ? number(me.points) : "—"} <small>pts</small></strong><span>{me ? number(me.gamesWon) + " retos ganados" : "Sin puesto en esta clasificación"}</span></div><Link to={homePath(locale)} className="primary compact">Volver a jugar</Link></section>}
  <p className="footnote">En el ranking solo aparecen los puntos que cumplen la política de IP.</p>
 </V2Page>;
}
