import "server-only";

const store = new Map();

function now() {
  return Date.now();
}

function cleanup(key, windowMs) {
  const bucket = store.get(key);
  if (!bucket) return;

  const cutoff = now() - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit > cutoff);

  if (bucket.hits.length === 0) {
    store.delete(key);
  }
}

export function rateLimit(key, { limit, windowMs }) {
  cleanup(key, windowMs);

  const bucket = store.get(key) ?? { hits: [] };
  const ts = now();
  bucket.hits.push(ts);
  store.set(key, bucket);

  if (bucket.hits.length <= limit) {
    return {
      allowed: true,
      remaining: Math.max(0, limit - bucket.hits.length),
      retryAfter: 0,
    };
  }

  const earliest = bucket.hits[0];
  return {
    allowed: false,
    remaining: 0,
    retryAfter: Math.max(1, Math.ceil((earliest + windowMs - ts) / 1000)),
  };
}
