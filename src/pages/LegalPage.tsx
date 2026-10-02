import {Seo} from '@/components/layout/Seo';
import {DocumentFrame, ReadingIndex} from '@/components/v2/DocumentFrame';
import {useI18n} from '@/context';
import {getLegalDoc, type LegalPageId} from '@/content/legal';
import type {LegalBlock} from '@/content/legal/types';
function Block({block}:{block:LegalBlock}) {
 if ('p' in block) return <p className="source-copy">{block.p}</p>;
 if ('list' in block) return <ul className="source-list">{block.list.map((item,i)=><li className="source-copy" key={i}>{item}</li>)}</ul>;
 return <p className="source-copy"><a className="inline-email" href={'mailto:'+block.email}>{block.email}</a></p>;
}
export function LegalPage({page}:{page:LegalPageId}) {
 const {locale,t}=useI18n();
 const doc=getLegalDoc(locale,page);
 const sections=doc.sections.map((s,i)=>({id:'seccion-'+(i+1),title:s.heading}));
 return <DocumentFrame page={page} title={doc.title} subtitle={<p className="document-date">{t('legal.updated',{date:doc.lastUpdated})}</p>}><Seo locale={locale} route={{kind:'legal',page}}/><div className="reading-layout"><ReadingIndex sections={sections}/><article className="document-body"><div className="document-intro">{doc.intro.map((p,i)=><p className="source-copy" key={i}>{p}</p>)}</div>{doc.sections.map((s,i)=><section key={i} className="reading-section" id={sections[i]!.id}><h2>{s.heading}</h2>{s.blocks.map((b,j)=><Block block={b} key={j}/>)}</section>)}</article></div></DocumentFrame>;
}
export function TermsPage(){return <LegalPage page="terms"/>;}
export function PrivacyPage(){return <LegalPage page="privacy"/>;}
