// Unified review content sanitization and validation
// Addresses C21, C24, C27

// Comprehensive junk markers list — single source of truth
// Previously duplicated across useExternalReviews.ts (35+), useMedicationDetails.ts (~17), ExternalReviewCard.tsx
export const JUNK_MARKERS = [
  'skip to main content',
  'skip to content',
  'skip to primary content',
  'skip to navigation',
  'skip to footer',
  'keyboard shortcuts',
  'save up to',
  'a-z list of drugs',
  'a-z list',
  'pill identifier',
  'page you were looking',
  'find treatment options',
  'the page you were looking could not be found',
  'skip to fda search',
  'skip to footer links',
  'skip to in this section',
  'in this section:',
  'drug interaction checker',
  'cookie policy',
  'sign up for',
  'advertisement',
  'check for [drug interactions]',
  'latest drug news',
  'start over on our',
  'complete sitemap',
  'home page](https://',
  'clipboard, search history',
  'sale sold out in stock',
  'filter your search',
  'we are updating our terms',
  'find a journal',
  'publish with us',
  'track your research',
  'automated to help more patients',
  'go to main content',
  'visit website',
  'error 403',
  'error 404',
  'claimed profile',
  'trustscore',
  'share - facebook',
  'logoproducts',
  'dexcom logo',
  'products patients',
  'javascript is disabled',
  'accept cookies',
  'we use cookies',
  'privacy policy',
  'terms of service',
  'subscribe to',
];

/**
 * Check if review content is valid (not scraped junk). (C21, C27)
 * Minimum length increased from 50 to 80 chars to filter more junk.
 */
export function isValidReviewContent(content: string): boolean {
  if (!content || content.length < 80) return false;
  const lower = content.substring(0, 500).toLowerCase();
  return !JUNK_MARKERS.some(marker => lower.includes(marker));
}

/**
 * Clean markdown artifacts from scraped content. (C24)
 * Single source of truth — previously duplicated 3 times.
 */
export function sanitizeContent(content: string): string {
  return content
    // Remove empty markdown links
    .replace(/\[]\([^)]*\)/g, '')
    // Remove markdown images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Convert links to just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove heading markers
    .replace(/#{1,6}\s/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
