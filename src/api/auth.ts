// src/api/auth.ts
//
// Autenticación con Google OAuth 2.0
//
// Flujo:
//  1. Frontend redirige a Google con GOOGLE_CLIENT_ID
//  2. Usuario acepta y Google redirige a /auth/google/callback con code
//  3. Backend intercambia code por access_token
//  4. Backend obtiene datos del usuario (email, name, googleId)
//  5. Backend vincula/crea userId y devuelve identidad al frontend
//
// Reglas de negocio:
//  - Una cuenta Google = un userId (UNIQUE en google_accounts)
//  - Si el usuario ya tiene attempts anónimos y se loguea por primera vez:
//    → sus attempts se mantienen (se vincula el userId actual)
//  - Si el usuario se loguea desde otro dispositivo:
//    → se devuelve el userId original (los attempts locales de ese dispositivo
//      se descartan silenciosamente al sincronizar)
//  - Si hay conflicto (misma cuenta, misma fecha, mismo juego):
//    → gana el intento del server (regla de negocio)

import { FastifyRequest, FastifyReply } from "fastify";
import { query, transaction } from "./db";
import { sanitizeDisplayName } from "./validate";
import { signIdentityToken } from "./identity-token";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    "⚠️  GOOGLE_CLIENT_ID/SECRET no configurados. OAuth deshabilitado.",
  );
}

// ─── Tipos ─────────────────────────────────────────────────────────

type GoogleUserInfo = {
  sub: string; // Google ID único
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  id_token: string;
  scope: string;
  token_type: string;
};

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Intercambia el `code` de Google por un `access_token`.
 */
async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<GoogleTokenResponse | null> {
  try {
    const params = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error("Google token exchange failed:", res.status);
      return null;
    }
    return (await res.json()) as GoogleTokenResponse;
  } catch (err) {
    console.error("Google token exchange error:", err);
    return null;
  }
}

/**
 * Obtiene info del usuario desde Google API con el access_token.
 */
async function getGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo | null> {
  try {
    const res = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    if (!res.ok) {
      console.error("Google userinfo failed:", res.status);
      return null;
    }
    return (await res.json()) as GoogleUserInfo;
  } catch (err) {
    console.error("Google userinfo error:", err);
    return null;
  }
}

// ─── Endpoints ─────────────────────────────────────────────────────

/**
 * POST /auth/google
 *
 * Recibe el `code` de Google desde el frontend (después del OAuth flow).
 * Devuelve la identidad del usuario (userId, displayName, countryCode).
 *
 * Body:
 * {
 *   code: string,
 *   redirectUri: string,
 *   currentUserId?: string  // userId actual del frontend (anónimo)
 * }
 */
