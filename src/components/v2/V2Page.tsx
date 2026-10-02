// src/components/v2/V2Page.tsx
//
// Contenedor común de las páginas del rediseño v2 (ranking, acceso, perfil,
// logros, amigos). Aplica el alcance `.bdb-v2` (todo el CSS portado del boceto
// vive debajo de esa clase, ver scripts/sync-boceto-css.mjs) y el ancho del
// boceto (`.shell`) y reserva los laterales para publicidad.

import type { ReactNode } from "react";
import { Seo } from "@/components/layout/Seo";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
import type { AccountPage } from "@/lib/seo";
import "@/styles/v2/fonts.css";
import "@/styles/v2/boceto.css";
import "@/styles/v2/app.css";
import "@/styles/v2/extras.css";

type V2PageProps = {
  page?: AccountPage;
  children: ReactNode;
};

export function V2Page({ page, children }: V2PageProps) {
  const { locale } = useI18n();
  return (
    <div className="bdb-v2 v2-page">
      {page && <Seo locale={locale} route={{ kind: "account", page }} />}
      <aside className="ad-rail left" aria-label="Espacio reservado para publicidad"><span>Publicidad</span><small>160 × 600</small></aside>
      <aside className="ad-rail right" aria-label="Espacio reservado para publicidad"><span>Publicidad</span><small>160 × 600</small></aside>
      <div className="shell">{children}</div>
    </div>
  );
}
