import { useI18n } from "@/context";

/**
 * Indicador de presencia de un amigo: verde si tiene la web abierta, gris si
 * no. Sirve para saber a quién tiene sentido desafiar, porque una invitación
 * a duelo caduca a los 60s (ver DUEL_PENDING_TTL_MS en src/api/routes.ts).
 *
 * El dato viene de `Friend.online`, un booleano ya calculado en el server: el
 * cliente nunca recibe la hora de la última conexión.
 */
export function OnlineDot({ online }: { online: boolean }) {
  const { t } = useI18n();
  const label = t(online ? "friends.online" : "friends.offline");
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={[
        "h-2 w-2 shrink-0 rounded-full",
        online ? "bg-sector-green ring-2 ring-sector-green/25" : "bg-ink-faint",
      ].join(" ")}
    />
  );
}
