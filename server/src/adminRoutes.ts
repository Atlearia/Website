import { Router, type Request, type Response, type NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import pool from './db.js';
import { isValidUUID } from './validation.js';

const router = Router();

// constant-time string comparison to avoid timing side channels
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    const padded = a.padEnd(b.length, '\0');
    const bufA = Buffer.from(padded, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    timingSafeEqual(bufA, bufB);
    return false;
  }
  return timingSafeEqual(Buffer.from(a, 'utf-8'), Buffer.from(b, 'utf-8'));
}

// admin auth — requires ADMIN_KEY env, bearer token only (no query strings)
const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey) {
    res.status(503).json({ error: 'Admin unavailable.' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const token = authHeader.slice(7);
  if (!safeCompare(token, adminKey)) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  next();
};

router.use(adminAuth);

// GET /api/admin/stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)::int AS total_users,
        (SELECT COUNT(DISTINCT ip_hash) FROM users WHERE ip_hash IS NOT NULL)::int AS unique_ips,
        (SELECT COUNT(*) FROM attempts)::int AS total_attempts,
        (SELECT COUNT(*) FILTER (WHERE correct) FROM attempts)::int AS total_correct,
        (SELECT COUNT(DISTINCT user_id) FROM attempts 
         WHERE created_at > NOW() - INTERVAL '24 hours')::int AS active_users_24h,
        (SELECT COUNT(DISTINCT u.ip_hash) FROM users u 
         JOIN attempts a ON a.user_id = u.id 
         WHERE a.created_at > NOW() - INTERVAL '24 hours')::int AS active_ips_24h,
        (SELECT COUNT(*) FROM attempts 
         WHERE created_at > NOW() - INTERVAL '24 hours')::int AS attempts_24h
    `);

    const row = stats.rows[0];
    res.json({
      totalUsers: row.total_users,
      uniqueIps: row.unique_ips,
      totalAttempts: row.total_attempts,
      totalCorrect: row.total_correct,
      overallAccuracy: row.total_attempts > 0 
        ? Math.round((row.total_correct / row.total_attempts) * 1000) / 10 
        : 0,
      activeUsers24h: row.active_users_24h,
      activeIps24h: row.active_ips_24h,
      attempts24h: row.attempts_24h,
    });
  } catch (err) {
    console.error('admin/stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.ip_hash,
        u.created_at,
        u.last_seen,
        COUNT(a.id)::int AS attempts,
        COUNT(*) FILTER (WHERE a.correct)::int AS correct,
        CASE WHEN COUNT(a.id) > 0
             THEN ROUND(100.0 * COUNT(*) FILTER (WHERE a.correct) / COUNT(a.id), 1)
             ELSE 0
        END AS accuracy,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.time_ms)::int AS median_time_ms
      FROM users u
      LEFT JOIN attempts a ON a.user_id = u.id
      GROUP BY u.id
      ORDER BY u.last_seen DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*)::int AS total FROM users');
    const uniqueIpResult = await pool.query('SELECT COUNT(DISTINCT ip_hash)::int AS unique_ips FROM users WHERE ip_hash IS NOT NULL');

    res.json({
      users: result.rows.map(r => ({
        id: r.id,
        ipHash: r.ip_hash ? r.ip_hash.slice(0, 12) : null,
        createdAt: r.created_at,
        lastSeen: r.last_seen,
        attempts: r.attempts,
        correct: r.correct,
        accuracy: Number(r.accuracy),
        medianTimeMs: r.median_time_ms,
      })),
      total: countResult.rows[0].total,
      uniqueIps: uniqueIpResult.rows[0].unique_ips,
      limit,
      offset,
    });
  } catch (err) {
    console.error('admin/users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users-by-ip — group users by ip hash
router.get('/users-by-ip', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(u.ip_hash, 'unknown') AS ip_hash,
        COUNT(DISTINCT u.id)::int AS user_count,
        ARRAY_AGG(DISTINCT u.id) AS user_ids,
        MIN(u.created_at) AS first_seen,
        MAX(u.last_seen) AS last_seen,
        COUNT(a.id)::int AS total_attempts,
        COUNT(*) FILTER (WHERE a.correct)::int AS total_correct,
        CASE WHEN COUNT(a.id) > 0
             THEN ROUND(100.0 * COUNT(*) FILTER (WHERE a.correct) / COUNT(a.id), 1)
             ELSE 0
        END AS accuracy
      FROM users u
      LEFT JOIN attempts a ON a.user_id = u.id
      GROUP BY COALESCE(u.ip_hash, 'unknown')
      ORDER BY MAX(u.last_seen) DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query(`
      SELECT COUNT(DISTINCT COALESCE(ip_hash, 'unknown'))::int AS total 
      FROM users
    `);

    res.json({
      usersByIp: result.rows.map(r => ({
        ipHash: r.ip_hash === 'unknown' ? 'unknown' : r.ip_hash.slice(0, 12),
        userCount: r.user_count,
        userIds: r.user_ids,
        firstSeen: r.first_seen,
        lastSeen: r.last_seen,
        totalAttempts: r.total_attempts,
        totalCorrect: r.total_correct,
        accuracy: Number(r.accuracy),
      })),
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    console.error('admin/users-by-ip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/attempts — recent attempts across all users
router.get('/attempts', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.user_id,
        a.problem_type,
        a.difficulty,
        a.time_ms,
        a.correct,
        a.created_at
      FROM attempts a
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*)::int AS total FROM attempts');

    res.json({
      attempts: result.rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        problemType: r.problem_type,
        difficulty: r.difficulty,
        timeMs: r.time_ms,
        correct: r.correct,
        createdAt: r.created_at,
      })),
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    console.error('admin/attempts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/daily — last 30 days aggregated
router.get('/daily', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        d.day::date AS date,
        COUNT(DISTINCT a.user_id)::int AS active_users,
        COUNT(a.id)::int AS attempts,
        COUNT(*) FILTER (WHERE a.correct)::int AS correct,
        CASE WHEN COUNT(a.id) > 0
             THEN ROUND(100.0 * COUNT(*) FILTER (WHERE a.correct) / COUNT(a.id), 1)
             ELSE 0
        END AS accuracy
      FROM generate_series(
             CURRENT_DATE - INTERVAL '29 days',
             CURRENT_DATE,
             '1 day'
           ) AS d(day)
      LEFT JOIN attempts a ON a.created_at::date = d.day::date
      GROUP BY d.day
      ORDER BY d.day
    `);

    res.json({
      daily: result.rows.map(r => ({
        date: r.date,
        activeUsers: r.active_users,
        attempts: r.attempts,
        correct: r.correct,
        accuracy: Number(r.accuracy),
      })),
    });
  } catch (err) {
    console.error('admin/daily error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/sessions-by-ip?ip=<hash or 12-char prefix>
router.get('/sessions-by-ip', async (req: Request, res: Response) => {
  const ipHashParam = req.query.ip as string;
  
  if (!ipHashParam) {
    res.status(400).json({ error: 'ip query param required' });
    return;
  }

  try {
    // find users by exact or prefix match on ip_hash
    const usersResult = await pool.query(
      `SELECT id FROM users WHERE ip_hash = $1 OR ip_hash LIKE $2`,
      [ipHashParam, `${ipHashParam}%`],
    );
    const userIds = usersResult.rows.map((r: { id: string }) => r.id);

    if (userIds.length === 0) {
      res.json({
        ipHash: ipHashParam.slice(0, 12),
        aggregate: { totalSessions: 0, totalAttempts: 0, totalCorrect: 0, totalTimeMs: 0, overallAccuracy: 0, avgTimePerAttempt: 0, firstSeen: null, lastSeen: null },
        improvementTrend: null,
        sessions: [],
      });
      return;
    }

    const fullHashResult = await pool.query(
      `SELECT ip_hash FROM users WHERE id = $1`, [userIds[0]],
    );
    const fullIpHash = fullHashResult.rows[0]?.ip_hash || ipHashParam;

    // join attempts into session windows
    const sessionsResult = await pool.query(`
      WITH session_windows AS (
        SELECT
          s.id,
          s.user_id,
          s.started_at,
          COALESCE(
            s.ended_at,
            LEAD(s.started_at) OVER (PARTITION BY s.user_id ORDER BY s.started_at),
            now()
          ) AS effective_end
        FROM sessions s
        WHERE s.user_id = ANY($1)
      ),
      session_stats AS (
        SELECT
          sw.id,
          sw.user_id,
          sw.started_at,
          sw.effective_end,
          COUNT(a.id)::int AS attempts,
          COUNT(*) FILTER (WHERE a.correct)::int AS correct,
          COALESCE(SUM(a.time_ms), 0)::bigint AS total_time_ms
        FROM session_windows sw
        LEFT JOIN attempts a
          ON a.user_id = sw.user_id
          AND a.created_at >= sw.started_at
          AND a.created_at < sw.effective_end
        GROUP BY sw.id, sw.user_id, sw.started_at, sw.effective_end
      )
      SELECT
        id,
        user_id,
        started_at,
        CASE WHEN effective_end < now() THEN effective_end ELSE NULL END AS ended_at,
        attempts,
        correct,
        total_time_ms,
        CASE WHEN attempts > 0
             THEN ROUND(100.0 * correct / attempts, 1)
             ELSE 0
        END AS accuracy,
        CASE WHEN attempts > 0
             THEN ROUND(total_time_ms::numeric / attempts, 0)
             ELSE 0
        END AS avg_time_ms
      FROM session_stats
      ORDER BY started_at DESC
      LIMIT 100
    `, [userIds]);

    let sessions = sessionsResult.rows;

    // fallback: if no session rows exist but attempts do,
    // group attempts into virtual sessions split at 30min gaps
    if (sessions.length === 0) {
      const virtualResult = await pool.query(`
        WITH ordered AS (
          SELECT
            a.*,
            LAG(a.created_at) OVER (ORDER BY a.created_at) AS prev_ts
          FROM attempts a
          WHERE a.user_id = ANY($1)
        ),
        grouped AS (
          SELECT
            *,
            SUM(CASE WHEN prev_ts IS NULL OR created_at - prev_ts > interval '30 minutes' THEN 1 ELSE 0 END)
              OVER (ORDER BY created_at) AS grp
          FROM ordered
        )
        SELECT
          grp AS id,
          MIN(user_id) AS user_id,
          MIN(created_at) AS started_at,
          MAX(created_at) AS ended_at,
          COUNT(*)::int AS attempts,
          COUNT(*) FILTER (WHERE correct)::int AS correct,
          COALESCE(SUM(time_ms), 0)::bigint AS total_time_ms,
          CASE WHEN COUNT(*) > 0
               THEN ROUND(100.0 * COUNT(*) FILTER (WHERE correct) / COUNT(*), 1)
               ELSE 0
          END AS accuracy,
          CASE WHEN COUNT(*) > 0
               THEN ROUND(SUM(time_ms)::numeric / COUNT(*), 0)
               ELSE 0
          END AS avg_time_ms
        FROM grouped
        GROUP BY grp
        ORDER BY MIN(created_at) DESC
        LIMIT 100
      `, [userIds]);
      sessions = virtualResult.rows;
    }

    const totalSessions = sessions.length;
    const totalAttempts = sessions.reduce((s, r) => s + r.attempts, 0);
    const totalCorrect = sessions.reduce((s, r) => s + r.correct, 0);
    const totalTimeMs = sessions.reduce((s, r) => s + Number(r.total_time_ms), 0);
    const firstSeen = sessions.length > 0 ? sessions[sessions.length - 1].started_at : null;
    const lastSeen = sessions.length > 0 ? (sessions[0].ended_at || sessions[0].started_at) : null;

    // compare first half vs second half of sessions for trend
    let improvementTrend = null;
    const sessionsWithAttempts = sessions.filter(s => s.attempts > 0);
    
    if (sessionsWithAttempts.length >= 4) {
      const midpoint = Math.floor(sessionsWithAttempts.length / 2);
      const recentSessions = sessionsWithAttempts.slice(0, midpoint);
      const earlierSessions = sessionsWithAttempts.slice(midpoint);
      
      const recentAccuracy = recentSessions.reduce((sum, s) => sum + Number(s.accuracy), 0) / recentSessions.length;
      const earlierAccuracy = earlierSessions.reduce((sum, s) => sum + Number(s.accuracy), 0) / earlierSessions.length;
      const recentAvgTime = recentSessions.reduce((sum, s) => sum + Number(s.avg_time_ms), 0) / recentSessions.length;
      const earlierAvgTime = earlierSessions.reduce((sum, s) => sum + Number(s.avg_time_ms), 0) / earlierSessions.length;
      
      improvementTrend = {
        accuracyChange: Math.round((recentAccuracy - earlierAccuracy) * 10) / 10,
        speedChange: Math.round(earlierAvgTime - recentAvgTime),
        recentAccuracy: Math.round(recentAccuracy * 10) / 10,
        earlierAccuracy: Math.round(earlierAccuracy * 10) / 10,
        recentAvgTime: Math.round(recentAvgTime),
        earlierAvgTime: Math.round(earlierAvgTime),
      };
    }

    res.json({
      ipHash: fullIpHash.slice(0, 12),
      aggregate: {
        totalSessions,
        totalAttempts,
        totalCorrect,
        totalTimeMs,
        overallAccuracy: totalAttempts > 0
          ? Math.round((totalCorrect / totalAttempts) * 1000) / 10
          : 0,
        avgTimePerAttempt: totalAttempts > 0
          ? Math.round(totalTimeMs / totalAttempts)
          : 0,
        firstSeen,
        lastSeen,
      },
      improvementTrend,
      sessions: sessions.map(s => ({
        id: Number(s.id),
        userId: s.user_id,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        attempts: s.attempts,
        correct: s.correct,
        totalTimeMs: Number(s.total_time_ms),
        accuracy: Number(s.accuracy),
        avgTimeMs: Number(s.avg_time_ms),
      })),
    });
  } catch (err) {
    console.error('admin/sessions-by-ip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/user/:userId — wipe a user and all their data (cascade)
router.delete('/user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!isValidUUID(userId)) {
    res.status(400).json({ error: 'userId must be a valid UUID' });
    return;
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('admin/delete-user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
