/**
 * Shared junk content filter for all review edge functions.
 * Canonical JUNK_MARKERS list — single source of truth for server-side filtering.
 * Client-side reviewSanitizer.ts mirrors this as defense-in-depth.
 */

export const JUNK_MARKERS = [
  'skip to main content', 'skip to content', 'skip to primary content',
  'skip to navigation', 'skip to footer', 'skip to fda search',
  'skip to footer links', 'skip to in this section', 'in this section:',
  'keyboard shortcuts', 'save up to', 'a-z list of drugs', 'a-z list',
  'pill identifier', 'page you were looking', 'find treatment options',
  'the page you were looking could not be found',
  'drug interaction checker', 'cookie policy', 'sign up for',
  'advertisement', 'check for [drug interactions]', 'latest drug news',
  'start over on our', 'complete sitemap', 'home page](https://',
  'clipboard, search history', 'sale sold out in stock', 'filter your search',
  'we are updating our terms', 'find a journal', 'publish with us',
  'track your research', 'automated to help more patients',
  'go to main content', 'visit website', 'error 403', 'error 404',
  'claimed profile', 'trustscore', 'share - facebook',
  'logoproducts', 'dexcom logo', 'products patients',
  'javascript is disabled', 'accept cookies', 'we use cookies',
  'privacy policy', 'terms of service', 'subscribe to',
];

/**
 * Returns true if the content appears to be scraped navigation/junk.
 * Minimum 80 chars required.
 */
export function isJunkContent(text: string): boolean {
  if (!text || text.length < 80) return true;
  const lower = text.substring(0, 500).toLowerCase();
  return JUNK_MARKERS.some(marker => lower.includes(marker));
}

/**
 * Clean markdown artifacts from scraped content.
 */
export function cleanMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,3}/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate a deterministic external_id from source + URL or content prefix.
 * Uses a simple hash to avoid duplicates from re-scraping.
 */
export function deterministicId(source: string, url: string | null, contentPrefix: string): string {
  const input = url || `${source}_${contentPrefix.substring(0, 100)}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(36);
  return `${source}_${hex}`;
}
