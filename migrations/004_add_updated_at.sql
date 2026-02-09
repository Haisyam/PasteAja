ALTER TABLE pastes ADD COLUMN updated_at INTEGER NULL;

UPDATE pastes
SET updated_at = created_at
WHERE updated_at IS NULL;
