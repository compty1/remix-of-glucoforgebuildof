/**
 * Phase 19.1: End-to-End Encryption Utilities
 * Web Crypto API (AES-GCM) for encrypting journals and DMs.
 * PBKDF2 key derivation from user passphrase.
 */

const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100_000;

/**
 * Derive a CryptoKey from a user passphrase using PBKDF2.
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = enc.encode(passphrase);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    rawKey.buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext. Returns base64-encoded string: salt + iv + ciphertext.
 */
export async function encrypt(plaintext: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    enc.encode(plaintext)
  );

  const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(ciphertext).length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt base64-encoded ciphertext produced by encrypt().
 */
export async function decrypt(encoded: string, passphrase: string): Promise<string> {
  const dec = new TextDecoder();
  const data = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));

  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(passphrase, salt);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: ALGO, iv },
    key,
    ciphertext
  );

  return dec.decode(plainBuffer);
}

/**
 * Check if Web Crypto API is available.
 */
export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
