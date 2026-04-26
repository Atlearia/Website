import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(sql);
    console.log('✅ Migration complete');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
