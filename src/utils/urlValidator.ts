/**
 * Validate that a URL uses a safe protocol before opening it.
 * Prevents javascript: and other dangerous protocol attacks from scraped/user content.
 * 
 * Bugs addressed: 228, 263, 264
 */
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Safely open a URL in a new tab with security attributes.
 * Returns false if the URL was blocked.
 */
export function safeOpenUrl(url: string | null | undefined, target: '_blank' | '_self' = '_blank'): boolean {
  if (!isSafeUrl(url)) return false;
  window.open(url!, target, target === '_blank' ? 'noopener,noreferrer' : undefined);
  return true;
}
