// Wipes sessions and attempts older than RETENTION_DAYS (default 90).
// User rows stay around for FK integrity.
// Runs at boot + every 24h.

import pool from './db.js';

const DEFAULT_RETENTION_DAYS = 90;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getRetentionDays(): number {
  const env = process.env.RETENTION_DAYS;
  if (env) {
    const parsed = parseInt(env, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_RETENTION_DAYS;
}

export async function runRetentionCleanup(): Promise<void> {
  const days = getRetentionDays();
  const cutoff = new Date(Date.now() - days * ONE_DAY_MS).toISOString();

  console.log(`[retention] cleaning data older than ${days}d (before ${cutoff})`);

  try {
    const attResult = await pool.query(
      `DELETE FROM attempts WHERE created_at < $1`,
      [cutoff],
    );
    const attDeleted = attResult.rowCount ?? 0;

    const sessResult = await pool.query(
      `DELETE FROM sessions WHERE started_at < $1`,
      [cutoff],
    );
    const sessDeleted = sessResult.rowCount ?? 0;

    console.log(
      `[retention] done: ${attDeleted} attempts, ${sessDeleted} sessions removed`,
    );
  } catch (err) {
    console.error('[retention] cleanup error:', err);
  }
}

export function scheduleRetentionCleanup(): NodeJS.Timeout {
  return setInterval(() => {
    runRetentionCleanup().catch((err) =>
      console.error('[retention] scheduled cleanup failed:', err),
    );
  }, ONE_DAY_MS);
}
