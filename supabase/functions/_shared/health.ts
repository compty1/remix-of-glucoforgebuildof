/**
 * Phase 4: Health check and graceful degradation utilities.
 * Covers: 4.8 (health checks), 4.9 (graceful degradation).
 */
import { corsHeaders, jsonResponse, errorResponse } from "./cors.ts";

/**
 * Standard health check response for edge functions.
 */
export function healthCheckResponse(functionName: string, extras?: Record<string, unknown>): Response {
  return jsonResponse({
    status: 'healthy',
    function: functionName,
    timestamp: new Date().toISOString(),
    ...extras,
  });
}

/**
 * Handle health check requests (GET /?health=true).
 */
export function handleHealthCheck(req: Request, functionName: string): Response | null {
  const url = new URL(req.url);
  if (url.searchParams.get('health') === 'true' || url.pathname.endsWith('/health')) {
    return healthCheckResponse(functionName);
  }
  return null;
}

/**
 * Graceful degradation wrapper — attempts primary, falls back to fallback.
 * Returns a result with degradation info.
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  label: string
): Promise<{ result: T; degraded: boolean; source: string }> {
  try {
    const result = await primary();
    return { result, degraded: false, source: `${label}:primary` };
  } catch (primaryErr) {
    console.warn(`[${label}] Primary failed, using fallback:`, primaryErr);
    try {
      const result = await fallback();
      return { result, degraded: true, source: `${label}:fallback` };
    } catch (fallbackErr) {
      console.error(`[${label}] Fallback also failed:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Retry an async operation with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; label?: string } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 500, label = 'operation' } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[${label}] Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}
