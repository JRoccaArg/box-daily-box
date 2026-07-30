// src/api/db.ts
import { Pool, QueryResult } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Máximo de conexiones concurrentes. Railway free/hobby tiene límites bajos;
  // un pool acotado evita agotar conexiones bajo carga o ataque.
  max: 10,
  // Cierra conexiones inactivas tras 30s.
  idleTimeoutMillis: 30_000,
  // Si no consigue conexión en 10s, falla rápido (no cuelga el request).
  connectionTimeoutMillis: 10_000,
});

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // Tabla users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        display_name TEXT,
        country_code TEXT,
        name_changed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Migración: agregar name_changed_at si no existe
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS name_changed_at TIMESTAMPTZ;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    // Tabla google_accounts (vinculación Google → userId)
    await client.query(`
      CREATE TABLE IF NOT EXISTS google_accounts (
        google_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        name TEXT,
        picture_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        last_login TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id)
      );
    `);
    // Índice para búsqueda rápida por email
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_google_accounts_email ON google_accounts(email);
    `);

    // Migraciones (columnas nuevas)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    // Deduplicación previa: para cada grupo de duplicados case-insensitive,
    // conservamos al usuario más antiguo con su nombre intacto y renombramos
    // al resto agregando los primeros caracteres de su id como sufijo.
    // Truncamos a 30 chars (límite de sanitizeDisplayName) para no romper el
    // formato. Además reseteamos name_changed_at para que puedan elegir un
    // nombre nuevo sin esperar al mes siguiente.
    await client.query(`
      WITH dupes AS (
        SELECT id,
               display_name,
               ROW_NUMBER() OVER (
                 PARTITION BY LOWER(display_name)
                 ORDER BY created_at ASC NULLS LAST, id ASC
               ) AS rn
        FROM users
        WHERE display_name IS NOT NULL
      )
      UPDATE users u
      SET display_name = LEFT(u.display_name || '_' || SUBSTRING(u.id, 1, 4), 30),
          name_changed_at = NULL
      FROM dupes d
      WHERE u.id = d.id AND d.rn > 1;
    `);

    // Índice único case-insensitive sobre display_name. Impide dos usuarios
    // con el mismo nombre (ignora mayúsculas/minúsculas). NULLs permitidos.
    // La deduplicación previa garantiza que la creación no falla en producción.
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_display_name_unique
      ON users (LOWER(display_name))
      WHERE display_name IS NOT NULL;
    `);

    // Tabla attempts.
    // OJO: la unicidad "un intento por juego por día" NO va como constraint
    // inline acá. Se maneja con un ÍNDICE ÚNICO PARCIAL (WHERE duel_id IS NULL)
    // más abajo, para que los intentos de DUELO (duel_id no nulo) puedan
    // repetir (user_id, game_id, date_key) sin chocar con el reto diario.
    await client.query(`
      CREATE TABLE IF NOT EXISTS attempts (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        game_id TEXT NOT NULL,
        date_key DATE NOT NULL,
        difficulty TEXT NOT NULL,
        won BOOLEAN NOT NULL,
        time_seconds INTEGER,
        points INTEGER NOT NULL,
        flagged BOOLEAN DEFAULT false,
        ranked BOOLEAN DEFAULT true,
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Migración: agregar ip_address si no existe
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE attempts ADD COLUMN IF NOT EXISTS ip_address TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    // Migración: agregar ranked si no existe.
    // ranked=false significa que el attempt NO cuenta para el ranking global
    // (otra cuenta de la misma IP ya jugó ese juego ese día). El resultado se
    // guarda igual (historial personal), pero no entra al ranking ni a la
    // posición mundial.
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE attempts ADD COLUMN IF NOT EXISTS ranked BOOLEAN DEFAULT true;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    // ─── Sistema de duelos (Roadmap §4): duel_id en attempts ─────────
    // Un intento de duelo se guarda en la MISMA tabla attempts, con duel_id
    // no nulo y ranked=false (nunca entra al ranking global). La columna es
    // nullable: los intentos del reto diario tienen duel_id NULL.
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE attempts ADD COLUMN IF NOT EXISTS duel_id TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
    // Migración del constraint viejo: la unicidad "un intento por juego por día"
    // era un UNIQUE de tabla (nombre autogenerado por Postgres). Lo quitamos y
    // lo reemplazamos por un índice único PARCIAL que solo aplica al reto diario
    // (duel_id IS NULL). Así los duelos pueden repetir (user,game,fecha).
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE attempts DROP CONSTRAINT IF EXISTS attempts_user_id_game_id_date_key_key;
      END $$;
    `);
    // Unicidad del reto diario (solo intentos NO-duelo).
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_unique_daily
      ON attempts (user_id, game_id, date_key)
      WHERE duel_id IS NULL;
    `);
    // Unicidad por duelo: cada usuario puede tener 1 solo intento por duelo.
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_unique_duel
      ON attempts (duel_id, user_id)
      WHERE duel_id IS NOT NULL;
    `);
    // Historial de duelos: buscar intentos por duel_id.
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_duel
      ON attempts (duel_id)
      WHERE duel_id IS NOT NULL;
    `);

    // Índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_ranking
      ON attempts (date_key, user_id)
      WHERE won AND NOT flagged;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_monthly
      ON attempts (date_key, won, flagged);
    `);

    // Índice para buscar por IP + game + fecha (anti multi-dispositivo)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_ip_game_date
      ON attempts (ip_address, game_id, date_key);
    `);

    // ─── Sistema de badges ───────────────────────────────────────────
    // Rol del usuario. 'user' por defecto; 'admin'/'superadmin' se asignan
    // SOLO a mano en la DB (nunca por API). El badge admin/superadmin se DERIVA
    // de esta columna en tiempo de lectura (no se guarda en `badges`).
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
    // CHECK del rol (idempotente).
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD CONSTRAINT users_role_check
          CHECK (role IN ('user', 'admin', 'superadmin'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // Selección de badges destacados del usuario (hasta 3 slots) que se muestran
    // inline en el ranking. NULL => default por jerarquía. Validado server-side.
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS featured_badges JSONB;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    // Tabla badges: solo guarda badges GANADOS (podio mensual). Un badge por
    // (usuario, tipo, mes). La UNIQUE hace idempotente la entrega concurrente.
    await client.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_type TEXT NOT NULL
          CHECK (badge_type IN ('monthly_gold', 'monthly_silver', 'monthly_bronze')),
        reference_month DATE NOT NULL,
        awarded_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, badge_type, reference_month)
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);
    `);

    // ─── Sistema de amigos y duelos (Roadmap §4) ─────────────────────
    // Código de amigo: string corto, único, compartible (tipo "friend code"
    // de Nintendo/Discord). Se genera on-demand la primera vez que se pide.
    // NULL hasta entonces. UNIQUE garantiza que dos usuarios nunca comparten
    // código (a diferencia de derivarlo de un hash del id, que podía colisionar).
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS friend_code TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_friend_code
      ON users (friend_code)
      WHERE friend_code IS NOT NULL;
    `);

    // Amistades (bidireccional). Se guarda SIEMPRE con user_a < user_b para
    // evitar filas duplicadas (A-B y B-A). El CHECK lo fuerza a nivel DB.
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        user_a TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_b TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (user_a, user_b),
        CHECK (user_a < user_b)
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_friendships_a ON friendships(user_a);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_friendships_b ON friendships(user_b);
    `);

    // Solicitudes de amistad (pendientes → aceptadas/rechazadas).
    await client.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id BIGSERIAL PRIMARY KEY,
        from_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMPTZ DEFAULT now(),
        resolved_at TIMESTAMPTZ,
        CHECK (from_user <> to_user)
      );
    `);
    // Una sola solicitud pendiente por par (from, to) a la vez.
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_pending
      ON friend_requests (from_user, to_user)
      WHERE status = 'pending';
    `);
    // Buscar solicitudes pendientes que me llegaron.
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_friend_requests_to
      ON friend_requests (to_user)
      WHERE status = 'pending';
    `);

    // Duelos. id = código corto url-safe (8 chars sin ambigüedad). El seed del
    // puzzle se deriva del id (guardado explícito para trazabilidad). Estados:
    // pending (esperando aceptación, TTL 60s) → active (jugando, TTL 15min) →
    // finished / expired / cancelled.
    await client.query(`
      CREATE TABLE IF NOT EXISTS duels (
        id TEXT PRIMARY KEY,
        creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        opponent_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        game_id TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        time_limit INT,
        seed TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'active', 'finished', 'expired', 'cancelled')),
        creator_result JSONB,
        opponent_result JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL,
        finished_at TIMESTAMPTZ,
        CHECK (opponent_id IS NULL OR opponent_id <> creator_id)
      );
    `);
    // "Máx 1 duelo activo por usuario": índices únicos parciales. El creador no
    // puede tener dos duelos pending/active; el oponente tampoco. Esto es la
    // garantía REAL (a nivel DB), no solo la validación del handler.
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_duels_creator_active
      ON duels (creator_id)
      WHERE status IN ('pending', 'active');
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_duels_opponent_active
      ON duels (opponent_id)
      WHERE status IN ('pending', 'active') AND opponent_id IS NOT NULL;
    `);
    // Buscar duelos pendientes que me llegaron (para el banner in-app).
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_duels_opponent_pending
      ON duels (opponent_id)
      WHERE status = 'pending' AND opponent_id IS NOT NULL;
    `);
    // Cleanup de expirados: buscar por estado + expiración.
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_duels_expiry
      ON duels (expires_at)
      WHERE status IN ('pending', 'active');
    `);

    // Tabla sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        game_id TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        date_key DATE NOT NULL,
        started_at BIGINT NOT NULL,
        expires_at BIGINT NOT NULL,
        consumed BOOLEAN DEFAULT false,
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Migración: agregar ip_address a sessions si no existe
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    console.log("✅ Database migration completed");
  } finally {
    client.release();
  }
}

export async function query(
  sql: string,
  values?: (string | number | boolean | Date | null)[]
): Promise<QueryResult> {
  return pool.query(sql, values);
}

/**
 * Borra sesiones expiradas hace más de 1 hora. Evita que la tabla sessions
 * crezca sin límite (vector de agotamiento de disco). Se llama periódicamente
 * desde el arranque del servidor.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const cutoff = Date.now() - 60 * 60 * 1000; // 1 hora atrás
  const res = await pool.query(
    "DELETE FROM sessions WHERE expires_at < $1",
    [cutoff],
  );
  return res.rowCount ?? 0;
}

export async function transaction<T>(
  fn: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
