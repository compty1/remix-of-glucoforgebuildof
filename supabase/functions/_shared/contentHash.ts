/**
 * Cross-source content hash for research-paper deduplication.
 *
 * Strategy: prefer the strongest stable identifier we have, in this order:
 *   1. DOI (case-insensitive, stripped of url prefix)
 *   2. PMID
 *   3. SHA-256 of normalized(title) + '|' + first author surname + '|' + year
 *
 * Returns a 32-char hex digest (first 16 bytes of SHA-256). Same paper
 * surfaced via OpenAlex + Semantic Scholar + Europe PMC will hash to the
 * same value so a future `UNIQUE (content_hash)` index can collapse them.
 */

function normalizeText(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(digest).slice(0, 16);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeContentHash(opts: {
  doi?: string | null;
  pmid?: string | null;
  title?: string | null;
  authors?: string[] | null;
  publication_date?: string | null;
}): Promise<string | null> {
  if (opts.doi) {
    const doi = opts.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').toLowerCase().trim();
    if (doi) return await sha256Hex(`doi:${doi}`);
  }
  if (opts.pmid) {
    const pmid = String(opts.pmid).trim();
    if (pmid) return await sha256Hex(`pmid:${pmid}`);
  }
  const title = normalizeText(opts.title || '');
  if (!title || title.length < 10) return null;
  const firstAuthor = normalizeText((opts.authors?.[0] || '').split(/[ ,]+/).pop() || '');
  const year = (opts.publication_date || '').slice(0, 4);
  return await sha256Hex(`tay:${title}|${firstAuthor}|${year}`);
}