// Replaces ip_address columns with ip_hash (HMAC-SHA256).
// Backfills existing rows, drops the old columns, creates new indexes.
// Idempotent — safe to run multiple times.

import pg from 'pg';
import { createHmac } from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const ipHashKey = process.env.IP_HASH_KEY;
  if (!ipHashKey) {
    console.error('IP_HASH_KEY env var is required for this migration.');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_hash TEXT');
    console.log('users.ip_hash column ensured');

    await pool.query('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_hash TEXT');
    console.log('sessions.ip_hash column ensured');

    // backfill: hash existing raw IPs where ip_hash is still null
    const usersWithIp = await pool.query(
      `SELECT id, ip_address FROM users WHERE ip_address IS NOT NULL AND ip_hash IS NULL`
    );
    let backfilledUsers = 0;
    for (const row of usersWithIp.rows) {
      const hash = createHmac('sha256', ipHashKey).update(row.ip_address.trim().toLowerCase()).digest('hex');
      await pool.query('UPDATE users SET ip_hash = $1 WHERE id = $2', [hash, row.id]);
      backfilledUsers++;
    }
    console.log(`Backfilled ${backfilledUsers} user ip_hash values`);

    const sessionsWithIp = await pool.query(
      `SELECT id, ip_address FROM sessions WHERE ip_address IS NOT NULL AND ip_hash IS NULL`
    );
    let backfilledSessions = 0;
    for (const row of sessionsWithIp.rows) {
      const hash = createHmac('sha256', ipHashKey).update(row.ip_address.trim().toLowerCase()).digest('hex');
      await pool.query('UPDATE sessions SET ip_hash = $1 WHERE id = $2', [hash, row.id]);
      backfilledSessions++;
    }
    console.log(`Backfilled ${backfilledSessions} session ip_hash values`);

    // drop old ip_address columns if they still exist
    const colCheck = await pool.query(`
      SELECT column_name, table_name 
      FROM information_schema.columns 
      WHERE table_name IN ('users', 'sessions') AND column_name = 'ip_address'
    `);

    for (const row of colCheck.rows) {
      if (row.table_name === 'users') {
        await pool.query('DROP INDEX IF EXISTS idx_users_ip');
      } else if (row.table_name === 'sessions') {
        await pool.query('DROP INDEX IF EXISTS idx_sessions_ip');
      }
      await pool.query(`ALTER TABLE ${row.table_name} DROP COLUMN ip_address`);
      console.log(`Dropped ${row.table_name}.ip_address`);
    }

    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_ip_hash ON users (ip_hash)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_ip_hash ON sessions (ip_hash)');
    console.log('Indexes on ip_hash created');

    console.log('Migration 002 complete — raw IPs removed.');
  } catch (err) {
    console.error('Migration 002 failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
