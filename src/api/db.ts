// src/api/db.ts
import { Pool, QueryResult } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // Crear tabla users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        display_name TEXT,
        country_code TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Migración: agregar country_code si no existe (tablas ya creadas)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    // Crear tabla attempts (ranking)
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
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, game_id, date_key)
      );
    `);

    // Índices para ranking rápido
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_ranking
      ON attempts (date_key, user_id)
      WHERE won AND NOT flagged;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_monthly
      ON attempts (date_key, won, flagged);
    `);

    // Crear tabla sessions
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
        created_at TIMESTAMPTZ DEFAULT now()
      );
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
