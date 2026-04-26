// ── Data retention cleanup ──────────────────────────────────────────
// Deletes old sessions and attempts beyond a configurable retention
// period. User rows are kept (to avoid breaking foreign keys and to
// preserve the anonymous user ID for returning visitors).
//
// Configuration:
//   RETENTION_DAYS  — number of days to keep data (default: 90)
//
// Runs once at server startup and then every 24 hours via setInterval.
// No external dependencies required.
// ────────────────────────────────────────────────────────────────────

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

/**
 * Delete sessions and attempts older than RETENTION_DAYS.
 * Preserves user rows to maintain referential integrity.
 */
export async function runRetentionCleanup(): Promise<void> {
  const days = getRetentionDays();
  const cutoff = new Date(Date.now() - days * ONE_DAY_MS).toISOString();

  console.log(`[retention] Cleaning data older than ${days} days (before ${cutoff})`);

  try {
    // Delete old attempts
    const attResult = await pool.query(
      `DELETE FROM attempts WHERE created_at < $1`,
      [cutoff],
    );
    const attDeleted = attResult.rowCount ?? 0;

    // Delete old sessions
    const sessResult = await pool.query(
      `DELETE FROM sessions WHERE started_at < $1`,
      [cutoff],
    );
    const sessDeleted = sessResult.rowCount ?? 0;

    console.log(
      `[retention] Cleanup complete: ${attDeleted} attempts, ${sessDeleted} sessions deleted.`,
    );
  } catch (err) {
    console.error('[retention] Cleanup error:', err);
  }
}

/**
 * Schedule retention cleanup to run every 24 hours.
 * Returns the interval handle (for testing / cleanup).
 */
export function scheduleRetentionCleanup(): NodeJS.Timeout {
  return setInterval(() => {
    runRetentionCleanup().catch((err) =>
      console.error('[retention] Scheduled cleanup failed:', err),
    );
  }, ONE_DAY_MS);
}
