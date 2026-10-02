import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useV2I18n } from "@/hooks/useV2I18n";
import { useLives } from "@/hooks/useLives";
import { useLocalIdentity } from "@/hooks/useLocalIdentity";
import { usePendingFriendRequestsCount } from "@/lib/friendsPolling";
import { useUnseenAchievementsCount } from "@/lib/achievements";
import { homePath, rankingPath, profilePath, accessPath, friendsPath, achievementsPath } from "@/lib/routes";
import { LivesModal } from "@/components/layout/LivesModal";
import { runNavGuard } from "@/lib/navGuard";

export function V2Header() {
 const { locale, t } = useV2I18n();
 const { pathname } = useLocation();
 const { lives } = useLives();
 const identity = useLocalIdentity();
 const requests = usePendingFriendRequestsCount();
 const achievements = useUnseenAchievementsCount();
 const [menuOpen, setMenuOpen] = useState(false);
 const [livesOpen, setLivesOpen] = useState(false);
 useEffect(() => {setMenuOpen(false); setLivesOpen(false);}, [pathname]);
 const notificationPath = requests > 0 ? friendsPath(locale) : achievements > 0 ? achievementsPath(locale) : null;
 return <div className="bdb-v2 v2-header"><header className="masthead">
  <Link className="brand" to={homePath(locale)} aria-label="Box Daily Box, inicio" onClick={e => {if (runNavGuard()) e.preventDefault();}}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4l7 8-7 8h5l7-8-7-8z" fill="#e10600"/><path d="M11 4l7 8-7 8h3l7-8-7-8z" fill="#eee"/></svg><span>BOX DAILY <small>BOX</small></span></Link>
  <button className="v2-menu-button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="v2-header-nav" onClick={() => setMenuOpen(v => !v)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
  <nav id="v2-header-nav" className={"v2-header-nav" + (menuOpen ? " is-open" : "")} aria-label="Principal">
   <Link to={homePath(locale)}>Juegos diarios</Link>
   <Link to={rankingPath(locale)} className={pathname.endsWith("/ranking") ? "v2-header-current" : ""}>Clasificación</Link>
   <Link to={identity?.hasToken ? profilePath(locale) : accessPath(locale)} className={pathname.includes("/perfil") ? "v2-header-current" : ""}>Mi piloto</Link>
   {notificationPath && <Link to={notificationPath}>{requests > 0 ? requests + " solicitudes" : achievements + " logros nuevos"}</Link>}
  </nav>
  {lives && lives.balance > 0 && <button className="v2-header-life" onClick={() => setLivesOpen(true)} aria-label={t("lives.header_label", {count: lives.balance})}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 3 12C-3 5 6-2 12 5c6-7 15 0 9 7Z"/></svg><strong>{lives.balance}</strong></button>}
  <LivesModal open={livesOpen} onClose={() => setLivesOpen(false)} lives={lives}/>
 </header></div>;
}
