// src/lib/achievements.ts
//
// Aviso al jugador de los logros recién desbloqueados.
//
// Por qué existe (auditoría 2026-09): el backend YA devolvía `newAchievements`
// —tanto en el finish de una partida como en el login con Google— pero ningún
// componente del frontend lo leía. El logro se otorgaba en silencio: la única
// forma de enterarte era entrar por tu cuenta a "Mis Logros" y notar que había
// uno nuevo. Un logro que nadie te avisa no premia nada.
//
// Se apoya en el store global de toasts (src/lib/toast.ts), que vive a nivel de
// módulo: por eso se puede llamar desde GameShell o desde el flujo de login sin
// pasar props, y el cartel sobrevive a la navegación client-side posterior
// (Layout no se desmonta).

import { showToast } from "./toast";
import { trackEvent } from "./analytics";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Más largo que un toast normal (3s): es una celebración, no un acuse. */
const ACHIEVEMENT_TOAST_MS = 6000;

/**
 * Muestra un cartel por cada logro nuevo y lo registra en analíticas.
 *
 * Tolerante a un logro que este bundle todavía no conozca (deploy escalonado:
 * el backend puede sumar un logro al catálogo antes de que se actualice el
 * frontend). En ese caso `t()` devuelve la clave cruda en vez de romper, igual
 * que hace `DEFAULT_TONE` en AchievementGallery.
 */
export function announceAchievements(
  types: readonly string[] | undefined | null,
  t: Translate,
): void {
  if (!types || types.length === 0) return;
  for (const type of types) {
    trackEvent("achievement_unlocked", { type });
    showToast(
      t("achievement.unlocked_toast", { name: t(`badge.${type}`) }),
      "success",
      ACHIEVEMENT_TOAST_MS,
    );
  }
}
