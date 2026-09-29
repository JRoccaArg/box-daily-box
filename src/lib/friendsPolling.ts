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
  // Fuerza rearmar el efecto de abajo cuando la identidad recién se confirma
  // DURANTE la sesión (ver comentario adentro del efecto): sin esto el efecto
  // depende de `[]` y solo corre una vez, así que un visitante sin identidad
  // al montar el Header quedaría sin poll para siempre aunque juegue su
  // primer reto sin recargar la página.
  const [identityVersion, setIdentityVersion] = useState(0);

  useEffect(() => {
    // Sin identityToken (nunca jugo un reto), /friends/* siempre da 403: no
    // vale la pena ni preguntar. Escuchamos IDENTITY_ESTABLISHED para
    // rearmar este efecto apenas la identidad se confirme (ver identityVersion).
    if (getIdentityToken() === null) {
      return on(Events.IDENTITY_ESTABLISHED, () => setIdentityVersion((v) => v + 1));
    }

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
  }, [identityVersion]);

  return count;
}
