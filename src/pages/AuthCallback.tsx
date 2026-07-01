// src/pages/AuthCallback.tsx
//
// Página a donde redirige Google después del OAuth flow.
// URL: /auth/callback?code=xxx&state=yyy
//
// Extrae el ?code=, lo envía al backend y luego redirige a home.

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleGoogleCallback } from "@/lib/auth";

export function AuthCallback(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    console.log("[AuthCallback] Montado, searchParams:", searchParams.toString());
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    console.log("[AuthCallback] code:", code ? code.substring(0, 20) + "..." : null);
    console.log("[AuthCallback] error:", error);

    if (error) {
      setStatus("error");
      setErrorMsg("Autenticación cancelada");
      window.setTimeout(() => navigate("/"), 2000);
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("Sin código de autorización");
      window.setTimeout(() => navigate("/"), 2000);
      return;
    }

    (async () => {
      console.log("[AuthCallback] Llamando handleGoogleCallback...");
      const result = await handleGoogleCallback(code);
      console.log("[AuthCallback] Resultado:", result);
      if (!result) {
        setStatus("error");
        setErrorMsg("No se pudo iniciar sesión");
        window.setTimeout(() => navigate("/"), 2500);
        return;
      }
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
            <h1 className="text-2xl font-semibold mb-2">Iniciando sesión...</h1>
            <p className="text-neutral-400">Vinculando tu cuenta de Google</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-semibold mb-2">Error</h1>
            <p className="text-neutral-400 mb-4">{errorMsg}</p>
            <p className="text-sm text-neutral-500">Redirigiendo...</p>
          </>
        )}
      </div>
    </div>
  );
}
