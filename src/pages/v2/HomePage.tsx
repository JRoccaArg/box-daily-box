import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {useI18n, useStats} from '@/context';
import {useLocalIdentity} from '@/hooks/useLocalIdentity';
import {useLives} from '@/hooks/useLives';
import {useMounted} from '@/lib/useMounted';
import {apiGetUserSummary, apiGetUserRank, apiGetClock, type UserSummary} from '@/lib/api';
import {initializeHomeVisuals} from '@/lib/v2/homeVisuals';
import {HOME_ARTWORK, HOME_DESCRIPTIONS} from '@/lib/v2/homeArtwork';
import {GAMES} from '@/components/games/registry';
import {Seo} from '@/components/layout/Seo';
import {SITE_URL} from '@/lib/seo';
import {gamePath, homePath, rankingPath} from '@/lib/routes';
import {getStreakVisual} from '@/lib/streakVisual';
import {CAFECITO_URL, KOFI_URL} from '@/lib/support';
import {on, Events} from '@/lib/events';
import '@/styles/v2/home.css';

const ORDER = Object.keys(HOME_ARTWORK);

export function HomePage() {
 const {locale, t} = useI18n();
 const {resultFor, summary: localSummary} = useStats();
 const identity = useLocalIdentity();
 const {lives} = useLives();
 const mounted = useMounted();
 const root = useRef<HTMLDivElement>(null);
 const pausedRef = useRef(false);
 const [paused, setPaused] = useState(false);
 const [serverSummary, setServerSummary] = useState<{id: string; value: UserSummary} | null>(null);
 const [rank, setRank] = useState<number | null>(null);
 const [rankState, setRankState] = useState('Cargando');
 const [version, setVersion] = useState(0);
 const [clock, setClock] = useState<{countdown: string; date: string}>({countdown:'--:--:--', date:'Edición diaria'});
 useEffect(() => on(Events.STATS_CHANGED, () => setVersion(n => n + 1)), []);
 useEffect(() => on(Events.PROFILE_CHANGED, () => setVersion(n => n + 1)), []);
 useEffect(() => {
  if (!root.current) return;
  pausedRef.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setPaused(pausedRef.current);
  return initializeHomeVisuals(root.current, () => pausedRef.current);
 }, []);
 useEffect(() => {
  const userId = identity?.hasToken ? identity.userId : null;
  setRank(null); setRankState(userId ? 'Cargando' : 'Sin puesto');
  if (!userId) return;
  let cancelled = false;
  void Promise.all([apiGetUserSummary(userId), apiGetUserRank(userId)]).then(([summary, position]) => {
   if (cancelled) return;
   if (summary) setServerSummary({id:userId,value:summary});
   setRank(position?.rank ?? null);
   setRankState(position ? 'Sin puesto' : 'No disponible');
  });
  return () => {cancelled = true;};
 }, [identity?.userId, identity?.hasToken, version]);
 useEffect(() => {
  let cancelled = false;
  let epoch: number | null = null;
  let start = 0;
  const render = () => {
   if (epoch === null) return;
   const now = new Date(epoch + performance.now() - start);
   const next = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
   const seconds = Math.max(0,Math.ceil((next.getTime()-now.getTime())/1000));
   const countdown = [Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
   const date = new Intl.DateTimeFormat(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);
   setClock({countdown,date:date.charAt(0).toUpperCase()+date.slice(1)});
  };
  const sync = async () => {
   const before = performance.now();
   const response = await apiGetClock();
   const after = performance.now();
   if (cancelled) return;
   const value = Date.parse(response?.timestamp ?? '');
   if (!Number.isFinite(value)) {epoch=null; setClock(old=>({...old,countdown:'--:--:--'})); return;}
   epoch=value; start=(before+after)/2; render();
  };
  void sync();
  const tick = window.setInterval(render,1000);
  const resync = window.setInterval(()=>void sync(),300000);
  return () => {cancelled=true; clearInterval(tick); clearInterval(resync);};
 }, [locale]);
 const summary = serverSummary && serverSummary.id === identity?.userId ? serverSummary.value : localSummary;
 const done = GAMES.filter(g=>resultFor(g.id)).length;
 const streak = mounted ? summary.currentStreak : 0;
 const formattedRank = rank === null ? rankState : '#' + rank.toLocaleString(locale);
 function toggleMotion() {
  pausedRef.current = !pausedRef.current; setPaused(pausedRef.current);
  root.current?.getAnimations({subtree:true}).forEach(a=>pausedRef.current ? a.pause() : a.play());
 }
 return <div className={'bdb-v2 bdb-home' + (paused ? ' paused' : '')} ref={root}>
  <Seo locale={locale} route={{kind:'home'}} jsonLd={{'@context':'https://schema.org','@type':'WebApplication',name:'Box Daily Box',url:SITE_URL,description:t('seo.home.description'),applicationCategory:'GameApplication',genre:'Puzzle Game',operatingSystem:'Web Browser',isAccessibleForFree:true,inLanguage:locale,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}}}/>
  <aside className="ad-rail ad-left" aria-label="Espacio reservado para publicidad"><span>Publicidad</span><small>160 × 600</small></aside><aside className="ad-rail ad-right" aria-label="Espacio reservado para publicidad"><span>Publicidad</span><small>160 × 600</small></aside>
  <div className="wrap">
   <div className="edition mono"><div className="home-ranking-access"><Link className="ranking-live" to={rankingPath(locale)}><i className="live"/>Ranking en vivo</Link><HomeRank value={formattedRank} locale={locale}/></div><span className="date">{clock.date}</span>{streak>0 && <div className={'streak-timeline streak-tier-'+getStreakVisual(streak).tier} aria-label={`Racha de ${streak} días`}><span className="streak-flame" aria-hidden="true"/><span className="streak-count">{streak}</span><span className="streak-detail"><strong>Racha activa</strong><small>{streak === 1 ? 'Día consecutivo' : 'Días consecutivos'}</small></span></div>}</div>
   <section className="hero" aria-labelledby="hero-title"><span className="hero-cross" aria-hidden="true">+</span><div className="hero-copy"><div className="mono">BOX DAILY BOX / DESAFÍOS DIARIOS</div><h1 id="hero-title">LA F1 SE SABE<span>DEMÚESTRALO<i className="hero-period">.</i></span></h1><p>Ocho retos para poner a prueba tu memoria de F1.<br/> Una oportunidad por juego. Una nueva grilla cada día.</p><a className="cta" href="#juegos">Explorar los retos</a></div><div className="track-art" role="group" aria-label="Pilotos en el circuito"><div id="circuit-stage"/></div></section>
   <section className="progress reveal" aria-label="Tu progreso de hoy"><div className="progress-games"><strong>{done} <span>de {GAMES.length}</span></strong><p>Juegos completados hoy<br/><span>{done === GAMES.length ? 'Vuelve mañana por nuevos retos' : 'Tu próxima partida te espera'}</span></p><div className="progress-pips" aria-hidden="true">{GAMES.map(g=><i key={g.id} className={resultFor(g.id) ? 'is-complete' : ''}/>)}</div></div><div className="progress-countdown"><strong aria-live="off">{clock.countdown}</strong><p>Para los próximos retos<br/><span>Reinicio a medianoche local</span></p></div><div><strong>{GAMES.length}</strong><p>Desafíos diferentes<br/><span>Elige por dónde empezar</span></p></div></section>
   <section id="juegos" aria-labelledby="games-title"><div className="section-head"><div><h2 id="games-title">TU GRILLA DE HOY</h2></div><p>Memoria, intuición y velocidad.<br/>Encuentra tu especialidad.</p></div><div className="games">{ORDER.map((id,index)=>{
    const game=GAMES.find(g=>g.id===id); if (!game) return null;
    const result=resultFor(id);
    const retry=result?.status==='lost' && lives && (lives.usableToday || lives.pendingGameId===id);
    const status=retry ? 'Usar una vida' : result?.status==='won' ? 'Completado' : result ? 'Jugado' : 'Jugar';
    return <article className={'game'+(index===0?' feature':'')+(result ? ' is-played' : '')} key={id}><Link className="game-link" to={gamePath(locale,id)} aria-label={`${t(`game.${id}.name`)}: ${status}`}><div className="home-artwork" aria-hidden="true" dangerouslySetInnerHTML={{__html:HOME_ARTWORK[id]!}}/><div className="game-meta"><div><h3>{t(`game.${id}.name`)}</h3><p>{locale === "es" ? HOME_DESCRIPTIONS[id] : t(`game.${id}.tagline`)}</p></div><span className={'game-action'+(result?.status==='won'?' is-won':'')}>{status}<i aria-hidden="true"/></span></div></Link></article>;
   })}</div></section>
   <aside className="mobile-ad" aria-label="Espacio reservado para publicidad">Publicidad<small>Espacio reservado · 320 × 100</small></aside>
   <section className="closing"><h2>TU PASIÓN NO TERMINA<br/>CON LA BANDERA A CUADROS.</h2><p>Hecho por fans, para fans.<br/>Un pequeño ritual diario para quienes<br/>nunca dejan de pensar en la próxima carrera.</p></section>
   <section className="support-panel" id="apoyar" aria-labelledby="support-title"><div className="support-copy"><span className="support-eyebrow">LA COMUNIDAD MANTIENE EL MOTOR ENCENDIDO</span><h2 id="support-title">Apoya el proyecto</h2><p>Box Daily Box seguirá siendo gratis. Si disfrutas los retos, puedes contribuir de forma voluntaria. El apoyo no da ventajas en los juegos ni en el ranking.</p></div><div className="support-actions"><a href={CAFECITO_URL} target="_blank" rel="noopener noreferrer">Cafecito<span>Argentina</span></a><a href={KOFI_URL} target="_blank" rel="noopener noreferrer">Ko-fi<span>Internacional</span></a></div></section>
   <button className="motion-control" type="button" aria-pressed={paused} onClick={toggleMotion}>{paused ? 'Activar animación' : 'Pausar animación'}</button>
  </div>
 </div>;
}

function HomeRank({value,locale}: {value:string;locale:Parameters<typeof homePath>[0]}) {
 const ref=useRef<HTMLSpanElement>(null);
 const [overflow,setOverflow]=useState(false);
 useEffect(()=>{
  const element=ref.current; if (!element) return;
  const measure=()=>setOverflow(element.scrollWidth>element.clientWidth);
  const observer=new ResizeObserver(measure); observer.observe(element); measure();
  void document.fonts.ready.then(measure);
  return ()=>observer.disconnect();
 },[value]);
 return <Link className="home-rank" to={rankingPath(locale)} aria-label={`Tu puesto de hoy: ${value}. Ver clasificación`} title={value}><span className="home-rank-label">Tu puesto</span><span className="home-rank-slot"><span ref={ref} className="home-rank-measure">{value}</span><span className={'home-rank-value'+(overflow?' is-label':'')}>{overflow ? (value.startsWith('#') ? 'Ver puesto' : 'Ver ranking') : value}</span></span></Link>;
}


