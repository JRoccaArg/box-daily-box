import {Link} from 'react-router-dom';
import {Seo} from '@/components/layout/Seo';
import {DocumentFrame, ReadingIndex} from '@/components/v2/DocumentFrame';
import {useI18n} from '@/context';
import {getInfoContent, type InfoGameId} from '@/content/info';
import {GAMES} from '@/components/games/registry';
import {BASE_POINTS, UNTIMED_SCORE} from '@/lib/scoring';
import {gamePath} from '@/lib/routes';
const DIFFICULTIES=['facil','medio','dificil','leyenda'] as const;

export function InfoPage(){
 const {locale,t}=useI18n();
 const info=getInfoContent(locale);
 const sections=([['juegos',info.gamesHeading],['dificultades',info.difficultyHeading],['puntaje',info.scoringHeading],['ranking',info.rankingHeading],['medallas',info.badgesHeading],['racha',info.streakHeading],['duelos',info.duelsHeading],['faq','FAQ']] as Array<[string,string]>).map(([id,title])=>({id,title}));
 const scoring=locale==='es' ? `Solo suman los retos ganados. Puntos base: Fácil ${BASE_POINTS.facil}, Medio ${BASE_POINTS.medio}, Difícil ${BASE_POINTS.dificil} y Leyenda ${BASE_POINTS.leyenda}. El bonus de rapidez depende de la dificultad, del tiempo restante y del límite elegido: elegir menos tiempo aumenta el bonus posible. Sin Tiempo otorga ${UNTIMED_SCORE} puntos por victoria. Perder o abandonar un reto da 0 puntos.` : t('monthly.scoring_body',{easy:BASE_POINTS.facil,medium:BASE_POINTS.medio,hard:BASE_POINTS.dificil,legend:BASE_POINTS.leyenda});
 const paragraphs=(values:string[])=>values.map((p,i)=><p key={i} className="source-copy">{p}</p>);
 return <DocumentFrame page="info" title={info.title} subtitle={<><div className="guide-intro"><p className="source-copy">{info.subtitle}</p></div><p className="data-note source-copy">{info.dataAsOfNote}</p></>}><Seo locale={locale} route={{kind:'info'}} jsonLd={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:info.faq.map(item=>({'@type':'Question',name:item.q,acceptedAnswer:{'@type':'Answer',text:item.a}}))}}/><div className="reading-layout"><ReadingIndex sections={sections}/><article className="document-body">
  <section className="reading-section" id="juegos"><h2>{info.gamesHeading}</h2><p className="source-copy">{info.gamesIntro}</p><ol className="game-guide">{GAMES.map((g,i)=><li key={g.id}><span className="guide-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><div><h3><Link to={gamePath(locale,g.id)}>{t(`game.${g.id}.name`)}</Link></h3><p className="guide-tagline source-copy">{t(`game.${g.id}.tagline`)}</p><p className="source-copy">{info.gameDetail[g.id as InfoGameId]}</p></div></li>)}</ol></section>
  <section className="reading-section" id="dificultades"><h2>{info.difficultyHeading}</h2><p className="source-copy">{info.difficultyIntro}</p><ul className="difficulty-guide">{DIFFICULTIES.map((d,index)=><li className={'difficulty-'+d} key={d}><span className="difficulty-dots" aria-hidden="true">{DIFFICULTIES.map((v,i)=><i key={v} className={i<=index?'filled':''}/>)}</span><div><strong className="source-copy">{t('diff.'+d)}</strong><p className="source-copy">{t('diff.hint.'+d)}</p></div></li>)}</ul></section>
  <section className="reading-section" id="puntaje"><h2>{info.scoringHeading}</h2>{paragraphs([info.scoringIntro,scoring])}</section>
  <section className="reading-section" id="ranking"><h2>{info.rankingHeading}</h2>{paragraphs(info.rankingBody)}</section>
  <section className="reading-section" id="medallas"><h2>{info.badgesHeading}</h2>{paragraphs(info.badgesBody)}</section>
  <section className="reading-section" id="racha"><h2>{info.streakHeading}</h2>{paragraphs([info.streakBody])}</section>
  <section className="reading-section" id="duelos"><h2>{info.duelsHeading}</h2>{paragraphs(info.duelsBody)}</section>
  <section className="reading-section" id="faq"><h2>FAQ</h2><div className="faq-guide">{info.faq.map(item=><div key={item.q}><h3 className="source-copy">{item.q}</h3><p className="source-copy">{item.a}</p></div>)}</div></section>
 </article></div></DocumentFrame>;
}
