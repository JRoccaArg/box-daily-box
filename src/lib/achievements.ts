// src/lib/achievements.ts
//
// Aviso al jugador de los logros recién desbloqueados: toast efímero +
// globito persistente estilo iOS (mismo patrón visual que las solicitudes
// de amistad pendientes en el botón Stats del Header).
//
// Por qué existe el toast (auditoría 2026-09): el backend YA devolvía
// `newAchievements` —tanto en el finish de una partida como en el login con
// Google— pero ningún componente del frontend lo leía. El logro se otorgaba
// en silencio: la única forma de enterarte era entrar por tu cuenta a "Mis
// Logros" y notar que había uno nuevo. Un logro que nadie te avisa no premia
// nada.
//
// Por qué además el globito ("no vistos"): el toast es EFÍMERO (6s) — si la
// pestaña estaba oculta, el usuario miró para otro lado, o cerró la app
// justo después de terminar el reto, se lo pierde igual y vuelve a quedar
// en silencio. El globito es el recordatorio persistente: se prende cuando
// se anuncia un logro y se apaga recién cuando el jugador abre la pestaña
// "Logros" (`clearUnseenAchievements`, ver StatsModal.tsx).
//
// A diferencia de las solicitudes de amistad (persistidas SERVER-SIDE,
// mismo estado en cualquier dispositivo), esto es deliberadamente LOCAL
// (localStorage vía src/lib/storage.ts): un logro ya otorgado no tiene
// "acción pendiente" real, solo falta que el jugador lo haya visto en ESTE
// dispositivo — no hay nada que sincronizar entre dispositivos porque no es
// un estado de negocio, es un recordatorio de UI. Se limpia solo (junto con
// el resto de localStorage) al borrar la cuenta (ver IdentityModal.tsx).
//
// Se apoya en el store global de toasts (src/lib/toast.ts) y en el event bus
// (src/lib/events.ts), que viven a nivel de módulo: por eso se puede llamar
// desde GameShell o desde el flujo de login sin pasar props, y sobreviven a
// la navegación client-side posterior (Layout no se desmonta).

import { useEffect, useState } from "react";
import { showToast } from "./toast";
import { trackEvent } from "./analytics";
import { storage } from "./storage";
import { emit, on, Events } from "./events";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Más largo que un toast normal (3s): es una celebración, no un acuse. */
const ACHIEVEMENT_TOAST_MS = 6000;

const UNSEEN_KEY = "achievements_unseen";

/**
 * Muestra un cartel por cada logro nuevo, lo registra en analíticas, y lo
 * suma al globito persistente (hasta que se abra la pestaña Logros).
 *
 * Tolerante a un logro que este bundle todavía no conozca (deploy escalonado:
 * el backend puede sumar un logro al catálogo antes de que se actualice el
 * frontend). En ese caso `t()` devuelve la clave cruda en vez de romper, igual
 * que hace `DEFAULT_TONE` en AchievementGallery — y por la misma razón acá se
 * guarda como `string[]` suelto, no como el union `AchievementBadgeType` de
 * `api.ts` (que puede no incluir todavía un tipo nuevo).
 */
export function announceAchievements(
  types: readonly string[] | undefined | null,
  t: Translate,
): void {
  if (!types || types.length === 0) return;
  markAchievementsUnseen(types);
  for (const type of types) {
    trackEvent("achievement_unlocked", { type });
    showToast(
      t("achievement.unlocked_toast", { name: t(`badge.${type}`) }),
      "success",
      ACHIEVEMENT_TOAST_MS,
    );
  }
}

/** Tipos de logro otorgados que el jugador todavía no vio en ESTE dispositivo. */
export function getUnseenAchievements(): string[] {
  return storage.get<string[]>(UNSEEN_KEY, []);
}

/** Agrega tipos al conjunto de "no vistos" (dedup) y avisa al globito. */
function markAchievementsUnseen(types: readonly string[]): void {
  if (types.length === 0) return;
  storage.update<string[]>(UNSEEN_KEY, [], (prev) => [...new Set([...prev, ...types])]);
  emit(Events.ACHIEVEMENTS_CHANGED);
}

/** Vacía el globito. Se llama al abrir la pestaña Logros (StatsModal.tsx). */
export function clearUnseenAchievements(): void {
  if (getUnseenAchievements().length === 0) return; // evita un emit de más
  storage.set(UNSEEN_KEY, []);
  emit(Events.ACHIEVEMENTS_CHANGED);
}

/**
 * Cantidad de logros no vistos, reactiva al globito (Header.tsx). Sin
 * polling: es un valor puramente local, así que alcanza con releer cuando
 * el event bus avisa un cambio (logro nuevo anunciado, o pestaña Logros
 * abierta y vaciada) — mismo espíritu que `usePendingFriendRequestsCount`
 * (src/lib/friendsPolling.ts), pero sin la parte de red.
 */
export function useUnseenAchievementsCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => setCount(getUnseenAchievements().length);
    read();
    return on(Events.ACHIEVEMENTS_CHANGED, read);
  }, []);

  return count;
}
