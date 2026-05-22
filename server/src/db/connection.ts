import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool;
let db: ReturnType<typeof drizzle<typeof schema>>;

export function getDb() {
  if (!db) {
    pool = new Pool({
      connectionString: process.env.RECIPME_DATABASE_URL,
      max: 10,
    });
    db = drizzle(pool, { schema });
  }
  return db;
}
