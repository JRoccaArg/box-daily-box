// src/components/v2/PersonalBack.tsx
//
// Acceso de vuelta al perfil con tu nombre y bandera (cabecera de Logros y
// Amigos en el boceto).

import { Link } from "react-router-dom";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
import { profilePath } from "@/lib/routes";
import type { LocalIdentity } from "@/hooks/useLocalIdentity";
import { V2Flag } from "./V2Flag";

export function PersonalBack({ identity }: { identity: LocalIdentity | null }) {
  const { t, locale } = useI18n();
  if (!identity) return null;
  return (
    <Link className="personal-back" to={profilePath(locale)} aria-label={t("v2.profile.back_aria")}>
      {identity.displayName || t("stats.no_name")}
      <V2Flag code={identity.countryCode} />
    </Link>
  );
}
