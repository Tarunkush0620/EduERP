import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://eduerp:eduerp_secret@localhost:5432/eduerp',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}

export type Database = ReturnType<typeof getDb>;
