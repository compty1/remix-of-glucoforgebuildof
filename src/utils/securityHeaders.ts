/**
 * Gap 263-266: Security headers via meta tags
 * Called once at app startup to add security-related meta tags.
 */
export function applySecurityHeaders() {
  const addMeta = (httpEquiv: string, content: string) => {
    if (document.querySelector(`meta[http-equiv="${httpEquiv}"]`)) return;
    const meta = document.createElement('meta');
    meta.httpEquiv = httpEquiv;
    meta.content = content;
    document.head.appendChild(meta);
  };

  // CSP (gap 263) - permissive for SPA
  addMeta('Content-Security-Policy', 
    "default-src 'self' https://*.supabase.co; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co;"
  );

  // Referrer Policy (gap 264)
  addMeta('Referrer-Policy', 'strict-origin-when-cross-origin');

  // X-Content-Type-Options
  addMeta('X-Content-Type-Options', 'nosniff');
}
