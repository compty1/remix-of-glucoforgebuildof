/**
 * File upload validation utilities (Gap 1153: magic byte validation)
 */

// Magic byte signatures for common file types
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }[]> = {
  'image/png': [{ bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0 }],
  'image/jpeg': [{ bytes: [0xFF, 0xD8, 0xFF], offset: 0 }],
  'image/gif': [{ bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 }],
  'image/webp': [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }],
  'application/pdf': [{ bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }],
  'text/csv': [], // CSV has no magic bytes, validated by extension
};

// Allowed MIME types for uploads
const ALLOWED_UPLOAD_TYPES = new Set([
  'text/csv',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/json',
]);

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate a file's magic bytes match its declared MIME type.
 */
export async function validateFileMagicBytes(file: File): Promise<boolean> {
  const signatures = MAGIC_BYTES[file.type];

  // If no signatures defined, allow if type is in allowed list
  if (!signatures || signatures.length === 0) {
    return ALLOWED_UPLOAD_TYPES.has(file.type);
  }

  const buffer = await file.slice(0, 16).arrayBuffer();
  const view = new Uint8Array(buffer);

  return signatures.some(sig =>
    sig.bytes.every((byte, i) => view[sig.offset + i] === byte)
  );
}

/**
 * Full file validation: type, size, and magic bytes.
 */
export async function validateFileUpload(
  file: File,
  options?: {
    maxSize?: number;
    allowedTypes?: Set<string>;
  }
): Promise<{ valid: boolean; error?: string }> {
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;
  const allowedTypes = options?.allowedTypes ?? ALLOWED_UPLOAD_TYPES;

  if (!allowedTypes.has(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed.` };
  }

  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File exceeds maximum size of ${maxMB}MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  const magicValid = await validateFileMagicBytes(file);
  if (!magicValid) {
    return { valid: false, error: 'File content does not match its declared type.' };
  }

  return { valid: true };
}

/**
 * Check upload quota (client-side helper — actual enforcement should be server-side).
 */
export function checkUploadQuota(currentCount: number, maxUploads = 100): boolean {
  return currentCount < maxUploads;
}
