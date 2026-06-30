// src/api/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getDb = () => pool;

/**
 * Ejecuta todas las migraciones al startup.
 * Crea tablas si no existen.
 */
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Crear tabla users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        display_name TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
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

    // Índice para ranking rápido
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_ranking
      ON attempts (date_key, user_id)
      WHERE won AND NOT flagged;
    `);

    // Crear tabla sessions (retos abiertos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY,
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

/**
 * Ejecuta una query y devuelve resultados.
 */
export async function query(sql: string, values?: any[]) {
  return pool.query(sql, values);
}

/**
 * Ejecuta una transacción.
 */
export async function transaction(fn: (client: any) => Promise<any>) {
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
