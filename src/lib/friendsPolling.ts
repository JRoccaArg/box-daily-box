// src/lib/friendsPolling.ts
//
// Polling liviano para el globito de notificaciones de amistad (Roadmap §4,
// Etapa 3). Mismo espiritu que duelPolling.ts: un hook que arranca un
// `setInterval` mientras esta montado, y se refresca al instante via el
// event bus cuando el propio usuario hace una accion (enviar/aceptar/
// rechazar/eliminar) en vez de esperar el proximo tick.
//
// Es de solo lectura (nunca navega, nunca pausa/afecta una partida en curso):
// se puede dejar corriendo siempre, a diferencia del polling de duelos que
// SI se pausa mientras se juega (ver duelPolling.ts / gameplayState.ts).

import { useEffect, useState } from "react";
import { apiListFriendRequests } from "./api";
import { getIdentityToken } from "./identity";
import { on, Events } from "./events";

const POLL_MS = 10_000;

/** Cantidad de solicitudes de amistad ENTRANTES sin responder (para el globito). */
export function usePendingFriendRequestsCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Sin identityToken (nunca jugo un reto), /friends/* siempre da 403: no
    // vale la pena ni preguntar.
    if (getIdentityToken() === null) return;

    let stopped = false;
    const fetchOnce = () => {
      apiListFriendRequests().then((rs) => {
        if (!stopped) setCount(rs.length);
      });
    };

    fetchOnce();
    const id = window.setInterval(fetchOnce, POLL_MS);
    const unsubscribe = on(Events.FRIENDS_CHANGED, fetchOnce);

    return () => {
      stopped = true;
      window.clearInterval(id);
      unsubscribe();
    };
  }, []);

  return count;
}
