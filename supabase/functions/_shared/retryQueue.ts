// Per-source retry queue with exponential backoff.
// Ingestion functions call `shouldRun(source)` at the top; skip if backoff not
// elapsed. On failure they call `recordFailure`; on success `recordSuccess`.
// State lives in public.ingestion_job_state and is manipulated via RPC.

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

export interface RetryDecision {
  allowed: boolean;
  nextRunAfter?: string;
  consecutiveFailures: number;
  isPaused: boolean;
}

/** Returns whether the ingestion source is currently allowed to run. */
export async function shouldRun(source: string): Promise<RetryDecision> {
  const { data } = await admin()
    .from('ingestion_job_state')
    .select('next_run_after, consecutive_failures, is_paused')
    .eq('source', source)
    .maybeSingle();
  if (!data) return { allowed: true, consecutiveFailures: 0, isPaused: false };
  const isPaused = !!data.is_paused;
  const nextRun = data.next_run_after ? new Date(data.next_run_after) : null;
  const allowed = !isPaused && (!nextRun || nextRun.getTime() <= Date.now());
  return {
    allowed,
    nextRunAfter: data.next_run_after ?? undefined,
    consecutiveFailures: data.consecutive_failures ?? 0,
    isPaused,
  };
}

export async function recordSuccess(source: string): Promise<void> {
  await admin().rpc('mark_ingestion_success', { p_source: source });
}

export async function recordFailure(source: string, err: unknown): Promise<void> {
  const msg = err instanceof Error ? err.message : String(err ?? 'unknown');
  await admin().rpc('bump_ingestion_backoff', { p_source: source, p_error: msg.slice(0, 2000) });
}

/** Convenience wrapper: run `fn` gated by the retry queue. */
export async function runWithRetry<T>(
  source: string,
  fn: () => Promise<T>,
): Promise<{ status: 'ran' | 'skipped' | 'failed'; result?: T; error?: string; nextRunAfter?: string }> {
  const decision = await shouldRun(source);
  if (!decision.allowed) {
    return { status: 'skipped', nextRunAfter: decision.nextRunAfter };
  }
  try {
    const result = await fn();
    await recordSuccess(source);
    return { status: 'ran', result };
  } catch (err) {
    await recordFailure(source, err);
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) };
  }
}