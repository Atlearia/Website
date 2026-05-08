// HMAC-SHA256 based IP hashing. Raw IPs never touch the database —
// only the keyed hash is stored. Same IP always yields the same hash
// so grouping/dedup analytics still work.

import { createHmac } from 'node:crypto';
import type { Request } from 'express';

let _ipHashKey: string | undefined;

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

// call at startup to fail fast if the key is missing
export function ensureIpHashKey(): void {
  getIpHashKey();
}

// normalize before hashing: strip ports, zone ids, ipv4-mapped prefixes
export function normalizeIp(raw: string | undefined | null): string {
  if (!raw || raw.trim() === '') return 'unknown';
  let ip = raw.trim().toLowerCase();

  const zoneIdx = ip.indexOf('%');
  if (zoneIdx !== -1) ip = ip.slice(0, zoneIdx);

  if (ip.startsWith('[')) {
    const closing = ip.indexOf(']');
    if (closing !== -1) ip = ip.slice(1, closing);
  } else if (ip.includes(':') && !ip.includes('::') && ip.lastIndexOf(':') === ip.indexOf(':')) {
    ip = ip.slice(0, ip.indexOf(':'));
  } else if (!ip.includes(':')) {
    const parts = ip.split(':');
    ip = parts[0];
  }

  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  return ip || 'unknown';
}

export function hashIp(rawIp: string | undefined | null): string {
  const normalized = normalizeIp(rawIp);
  const key = getIpHashKey();
  return createHmac('sha256', key).update(normalized).digest('hex');
}

// pull the client IP from the request (respects trust proxy), then hash it
export function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function getHashedClientIp(req: Request): string {
  return hashIp(getClientIp(req));
}
