// ── IP hashing utility ──────────────────────────────────────────────
// Produces a privacy-preserving, deterministic identifier from a raw
// IP address.  Uses HMAC-SHA256 keyed with the IP_HASH_KEY secret so
// the hash cannot be reversed or brute-forced without the key.
//
// The raw IP is NEVER stored — only this hash goes into the database.
// Grouping / unique-count analytics still work because the same IP
// always produces the same hash (given the same key).
// ────────────────────────────────────────────────────────────────────

import { createHmac } from 'node:crypto';
import type { Request } from 'express';

let _ipHashKey: string | undefined;

/**
 * Return the configured IP_HASH_KEY, or throw if it is missing.
 * Called once at startup via `ensureIpHashKey()` to fail fast.
 */
function getIpHashKey(): string {
  if (!_ipHashKey) {
    _ipHashKey = process.env.IP_HASH_KEY;
  }
  if (!_ipHashKey) {
    throw new Error(
      'IP_HASH_KEY environment variable is required. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  return _ipHashKey;
}

/**
 * Validate that IP_HASH_KEY is set. Call at server startup.
 */
export function ensureIpHashKey(): void {
  getIpHashKey();
}

/**
 * Normalize a raw IP string before hashing.
 *  - Strips port suffixes (e.g. "1.2.3.4:56789")
 *  - Strips IPv6 zone IDs (%eth0)
 *  - Lowercases (IPv6 hex consistency)
 *  - Handles IPv4-mapped IPv6 (::ffff:1.2.3.4 → 1.2.3.4)
 *  - Treats null / empty / undefined as "unknown"
 */
export function normalizeIp(raw: string | undefined | null): string {
  if (!raw || raw.trim() === '') return 'unknown';
  let ip = raw.trim().toLowerCase();

  // Remove IPv6 zone ID (%...)
  const zoneIdx = ip.indexOf('%');
  if (zoneIdx !== -1) ip = ip.slice(0, zoneIdx);

  // Handle bracketed IPv6 [::1]:port
  if (ip.startsWith('[')) {
    const closing = ip.indexOf(']');
    if (closing !== -1) ip = ip.slice(1, closing);
  } else if (ip.includes(':') && !ip.includes('::') && ip.lastIndexOf(':') === ip.indexOf(':')) {
    // plain IPv4:port — only one colon
    ip = ip.slice(0, ip.indexOf(':'));
  } else if (!ip.includes(':')) {
    // IPv4 with possible port — should not happen after above, but guard
    const parts = ip.split(':');
    ip = parts[0];
  }

  // Strip IPv4-mapped IPv6 prefix
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  return ip || 'unknown';
}

/**
 * HMAC-SHA256 of a normalized IP, returned as hex.
 */
export function hashIp(rawIp: string | undefined | null): string {
  const normalized = normalizeIp(rawIp);
  const key = getIpHashKey();
  return createHmac('sha256', key).update(normalized).digest('hex');
}

/**
 * Extract the client IP from an Express request using the standard
 * mechanisms (trust proxy → req.ip, falling back to socket address).
 * Returns the RAW ip — does NOT hash it. Callers should hash before
 * storing.
 */
export function getClientIp(req: Request): string {
  // When trust proxy is configured, Express populates req.ip
  // from X-Forwarded-For automatically.
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Convenience: extract + hash in one step (for storing).
 */
export function getHashedClientIp(req: Request): string {
  return hashIp(getClientIp(req));
}
