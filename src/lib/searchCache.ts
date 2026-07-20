// Lightweight in-memory LRU cache for search results with TTL.
// Complements the server-side public.search_cache table for cross-user reuse.

interface Entry<T> { value: T; expiresAt: number; }

const MAX_ENTRIES = 50;
const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  // LRU refresh
  store.delete(key);
  store.set(key, hit);
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = 60_000): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheClear(): void { store.clear(); }