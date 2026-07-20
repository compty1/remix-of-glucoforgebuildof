// Shared search-result cache backed by public.search_cache.
// Edge functions performing expensive full-text or trigram queries can wrap
// the query with `withSearchCache(key, ttlMinutes, fetcher)`.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

let cached: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (cached) return cached;
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service credentials missing');
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export async function hashKey(...parts: string[]): Promise<string> {
  const data = new TextEncoder().encode(parts.map((p) => (p ?? '').toLowerCase().trim()).join('|'));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function withSearchCache<T>(
  cacheKey: string,
  queryText: string,
  ttlMinutes: number,
  fetcher: () => Promise<T>,
): Promise<{ payload: T; hit: boolean }> {
  const supabase = admin();
  const { data: existing } = await supabase
    .from('search_cache')
    .select('payload, expires_at')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (existing?.payload) {
    void supabase.from('search_cache').update({ hit_count: (existing as { hit_count?: number }).hit_count ?? 0 + 1 }).eq('cache_key', cacheKey);
    return { payload: existing.payload as T, hit: true };
  }

  const payload = await fetcher();
  const expires = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
  await supabase.from('search_cache').upsert({
    cache_key: cacheKey,
    query_text: queryText.slice(0, 500),
    payload: payload as unknown as Record<string, unknown>,
    expires_at: expires,
    hit_count: 0,
  });
  return { payload, hit: false };
}

/** Periodic maintenance: drop expired cache rows. Call from scheduled jobs. */
export async function purgeExpiredSearchCache(): Promise<number> {
  const { count } = await admin()
    .from('search_cache')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString());
  return count ?? 0;
}