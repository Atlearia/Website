import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_hash TEXT');
    console.log('Ensured ip_hash column on users');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_ip_hash ON users (ip_hash)');
    console.log('Created index on ip_hash');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id            BIGSERIAL PRIMARY KEY,
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ip_hash       TEXT,
        started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        ended_at      TIMESTAMPTZ,
        attempts      INT NOT NULL DEFAULT 0,
        correct       INT NOT NULL DEFAULT 0,
        total_time_ms BIGINT NOT NULL DEFAULT 0
      )
    `);
    console.log('Created sessions table');

    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_ip_hash ON sessions (ip_hash)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions (started_at)');
    console.log('Created indexes on sessions');

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
