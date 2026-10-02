import {V2Page} from '@/components/v2/V2Page';
import {ErrorState} from '@/components/v2/ErrorState';
import {Head} from 'vite-react-ssg';
export function NotFoundPage(){return <V2Page><Head><title>Página no encontrada · Box Daily Box</title><meta name="robots" content="noindex, follow"/></Head><ErrorState status={404}/></V2Page>;}
