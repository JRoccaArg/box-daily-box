import {Seo} from '@/components/layout/Seo';
import {DocumentFrame} from '@/components/v2/DocumentFrame';
import {useI18n} from '@/context';
const CONTACT_EMAIL='boxdailybox@gmail.com';
export function ContactPage(){
 const {locale,t}=useI18n();
 return <DocumentFrame page="contact" title={t('contact.title')}><Seo locale={locale} route={{kind:'contact'}}/><article className="contact-paper"><div className="contact-copy"><p className="source-copy">{t('contact.intro')}</p><a className="contact-email source-copy" href={'mailto:'+CONTACT_EMAIL}><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="18" rx="4"/><path d="m5 9 11 9L27 9"/></svg><span>{CONTACT_EMAIL}</span></a></div></article></DocumentFrame>;
}
