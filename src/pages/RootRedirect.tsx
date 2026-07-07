// src/pages/RootRedirect.tsx
//
// Página raíz "/" (x-default). Redirige al idioma preferido (localStorage >
// detección de navegador > inglés). Se prerenderiza con contenido real
// (enlaces a todos los idiomas) para crawlers y usuarios sin JS, en vez de
// quedar en blanco: el redirect solo ocurre client-side, en un efecto.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredLocale } from "@/i18n";
import { LOCALE_META } from "@/i18n/types";
import { homePath } from "@/lib/routes";

export function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(homePath(getStoredLocale()), { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-asphalt-900 px-4 text-center text-ink">
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
