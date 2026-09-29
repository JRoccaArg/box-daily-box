// src/api/accountMerge.ts
//
// Al entrar con Google, el usuario anónimo se FUSIONA en la cuenta de Google y
// después se borra (auth.ts, migrateAnonymousAttempts). Las tablas de vidas y
// desafíos referencian a `users` con ON DELETE CASCADE, así que sin este paso
// ese borrado se llevaba puesto:
//  - las vidas juntadas jugando sin cuenta,
//  - los links de desafío ya compartidos (dejaban de abrir: "el link no vence"),
//  - las partidas jugadas en links de otros (se podía volver a jugar el mismo),
//  - el historial de referidos y de vidas gastadas (que sostiene los límites
//    "una por persona por día" y "una vida por día").
//
// Se pasa todo a la cuenta de destino. Donde el destino ya tiene una fila que
// chocaría con un índice único (p. ej. los dos jugaron el mismo juego el mismo
// día), gana la del destino y la del anónimo cae con el borrado, igual que la
// regla de attempts de migrateAnonymousAttempts.
//
// Recibe el ejecutor de queries por parámetro (se prueba contra PGlite en
// scripts/test-account-merge.ts). DEBE correr dentro de la transacción de la
// migración, antes de borrar al anónimo.

import type { QueryFn } from "./lives";

export async function mergeAnonymousExtras(
  q: QueryFn,
  fromUserId: string,
  toUserId: string,
): Promise<void> {
  if (fromUserId === toUserId) return;

  // 1. Vidas: se suman. La fecha de la última vida gastada queda en la más
  //    reciente (GREATEST ignora NULL): si cualquiera de los dos ya gastó la de
  //    hoy, fusionar no regala otra.
  await q(
    `UPDATE users d
        SET extra_lives_balance = d.extra_lives_balance + a.extra_lives_balance,
            last_life_used_date = GREATEST(d.last_life_used_date, a.last_life_used_date)
       FROM users a
      WHERE d.id = $2 AND a.id = $1`,
    [fromUserId, toUserId],
  );

  // 2. Desafíos propios (los links compartidos siguen abriendo).
  await q(
    `UPDATE challenges c SET owner_id = $2
      WHERE c.owner_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM challenges x
           WHERE x.owner_id = $2 AND x.game_id = c.game_id AND x.date_key = c.date_key
        )`,
    [fromUserId, toUserId],
  );

  // 3. Partidas en desafíos ajenos ("una sola vez por link" sigue valiendo).
  await q(
    `UPDATE challenge_plays p SET user_id = $2
      WHERE p.user_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM challenge_plays x WHERE x.challenge_id = p.challenge_id AND x.user_id = $2
        )`,
    [fromUserId, toUserId],
  );

  // 4. Referidos. Primero los que eran ENTRE las dos identidades (tras fusionar
  //    serían un auto-referido, que el CHECK prohíbe).
  await q(
    `DELETE FROM referrals
      WHERE (referrer_id = $1 AND referred_user_id = $2)
         OR (referrer_id = $2 AND referred_user_id = $1)`,
    [fromUserId, toUserId],
  );
  await q(
    `UPDATE referrals r SET referrer_id = $2
      WHERE r.referrer_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM referrals x
           WHERE x.referrer_id = $2 AND x.date_key = r.date_key
             AND (x.referred_user_id = r.referred_user_id
                  OR (r.referred_ip_hash IS NOT NULL AND x.referred_ip_hash = r.referred_ip_hash))
        )`,
    [fromUserId, toUserId],
  );
  await q(
    `UPDATE referrals r SET referred_user_id = $2
      WHERE r.referred_user_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM referrals x
           WHERE x.referrer_id = r.referrer_id AND x.referred_user_id = $2 AND x.date_key = r.date_key
        )`,
    [fromUserId, toUserId],
  );

  // 5. Segundas oportunidades (sostienen "una vida por día" y la regla de IP).
  await q(
    `UPDATE second_chances s SET user_id = $2
      WHERE s.user_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM second_chances x WHERE x.user_id = $2 AND x.date_key = s.date_key
        )`,
    [fromUserId, toUserId],
  );
}
