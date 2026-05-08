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

// crash immediately if IP_HASH_KEY is missing
ensureIpHashKey();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// proxy trust — default 1 hop, override with TRUST_PROXY env
const trustProxy = process.env.TRUST_PROXY ?? '1';
app.set(
  'trust proxy',
  trustProxy === 'true' ? true
    : trustProxy === 'false' ? false
    : /^\d+$/.test(trustProxy) ? parseInt(trustProxy, 10)
    : trustProxy,
);

// security headers
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
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
app.disable('x-powered-by');

// CORS
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

app.use(express.json({ limit: '16kb' }));

// rate limits
const generalLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const attemptLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts submitted. Slow down!' },
});

const registerLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registrations. Try again later.' },
});

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

// routes
app.use('/api', apiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/guestbook', guestbookLimiter, guestbookRouter);

// health check
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);

  // clean old data on boot, then daily
  runRetentionCleanup().catch((err: unknown) =>
    console.error('Initial retention cleanup failed:', err),
  );
  scheduleRetentionCleanup();
});

export default app;
