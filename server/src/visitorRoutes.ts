import { Router, type Request, type Response, type NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import pool from './db.js';
import { getHashedClientIp, getClientIp } from './ipHash.js';

const router = Router();

// ── Admin auth (same pattern as guestbookRoutes) ──
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
  if (!adminKey) { res.status(503).json({ error: 'Unavailable.' }); return; }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized.' }); return;
  }
  if (!safeCompare(authHeader.slice(7), adminKey)) {
    res.status(401).json({ error: 'Unauthorized.' }); return;
  }
  next();
};

// ── Geo lookup cache (ip_hash -> geo result) ──
// keeps us well under ip-api.com's 45 req/min limit
const geoCache = new Map<string, {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  timezone: string | null;
  isp: string | null;
  ts: number;
}>();

const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

async function lookupGeo(rawIp: string, ipHash: string): Promise<{
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  timezone: string | null;
  isp: string | null;
}> {
  const cached = geoCache.get(ipHash);
  if (cached && (Date.now() - cached.ts) < GEO_CACHE_TTL_MS) {
    return cached;
  }

  const empty = { city: null, region: null, country: null, countryCode: null, timezone: null, isp: null };

  // skip private/local IPs
  if (!rawIp || rawIp === 'unknown' || rawIp.startsWith('127.') ||
      rawIp.startsWith('192.168.') || rawIp.startsWith('10.') ||
      rawIp === '::1' || rawIp === 'localhost') {
    return empty;
  }

  try {
    // ip-api.com — free tier, no key needed, 45 req/min
    // only request the fields we actually store
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(rawIp)}?fields=status,city,regionName,country,countryCode,timezone,isp`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    if (!res.ok) return empty;

    const data = await res.json() as Record<string, unknown>;
    if (data.status !== 'success') return empty;

    const result = {
      city: (data.city as string) || null,
      region: (data.regionName as string) || null,
      country: (data.country as string) || null,
      countryCode: (data.countryCode as string) || null,
      timezone: (data.timezone as string) || null,
      isp: (data.isp as string) || null,
    };

    geoCache.set(ipHash, { ...result, ts: Date.now() });
    return result;
  } catch {
    return empty;
  }
}

// sanitize incoming strings — strip control chars, cap length
function clean(val: unknown, maxLen = 512): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return null;
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLen) || null;
}

function clampNumber(val: unknown, min: number, max: number): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}

// ── POST /api/visitor-log — public beacon ──
// called on every page load, records hardware fingerprint + geo
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body) { res.status(400).json({ error: 'Empty body.' }); return; }

    const ipHash = getHashedClientIp(req);
    const rawIp = getClientIp(req);
    const userAgent = (req.headers['user-agent'] || '').slice(0, 512);
    const referer = (req.headers['referer'] || req.headers['referrer'] || '').slice(0, 512);

    // geo lookup (fire-and-forget-ish, cached per ip hash)
    const geo = await lookupGeo(rawIp, ipHash);

    // extract hardware fields
    const gpuRenderer = clean(body.gpuRenderer, 256);
    const gpuVendor = clean(body.gpuVendor, 256);
    const deviceMemory = clampNumber(body.deviceMemory, 0, 1024);
    const coreCount = clampNumber(body.coreCount, 0, 256);
    const deviceType = clean(body.deviceType, 32);
    const screenWidth = clampNumber(body.screenWidth, 0, 16384);
    const screenHeight = clampNumber(body.screenHeight, 0, 16384);
    const pixelRatio = clampNumber(body.pixelRatio, 0, 10);
    const colorDepth = clampNumber(body.colorDepth, 0, 64);
    const connection = clean(body.connection, 64);
    const webglVersion = clampNumber(body.webglVersion, 0, 3);
    const batteryLevel = clampNumber(body.batteryLevel, 0, 1);
    const batteryCharging = body.batteryCharging === true ? true
      : body.batteryCharging === false ? false : null;

    await pool.query(
      `INSERT INTO visitor_log (
        ip_hash, gpu_renderer, gpu_vendor, device_memory, core_count,
        device_type, screen_width, screen_height, pixel_ratio, color_depth,
        connection, user_agent, referer,
        city, region, country, country_code, timezone, isp,
        webgl_version, battery_level, battery_charging
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16, $17, $18, $19,
        $20, $21, $22
      )`,
      [
        ipHash, gpuRenderer, gpuVendor, deviceMemory, coreCount,
        deviceType, screenWidth, screenHeight, pixelRatio, colorDepth,
        connection, userAgent || null, referer || null,
        geo.city, geo.region, geo.country, geo.countryCode, geo.timezone, geo.isp,
        webglVersion, batteryLevel, batteryCharging,
      ],
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[visitor-log] POST failed:', msg);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/visitor-log — admin only ──
// returns visits grouped by IP hash, with linked guestbook messages
router.get('/', adminAuth, async (req: Request, res: Response) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 200);
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

  try {
    // get distinct IP hashes with aggregate info
    const groupResult = await pool.query(
      `SELECT
        ip_hash,
        COUNT(*)::int AS visit_count,
        MIN(created_at) AS first_seen,
        MAX(created_at) AS last_seen,
        -- grab the latest hardware snapshot
        (array_agg(gpu_renderer ORDER BY created_at DESC))[1] AS gpu_renderer,
        (array_agg(gpu_vendor ORDER BY created_at DESC))[1] AS gpu_vendor,
        (array_agg(device_memory ORDER BY created_at DESC))[1] AS device_memory,
        (array_agg(core_count ORDER BY created_at DESC))[1] AS core_count,
        (array_agg(device_type ORDER BY created_at DESC))[1] AS device_type,
        (array_agg(screen_width ORDER BY created_at DESC))[1] AS screen_width,
        (array_agg(screen_height ORDER BY created_at DESC))[1] AS screen_height,
        (array_agg(pixel_ratio ORDER BY created_at DESC))[1] AS pixel_ratio,
        (array_agg(connection ORDER BY created_at DESC))[1] AS connection,
        (array_agg(user_agent ORDER BY created_at DESC))[1] AS user_agent,
        (array_agg(city ORDER BY created_at DESC))[1] AS city,
        (array_agg(region ORDER BY created_at DESC))[1] AS region,
        (array_agg(country ORDER BY created_at DESC))[1] AS country,
        (array_agg(country_code ORDER BY created_at DESC))[1] AS country_code,
        (array_agg(timezone ORDER BY created_at DESC))[1] AS timezone,
        (array_agg(isp ORDER BY created_at DESC))[1] AS isp,
        (array_agg(webgl_version ORDER BY created_at DESC))[1] AS webgl_version
      FROM visitor_log
      WHERE ip_hash IS NOT NULL
      GROUP BY ip_hash
      ORDER BY MAX(created_at) DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT ip_hash)::int AS total FROM visitor_log WHERE ip_hash IS NOT NULL`,
    );

    // for each IP hash, fetch linked guestbook messages
    const ipHashes = groupResult.rows.map((r: Record<string, unknown>) => r.ip_hash as string);
    let messagesByIp: Record<string, Array<Record<string, unknown>>> = {};

    if (ipHashes.length > 0) {
      const msgResult = await pool.query(
        `SELECT id, name, email, message, ip_hash, created_at
         FROM guestbook
         WHERE ip_hash = ANY($1)
         ORDER BY created_at DESC`,
        [ipHashes],
      );
      for (const row of msgResult.rows) {
        const hash = (row.ip_hash as string)?.slice(0, 12);
        if (!messagesByIp[hash]) messagesByIp[hash] = [];
        messagesByIp[hash].push({
          id: Number(row.id),
          name: row.name,
          email: row.email || null,
          message: row.message,
          createdAt: row.created_at,
        });
      }
    }

    const visitors = groupResult.rows.map((r: Record<string, unknown>) => {
      const hash = (r.ip_hash as string)?.slice(0, 12) || 'unknown';
      return {
        ipHash: hash,
        visitCount: r.visit_count,
        firstSeen: r.first_seen,
        lastSeen: r.last_seen,
        hardware: {
          gpuRenderer: r.gpu_renderer || null,
          gpuVendor: r.gpu_vendor || null,
          deviceMemory: r.device_memory || null,
          coreCount: r.core_count || null,
          deviceType: r.device_type || null,
          screenWidth: r.screen_width || null,
          screenHeight: r.screen_height || null,
          pixelRatio: r.pixel_ratio || null,
          connection: r.connection || null,
          webglVersion: r.webgl_version || null,
        },
        location: {
          city: r.city || null,
          region: r.region || null,
          country: r.country || null,
          countryCode: r.country_code || null,
          timezone: r.timezone || null,
          isp: r.isp || null,
        },
        userAgent: r.user_agent || null,
        messages: messagesByIp[hash] || [],
      };
    });

    res.json({
      visitors,
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[visitor-log] GET failed:', msg);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
