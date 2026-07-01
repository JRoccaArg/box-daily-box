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
        created_at TIMESTAMPTZ DEFAULT now()
      );
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

    // Tabla attempts
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
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, game_id, date_key)
      );
    `);

    // Migración: agregar ip_address si no existe
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE attempts ADD COLUMN IF NOT EXISTS ip_address TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
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
