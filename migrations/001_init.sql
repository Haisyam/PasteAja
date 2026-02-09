-- Final schema (fresh install)
CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  title TEXT NULL,
  content TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'unlisted')),
  expires_at INTEGER NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  password_hash TEXT NULL,
  access_key_hash TEXT NULL
);

CREATE TABLE IF NOT EXISTS paste_access_tokens (
  token TEXT PRIMARY KEY,
  paste_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (paste_id) REFERENCES pastes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS paste_edit_tokens (
  token TEXT PRIMARY KEY,
  paste_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (paste_id) REFERENCES pastes(id) ON DELETE CASCADE
);

-- Backward compatibility for old databases
ALTER TABLE pastes ADD COLUMN title TEXT NULL;
ALTER TABLE pastes ADD COLUMN access_key_hash TEXT NULL;
ALTER TABLE pastes ADD COLUMN updated_at INTEGER NULL;

UPDATE pastes
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes (expires_at);
CREATE INDEX IF NOT EXISTS idx_tokens_paste_id_expires_at ON paste_access_tokens (paste_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_edit_tokens_paste_id_expires_at ON paste_edit_tokens (paste_id, expires_at);