export async function googleAuthCallback(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    reply.code(503).send({ error: "OAuth no configurado" });
    return;
  }

  try {
    const { code, redirectUri, currentUserId } = req.body as {
      code?: string;
      redirectUri?: string;
      currentUserId?: string;
    };

    if (!code || typeof code !== "string" || code.length > 512) {
      reply.code(422).send({ error: "code inválido" });
      return;
    }
    if (!redirectUri || typeof redirectUri !== "string") {
      reply.code(422).send({ error: "redirectUri inválido" });
      return;
    }

    // 1. Intercambiar code por token
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    if (!tokenData) {
      reply.code(401).send({ error: "No se pudo autenticar con Google" });
      return;
    }

    // 2. Obtener info del usuario
    const userInfo = await getGoogleUserInfo(tokenData.access_token);
    if (!userInfo || !userInfo.email_verified) {
      reply.code(401).send({ error: "Email de Google no verificado" });
      return;
    }

    const googleId = userInfo.sub;
    const email = userInfo.email;
    const googleName = sanitizeDisplayName(userInfo.name || "");
    const picture = userInfo.picture || null;

    // 3. Buscar si ya existe la cuenta Google
    const existing = await query(
      "SELECT user_id FROM google_accounts WHERE google_id = $1",
      [googleId],
    );

    let userId: string;
    let isNewLink = false;
    let migratedCount = 0;

    if (existing.rows.length > 0) {
      // Cuenta Google ya vinculada: devolver su userId
      userId = existing.rows[0].user_id;
      // Actualizar last_login
      await query(
        "UPDATE google_accounts SET last_login = now() WHERE google_id = $1",
        [googleId],
      );

      // MIGRACIÓN: si el frontend viene con un userId anónimo distinto,
      // migrar los attempts anónimos al userId de Google (si no hay conflicto).
      // Regla:
      //  - Si server ya tiene attempt para (game, date) → descartar el local (borrarlo)
      //  - Si server NO tiene → migrar (cambiar user_id del attempt anónimo)
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (
        typeof currentUserId === "string" &&
        UUID_RE.test(currentUserId) &&
        currentUserId !== userId
      ) {
        const anonHasGoogle = await query(
          "SELECT google_id FROM google_accounts WHERE user_id = $1",
          [currentUserId],
        );
        // Solo migrar si el userId anónimo NO está vinculado a ninguna cuenta
        if (anonHasGoogle.rows.length === 0) {
          // migrateAnonymousAttempts hace TODO atómicamente:
          // migra attempts + borra sesiones + borra el usuario anónimo.
          migratedCount = await migrateAnonymousAttempts(currentUserId, userId);
        }
      }
    } else {
      // Cuenta Google nueva: vincular con el userId actual o crear uno
      isNewLink = true;

      // Validar currentUserId (si viene, debe ser UUID válido)
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validCurrentUser = typeof currentUserId === "string" && UUID_RE.test(currentUserId);

      if (validCurrentUser) {
        // Verificar que ese userId no tenga ya otra cuenta Google vinculada
        const alreadyLinked = await query(
          "SELECT google_id FROM google_accounts WHERE user_id = $1",
          [currentUserId],
        );
        if (alreadyLinked.rows.length > 0) {
          // Este userId ya está vinculado a OTRA cuenta Google → error
          reply.code(409).send({
            error: "Este dispositivo ya está vinculado a otra cuenta de Google",
          });
          return;
        }
        // Verificar que el userId exista en users (crearlo si no)
        await query(
          `INSERT INTO users (id, display_name)
           VALUES ($1, $2)
           ON CONFLICT (id) DO NOTHING`,
          [currentUserId, googleName],
        );
        userId = currentUserId;
      } else {
        // Sin userId válido: generar uno nuevo
        const { randomUUID } = await import("crypto");
        userId = randomUUID();
        await query(
          "INSERT INTO users (id, display_name) VALUES ($1, $2)",
          [userId, googleName],
        );
      }

      // Vincular Google → userId
      await query(
        `INSERT INTO google_accounts (google_id, user_id, email, name, picture_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [googleId, userId, email, googleName, picture],
      );
    }

    // 4. Devolver identidad completa del usuario
    const userRow = await query(
      "SELECT id, display_name, country_code FROM users WHERE id = $1",
      [userId],
    );
    if (userRow.rows.length === 0) {
      reply.code(500).send({ error: "Usuario no encontrado tras login" });
      return;
    }

    const user = userRow.rows[0];
    reply.code(200).send({
      userId: user.id,
      displayName: user.display_name || googleName,
      countryCode: user.country_code,
      email,
      picture,
      isNewLink,
      migratedCount,
      // Emitir identityToken: Google probó la identidad, así que le damos
      // el token que prueba posesión del userId para futuras operaciones.
      identityToken: signIdentityToken(user.id),
    });
  } catch (err) {
    console.error("googleAuthCallback error:", err);
    reply.code(500).send({ error: "Error interno" });
  }
}

/**
 * Migra los attempts del userId anónimo al userId de Google Y borra el
 * usuario anónimo, todo de forma ATÓMICA en una sola transacción.
 * Regla:
 *  - Si el destino YA tiene attempt para (game_id, date_key) → borrar el anónimo (descartar local)
 *  - Si el destino NO tiene → cambiar user_id del attempt anónimo
 *
 * O se hace todo (migrar + borrar usuario), o no se hace nada. Esto evita
 * estados corruptos si algo falla a mitad de camino.
 *
 * @returns cantidad de attempts efectivamente migrados
 */
async function migrateAnonymousAttempts(
  fromUserId: string,
  toUserId: string,
): Promise<number> {
  return transaction(async (client) => {
    // 1. Traer todos los attempts del anónimo (lock FOR UPDATE para evitar
    //    que otra request los modifique mientras migramos).
    const anonAttempts = await client.query(
      "SELECT id, game_id, date_key FROM attempts WHERE user_id = $1 FOR UPDATE",
      [fromUserId],
    );

    let migrated = 0;

    for (const row of anonAttempts.rows) {
      // ¿El destino ya tiene attempt para (game, date)?
      const conflict = await client.query(
        "SELECT id FROM attempts WHERE user_id = $1 AND game_id = $2 AND date_key = $3",
        [toUserId, row.game_id, row.date_key],
      );

      if (conflict.rows.length > 0) {
        // Destino ya tiene → descartar el anónimo (borrar)
        await client.query("DELETE FROM attempts WHERE id = $1", [row.id]);
      } else {
        // Destino no tiene → migrar
        await client.query(
          "UPDATE attempts SET user_id = $1 WHERE id = $2",
          [toUserId, row.id],
        );
        migrated++;
      }
    }

    // 2. Borrar el usuario anónimo. Sus sesiones quedan huérfanas pero se
    //    limpian por expiración (cleanupExpiredSessions). Los attempts ya
    //    se movieron o borraron arriba.
    await client.query("DELETE FROM sessions WHERE user_id = $1", [fromUserId]);
    await client.query("DELETE FROM users WHERE id = $1", [fromUserId]);

    return migrated;
  });
}

/**
 * POST /auth/logout
 *
 * En este diseño el "logout" es solo del lado cliente (borrar identity local).
 * Este endpoint existe para futuros usos (invalidar tokens, etc).
 */
export async function logout(
  _req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  reply.code(200).send({ ok: true });
}
