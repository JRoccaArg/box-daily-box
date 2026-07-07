// src/pages/RootRedirect.tsx
//
// Página raíz "/" (x-default). Redirige al idioma preferido (localStorage >
// detección de navegador > inglés). Se prerenderiza con contenido real
// (enlaces a todos los idiomas) para crawlers y usuarios sin JS, en vez de
// quedar en blanco: el redirect solo ocurre client-side, en un efecto.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredLocale } from "@/i18n";
import { LOCALE_META, SUPPORTED_LOCALES } from "@/i18n/types";
import { homePath } from "@/lib/routes";

// Script inline (no module/async/defer) que el navegador ejecuta de forma
// síncrona apenas lo parsea, ANTES de pintar el <div> de fallback que viene
// después en el mismo HTML. Replica getStoredLocale()/detectLocale() de
// src/i18n/index.ts para no depender de que React monte y corra el useEffect
// (que sí pintaría el fallback primero). El fallback sigue existiendo en el
// HTML estático para crawlers/no-JS — esto solo evita el flash en navegadores
// con JS habilitado, adelantando la misma redirección.
const INSTANT_REDIRECT_SCRIPT = `(function(){try{var S=${JSON.stringify(SUPPORTED_LOCALES)};var l=null;try{var s=localStorage.getItem("lang");if(s&&S.indexOf(s)!==-1)l=s;}catch(e){}if(!l){var ls=navigator.languages||[navigator.language];for(var i=0;i<ls.length;i++){var p=(ls[i]||"").split("-")[0].toLowerCase();if(S.indexOf(p)!==-1){l=p;break;}}}if(!l)l="en";location.replace("/"+l+"/");}catch(e){}})();`;

export function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(homePath(getStoredLocale()), { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-asphalt-900 px-4 text-center text-ink">
      <script dangerouslySetInnerHTML={{ __html: INSTANT_REDIRECT_SCRIPT }} />
      <p className="font-display text-lg font-bold">Box Daily Box</p>
      <ul className="flex flex-wrap justify-center gap-3">
        {LOCALE_META.map((m) => (
          <li key={m.code}>
            <a
              href={homePath(m.code)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-ink-muted hover:border-white/25 hover:text-ink"
            >
              <span>{m.flag}</span>
              {m.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
