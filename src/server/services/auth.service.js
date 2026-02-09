import "server-only";

import crypto from "node:crypto";

import { generateAccessToken } from "@/lib/id";
import {
  deleteExpiredTokens,
  deleteToken,
  getAccessToken,
  getEditAccessToken,
  deleteExpiredEditTokens,
  deleteEditToken,
  insertAccessToken,
  insertEditAccessToken,
} from "@/server/repositories/paste.repo";

const ACCESS_TOKEN_TTL_MS = 10 * 60 * 1000;
const EDIT_TOKEN_TTL_MS = 60 * 60 * 1000;
export const ACCESS_COOKIE_NAME = "paste_access_token";
export const EDIT_ACCESS_COOKIE_NAME = "paste_edit_token";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  return originUrl.host === request.headers.get("host");
}

export async function issueAccessToken(pasteId) {
  await deleteExpiredTokens(Date.now());

  const rawToken = generateAccessToken();
  const tokenHash = hashToken(rawToken);
  const createdAt = Date.now();
  const expiresAt = createdAt + ACCESS_TOKEN_TTL_MS;

  await insertAccessToken({
    token: tokenHash,
    pasteId,
    createdAt,
    expiresAt,
  });

  return {
    token: rawToken,
    expiresAt,
  };
}

export async function validateAccessToken(rawToken, pasteId) {
  if (!rawToken || !pasteId) return false;

  await deleteExpiredTokens(Date.now());

  const tokenHash = hashToken(rawToken);
  const tokenRecord = await getAccessToken(tokenHash, pasteId);

  if (!tokenRecord) {
    return false;
  }

  if (Date.now() > Number(tokenRecord.expires_at)) {
    await deleteToken(tokenHash);
    return false;
  }

  return true;
}

export async function issueEditAccessToken(pasteId) {
  await deleteExpiredEditTokens(Date.now());

  const rawToken = generateAccessToken();
  const tokenHash = hashToken(rawToken);
  const createdAt = Date.now();
  const expiresAt = createdAt + EDIT_TOKEN_TTL_MS;

  await insertEditAccessToken({
    token: tokenHash,
    pasteId,
    createdAt,
    expiresAt,
  });

  return {
    token: rawToken,
    expiresAt,
  };
}

export async function validateEditAccessToken(rawToken, pasteId) {
  if (!rawToken || !pasteId) return false;

  await deleteExpiredEditTokens(Date.now());

  const tokenHash = hashToken(rawToken);
  const tokenRecord = await getEditAccessToken(tokenHash, pasteId);

  if (!tokenRecord) {
    return false;
  }

  if (Date.now() > Number(tokenRecord.expires_at)) {
    await deleteEditToken(tokenHash);
    return false;
  }

  return true;
}

export function buildAccessCookie(token, expiresAt) {
  return {
    name: ACCESS_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    },
  };
}

export function buildEditAccessCookie(token, expiresAt) {
  return {
    name: EDIT_ACCESS_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    },
  };
}
