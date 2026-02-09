import "server-only";

import { db } from "@/lib/db";

export async function insertPaste(paste) {
  await db.execute({
    sql: `
      INSERT INTO pastes (id, title, content, visibility, expires_at, created_at, updated_at, password_hash, access_key_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      paste.id,
      paste.title,
      paste.content,
      paste.visibility,
      paste.expiresAt,
      paste.createdAt,
      paste.updatedAt,
      paste.passwordHash,
      paste.accessKeyHash,
    ],
  });
}

export async function getPasteById(id) {
  const result = await db.execute({
    sql: `
      SELECT id, title, content, visibility, expires_at, created_at, updated_at, password_hash, access_key_hash
      FROM pastes
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  });

  return result.rows[0] ?? null;
}

export async function insertAccessToken(tokenRecord) {
  await db.execute({
    sql: `
      INSERT INTO paste_access_tokens (token, paste_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `,
    args: [
      tokenRecord.token,
      tokenRecord.pasteId,
      tokenRecord.expiresAt,
      tokenRecord.createdAt,
    ],
  });
}

export async function getAccessToken(token, pasteId) {
  const result = await db.execute({
    sql: `
      SELECT token, paste_id, expires_at, created_at
      FROM paste_access_tokens
      WHERE token = ? AND paste_id = ?
      LIMIT 1
    `,
    args: [token, pasteId],
  });

  return result.rows[0] ?? null;
}

export async function deleteExpiredTokens(nowEpochMs) {
  await db.execute({
    sql: `DELETE FROM paste_access_tokens WHERE expires_at <= ?`,
    args: [nowEpochMs],
  });
}

export async function deleteToken(token) {
  await db.execute({
    sql: `DELETE FROM paste_access_tokens WHERE token = ?`,
    args: [token],
  });
}

export async function updatePasteById(id, values) {
  await db.execute({
    sql: `
      UPDATE pastes
      SET title = ?, content = ?, updated_at = ?
      WHERE id = ?
    `,
    args: [values.title, values.content, values.updatedAt, id],
  });
}

export async function insertEditAccessToken(tokenRecord) {
  await db.execute({
    sql: `
      INSERT INTO paste_edit_tokens (token, paste_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `,
    args: [
      tokenRecord.token,
      tokenRecord.pasteId,
      tokenRecord.expiresAt,
      tokenRecord.createdAt,
    ],
  });
}

export async function getEditAccessToken(token, pasteId) {
  const result = await db.execute({
    sql: `
      SELECT token, paste_id, expires_at, created_at
      FROM paste_edit_tokens
      WHERE token = ? AND paste_id = ?
      LIMIT 1
    `,
    args: [token, pasteId],
  });

  return result.rows[0] ?? null;
}

export async function deleteExpiredEditTokens(nowEpochMs) {
  await db.execute({
    sql: `DELETE FROM paste_edit_tokens WHERE expires_at <= ?`,
    args: [nowEpochMs],
  });
}

export async function deleteEditToken(token) {
  await db.execute({
    sql: `DELETE FROM paste_edit_tokens WHERE token = ?`,
    args: [token],
  });
}

export async function deleteAccessTokensByPasteId(pasteId) {
  await db.execute({
    sql: `DELETE FROM paste_access_tokens WHERE paste_id = ?`,
    args: [pasteId],
  });
}

export async function deleteEditTokensByPasteId(pasteId) {
  await db.execute({
    sql: `DELETE FROM paste_edit_tokens WHERE paste_id = ?`,
    args: [pasteId],
  });
}

export async function deletePasteById(id) {
  await db.execute({
    sql: `DELETE FROM pastes WHERE id = ?`,
    args: [id],
  });
}
