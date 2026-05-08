CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY,
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_ip_hash ON users (ip_hash);

CREATE TABLE IF NOT EXISTS attempts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_type  TEXT NOT NULL,
  difficulty    INT NOT NULL,
  time_ms       INT NOT NULL,
  correct       BOOLEAN NOT NULL,
  client_ts     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_created
  ON attempts (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_attempts_user_type
  ON attempts (user_id, problem_type);

CREATE TABLE IF NOT EXISTS sessions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_hash       TEXT,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at      TIMESTAMPTZ,
  attempts      INT NOT NULL DEFAULT 0,
  correct       INT NOT NULL DEFAULT 0,
  total_time_ms BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_ip_hash ON sessions (ip_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions (started_at);

CREATE TABLE IF NOT EXISTS guestbook (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT DEFAULT 'Anonymous',
  email       TEXT,
  message     TEXT NOT NULL,
  ip_hash     TEXT,
  user_agent  TEXT,
  referer     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guestbook_created ON guestbook (created_at);
