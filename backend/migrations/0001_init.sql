-- Syntive D1 schema. Apply with: npx wrangler d1 migrations apply syntive --remote

CREATE TABLE IF NOT EXISTS vaults (
  auth_id    TEXT PRIMARY KEY,
  blob       TEXT NOT NULL,            -- base64 AES-GCM ciphertext
  version    INTEGER NOT NULL,         -- monotonic, client-managed
  updated_at INTEGER NOT NULL          -- epoch ms
);

CREATE TABLE IF NOT EXISTS devices (
  auth_id    TEXT NOT NULL,
  device_id  TEXT NOT NULL,
  label      TEXT NOT NULL,            -- e.g. "Chrome - Windows"
  last_sync  INTEGER NOT NULL,
  PRIMARY KEY (auth_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_devices_auth ON devices(auth_id);
