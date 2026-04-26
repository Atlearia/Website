import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from './db.js';
import { isValidUUID, validateAttempt } from './validation.js';
import { getHashedClientIp } from './ipHash.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════════
// POST /api/register-anon
// Creates a new anonymous user and returns { userId }.
// If a userId is sent and already exists, returns it (idempotent).
// ═══════════════════════════════════════════════════════════════════
router.post('/register-anon', async (req: Request, res: Response) => {
  try {
    // Accept client-generated UUID, or generate one server-side as fallback
    const body = req.body as Record<string, unknown> | undefined;
    const id = (body?.userId && isValidUUID(body.userId)) ? body.userId : uuidv4();
    const ipHash = getHashedClientIp(req);
    
    await pool.query(
      `INSERT INTO users (id, ip_hash) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET last_seen = now(), ip_hash = $2`,
      [id, ipHash],
    );
    res.status(201).json({ userId: id });
  } catch (err) {
    console.error('register-anon error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/attempt
// Records one problem attempt.
// ═══════════════════════════════════════════════════════════════════
router.post('/attempt', async (req: Request, res: Response) => {
  const { data, errors } = validateAttempt(req.body);
  if (errors) {
    res.status(400).json({ errors });
    return;
  }

  try {
    // Ensure user exists (upsert last_seen)
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [data!.userId]);
    if (userCheck.rowCount === 0) {
      res.status(404).json({ error: 'User not found. Call /api/register-anon first.' });
      return;
    }

    // Update last_seen
    await pool.query('UPDATE users SET last_seen = now() WHERE id = $1', [data!.userId]);

    // Insert attempt
    await pool.query(
      `INSERT INTO attempts (user_id, problem_type, difficulty, time_ms, correct, client_ts)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        data!.userId,
        data!.problemType,
        data!.difficulty,
        data!.timeMs,
        data!.correct,
        data!.clientTs ?? null,
      ],
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('attempt error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// GET /api/progress?userId=...
// Returns aggregate stats + daily trend (last 14 days).
// ═══════════════════════════════════════════════════════════════════
router.get('/progress', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!isValidUUID(userId)) {
    res.status(400).json({ error: 'userId query param must be a valid UUID' });
    return;
  }

  try {
    // ── Totals ──────────────────────────────────────────────────
    const totalsResult = await pool.query(
      `SELECT
         COUNT(*)::int                                          AS attempts,
         COUNT(*) FILTER (WHERE correct)::int                   AS correct_count,
         CASE WHEN COUNT(*) > 0
              THEN ROUND(100.0 * COUNT(*) FILTER (WHERE correct) / COUNT(*), 1)
              ELSE 0
         END                                                    AS accuracy
       FROM attempts
       WHERE user_id = $1`,
      [userId],
    );

    const totals = totalsResult.rows[0] ?? { attempts: 0, correct_count: 0, accuracy: 0 };

    // ── Median time (overall) ───────────────────────────────────
    const medianAllResult = await pool.query(
      `SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_ms)::int AS median
       FROM attempts WHERE user_id = $1`,
      [userId],
    );
    const medianTimeMs = medianAllResult.rows[0]?.median ?? null;

    // ── Median time (correct only) ──────────────────────────────
    const medianCorrectResult = await pool.query(
      `SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_ms)::int AS median
       FROM attempts WHERE user_id = $1 AND correct = true`,
      [userId],
    );
    const medianCorrectTimeMs = medianCorrectResult.rows[0]?.median ?? null;

    // ── Per-day breakdown (last 14 days) ─────────────────────────
    const perDayResult = await pool.query(
      `SELECT
         d.day::date                                            AS date,
         COUNT(a.id)::int                                       AS attempts,
         CASE WHEN COUNT(a.id) > 0
              THEN ROUND(100.0 * COUNT(a.id) FILTER (WHERE a.correct) / COUNT(a.id), 1)
              ELSE 0
         END                                                    AS accuracy,
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.time_ms)::int AS "medianTimeMs"
       FROM generate_series(
              (CURRENT_DATE - INTERVAL '13 days'),
              CURRENT_DATE,
              '1 day'
            ) AS d(day)
       LEFT JOIN attempts a
         ON a.user_id = $1
         AND a.created_at::date = d.day::date
       GROUP BY d.day
       ORDER BY d.day`,
      [userId],
    );

    res.json({
      totals: {
        attempts: totals.attempts,
        correct: totals.correct_count,
        accuracy: Number(totals.accuracy),
      },
      medianTimeMs,
      medianCorrectTimeMs,
      perDay: perDayResult.rows.map((r) => ({
        date: r.date,
        attempts: r.attempts,
        accuracy: Number(r.accuracy),
        medianTimeMs: r.medianTimeMs,
      })),
    });
  } catch (err) {
    console.error('progress error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/session/start
// Creates a new session when user opens the site.
// Returns { sessionId }.
// ═══════════════════════════════════════════════════════════════════
router.post('/session/start', async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown> | undefined;
    const userId = body?.userId;
    
    if (!userId || !isValidUUID(userId)) {
      res.status(400).json({ error: 'userId is required and must be a valid UUID' });
      return;
    }

    const ipHash = getHashedClientIp(req);

    // Create a new session
    const result = await pool.query(
      `INSERT INTO sessions (user_id, ip_hash, started_at)
       VALUES ($1, $2, now())
       RETURNING id`,
      [userId, ipHash],
    );

    res.status(201).json({ sessionId: result.rows[0].id });
  } catch (err) {
    console.error('session/start error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/session/end
// Ends a session with summary stats (called when user leaves).
// ═══════════════════════════════════════════════════════════════════
router.post('/session/end', async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown> | undefined;
    const sessionId = body?.sessionId;
    const attempts = typeof body?.attempts === 'number' ? body.attempts : 0;
    const correct = typeof body?.correct === 'number' ? body.correct : 0;
    const totalTimeMs = typeof body?.totalTimeMs === 'number' ? body.totalTimeMs : 0;

    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    // Update the session with end time and stats
    await pool.query(
      `UPDATE sessions 
       SET ended_at = now(),
           attempts = $2,
           correct = $3,
           total_time_ms = $4
       WHERE id = $1`,
      [sessionId, attempts, correct, totalTimeMs],
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('session/end error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/session/update
// Updates session stats periodically (in case the user doesn't trigger end).
// ═══════════════════════════════════════════════════════════════════
router.post('/session/update', async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown> | undefined;
    const sessionId = body?.sessionId;
    const attempts = typeof body?.attempts === 'number' ? body.attempts : 0;
    const correct = typeof body?.correct === 'number' ? body.correct : 0;
    const totalTimeMs = typeof body?.totalTimeMs === 'number' ? body.totalTimeMs : 0;

    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    // Update the session stats
    await pool.query(
      `UPDATE sessions 
       SET attempts = $2,
           correct = $3,
           total_time_ms = $4
       WHERE id = $1`,
      [sessionId, attempts, correct, totalTimeMs],
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('session/update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
