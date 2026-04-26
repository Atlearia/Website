import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRouter from './routes.js';
import adminRouter from './adminRoutes.js';
import guestbookRouter from './guestbookRoutes.js';
import pool from './db.js';
import { ensureIpHashKey } from './ipHash.js';
import { runRetentionCleanup, scheduleRetentionCleanup } from './retention.js';

dotenv.config();

// ── Fail fast if required secrets are missing ────────────────────────
ensureIpHashKey();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ── Trust proxy ──────────────────────────────────────────────────────
// TRUST_PROXY controls Express's trust-proxy setting for correct IP
// extraction behind reverse proxies (e.g. nginx, Cloudflare, Render).
//   '1'      → trust one proxy hop (safe default for single-proxy setups)
//   'loopback' → trust only loopback addresses
//   'true'   → trust ALL proxies (use ONLY if guaranteed behind a trusted proxy)
// Default: 1 (single trusted hop). Adjust via TRUST_PROXY env var.
const trustProxy = process.env.TRUST_PROXY ?? '1';
app.set(
  'trust proxy',
  trustProxy === 'true' ? true
    : trustProxy === 'false' ? false
    : /^\d+$/.test(trustProxy) ? parseInt(trustProxy, 10)
    : trustProxy,
);

// ── Security headers ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,  // needed for CORS API
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
app.disable('x-powered-by');

// ── CORS ─────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── Body parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));

// ── Rate limiting ────────────────────────────────────────────────────
// General limiter: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter limiter for attempt submission: 30 per minute per IP
const attemptLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts submitted. Slow down!' },
});

// Registration limiter: 5 per minute per IP
const registerLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registrations. Try again later.' },
});

// Guestbook limiter: 3 messages per 10 minutes per IP
const guestbookLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Try again in a few minutes.' },
});

app.use('/api', generalLimiter);
app.use('/api/register-anon', registerLimiter);
app.use('/api/attempt', attemptLimiter);

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api', apiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/guestbook', guestbookLimiter, guestbookRouter);

// ── Root route ────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Math Practice API',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// ── Health check ─────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// ── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Math Practice API running on http://localhost:${PORT}`);

  // Run retention cleanup once at startup, then schedule daily
  runRetentionCleanup().catch((err: unknown) =>
    console.error('Initial retention cleanup failed:', err),
  );
  scheduleRetentionCleanup();
});

export default app;
