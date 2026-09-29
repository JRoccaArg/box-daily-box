import { useCallback, useEffect, useState } from "react";
import { apiGetLives, type LivesInfo } from "@/lib/api";
import { getIdentityToken } from "@/lib/identity";
import { on, Events } from "@/lib/events";

/** Mismo intervalo que usePendingFriendRequestsCount (friendsPolling.ts):
 *  liviano, no necesita ser instantáneo. Vidas cambia menos seguido que
 *  solicitudes de amistad, pero se mantiene el mismo número por consistencia. */
const POLL_MS = 10_000;

/**
 * Vidas extra del jugador, leídas del server (la fuente de verdad: el saldo
 * nunca vive en el navegador).
 *
 * Solo pide después de montar (el HTML prerenderizado no tiene identidad).
 * Se refresca de tres formas, mismo espíritu que usePendingFriendRequestsCount:
 * al montar, cada POLL_MS (para enterarse de una vida ganada por un amigo
 * jugando tu link MIENTRAS tenés la pestaña abierta, sin haber hecho vos
 * ninguna acción), y al instante vía `Events.LIVES_CHANGED` (lo emite quien
 * gasta o gana una vida en ESTE dispositivo, para no esperar el próximo tick).
 * `null` = no se sabe (sin backend, sin identidad todavía o sin respuesta): la
 * UI de vidas simplemente no se muestra.
 */
export function useLives(): { lives: LivesInfo | null; refresh: () => void } {
  const [lives, setLives] = useState<LivesInfo | null>(null);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    // Sin identityToken (nunca jugó un reto), /me/lives siempre da 403 (y
    // apiGetLives ya corta antes de pedir): no vale la pena armar el poll.
    // Pero el Header (y este hook con él) está montado desde la primera
    // carga de la página, así que si la identidad recién se confirma DURANTE
    // la sesión (ej: el visitante termina su primer reto sin recargar), este
    // efecto ya corrió una vez y no se iba a volver a ejecutar solo. Por eso
    // escuchamos IDENTITY_ESTABLISHED y llamamos a refresh(), que cambia
    // `version` y fuerza que este efecto se rearme con el token ya presente.
    if (getIdentityToken() === null) {
      return on(Events.IDENTITY_ESTABLISHED, refresh);
    }

    let stopped = false;
    const fetchOnce = () => {
      apiGetLives().then((res) => {
        if (!stopped) setLives(res);
      });
    };

    fetchOnce();
    const id = window.setInterval(fetchOnce, POLL_MS);
    const unsubscribe = on(Events.LIVES_CHANGED, fetchOnce);

    return () => {
      stopped = true;
      window.clearInterval(id);
      unsubscribe();
    };
  }, [version, refresh]);

  return { lives, refresh };
}
