// src/components/v2/V2Flag.tsx
//
// Bandera con el tamaño/forma del boceto (`.flag`, 21×14 redondeada), dibujada
// con flag-icons (`fi fi-xx`) como el resto del sitio. Sin país o con un código
// desconocido no dibuja nada (no inventa una bandera).

import { countryName } from "@/data/nationalities";
import { NATIONALITIES } from "@/data/nationalities";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";

export function V2Flag({ code }: { code: string | null | undefined }) {
  const { t } = useI18n();
  if (!code) return null;
  const nat = NATIONALITIES[code];
  if (!nat) return null;
  return (
    <span
      className={`flag fi fi-${nat.alpha2}`}
      role="img"
      aria-label={countryName(code, t)}
      title={countryName(code, t)}
    />
  );
}
