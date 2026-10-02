import { countryName, NATIONALITIES } from "@/data/nationalities";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
/** Nombre del país traducido (o null si no hay país). */
export function useCountryLabel(code: string | null | undefined): string | null {
  const { t } = useI18n();
  if (!code || !NATIONALITIES[code]) return null;
  return countryName(code, t);
}
