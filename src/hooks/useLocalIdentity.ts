// src/hooks/useLocalIdentity.ts
//
// Identidad local (userId, nombre, país) para mostrar en las páginas v2.
// null hasta montar en el cliente (prerender sin localStorage) y se relee
// cuando se guarda el perfil o se confirma la identidad con el server.

import { useEffect, useState } from "react";
import { getIdentity, getIdentityToken, type UserIdentity } from "@/lib/identity";
import { isLoggedIn, getUserEmail } from "@/lib/auth";
import { on, Events } from "@/lib/events";

export type LocalIdentity = UserIdentity & {
  /** true si ya jugó/guardó algo: tiene identityToken (amigos, vidas, etc.). */
  hasToken: boolean;
  /** true si la cuenta está vinculada a Google. */
  loggedIn: boolean;
  email: string | null;
};

function read(): LocalIdentity {
  const identity = getIdentity();
  return {
    ...identity,
    hasToken: getIdentityToken() !== null,
    loggedIn: isLoggedIn(),
    email: getUserEmail(),
  };
}

export function useLocalIdentity(): LocalIdentity | null {
  const [identity, setIdentity] = useState<LocalIdentity | null>(null);
  useEffect(() => {
    const refresh = () => setIdentity(read());
    refresh();
    const offProfile = on(Events.PROFILE_CHANGED, refresh);
    const offToken = on(Events.IDENTITY_ESTABLISHED, refresh);
    return () => {
      offProfile();
      offToken();
    };
  }, []);
  return identity;
}
