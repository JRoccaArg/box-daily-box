import {Link} from 'react-router-dom';
import {useI18n} from '@/context';
import {homePath} from '@/lib/routes';
import {reopenConsent} from '@/lib/consent';

export function V2Footer(){
 const {locale,t}=useI18n();
 return <div className="bdb-v2 bdb-home v2-site-footer"><div className="wrap"><footer className="site-footer"><div className="footer-brand"><strong>BOX DAILY BOX</strong><span>{t('footer.line1')}</span></div><nav aria-label="Enlaces del sitio">{['info','terms','privacy','contact'].map(id=><Link key={id} to={`/${locale}/${id}`}>{t('footer.'+id)}</Link>)}<Link to={homePath(locale)+'#apoyar'}>{t('footer.support')}</Link><button type="button" className="preview-cookie-manage" onClick={reopenConsent}>{t('consent.manage')}</button></nav><div className="footer-bottom"><span>Box Daily Box</span><span>{t('footer.line2')}</span></div></footer></div></div>;
}
