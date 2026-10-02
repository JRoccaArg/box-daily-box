import {Link} from 'react-router-dom';
import {useI18n} from '@/context';
import {homePath,accessPath} from '@/lib/routes';
import {errorCopy} from '@/lib/v2/errorCopy';
export function ErrorState({status=0,onRetry}: {status?:number;onRetry?:()=>void}) {
 const {locale}=useI18n();
 const [title,description]=errorCopy(status,typeof navigator!=='undefined' && navigator.onLine===false);
 return <section className="error-scene" role="alert"><div className="error-symbol" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M32 8 57 52H7Z"/><path d="M32 24v12m0 8v1"/></svg></div><h1>{title}<span>.</span></h1><p>{description}</p>{status===401 || status===403 ? <Link className="primary" to={accessPath(locale)}>Iniciar sesión</Link> : onRetry && status!==404 ? <button className="primary" type="button" onClick={onRetry}>Reintentar</button> : <Link className="primary" to={homePath(locale)}>Volver al inicio</Link>}</section>;
}
