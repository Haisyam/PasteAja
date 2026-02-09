import "server-only";

import bcrypt from "bcryptjs";

import { generateEditorAccessKey, generatePasteId } from "@/lib/id";
import { logger } from "@/lib/logger";
import { calculateExpiresAt, isExpired } from "@/lib/time";
import {
  deleteAccessTokensByPasteId,
  deleteEditTokensByPasteId,
  deletePasteById,
  getPasteById,
  insertPaste,
  updatePasteById,
} from "@/server/repositories/paste.repo";
import {
  validateEditAccessToken,
} from "@/server/services/auth.service";
import {
  createPasteSchema,
  unlockEditorSchema,
  unlockPasteSchema,
  updatePasteSchema,
} from "@/server/validators/paste.schema";

const BCRYPT_ROUNDS = 12;
const MAX_CREATE_RETRIES = 5;

function toPublicPaste(row) {
  return {
    id: row.id,
    title: row.title ?? null,
    content: row.content,
    visibility: row.visibility,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isProtected: Boolean(row.password_hash),
  };
}

function isPasteExpired(row) {
  if (!row?.expires_at) return false;
  return isExpired(Number(row.expires_at));
}

export async function createPaste(input, metadata = {}) {
  const parsed = createPasteSchema.parse(input);

  const passwordHash = parsed.password
    ? await bcrypt.hash(parsed.password, BCRYPT_ROUNDS)
    : null;
  const accessKey = generateEditorAccessKey();
  const accessKeyHash = await bcrypt.hash(accessKey, BCRYPT_ROUNDS);

  const createdAt = Date.now();
  const updatedAt = createdAt;
  const expiresAt = calculateExpiresAt(parsed.expiration);

  for (let attempt = 0; attempt < MAX_CREATE_RETRIES; attempt += 1) {
    const id = generatePasteId();

    try {
      await insertPaste({
        id,
        title: parsed.title ?? null,
        content: parsed.content,
        visibility: parsed.visibility,
        createdAt,
        updatedAt,
        expiresAt,
        passwordHash,
        accessKeyHash,
      });

      logger.info("paste_created", {
        id,
        hasTitle: Boolean(parsed.title),
        visibility: parsed.visibility,
        hasPassword: Boolean(passwordHash),
        ip: metadata.ip,
      });

      return { id, accessKey };
    } catch (error) {
      if (attempt === MAX_CREATE_RETRIES - 1) {
        logger.error("paste_create_failed", { ip: metadata.ip, reason: "insert_error" });
        throw error;
      }
    }
  }

  throw new Error("Unable to create paste");
}

export async function getPasteForAccess(id, metadata = {}) {
  const row = await getPasteById(id);
  if (!row || isPasteExpired(row)) {
    return { status: "not_found" };
  }

  const protectedPaste = Boolean(row.password_hash);
  if (protectedPaste) {
    logger.warn("paste_access_denied", { id, ip: metadata.ip });
    return { status: "locked" };
  }

  logger.info("paste_read", { id, ip: metadata.ip });
  return { status: "ok", paste: toPublicPaste(row) };
}

export async function verifyPastePassword(id, input, metadata = {}) {
  const parsed = unlockPasteSchema.parse(input);

  const row = await getPasteById(id);
  if (!row || isPasteExpired(row) || !row.password_hash) {
    logger.warn("paste_unlock_denied", { id, ip: metadata.ip, reason: "not_available" });
    return { ok: false };
  }

  const valid = await bcrypt.compare(parsed.password, row.password_hash);
  if (!valid) {
    logger.warn("paste_unlock_denied", { id, ip: metadata.ip, reason: "bad_password" });
    return { ok: false };
  }

  logger.info("paste_unlock_success", { id, ip: metadata.ip });
  return { ok: true };
}

export async function unlockPasteAndGetContent(id, input, metadata = {}) {
  const verified = await verifyPastePassword(id, input, metadata);
  if (!verified.ok) return { status: "locked" };

  const row = await getPasteById(id);
  if (!row || isPasteExpired(row)) return { status: "not_found" };

  return { status: "ok", paste: toPublicPaste(row) };
}

export async function getPasteVisibilityInfo(id) {
  const row = await getPasteById(id);
  if (!row || isPasteExpired(row)) return { status: "not_found" };

  return {
    status: "ok",
    id: row.id,
    title: row.title ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
    visibility: row.visibility,
    isProtected: Boolean(row.password_hash),
  };
}

export async function verifyEditorAccessKey(id, input, metadata = {}) {
  const parsed = unlockEditorSchema.parse(input);

  const row = await getPasteById(id);
  if (!row || isPasteExpired(row) || !row.access_key_hash) {
    logger.warn("paste_editor_unlock_denied", { id, ip: metadata.ip, reason: "not_available" });
    return { ok: false };
  }

  const valid = await bcrypt.compare(parsed.accessKey, row.access_key_hash);
  if (!valid) {
    logger.warn("paste_editor_unlock_denied", { id, ip: metadata.ip, reason: "invalid_access_key" });
    return { ok: false };
  }

  logger.info("paste_editor_unlock_success", { id, ip: metadata.ip });
  return { ok: true };
}

export async function updatePasteForEditor(id, editAccessToken, input, metadata = {}) {
  const parsed = updatePasteSchema.parse(input);

  const row = await getPasteById(id);
  if (!row || isPasteExpired(row)) {
    return { status: "not_found" };
  }

  const hasEditAccess = await validateEditAccessToken(editAccessToken, id);
  if (!hasEditAccess) {
    logger.warn("paste_edit_denied", { id, ip: metadata.ip });
    return { status: "locked" };
  }

  await updatePasteById(id, {
    title: parsed.title,
    content: parsed.content,
    updatedAt: Date.now(),
  });

  logger.info("paste_updated", {
    id,
    ip: metadata.ip,
    hasTitle: Boolean(parsed.title),
  });

  return {
    status: "ok",
    title: parsed.title,
    content: parsed.content,
  };
}

export async function canEditPaste(id, editAccessToken) {
  const row = await getPasteById(id);
  if (!row || isPasteExpired(row)) return false;
  return validateEditAccessToken(editAccessToken, id);
}

export async function deletePasteForEditor(id, editAccessToken, metadata = {}) {
  const row = await getPasteById(id);
  if (!row || isPasteExpired(row)) {
    return { status: "not_found" };
  }

  const hasEditAccess = await validateEditAccessToken(editAccessToken, id);
  if (!hasEditAccess) {
    logger.warn("paste_delete_denied", { id, ip: metadata.ip });
    return { status: "locked" };
  }

  await deleteAccessTokensByPasteId(id);
  await deleteEditTokensByPasteId(id);
  await deletePasteById(id);

  logger.info("paste_deleted", { id, ip: metadata.ip });
  return { status: "ok" };
}
