import { Router, type Request, type Response, type NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import pool from './db.js';
import { getHashedClientIp } from './ipHash.js';

const router = Router();

// ── Input sanitization ───────────────────────────────────────────
// Strip control characters (except newline/tab for message readability),
// null bytes, and HTML-like tags to prevent stored XSS and injection
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const HTML_TAGS = /<\/?[^>]+(>|$)/g;

function sanitizeText(input: string): string {
  return input
    .replace(CONTROL_CHARS, '')  // strip control chars (keep \n \t)
    .replace(HTML_TAGS, '')      // strip HTML tags
    .replace(/\0/g, '')          // null bytes
    .trim();
}

// ── Constant-time admin key comparison ───────────────────────────
// Prevents timing attacks on the admin key
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // pad shorter to prevent length leak, still compare
    const padded = a.padEnd(b.length, '\0');
    const bufA = Buffer.from(padded, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    timingSafeEqual(bufA, bufB);
    return false;
  }
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  return timingSafeEqual(bufA, bufB);
}

// ── Admin auth (same pattern as adminRoutes) ─────────────────────
const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    res.status(503).json({ error: 'Admin interface unavailable.' });
    return;
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  if (!safeCompare(authHeader.slice(7), adminKey)) {
    res.status(401).json({ error: 'Invalid admin key.' });
    return;
  }
  next();
};

// ── Content-Type enforcement middleware ───────────────────────────
// Only accept application/json for POST requests
const requireJson = (req: Request, res: Response, next: NextFunction): void => {
  const ct = req.headers['content-type'];
  if (!ct || !ct.includes('application/json')) {
    res.status(415).json({ error: 'Content-Type must be application/json' });
    return;
  }
  next();
};

// ═══════════════════════════════════════════════════════════════════
// POST /api/guestbook
// Public — anyone can leave a message
// ═══════════════════════════════════════════════════════════════════
router.post('/', requireJson, async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown> | undefined;

    // reject if body has unexpected keys (limit attack surface)
    if (body) {
      const allowedKeys = new Set(['name', 'message']);
      const extraKeys = Object.keys(body).filter((k) => !allowedKeys.has(k));
      if (extraKeys.length > 0) {
        res.status(400).json({ error: 'Unexpected fields in request body.' });
        return;
      }
    }

    // validate message
    const rawMessage = body?.message;
    if (!rawMessage || typeof rawMessage !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const message = sanitizeText(rawMessage);
    if (message.length === 0) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }
    if (message.length > 500) {
      res.status(400).json({ error: 'Message must be 500 characters or fewer.' });
      return;
    }

    // validate name (optional)
    let name = 'Anonymous';
    if (body?.name !== undefined) {
      if (typeof body.name !== 'string') {
        res.status(400).json({ error: 'Name must be a string.' });
        return;
      }
      const sanitizedName = sanitizeText(body.name);
      if (sanitizedName.length > 0) {
        name = sanitizedName.slice(0, 50);
      }
    }

    const ipHash = getHashedClientIp(req);

    await pool.query(
      `INSERT INTO guestbook (name, message, ip_hash) VALUES ($1, $2, $3)`,
      [name, message, ipHash],
    );

    // intentionally minimal response — don't leak any internal state
    res.status(201).json({ ok: true });
  } catch (err) {
    // log only error message, not full stack (could contain query/data)
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[guestbook] POST failed:', msg);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// GET /api/guestbook
// Admin-only — read all messages
// ═══════════════════════════════════════════════════════════════════
router.get('/', adminAuth, async (req: Request, res: Response) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 200);
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

  try {
    const result = await pool.query(
      `SELECT id, name, message, ip_hash, created_at
       FROM guestbook
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await pool.query('SELECT COUNT(*)::int AS total FROM guestbook');

    res.json({
      messages: result.rows.map((r) => ({
        id: Number(r.id),
        name: r.name,
        message: r.message,
        ipHash: r.ip_hash ? r.ip_hash.slice(0, 12) : null,
        createdAt: r.created_at,
      })),
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[guestbook] GET failed:', msg);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// DELETE /api/guestbook/:id
// Admin-only — remove a message
// ═══════════════════════════════════════════════════════════════════
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return;
  }

  try {
    const result = await pool.query('DELETE FROM guestbook WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    console.log(`[guestbook] Deleted message ${id}`);
    res.json({ ok: true, deletedId: id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[guestbook] DELETE failed:', msg);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
