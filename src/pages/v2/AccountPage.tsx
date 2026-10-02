import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Head} from 'vite-react-ssg';
import {V2Page} from '@/components/v2/V2Page';
import {IdentitySection} from './ProfilePage';
import {useLocalIdentity} from '@/hooks/useLocalIdentity';
import {useI18n} from '@/context';
import {apiGetUserBadges,type UserBadges} from '@/lib/api';
import {profilePath} from '@/lib/routes';
import {on,Events} from '@/lib/events';

export function AccountPage(){
 const {locale}=useI18n();
 const identity=useLocalIdentity();
 const userId=identity?.hasToken?identity.userId:null;
 const [data,setData]=useState<{id:string;badges:UserBadges|null}|null>(null);
 const [loading,setLoading]=useState(false);
 const [version,setVersion]=useState(0);
 useEffect(()=>on(Events.PROFILE_CHANGED,()=>setVersion(n=>n+1)),[]);
 useEffect(()=>{
  if(!userId){setLoading(false);return;}
  let cancelled=false;setLoading(true);
  void apiGetUserBadges(userId).then(badges=>{if(!cancelled){setData({id:userId,badges});setLoading(false);}});
  return ()=>{cancelled=true;};
 },[userId,version]);
 return <V2Page><Head><title>Editar perfil · Box Daily Box</title><meta name="robots" content="noindex, follow"/></Head>
  <div className="v2-account-page"><section className="page-intro"><div><p className="eyebrow">Tu firma en la grilla</p><h1>Tu identidad<span>.</span></h1></div><Link className="secondary" to={profilePath(locale)}>Volver a estadísticas</Link></section>
  {identity ? <IdentitySection key={identity.userId} badges={data?.id===userId?data.badges:null} badgesLoading={loading} onRefresh={()=>setVersion(n=>n+1)}/> : <div className="v2-skeleton" style={{height:240}} aria-busy="true"/>}</div>
 </V2Page>;
}
