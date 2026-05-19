import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
    const pool = new Pool({ connectionString: config.DATABASE_URL });
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder });
    await pool.end();
    console.log('Database migrations applied.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }

  const PORT = parseInt(config.PORT);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RecipMe server running on port ${PORT} (${config.NODE_ENV})`);
  });
}

main();
