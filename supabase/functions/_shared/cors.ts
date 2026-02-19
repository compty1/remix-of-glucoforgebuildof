/**
 * Shared CORS headers for all edge functions (Item 2081, 1825)
 * Import this in every edge function instead of copy-pasting.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Standard OPTIONS preflight response
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Standardized JSON error response (Item 2084)
 */
export function errorResponse(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}

/**
 * Standardized JSON success response
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}

/**
 * Validate request body size (Item 2085)
 * Returns an error response if the body exceeds maxBytes, or null if OK.
 */
export async function validateBodySize(req: Request, maxBytes = 1_048_576): Promise<Response | null> {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxBytes) {
    return errorResponse(`Request body too large. Maximum ${Math.round(maxBytes / 1024)}KB.`, 413);
  }
  return null;
}
