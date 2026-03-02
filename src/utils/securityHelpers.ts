/**
 * Phase 2: Security Hardening - Additional Security Utilities
 * Covers: 2.12 (URL safety), 2.14 (SW PHI caching), 2.16 (Realtime filters),
 *         2.17 (Magic link protection)
 */

// ============= 2.12: URL SIGNING / SAFETY =============

/**
 * Validate that a URL is safe before opening.
 * Prevents open redirect and javascript: protocol attacks.
 */
export function isSafeURL(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url, window.location.origin);
    // Block javascript:, data:, vbscript: protocols
    const blockedProtocols = ['javascript:', 'data:', 'vbscript:', 'blob:'];
    if (blockedProtocols.some(p => parsed.protocol === p)) return false;
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a safe external link with rel="noopener noreferrer".
 */
export function safeExternalLink(url: string): { href: string; target: string; rel: string } | null {
  if (!isSafeURL(url)) return null;
  return {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

// ============= 2.14: SERVICE WORKER PHI CACHING PREVENTION =============

/**
 * HTTP headers that should be set on responses containing PHI
 * to prevent service worker caching.
 */
export const PHI_NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * URL patterns that should never be cached by service workers
 * because they may contain Protected Health Information.
 */
export const PHI_URL_PATTERNS = [
  '/rest/v1/uploads',
  '/rest/v1/shifts',
  '/rest/v1/profiles',
  '/rest/v1/chat_sessions',
  '/rest/v1/direct_messages',
  '/rest/v1/diabetic_profiles',
  '/functions/v1/analyze-glucose',
  '/functions/v1/t1d-companion-chat',
  '/functions/v1/daily-briefing',
];

/**
 * Check if a URL contains PHI data that should not be cached.
 */
export function isPHIUrl(url: string): boolean {
  return PHI_URL_PATTERNS.some(pattern => url.includes(pattern));
}

// ============= 2.16: REALTIME FILTER ENFORCEMENT =============

/**
 * Build a safe Realtime subscription filter scoped to the current user.
 * Prevents users from subscribing to other users' data.
 */
export function buildUserScopedFilter(userId: string, column = 'user_id'): string {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required for Realtime subscriptions');
  }
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    throw new Error('Invalid user ID format');
  }
  return `${column}=eq.${userId}`;
}

// ============= 2.17: MAGIC LINK PRE-FETCH PROTECTION =============

/**
 * Headers to prevent email clients from pre-fetching magic links.
 * These should be set on any auth callback endpoint.
 */
export const MAGIC_LINK_PROTECTION_META = {
  // Prevent email clients from pre-fetching the page
  'X-Robots-Tag': 'noindex, nofollow',
};

/**
 * Validate that a magic link token is being consumed intentionally
 * (not by an email client pre-fetching the URL).
 */
export function validateMagicLinkConsumption(): boolean {
  // Check if this is likely a real user interaction vs bot pre-fetch
  const hasInteraction = typeof window !== 'undefined' && (
    window.navigator.userAgent.includes('Mozilla') ||
    window.navigator.userAgent.includes('Chrome') ||
    window.navigator.userAgent.includes('Safari')
  );

  // Email client bots typically have specific user agents
  const botPatterns = [
    'Googlebot', 'bingbot', 'Yahoo! Slurp', 'Baiduspider',
    'YandexBot', 'DuckDuckBot', 'facebookexternalhit',
    'LinkedInBot', 'Twitterbot', 'WhatsApp',
    'Outlook', 'Thunderbird',
  ];

  const ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const isBot = botPatterns.some(p => ua.includes(p));

  return hasInteraction && !isBot;
}

// ============= RATE LIMIT HELPERS (Client-side) =============

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Client-side rate limiter for form submissions.
 * Returns true if the action is allowed, false if rate limited.
 */
export function checkClientRateLimit(
  actionKey: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(actionKey);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(actionKey, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Reset rate limit for a specific action.
 */
export function resetRateLimit(actionKey: string): void {
  rateLimitMap.delete(actionKey);
}
