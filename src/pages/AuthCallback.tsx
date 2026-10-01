// src/pages/AuthCallback.tsx
//
// Página a donde redirige Google después del OAuth flow.
// URL: /auth/callback?code=xxx&state=yyy
//
// Verifica el ?state= (anti-CSRF), envía el ?code= al backend y luego
// redirige a home.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { consumeOAuthState, handleGoogleCallback } from "@/lib/auth";
import { announceAchievements } from "@/lib/achievements";
import { useI18n } from "@/context";

export function AuthCallback(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
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
      window.setTimeout(() => navigate("/"), 2000);
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorKey("auth.no_code");
      window.setTimeout(() => navigate("/"), 2000);
      return;
    }

    // `state` ausente o distinto: el callback no salió de un login iniciado
    // en este navegador (posible CSRF de login). No se envía el code.
    if (!stateOk) {
      setStatus("error");
      setErrorKey("auth.failed");
      window.setTimeout(() => navigate("/"), 2500);
      return;
    }

    (async () => {
      const result = await handleGoogleCallback(code);
      if (!result) {
        setStatus("error");
        setErrorKey("auth.failed");
        window.setTimeout(() => navigate("/"), 2500);
        return;
      }
      // Logros que se desbloquearon al fusionar/importar el historial en esta
      // cuenta. El toast vive en un store global, así que sobrevive al
      // navigate de abajo (Layout no se desmonta en navegación client-side).
      announceAchievements(result.newAchievements, tRef.current);
      // Éxito: redirigir a home.
      navigate("/", { replace: true });
    })();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin h-12 w-12 border-4 border-neutral-700 border-t-red-500 rounded-full mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">{t("auth.loading")}</h1>
            <p className="text-neutral-400">{t("auth.linking")}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-semibold mb-2">{t("auth.error")}</h1>
            <p className="text-neutral-400 mb-4">{t(errorKey)}</p>
            <p className="text-sm text-neutral-500">{t("auth.redirecting")}</p>
          </>
        )}
      </div>
    </div>
  );
}
