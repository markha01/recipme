import * as dotenv from 'dotenv';
import path from 'path';
// Only load .env file in development — in production OSC injects env vars directly
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

import { getConfig } from './config';
import app from './app';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function main() {
  const config = getConfig();

  // Auto-run migrations on startup
  // Path works for both: dev (__dirname=server/src) and prod bundle (__dirname=server/dist)
  const migrationsFolder = path.resolve(__dirname, '../src/db/migrations');
  try {
    const pool = new Pool({ connectionString: config.RECIPME_DATABASE_URL });
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder });
    await pool.end();
    console.log('Database migrations applied.');
  } catch (err: any) {
    // 42704 = undefined_object (e.g. DROP CONSTRAINT on already-removed constraint)
    // 42P07 = duplicate_table (e.g. CREATE TABLE that already exists without IF NOT EXISTS)
    // These can occur when migrations overlap; treat them as non-fatal warnings.
    if (err?.code === '42704' || err?.code === '42P07') {
      console.warn('Migration warning (safe to continue):', err.message);
    } else if (err?.code === 'ENOTFOUND') {
      console.error('Migration error: cannot reach DB host:', err.hostname, '— check DATABASE_URL in parameter store');
      process.exit(1);
    } else {
      console.error('Migration error:', err);
      process.exit(1);
    }
  }

  const PORT = parseInt(config.PORT);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RecipMe server running on port ${PORT} (${config.NODE_ENV})`);
  });
}

main();
