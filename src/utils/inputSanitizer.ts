/**
 * Phase 2: Security Hardening - Input Sanitization Utilities
 * Covers: 2.9 (Filename), 2.11 (HTML/DOMPurify), 2.15 (Key Logging), 2.18 (PII Hashing)
 */
import DOMPurify from 'dompurify';

// ============= 2.9: FILENAME SANITIZATION =============

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.msi', '.dll', '.scr'];
const MAX_FILENAME_LENGTH = 255;

/**
 * Sanitize a filename to prevent path traversal, injection, and dangerous uploads.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';

  // Remove path traversal
  let safe = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '_');

  // Remove null bytes and control characters
  safe = safe.replace(/[\x00-\x1F\x7F]/g, '');

  // Replace spaces and special characters
  safe = safe.replace(/[^a-zA-Z0-9._\-]/g, '_');

  // Remove leading dots (hidden files)
  safe = safe.replace(/^\.+/, '');

  // Truncate
  if (safe.length > MAX_FILENAME_LENGTH) {
    const ext = safe.substring(safe.lastIndexOf('.'));
    safe = safe.substring(0, MAX_FILENAME_LENGTH - ext.length) + ext;
  }

  // Block dangerous extensions
  const lowerSafe = safe.toLowerCase();
  if (DANGEROUS_EXTENSIONS.some(ext => lowerSafe.endsWith(ext))) {
    safe = safe + '.blocked';
  }

  return safe || 'unnamed_file';
}

/**
 * Validate allowed file types for CGM uploads.
 */
export function isAllowedUploadType(filename: string): boolean {
  const allowed = ['.csv', '.json', '.txt', '.xlsx', '.xls', '.xml', '.pdf', '.png', '.jpg', '.jpeg', '.webp'];
  const lower = filename.toLowerCase();
  return allowed.some(ext => lower.endsWith(ext));
}

// ============= 2.11: HTML SANITIZATION (DOMPurify) =============

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this instead of dangerouslySetInnerHTML with raw content.
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'figure', 'figcaption', 'sup', 'sub',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'id', 'src', 'alt', 'width', 'height',
      'title', 'aria-label', 'role',
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    // Force all links to open in new tab safely
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
  });
}

/**
 * Sanitize and return safe HTML for React's dangerouslySetInnerHTML.
 */
export function createSafeHTML(html: string): { __html: string } {
  return { __html: sanitizeHTML(html) };
}

// ============= 2.15: SUPABASE KEY LOGGING PREVENTION =============

const SENSITIVE_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{20,}/g,  // JWT tokens
  /sk_[a-zA-Z0-9]{20,}/g,     // Stripe secret keys
  /key_[a-zA-Z0-9]{20,}/g,    // Generic API keys
  /sbp_[a-zA-Z0-9]{20,}/g,    // Supabase keys
  /password['":\s]*['"][^'"]+['"]/gi,
  /secret['":\s]*['"][^'"]+['"]/gi,
];

/**
 * Redact sensitive values from a string before logging.
 */
export function redactSensitive(text: string): string {
  let redacted = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

/**
 * Safe console logger that redacts sensitive data.
 * Use in place of console.log when logging user data or request details.
 */
export const safeLog = {
  info: (message: string, ...args: unknown[]) => {
    console.info(redactSensitive(message), ...args.map(a => 
      typeof a === 'string' ? redactSensitive(a) : a
    ));
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(redactSensitive(message), ...args.map(a => 
      typeof a === 'string' ? redactSensitive(a) : a
    ));
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(redactSensitive(message), ...args.map(a => 
      typeof a === 'string' ? redactSensitive(a) : a
    ));
  },
};

// ============= 2.18: ANALYTICS PII HASHING =============

/**
 * Hash PII (email, name, etc.) for analytics using SHA-256.
 * Returns a hex string that can be used as an anonymous identifier.
 */
export async function hashPII(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous PII hashing fallback using simple hash.
 * Use when async is not available.
 */
export function hashPIISync(value: string): string {
  const str = value.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// ============= 2.10: CONTENT QUARANTINE KEYWORDS =============

const QUARANTINE_KEYWORDS = [
  // Self-harm indicators
  'kill myself', 'want to die', 'suicide', 'self-harm', 'end my life',
  'no reason to live', 'better off dead',
  // Dangerous medical advice
  'stop taking insulin', 'dont need insulin', "don't need insulin",
  'insulin is poison', 'cure diabetes naturally',
  // Spam/scam
  'buy now', 'limited time offer', 'click here to win',
  'nigerian prince', 'wire transfer',
];

/**
 * Check if content contains quarantine-worthy keywords.
 * Returns matching keywords for flagging.
 */
export function checkQuarantineContent(content: string): {
  shouldQuarantine: boolean;
  matchedKeywords: string[];
  isCrisis: boolean;
} {
  const lower = content.toLowerCase();
  const matched = QUARANTINE_KEYWORDS.filter(kw => lower.includes(kw));
  
  const crisisKeywords = ['kill myself', 'want to die', 'suicide', 'self-harm', 'end my life', 'better off dead', 'no reason to live'];
  const isCrisis = crisisKeywords.some(kw => lower.includes(kw));

  return {
    shouldQuarantine: matched.length > 0,
    matchedKeywords: matched,
    isCrisis,
  };
}

// ============= GENERIC INPUT VALIDATION =============

/**
 * Validate and sanitize user text input (max length, trim, strip control chars).
 */
export function sanitizeTextInput(input: string, maxLength = 1000): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars (keep \n, \r, \t)
    .substring(0, maxLength);
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}
