// src/pages/AuthCallback.tsx
//
// Página a donde redirige Google después del OAuth flow.
// URL: /auth/callback?code=xxx&state=yyy
//
// Verifica el ?state= (anti-CSRF), envía el ?code= al backend y luego
// vuelve a la página desde la que se inició el login (o a la home).

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { consumeOAuthState, consumePostLoginPath, handleGoogleCallback } from "@/lib/auth";
import { announceAchievements } from "@/lib/achievements";
import { safeReturnPath } from "@/lib/routes";
import { useI18n } from "@/context";
import { Head } from 'vite-react-ssg';
import { Link } from 'react-router-dom';
import { V2Page } from '@/components/v2/V2Page';
import { GoogleMark } from '@/components/v2/GoogleMark';
import { accessPath } from '@/lib/routes';

export function AuthCallback(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorKey, setErrorKey] = useState("");
  // El efecto depende de `t`, que cambia cuando AuthCallbackRoot pasa del
  // idioma inicial ("en", por el prerender) al guardado: sin esta guarda el
  // callback se procesaba DOS veces (el `code` de Google es de un solo uso y
  // el `state` también, así que la segunda corrida mostraba un error falso).
  const startedRef = useRef(false);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const stateOk = consumeOAuthState(searchParams.get("state"));

    if (error) {
      setStatus("error");
      setErrorKey("auth.cancelled");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorKey("auth.no_code");
      return;
    }

    // `state` ausente o distinto: el callback no salió de un login iniciado
    // en este navegador (posible CSRF de login). No se envía el code.
    if (!stateOk) {
      setStatus("error");
      setErrorKey("auth.failed");
      return;
    }

    (async () => {
      const result = await handleGoogleCallback(code);
      if (!result) {
        setStatus("error");
        setErrorKey("auth.failed");
        return;
      }
      // Logros que se desbloquearon al fusionar/importar el historial en esta
      // cuenta. El toast vive en un store global, así que sobrevive al
      // navigate de abajo (Layout no se desmonta en navegación client-side).
      announceAchievements(result.newAchievements, tRef.current);
      // Éxito: volver a donde se inició el login (validado: solo rutas
      // internas), o a la home si no hay.
      navigate(safeReturnPath(consumePostLoginPath()) ?? "/", { replace: true });
    })();
  }, [searchParams, navigate]);

  return (
    <V2Page>
      <Head><title>{t(status==='error'?'auth.error':'auth.loading')} · Box Daily Box</title><meta name="robots" content="noindex, nofollow"/></Head>
      <section className="error-scene v2-auth-state" aria-live="polite">
        {status === "loading" && (
          <>
            <div className="v2-auth-google"><GoogleMark/></div>
            <h1>{t("auth.loading")}</h1>
            <p>{t("auth.linking")}</p>
            <div className="v2-skeleton" style={{height: 5, maxWidth: 180, margin: '24px auto'}}/>
          </>
        )}
        {status === "error" && (
          <>
            <div className="error-symbol" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M32 8 57 52H7Z"/><path d="M32 24v12m0 8v1"/></svg></div>
            <h1>{t("auth.error")}<span>.</span></h1>
            <p>{t(errorKey)}</p>
            <Link className="primary" to={accessPath(locale)}>Volver al acceso</Link>
          </>
        )}
      </section>
    </V2Page>
  );
}
