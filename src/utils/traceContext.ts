/**
 * Domain 6.4: Lightweight Distributed Tracing via Correlation IDs.
 * Generates unique x-trace-id headers per user action.
 */

/**
 * Generate a unique trace ID (UUID v4 format).
 */
export function generateTraceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create headers object with trace ID for edge function calls.
 */
export function traceHeaders(existingTraceId?: string): Record<string, string> {
  return {
    'x-trace-id': existingTraceId || generateTraceId(),
  };
}

/**
 * Extract trace ID from request headers (for use in edge functions).
 */
export function extractTraceId(headers: Headers): string {
  return headers.get('x-trace-id') || generateTraceId();
}
