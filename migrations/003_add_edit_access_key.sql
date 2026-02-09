ALTER TABLE pastes ADD COLUMN access_key_hash TEXT NULL;

CREATE TABLE IF NOT EXISTS paste_edit_tokens (
  token TEXT PRIMARY KEY,
  paste_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (paste_id) REFERENCES pastes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_edit_tokens_paste_id_expires_at ON paste_edit_tokens (paste_id, expires_at);
