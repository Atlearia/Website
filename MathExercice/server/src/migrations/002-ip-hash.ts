// ── Migration 002: Replace ip_address with ip_hash ──────────────────
// This migration:
//   1. Adds ip_hash columns to users and sessions tables.
//   2. Hashes existing ip_address values using HMAC-SHA256 (IP_HASH_KEY).
//   3. Drops the ip_address columns and their indexes.
//   4. Creates new indexes on ip_hash.
//
// REQUIRES:  IP_HASH_KEY environment variable to be set.
// SAFE:      Uses IF NOT EXISTS / IF EXISTS guards, idempotent.
// ────────────────────────────────────────────────────────────────────

import pg from 'pg';
import { createHmac } from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const ipHashKey = process.env.IP_HASH_KEY;
  if (!ipHashKey) {
    console.error('❌ IP_HASH_KEY environment variable is required for this migration.');
    console.error('   Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // 1. Add ip_hash column to users (if not already present)
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_hash TEXT');
    console.log('✅ users.ip_hash column ensured');

    // 2. Add ip_hash column to sessions (if not already present)
    await pool.query('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_hash TEXT');
    console.log('✅ sessions.ip_hash column ensured');

    // 3. Backfill: hash existing ip_address values into ip_hash
    //    (only where ip_address exists and ip_hash is still null)
    const usersWithIp = await pool.query(
      `SELECT id, ip_address FROM users WHERE ip_address IS NOT NULL AND ip_hash IS NULL`
    );
    let backfilledUsers = 0;
    for (const row of usersWithIp.rows) {
      const hash = createHmac('sha256', ipHashKey).update(row.ip_address.trim().toLowerCase()).digest('hex');
      await pool.query('UPDATE users SET ip_hash = $1 WHERE id = $2', [hash, row.id]);
      backfilledUsers++;
    }
    console.log(`✅ Backfilled ${backfilledUsers} user ip_hash values`);

    const sessionsWithIp = await pool.query(
      `SELECT id, ip_address FROM sessions WHERE ip_address IS NOT NULL AND ip_hash IS NULL`
    );
    let backfilledSessions = 0;
    for (const row of sessionsWithIp.rows) {
      const hash = createHmac('sha256', ipHashKey).update(row.ip_address.trim().toLowerCase()).digest('hex');
      await pool.query('UPDATE sessions SET ip_hash = $1 WHERE id = $2', [hash, row.id]);
      backfilledSessions++;
    }
    console.log(`✅ Backfilled ${backfilledSessions} session ip_hash values`);

    // 4. Drop old ip_address columns
    //    Note: We check column existence before dropping to stay idempotent.
    const colCheck = await pool.query(`
      SELECT column_name, table_name 
      FROM information_schema.columns 
      WHERE table_name IN ('users', 'sessions') AND column_name = 'ip_address'
    `);

    for (const row of colCheck.rows) {
      // Drop index first (if it exists)
      if (row.table_name === 'users') {
        await pool.query('DROP INDEX IF EXISTS idx_users_ip');
      } else if (row.table_name === 'sessions') {
        await pool.query('DROP INDEX IF EXISTS idx_sessions_ip');
      }
      await pool.query(`ALTER TABLE ${row.table_name} DROP COLUMN ip_address`);
      console.log(`✅ Dropped ${row.table_name}.ip_address column`);
    }

    // 5. Create indexes on ip_hash
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_ip_hash ON users (ip_hash)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_ip_hash ON sessions (ip_hash)');
    console.log('✅ Created indexes on ip_hash');

    console.log('\n🎉 Migration 002 complete — raw IPs removed, ip_hash in place.');
  } catch (err) {
    console.error('❌ Migration 002 failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
