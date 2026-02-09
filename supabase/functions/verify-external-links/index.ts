import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback URL patterns for common sources
const fallbackPatterns: Record<string, (id: string) => string> = {
  pubmed: (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
  doi: (id: string) => `https://doi.org/${id}`,
  clinicaltrials: (id: string) => `https://clinicaltrials.gov/study/${id}`,
  reddit: (permalink: string) => `https://www.reddit.com${permalink}`,
  openalex: (id: string) => `https://openalex.org/${id}`,
  patent: (id: string) => `https://patents.google.com/patent/${id}`,
};

function extractIdentifier(url: string, source: string): string | null {
  try {
    const urlObj = new URL(url);
    switch (source) {
      case 'pubmed':
        const pmidMatch = url.match(/\/(\d+)\/?$/);
        return pmidMatch ? pmidMatch[1] : null;
      case 'doi':
        const doiMatch = url.match(/doi\.org\/(.+)$/);
        return doiMatch ? doiMatch[1] : null;
      case 'clinicaltrials':
        const nctMatch = url.match(/(NCT\d+)/i);
        return nctMatch ? nctMatch[1] : null;
      case 'reddit':
        return urlObj.pathname;
      case 'openalex':
        const oaMatch = url.match(/openalex\.org\/(W\d+)/);
        return oaMatch ? oaMatch[1] : null;
      case 'patent':
        const patentMatch = url.match(/patent\/([A-Z]{2}\d+[A-Z]?\d*)/);
        return patentMatch ? patentMatch[1] : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function detectSourceType(url: string): string {
  if (url.includes('pubmed.ncbi.nlm.nih.gov') || url.includes('ncbi.nlm.nih.gov/pubmed')) return 'pubmed';
  if (url.includes('doi.org')) return 'doi';
  if (url.includes('clinicaltrials.gov')) return 'clinicaltrials';
  if (url.includes('reddit.com')) return 'reddit';
  if (url.includes('openalex.org')) return 'openalex';
  if (url.includes('patents.google.com')) return 'patent';
  return 'unknown';
}

// Check if a URL is a Reddit search URL we constructed (always structurally valid)
function isRedditSearchUrl(url: string): boolean {
  return /^https:\/\/(www\.)?reddit\.com\/search\/?\?q=/.test(url);
}

// Structural validation: check URL format without HTTP request
function structurallyValidate(url: string): { valid: boolean; method: string } {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, method: 'structural' };
    }
    // Reddit search URLs we generate are always valid
    if (isRedditSearchUrl(url)) {
      return { valid: true, method: 'structural_reddit_search' };
    }
    return { valid: true, method: 'structural_format' };
  } catch {
    return { valid: false, method: 'structural' };
  }
}

async function verifyUrl(url: string): Promise<{ valid: boolean; status?: number; error?: string; method: string }> {
  // Skip HTTP verification for Reddit URLs — they block server-side requests with 403
  if (url.includes('reddit.com')) {
    const structural = structurallyValidate(url);
    return { ...structural, status: undefined };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'GlucoForge Link Verifier/1.0' }
    });
    clearTimeout(timeoutId);
    const valid = response.status >= 200 && response.status < 400;
    return { valid, status: response.status, method: 'http_head' };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error', method: 'http_head' };
  }
}

function generateFallbackUrl(originalUrl: string): string | null {
  const sourceType = detectSourceType(originalUrl);
  const identifier = extractIdentifier(originalUrl, sourceType);
  if (!identifier || !fallbackPatterns[sourceType]) return null;
  return fallbackPatterns[sourceType](identifier);
}

interface VerificationResult {
  originalUrl: string;
  valid: boolean;
  status?: number;
  error?: string;
  fallbackUrl?: string | null;
  fallbackValid?: boolean;
  sourceType: string;
  method: string;
  postId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { urls, mode = 'verify' } = body;

    // MODE: "fix" — fetch posts from DB, verify, and update link_status
    if (mode === 'fix') {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const batchSize = 50;
      let offset = 0;
      let totalProcessed = 0;
      let totalValid = 0;
      let totalDead = 0;
      let totalStructural = 0;

      while (true) {
        const { data: posts, error } = await supabase
          .from('community_posts')
          .select('id, url, title')
          .not('url', 'is', null)
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!posts || posts.length === 0) break;

        for (const post of posts) {
          if (!post.url) continue;

          const result = await verifyUrl(post.url);
          const linkStatus: Record<string, unknown> = {
            status: result.valid ? 'ok' : 'dead',
            http_code: result.status || null,
            error: result.error || null,
            method: result.method,
            last_checked: new Date().toISOString(),
          };

          // Track structural validations
          if (result.method.startsWith('structural')) {
            totalStructural++;
            linkStatus.status = 'ok';
            linkStatus.note = 'Structurally validated (no HTTP check)';
          }

          let fallbackUrl: string | null = null;
          if (!result.valid && !result.method.startsWith('structural')) {
            fallbackUrl = generateFallbackUrl(post.url);
            if (fallbackUrl && fallbackUrl !== post.url) {
              const fallbackResult = await verifyUrl(fallbackUrl);
              if (fallbackResult.valid) {
                linkStatus.status = 'ok_fallback';
              }
            }
          }

          const isValid = linkStatus.status === 'ok' || linkStatus.status === 'ok_fallback';

          await supabase.from('community_posts').update({
            link_status: linkStatus,
            source_link_verified: isValid,
            source_link_verified_at: new Date().toISOString(),
            ...(fallbackUrl && !result.valid ? { canonical_url: fallbackUrl } : {}),
          }).eq('id', post.id);

          totalProcessed++;
          if (isValid) totalValid++;
          else totalDead++;
        }

        offset += batchSize;
        if (posts.length < batchSize) break;
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'fix',
          summary: { totalProcessed, totalValid, totalDead, totalStructural },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // MODE: "verify" (default) — check provided URLs without DB writes
    if (!urls || !Array.isArray(urls)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a urls array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: VerificationResult[] = await Promise.all(
      urls.slice(0, 50).map(async (url: string) => {
        if (!url || typeof url !== 'string') {
          return { originalUrl: url || '', valid: false, error: 'Invalid URL', sourceType: 'unknown', method: 'none' };
        }

        const result = await verifyUrl(url);
        let fallbackUrl: string | null = null;
        let fallbackValid = false;

        if (!result.valid && !result.method.startsWith('structural')) {
          fallbackUrl = generateFallbackUrl(url);
          if (fallbackUrl && fallbackUrl !== url) {
            const fallbackResult = await verifyUrl(fallbackUrl);
            fallbackValid = fallbackResult.valid;
          }
        }

        return {
          originalUrl: url,
          valid: result.valid,
          status: result.status,
          error: result.error,
          fallbackUrl,
          fallbackValid,
          sourceType: detectSourceType(url),
          method: result.method,
        };
      })
    );

    const summary = {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      fixable: results.filter(r => !r.valid && r.fallbackValid).length,
    };

    return new Response(
      JSON.stringify({ success: true, results, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error verifying links:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
