-- visitor_log: tracks every page load with hardware fingerprint + geo
CREATE TABLE IF NOT EXISTS visitor_log (
  id            BIGSERIAL PRIMARY KEY,
  ip_hash       TEXT,
  gpu_renderer  TEXT,
  gpu_vendor    TEXT,
  device_memory REAL,
  core_count    INT,
  device_type   TEXT,
  screen_width  INT,
  screen_height INT,
  pixel_ratio   REAL,
  color_depth   INT,
  connection    TEXT,
  user_agent    TEXT,
  referer       TEXT,
  city          TEXT,
  region        TEXT,
  country       TEXT,
  country_code  TEXT,
  timezone      TEXT,
  isp           TEXT,
  webgl_version INT,
  battery_level REAL,
  battery_charging BOOLEAN,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_log_ip_hash ON visitor_log (ip_hash);
CREATE INDEX IF NOT EXISTS idx_visitor_log_created ON visitor_log (created_at);
