// src/lib/events.ts
//
// Event bus minimalista para notificar cambios que ocurren fuera del árbol
// de React (ej: sync con server desde módulos como auth.ts). Se usa para
// que el StatsProvider refresque cuando los datos locales cambian.

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

export function emit(event: string): void {
  const ls = listeners.get(event);
  if (!ls) return;
  for (const fn of ls) {
    try {
      fn();
    } catch {
      // Ignorar errores individuales de listeners
    }
  }
}

export function on(event: string, fn: Listener): () => void {
  let ls = listeners.get(event);
  if (!ls) {
    ls = new Set();
    listeners.set(event, ls);
  }
  ls.add(fn);
  return () => {
    ls?.delete(fn);
  };
}

/** Nombres de eventos usados en la app. */
export const Events = {
  STATS_CHANGED: "stats:changed",
  /** Solicita abrir el modal de stats/ranking desde cualquier lugar. */
  OPEN_STATS: "stats:open",
  /** Cambio en amistades (enviar/aceptar/rechazar/eliminar): refresca el
   *  globito de notificaciones y cualquier lista de amigos montada, sin
   *  esperar al proximo poll. */
  FRIENDS_CHANGED: "friends:changed",
  /** Cambio en el conjunto de logros "no vistos" (uno nuevo se otorga, o la
   *  pestaña Logros se abre y lo vacía): refresca el globito del botón Stats
   *  sin polling, ver src/lib/achievements.ts. */
  ACHIEVEMENTS_CHANGED: "achievements:changed",
  /** Cambio en las vidas extra (se gastó una, se ganó una): refresca cualquier
   *  vista que las muestre (src/hooks/useLives.ts). */
  LIVES_CHANGED: "lives:changed",
  /** Se acaba de ANUNCIAR una vida ganada (toast ya disparado por
   *  LivesToastWatcher, tras esperar a que termine una partida en curso si
   *  hacía falta). Distinto de LIVES_CHANGED: este es solo para la animación
   *  decorativa del corazoncito del Header, no dispara ningún refetch. */
  LIFE_GAINED: "lives:gained",
  /** La identidad pasó de "sin token" a "con token" DURANTE la sesión actual
   *  (ver setIdentityToken en src/lib/identity.ts). El Header (y con él los
   *  hooks de polling que dependen de identityToken, como useLives.ts y
   *  friendsPolling.ts) está montado desde la primera carga de la página, así
   *  que un visitante sin token todavía puede tener esos hooks ya corridos y
   *  "dormidos" cuando recién ahora consigue su primer identityToken (ej:
   *  termina su primer reto sin recargar la página). Sin este evento se
   *  quedarían escuchando en el vacío el resto de la sesión. */
  IDENTITY_ESTABLISHED: "identity:established",
} as const;
