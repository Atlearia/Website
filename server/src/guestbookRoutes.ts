import { Router, type Request, type Response, type NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import pool from './db.js';
import { getHashedClientIp } from './ipHash.js';

const router = Router();

// strip control chars and html to prevent stored XSS
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const HTML_TAGS = /<\/?[^>]+(>|$)/g;

function sanitizeText(input: string): string {
  return input
    .replace(CONTROL_CHARS, '')
    .replace(HTML_TAGS, '')
    .replace(/\0/g, '')
    .trim();
}

// constant-time comparison for admin key
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
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

const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    res.status(503).json({ error: 'Unavailable.' });
    return;
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  if (!safeCompare(authHeader.slice(7), adminKey)) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  next();
};

// reject anything that isn't application/json
const requireJson = (req: Request, res: Response, next: NextFunction): void => {
  const ct = req.headers['content-type'];
  if (!ct || !ct.includes('application/json')) {
    res.status(415).json({ error: 'Content-Type must be application/json' });
    return;
  }
  next();
};

// basic email format check — intentionally lenient
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/guestbook — public, anyone can leave a message
router.post('/', requireJson, async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown> | undefined;

    // reject unknown fields
    if (body) {
      const allowedKeys = new Set(['name', 'email', 'message']);
      const extraKeys = Object.keys(body).filter((k) => !allowedKeys.has(k));
      if (extraKeys.length > 0) {
        res.status(400).json({ error: 'Unexpected fields in request body.' });
        return;
      }
    }

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

    // optional email — validate format if provided
    let email: string | null = null;
    if (body?.email !== undefined) {
      if (typeof body.email !== 'string') {
        res.status(400).json({ error: 'Email must be a string.' });
        return;
      }
      const trimmedEmail = body.email.trim();
      if (trimmedEmail.length > 0) {
        if (!EMAIL_RE.test(trimmedEmail) || trimmedEmail.length > 254) {
          res.status(400).json({ error: 'Invalid email format.' });
          return;
        }
        email = sanitizeText(trimmedEmail).slice(0, 254);
      }
    }

    const ipHash = getHashedClientIp(req);
    const userAgent = (req.headers['user-agent'] || '').slice(0, 512);
    const referer = (req.headers['referer'] || req.headers['referrer'] || '').slice(0, 512);

    await pool.query(
      `INSERT INTO guestbook (name, email, message, ip_hash, user_agent, referer)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, message, ipHash, userAgent || null, referer || null],
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[guestbook] POST failed:', msg);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/guestbook — admin only
router.get('/', adminAuth, async (req: Request, res: Response) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 200);
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

  try {
    const result = await pool.query(
      `SELECT id, name, email, message, ip_hash, user_agent, referer, created_at
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
        email: r.email || null,
        message: r.message,
        ipHash: r.ip_hash ? r.ip_hash.slice(0, 12) : null,
        userAgent: r.user_agent || null,
        referer: r.referer || null,
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

// DELETE /api/guestbook/:id — admin only
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return;
  }

  try {
    const result = await pool.query('DELETE FROM guestbook WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[guestbook] DELETE failed:', msg);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
