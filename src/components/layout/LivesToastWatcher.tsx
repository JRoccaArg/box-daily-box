// src/components/layout/LivesToastWatcher.tsx
//
// Anuncia "ganaste una vida" (toast + aviso al corazoncito del Header) sin
// interrumpir una partida en curso. Montado UNA sola vez en Layout (mismo
// criterio que DuelBanner/ToastContainer): así el aumento de saldo se
// anuncia una sola vez, aunque Header/Home/GameShell tengan cada uno su
// propia lectura de useLives() para MOSTRAR el número.
//
// Regla pedida por el operador: si en ese momento hay un reto en curso (el
// cronómetro corriendo, propio o de un desafío por link), el aviso se
// GUARDA y se muestra recién cuando esa partida termina — nunca interrumpe
// el juego ni el cronómetro. Se apoya en gameplayState.ts (la misma bandera
// que ya usa DuelBanner para no pisarle la confirmación a una partida en
// curso).
//
// El "último saldo ya anunciado" se guarda en localStorage (mismo patrón que
// el globito de logros, achievements.ts): sobrevive a un refresco de página
// y evita festejar dos veces el mismo saldo, o festejar de entrada el saldo
// que ya tenías la primera vez que esta pestaña carga.

import { useEffect, useRef } from "react";
import { useI18n } from "@/context";
import { useLives } from "@/hooks/useLives";
import { showToast } from "@/lib/toast";
import { storage } from "@/lib/storage";
import { isGameplayActive, onGameplayChanged } from "@/lib/gameplayState";
import { emit, Events } from "@/lib/events";

const LAST_SEEN_KEY = "lives_last_announced_balance";

export function LivesToastWatcher() {
  const { t } = useI18n();
  const { lives } = useLives();

  // null = todavía no se leyó localStorage en esta carga de página.
  const lastSeenRef = useRef<number | null>(null);
  const readRef = useRef(false);

  useEffect(() => {
    if (!readRef.current) {
      lastSeenRef.current = storage.get<number | null>(LAST_SEEN_KEY, null);
      readRef.current = true;
    }
    if (!lives) return;

    const sync = (balance: number) => {
      lastSeenRef.current = balance;
      storage.set(LAST_SEEN_KEY, balance);
    };

    const check = () => {
      const seen = lastSeenRef.current;
      // Primera lectura real (recién se supo el saldo): anclar sin festejar,
      // el saldo heredado no es una vida "recién ganada".
      if (seen === null) {
        sync(lives.balance);
        return;
      }
      if (lives.balance <= seen) {
        // Igual o bajó (se gastó una, u otro dispositivo la usó): sincronizar
        // en silencio.
        sync(lives.balance);
        return;
      }
      // Subió. Si hay una partida en curso AHORA, se deja pendiente: no se
      // toca `lastSeenRef`, así que la próxima verificación (al terminar esa
      // partida) vuelve a ver la diferencia y recién ahí avisa.
      if (isGameplayActive()) return;
      showToast(t("lives.gained_toast"), "success");
      emit(Events.LIFE_GAINED);
      sync(lives.balance);
    };

    check();
    return onGameplayChanged(check);
  }, [lives, t]);

  return null;
}
