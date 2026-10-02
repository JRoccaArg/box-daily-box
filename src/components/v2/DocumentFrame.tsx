import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {useI18n} from '@/context';
import {V2Page} from './V2Page';
import {homePath} from '@/lib/routes';

export function DocumentFrame({page,title,subtitle,children}: {page:string;title:string;subtitle?:ReactNode;children:ReactNode}) {
 const {locale,t}=useI18n();
 return <V2Page><nav className="reference-nav" aria-label="Información del sitio">{['info','terms','privacy','contact'].map(id=><Link key={id} to={`/${locale}/${id}`} aria-current={id===page?'page':undefined}>{t('footer.'+id)}</Link>)}</nav><header className="document-heading"><span className="document-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 4l7 8-7 8h5l7-8-7-8z" fill="#e10600"/><path d="M11 4l7 8-7 8h3l7-8-7-8z" fill="#eee"/></svg></span><h1>{title}<span className="heading-dot">.</span></h1>{subtitle}</header>{children}<Link className="reading-return" to={homePath(locale)+'#juegos'}>{t('shell.back')}</Link></V2Page>;
}
export function ReadingIndex({sections}: {sections:Array<{id:string;title:string}>}) {
 const links=<nav aria-label="Índice de la página">{sections.map((s,i)=><a key={s.id} href={'#'+s.id}><span>{String(i+1).padStart(2,'0')}</span>{s.title.replace(/^\d+\. /,'')}</a>)}</nav>;
 return <><aside className="reading-index"><span className="index-label">En esta página</span>{links}</aside><details className="mobile-index"><summary>Índice de la página<span aria-hidden="true">+</span></summary>{links}</details></>;
}
