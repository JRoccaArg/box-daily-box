import { useEffect, useState } from "react";
import { apiGetUserAttempts, type ServerAttempt } from "@/lib/api";
import { dateKey } from "@/lib/seed";
import { useV2I18n } from "@/hooks/useV2I18n";
import { GAMES } from "@/components/games/registry";

export function ProfileDetails({ userId }: { userId: string }) {
 const { t, locale } = useV2I18n();
 const [open, setOpen] = useState(false);
 const [attempts, setAttempts] = useState<ServerAttempt[] | null>(null);
 const [loading, setLoading] = useState(false);
 const [retry, setRetry] = useState(0);
 useEffect(() => {
  if (!open) return;
  let cancelled = false;
  setLoading(true);
  const today = dateKey();
  void apiGetUserAttempts(userId, {from: today.slice(0, 7) + "-01", to: today}).then(res => {
   if (!cancelled) {setAttempts(res?.attempts ?? null); setLoading(false);}
  });
  return () => {cancelled = true;};
 }, [open, userId, retry]);
 const byDay = new Map<string, number>();
 for (const a of attempts ?? []) byDay.set(a.dateKey, (byDay.get(a.dateKey) ?? 0) + a.points);
 const days = [...byDay].sort(([a], [b]) => a.localeCompare(b));
 const max = Math.max(1, ...days.map(([, points]) => points));
 const width = 600; const height = 190;
 return <details className="extended-detail" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
  <summary><span>Ver estadísticas en detalle</span><span className="detail-plus" aria-hidden="true">+</span></summary>
  {open && <div className="detail-content">{loading ? <div className="v2-skeleton" style={{height: 200}} aria-label="Cargando detalle" aria-busy="true"/> : attempts === null ? <div role="alert"><p>No pudimos cargar el detalle.</p><button className="secondary" onClick={() => setRetry(n => n + 1)}>Reintentar</button></div> : <>
   <div className="chart-heading"><h2>Tu mes, vuelta a vuelta</h2><span className="chart-key"><i/>Puntos personales</span></div>
   {days.length === 0 ? <p className="v2-muted-note">Todavía no hay partidas este mes.</p> : <div className="chart-scroll"><svg className="points-chart" viewBox={`0 0 ${width} ${height + 45}`} role="img" aria-label="Puntos personales por día del mes">
    {[0, 1, 2].map(i => <g key={i}><line x1="40" x2="590" y1={height - i * 80} y2={height - i * 80} stroke="#52313b"/><text x="2" y={height - i * 80 + 4} fill="#b49aa7">{Math.round(max * i / 2)}</text></g>)}
    {days.map(([day, points], i) => {const x = 45 + i * 540 / days.length; const h = points / max * 160; return <g key={day}><title>{day}: {points} puntos</title><rect x={x} y={height - h} width={Math.min(26, 500 / days.length)} height={h} rx="4" fill="#ed6757"/><text x={x + 4} y={height + 25} fill="#c2a6b3">{Number(day.slice(-2))}</text></g>;})}
   </svg></div>}
   <div className="detail-columns"><section><h3>Por juego</h3>{GAMES.map(game => {const list = attempts.filter(a => a.gameId === game.id); const wins = list.filter(a => a.won).length; return <div className="breakdown-row" key={game.id}><span>{t("game." + game.id + ".name")}</span><span className="breakdown-track"><i style={{["--amount" as string]: (list.length ? wins / list.length * 100 : 0) + "%"}}/></span><strong>{wins} / {list.length}</strong></div>;})}</section><section><h3>Por dificultad</h3>{["facil", "medio", "dificil", "leyenda"].map(level => {const list = attempts.filter(a => a.difficulty === level); const wins = list.filter(a => a.won).length; return <div className="breakdown-row" key={level}><span>{t("diff." + level)}</span><span className="breakdown-track"><i style={{["--amount" as string]: (list.length ? wins / list.length * 100 : 0) + "%"}}/></span><strong>{wins} / {list.length}</strong></div>;})}<p>{(attempts.reduce((n, a) => n + a.points, 0)).toLocaleString(locale)} puntos personales este mes</p></section></div>
  </>}</div>}
 </details>;
}
