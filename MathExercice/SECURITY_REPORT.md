# Security & Data Collection Report

**Application:** Math Practice  
**Date:** 2026-02-10  
**Scope:** Server-side data handling, admin access, privacy posture

---

## 1. Data Collected

| Data point | Storage location | Purpose | Retention |
|---|---|---|---|
| **Anonymous user UUID** | `users.id` (PostgreSQL) + browser `localStorage` | Track practice progress per anonymous user | Permanent (user row preserved for FK integrity); sessions/attempts subject to retention policy |
| **IP hash** (`HMAC-SHA256`) | `users.ip_hash`, `sessions.ip_hash` | Deduplicate users, group by network identity, unique-visitor counts | Same as sessions |
| **Practice attempts** | `attempts` table (problem_type, difficulty, time_ms, correct, client_ts) | Analytics, progress tracking, accuracy stats | Configurable via `RETENTION_DAYS` (default: 90 days) |
| **Sessions** | `sessions` table (user_id, ip_hash, started/ended_at, attempts, correct, total_time_ms) | Track visit duration, per-session performance | Configurable via `RETENTION_DAYS` (default: 90 days) |
| **Client-side preferences** | Browser `localStorage` only | Sound, difficulty, mode, goal — never sent to server | Browser-local only |

### What is NOT collected

- **Raw IP addresses** — never stored in the database. Only a keyed HMAC-SHA256 hash is stored, which cannot be reversed to recover the original IP without the secret key.
- **Names, emails, or any personally identifiable information.**
- **Browser fingerprints, cookies, or third-party tracking.**
- **Precise geolocation.**

---

## 2. IP Address Handling

### Before (old behavior)
Raw IP addresses were stored in `users.ip_address` and `sessions.ip_address` columns.

### After (current behavior)
- Raw IPs are **never written to the database**.
- At request time, the IP is extracted from the request (respecting `trust proxy` configuration), normalized (port stripped, IPv6 lowercased, IPv4-mapped prefix removed), and hashed using `HMAC-SHA256` with a server-side secret (`IP_HASH_KEY`).
- Only the resulting hex hash (`ip_hash`) is stored.
- The `IP_HASH_KEY` is a required environment variable. If missing, the server refuses to start.
- Admin dashboards display a **12-character prefix** of the hash for identification purposes.
- Grouping, unique-count, and deduplication analytics continue to work because the same IP always produces the same hash (given the same key).

### Rate Limiting
The rate limiter (`express-rate-limit`) continues to use the in-memory request IP at runtime for throttling. It does **not** store IPs to disk or database.

---

## 3. Admin Access Protection

| Control | Implementation |
|---|---|
| **Authentication required** | `ADMIN_KEY` environment variable must be set. If missing, all admin routes return `503 Service Unavailable`. |
| **Auth method** | `Authorization: Bearer <key>` header only. Query-string keys (`?key=`) are **not accepted** — prevents secret leakage in logs, browser history, and HTTP referrer headers. |
| **Failed auth logging** | Denied requests are logged with method + path (secrets are never logged). |
| **Admin endpoints protected** | `/api/admin/stats`, `/api/admin/users`, `/api/admin/users-by-ip`, `/api/admin/attempts`, `/api/admin/daily`, `/api/admin/sessions-by-ip`, `/api/admin/user/:userId` (DELETE) |

---

## 4. Proxy Trust Configuration

- Express `trust proxy` is configured via `TRUST_PROXY` environment variable.
- **Default: `1`** (trust one proxy hop) — safe for typical single-reverse-proxy deployments.
- Blanket `true` is no longer the default; it must be explicitly set if the deployment guarantees a trusted proxy chain.
- This ensures `req.ip` cannot be trivially spoofed by untrusted clients injecting `X-Forwarded-For` headers.

---

## 5. Data Retention

- **Configurable retention period** via `RETENTION_DAYS` environment variable (default: 90 days).
- A cleanup job runs **at server startup** and then **every 24 hours**.
- Deletes `attempts` with `created_at` older than the retention period.
- Deletes `sessions` with `started_at` older than the retention period.
- **User rows are preserved** (not deleted) to maintain foreign key integrity and allow returning visitors to retain their anonymous identity.

---

## 6. User Deletion (Compliance)

- `DELETE /api/admin/user/:userId` — admin-only endpoint that deletes a user and all associated data (sessions, attempts cascade-delete via FK constraints).
- Protected by the same admin auth middleware.
- Enables compliance with data deletion requests (e.g., Québec/Canada privacy expectations).

---

## 7. Required Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `IP_HASH_KEY` | Yes | Secret key for HMAC-SHA256 IP hashing. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_KEY` | Yes (for admin access) | Secret key for admin endpoint authentication |
| `TRUST_PROXY` | No (default: `1`) | Express trust-proxy setting |
| `RETENTION_DAYS` | No (default: `90`) | Number of days to retain session/attempt data |
| `CORS_ORIGINS` | No (default: `http://localhost:5173`) | Comma-separated allowed CORS origins |
| `PORT` | No (default: `3001`) | Server port |

---

## 8. Migration Notes

### For existing deployments
Run the IP hash migration to convert `ip_address` → `ip_hash`:
```bash
IP_HASH_KEY=<your-secret> npx tsx src/migrations/002-ip-hash.ts
```
This will:
1. Add `ip_hash` columns to `users` and `sessions`.
2. HMAC-hash all existing `ip_address` values into `ip_hash`.
3. Drop the `ip_address` columns and their indexes.
4. Create new indexes on `ip_hash`.

### For fresh deployments
`schema.sql` already uses `ip_hash` — no migration needed.

---

## 9. Architecture Notes

- **No external auth system** (OAuth, JWT, login) is used — this is intentional. The app uses anonymous UUIDs only.
- **No cookies** are set by the server.
- **Rate limiting** is IP-based at runtime only (in-memory, not persisted).
- **CORS** restricts which origins can call the API.
- **Request body size** is limited to 16KB.
