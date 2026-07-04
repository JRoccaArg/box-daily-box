// src/pages/AuthCallback.tsx
//
// Página a donde redirige Google después del OAuth flow.
// URL: /auth/callback?code=xxx&state=yyy
//
// Extrae el ?code=, lo envía al backend y luego redirige a home.

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleGoogleCallback } from "@/lib/auth";
import { useI18n } from "@/context";

export function AuthCallback(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg(t("auth.cancelled"));
      window.setTimeout(() => navigate("/"), 2000);
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg(t("auth.no_code"));
      window.setTimeout(() => navigate("/"), 2000);
      return;
    }

    (async () => {
      const result = await handleGoogleCallback(code);
      if (!result) {
        setStatus("error");
        setErrorMsg(t("auth.failed"));
        window.setTimeout(() => navigate("/"), 2500);
        return;
      }
      // Éxito: redirigir a home.
      navigate("/", { replace: true });
    })();
  }, [searchParams, navigate, t]);

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
            <p className="text-neutral-400 mb-4">{errorMsg}</p>
            <p className="text-sm text-neutral-500">{t("auth.redirecting")}</p>
          </>
        )}
      </div>
    </div>
  );
}
