import {useEffect,useRef,useState,type MouseEvent} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import {useI18n} from '@/context';
import {useLives} from '@/hooks/useLives';
import {useLocalIdentity} from '@/hooks/useLocalIdentity';
import {usePendingFriendRequestsCount} from '@/lib/friendsPolling';
import {useUnseenAchievementsCount} from '@/lib/achievements';
import {homePath,rankingPath,profilePath,accessPath,friendsPath,achievementsPath,infoPath} from '@/lib/routes';
import {LivesModal} from '@/components/layout/LivesModal';
import {V2Flag} from './V2Flag';
import {LOCALE_META} from '@/i18n/types';
import {runNavGuard} from '@/lib/navGuard';
import {on,Events} from '@/lib/events';
import '@/styles/v2/fonts.css';
import '@/styles/v2/boceto.css';
import '@/styles/v2/app.css';
import '@/styles/v2/home.css';
import '@/styles/v2/extras.css';

const FLAGS:Record<string,string>={es:'ESP',en:'GBR',pt:'BRA',hi:'IND',it:'ITA',fr:'FRA',zh:'CHN',ja:'JPN',de:'DEU',nl:'NLD',ar:'SAU',ru:'RUS',tr:'TUR',sl:'SVN'};
export function V2Header(){
 const {locale,t,setLocale}=useI18n();
 const {pathname,hash}=useLocation();
 const navigate=useNavigate();
 const {lives}=useLives();
 const identity=useLocalIdentity();
 const requests=usePendingFriendRequestsCount();
 const achievements=useUnseenAchievementsCount();
 const [menuOpen,setMenuOpen]=useState(false);
 const [languageOpen,setLanguageOpen]=useState(false);
 const [livesOpen,setLivesOpen]=useState(false);
 const language=useRef<HTMLDivElement>(null);
 const nav=useRef<HTMLElement>(null);
 useEffect(()=>{setMenuOpen(false);setLanguageOpen(false);setLivesOpen(false);},[pathname,hash]);
 useEffect(()=>on(Events.OPEN_STATS,()=>{if(!runNavGuard())navigate(rankingPath(locale));}),[locale,navigate]);
 useEffect(()=>{
  const outside=(event:globalThis.MouseEvent)=>{if(!language.current?.contains(event.target as Node))setLanguageOpen(false); if(!nav.current?.contains(event.target as Node))setMenuOpen(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setLanguageOpen(false);setMenuOpen(false);}};
  document.addEventListener('click',outside); document.addEventListener('keydown',escape);
  return ()=>{document.removeEventListener('click',outside);document.removeEventListener('keydown',escape);};
 },[]);
 const guard=(event:MouseEvent<HTMLAnchorElement>)=>{if(runNavGuard())event.preventDefault();else setMenuOpen(false);};
 const current=LOCALE_META.find(meta=>meta.code===locale)!;
 const pilotPath=identity?.hasToken?profilePath(locale):accessPath(locale);
 return <div className="bdb-v2 bdb-home v2-site-header"><a className="skip" href="#contenido">Ir al contenido</a><div className="wrap"><header className="nav" ref={nav}>
  <Link className="brand" to={homePath(locale)} aria-label={t('header.home_label')} onClick={guard}><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4l7 8-7 8h5l7-8-7-8z" fill="#e10600"/><path d="M11 4l7 8-7 8h3l7-8-7-8z" fill="#eee"/></svg><span className="original-wordmark">Box Daily <sup>BOX</sup></span></Link>
  <nav className="navlinks" aria-label="Principal"><Link to={homePath(locale)+'#juegos'} aria-current={pathname.replace(/\/$/,'')===homePath(locale).replace(/\/$/,'')?'page':undefined} onClick={guard}>Juegos diarios</Link><Link className="nav-ranking" to={rankingPath(locale)} aria-current={pathname===rankingPath(locale)?'page':undefined} onClick={guard}>Clasificación</Link><Link to={infoPath(locale)} aria-current={pathname===infoPath(locale)?'page':undefined} onClick={guard}>Cómo jugar</Link></nav>
  <Link className="header-support" to={homePath(locale)+'#apoyar'} onClick={guard}><i aria-hidden="true"/>Apoyar</Link>
  <div className="account"><div className="language-wrap" ref={language}><button className="language-control" type="button" aria-expanded={languageOpen} aria-controls="v2-language-menu" aria-label={t('lang.label')} onClick={()=>setLanguageOpen(v=>!v)}><span className="language-flag"><V2Flag code={FLAGS[locale]}/></span><span className="language-copy"><small>IDIOMA</small><strong>{current.label}</strong></span></button>{languageOpen && <div className="language-menu" id="v2-language-menu"><span className="language-menu-title">Idioma de la web</span>{LOCALE_META.map(meta=><button type="button" key={meta.code} className={'language-option'+(locale===meta.code?' selected':'')} onClick={()=>{if(!runNavGuard()){setLocale(meta.code);setLanguageOpen(false);}}}><V2Flag code={FLAGS[meta.code]}/><span className="option-name">{meta.label}</span><span className="selected-mark">{locale===meta.code?'✓':''}</span></button>)}</div>}</div><Link className="outline" to={pilotPath} onClick={guard}>Mi piloto{requests+achievements>0 && <span className="v2-tab-dot" aria-label="Novedades"/>}</Link></div>
  {lives && lives.balance>0 && <button className="v2-header-life" type="button" onClick={()=>setLivesOpen(true)} aria-label={t('lives.header_label',{count:lives.balance})}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 3 12C-3 5 6-2 12 5c6-7 15 0 9 7Z"/></svg><strong>{lives.balance}</strong></button>}
  <button className="mobile-menu-toggle" type="button" aria-label={menuOpen?'Cerrar menú':'Abrir menú'} aria-expanded={menuOpen} aria-controls="v2-mobile-menu" onClick={()=>setMenuOpen(v=>!v)}><span/><span/></button>
  {menuOpen && <div className="mobile-menu" id="v2-mobile-menu"><nav aria-label="Menú móvil"><Link to={homePath(locale)+'#juegos'} onClick={guard}>Juegos diarios</Link><Link to={rankingPath(locale)} onClick={guard}>Clasificación</Link><Link to={infoPath(locale)} onClick={guard}>Cómo jugar</Link><Link to={homePath(locale)+'#apoyar'} onClick={guard}>Apoyar el proyecto</Link><Link to={pilotPath} onClick={guard}>Mi piloto</Link><Link to={accessPath(locale)} onClick={guard}>Inicio de sesión</Link>{requests>0 && <Link to={friendsPath(locale)} onClick={guard}>{requests} solicitudes</Link>}{achievements>0 && <Link to={achievementsPath(locale)} onClick={guard}>{achievements} logros nuevos</Link>}</nav><details className="v2-mobile-language"><summary><V2Flag code={FLAGS[locale]}/><span>Idioma · {current.label}</span></summary><div className="mobile-language-options">{LOCALE_META.map(meta=><button key={meta.code} className={locale===meta.code?"selected":""} type="button" onClick={()=>{if(!runNavGuard())setLocale(meta.code);}}><V2Flag code={FLAGS[meta.code]}/>{meta.label}</button>)}</div></details></div>}
  <LivesModal open={livesOpen} onClose={()=>setLivesOpen(false)} lives={lives} redesigned/>
 </header></div></div>;
}
