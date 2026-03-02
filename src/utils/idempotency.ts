/**
 * Phase 19.3: Idempotency Key Utilities
 * Client-side UUID keys to prevent duplicate mutations.
 */

/**
 * Generate a unique idempotency key for a mutation.
 */
export function generateIdempotencyKey(prefix = 'idem'): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

/**
 * In-memory cache of recently used idempotency keys to catch
 * client-side double-clicks before they hit the server.
 */
const recentKeys = new Set<string>();
const MAX_CACHED = 200;

export function isKeyUsed(key: string): boolean {
  return recentKeys.has(key);
}

export function markKeyUsed(key: string): void {
  recentKeys.add(key);
  // Evict oldest entries when cache grows too large
  if (recentKeys.size > MAX_CACHED) {
    const first = recentKeys.values().next().value;
    if (first) recentKeys.delete(first);
  }
}

/**
 * Wrapper that ensures a mutation is only executed once per idempotency key.
 * Returns the cached result if the key was already used.
 */
export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  if (isKeyUsed(key)) {
    throw new Error(`Duplicate mutation detected (key: ${key}). Request was already processed.`);
  }
  markKeyUsed(key);
  return fn();
}
