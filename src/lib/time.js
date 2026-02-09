import "server-only";

export const EXPIRATION_OPTIONS = {
  "10m": 10 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
  never: null,
};

export function calculateExpiresAt(expiration) {
  const duration = EXPIRATION_OPTIONS[expiration];
  if (duration === null || duration === undefined) return null;
  return Date.now() + duration;
}

export function isExpired(expiresAt) {
  return Number.isFinite(expiresAt) && Date.now() > expiresAt;
}
