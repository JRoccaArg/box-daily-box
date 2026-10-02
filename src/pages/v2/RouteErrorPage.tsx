import {useEffect,useState} from 'react';
import {Head} from 'vite-react-ssg';
import {I18nProvider} from '@/context';
import {getStoredLocale} from '@/i18n';
import type {Locale} from '@/i18n/types';
import {V2Page} from '@/components/v2/V2Page';
import {ErrorState} from '@/components/v2/ErrorState';

/** A route's unexpected exception must never expose its stack or response body. */
export function RouteErrorPage(){
 const [locale,setLocale]=useState<Locale>('es');
 useEffect(()=>setLocale(getStoredLocale()),[]);
 return <I18nProvider locale={locale}><V2Page><Head><title>Box Daily Box</title><meta name="robots" content="noindex, nofollow"/></Head><ErrorState status={500} onRetry={()=>window.location.reload()}/></V2Page></I18nProvider>;
}
