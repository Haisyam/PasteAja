import "server-only";

import crypto from "node:crypto";

function maskIp(ip) {
  if (!ip) return "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 12);
}

function buildPayload(message, meta = {}) {
  return {
    message,
    timestamp: new Date().toISOString(),
    ...meta,
    ip: maskIp(meta.ip),
  };
}

export const logger = {
  info(message, meta) {
    console.info(JSON.stringify(buildPayload(message, meta)));
  },
  warn(message, meta) {
    console.warn(JSON.stringify(buildPayload(message, meta)));
  },
  error(message, meta) {
    console.error(JSON.stringify(buildPayload(message, meta)));
  },
};
