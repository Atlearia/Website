# Progress Tracking — Setup Guide

## Architecture

```
Browser (React)  →  Express API (:3001)  →  PostgreSQL (:5432)
                     ├─ POST /api/register-anon
                     ├─ POST /api/attempt
                     └─ GET  /api/progress?userId=...
```

- **Anonymous UUID** is generated client-side via `crypto.randomUUID()` and stored
  in `localStorage`. The backend registers it (upsert) on first call.
- **Attempts** are sent fire-and-forget so the UI never blocks.
- **Rate limiting**: 100 req/min general, 30/min for attempts, 5/min for registration.

---

## Prerequisites

- **Node.js ≥ 18** (for `crypto.randomUUID` support)
- **Docker + Docker Compose** (for PostgreSQL)
- **npm**

---

## Quick Start (4 steps)

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts a Postgres 16 container on port 5432 with:
- user: `mathuser`, password: `mathpass`, database: `mathpractice`

### 2. Run database migrations

```bash
cd server
cp .env.example .env   # (already done — check values if needed)
npm run migrate
```

You should see: `✅ Migration complete`

### 3. Start the API server

```bash
cd server
npm run dev
```

Server runs at `http://localhost:3001`.

### 4. Start the frontend (new terminal)

```bash
# from project root
npm run dev
```

Vite dev server at `http://localhost:5173` with API proxy to `:3001`.

---

## Environment Variables (server/.env)

| Variable        | Default                                                    | Description                    |
| --------------- | ---------------------------------------------------------- | ------------------------------ |
| `DATABASE_URL`  | `postgresql://mathuser:mathpass@localhost:5432/mathpractice`| PostgreSQL connection string   |
| `PORT`          | `3001`                                                     | API server port                |
| `CORS_ORIGINS`  | `http://localhost:5173,http://localhost:4173`               | Allowed CORS origins (CSV)     |

---

## API Reference

### `POST /api/register-anon`

Creates a new anonymous user.

```bash
curl -s -X POST http://localhost:3001/api/register-anon | jq
```

Response:
```json
{ "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }
```

---

### `POST /api/attempt`

Records a problem attempt.

```bash
curl -s -X POST http://localhost:3001/api/attempt \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_UUID_HERE",
    "problemType": "add",
    "difficulty": 2,
    "timeMs": 1530,
    "correct": true,
    "clientTs": "2026-02-09T12:00:00.000Z"
  }' | jq
```

Response:
```json
{ "ok": true }
```

Validation rules:
- `timeMs`: integer 100–120000
- `problemType`: `add`, `sub`, `mul`, `mix`
- `difficulty`: integer 1–5
- `correct`: boolean

---

### `GET /api/progress?userId=...`

Returns aggregate stats + 14-day daily trend.

```bash
curl -s "http://localhost:3001/api/progress?userId=YOUR_UUID_HERE" | jq
```

Response:
```json
{
  "totals": { "attempts": 42, "correct": 38, "accuracy": 90.5 },
  "medianTimeMs": 1200,
  "medianCorrectTimeMs": 1050,
  "perDay": [
    { "date": "2026-01-27", "attempts": 5, "accuracy": 80.0, "medianTimeMs": 1400 },
    ...
  ]
}
```

---

## Testing (full curl workflow)

```bash
# 1. Register
USER_ID=$(curl -s -X POST http://localhost:3001/api/register-anon | jq -r '.userId')
echo "User: $USER_ID"

# 2. Submit some attempts
for i in $(seq 1 5); do
  curl -s -X POST http://localhost:3001/api/attempt \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"$USER_ID\",
      \"problemType\": \"add\",
      \"difficulty\": 2,
      \"timeMs\": $((RANDOM % 3000 + 500)),
      \"correct\": true,
      \"clientTs\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
    }"
  echo
done

# 3. Check progress
curl -s "http://localhost:3001/api/progress?userId=$USER_ID" | jq
```

---

## SQL Schema

```sql
-- users
CREATE TABLE users (
  id          UUID PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  last_seen   TIMESTAMPTZ DEFAULT now()
);

-- attempts
CREATE TABLE attempts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_type  TEXT NOT NULL,
  difficulty    INT NOT NULL,
  time_ms       INT NOT NULL,
  correct       BOOLEAN NOT NULL,
  client_ts     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attempts_user_created ON attempts (user_id, created_at);
CREATE INDEX idx_attempts_user_type    ON attempts (user_id, problem_type);
```

---

## Stopping

```bash
# Stop API server: Ctrl+C in that terminal
# Stop Postgres:
docker compose down
# To wipe data too:
docker compose down -v
```
