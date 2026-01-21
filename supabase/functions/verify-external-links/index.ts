import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Extract identifier from URL for fallback generation
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

// Detect source type from URL
function detectSourceType(url: string): string {
  if (url.includes('pubmed.ncbi.nlm.nih.gov') || url.includes('ncbi.nlm.nih.gov/pubmed')) {
    return 'pubmed';
  }
  if (url.includes('doi.org')) {
    return 'doi';
  }
  if (url.includes('clinicaltrials.gov')) {
    return 'clinicaltrials';
  }
  if (url.includes('reddit.com')) {
    return 'reddit';
  }
  if (url.includes('openalex.org')) {
    return 'openalex';
  }
  if (url.includes('patents.google.com')) {
    return 'patent';
  }
  return 'unknown';
}

// Verify if a URL is accessible
async function verifyUrl(url: string): Promise<{ valid: boolean; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'GlucoForge Link Verifier/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Consider 2xx and 3xx as valid
    const valid = response.status >= 200 && response.status < 400;
    return { valid, status: response.status };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Generate fallback URL if primary fails
function generateFallbackUrl(originalUrl: string): string | null {
  const sourceType = detectSourceType(originalUrl);
  const identifier = extractIdentifier(originalUrl, sourceType);
  
  if (!identifier || !fallbackPatterns[sourceType]) {
    return null;
  }
  
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a urls array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: VerificationResult[] = await Promise.all(
      urls.slice(0, 50).map(async (url: string) => {
        if (!url || typeof url !== 'string') {
          return {
            originalUrl: url || '',
            valid: false,
            error: 'Invalid URL',
            sourceType: 'unknown'
          };
        }

        const result = await verifyUrl(url);
        let fallbackUrl: string | null = null;
        let fallbackValid = false;
        
        if (!result.valid) {
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
          sourceType: detectSourceType(url)
        };
      })
    );

    const summary = {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      fixable: results.filter(r => !r.valid && r.fallbackValid).length
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary
      }),
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
