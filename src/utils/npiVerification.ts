/**
 * Phase 17.3: NPI Verification via NPPES API
 * Client-side helper for verifying medical professional NPI numbers.
 * The actual verification should happen server-side; this provides types and helpers.
 */

export interface NPIResult {
  npiNumber: string;
  isValid: boolean;
  providerName?: string;
  credential?: string;
  specialty?: string;
  state?: string;
  verifiedAt: string;
}

/**
 * Basic NPI Luhn check (NPI uses a Luhn algorithm variant with prefix 80840).
 */
export function isValidNPIFormat(npi: string): boolean {
  if (!/^\d{10}$/.test(npi)) return false;

  const prefixed = '80840' + npi;
  let sum = 0;
  let alternate = false;

  for (let i = prefixed.length - 1; i >= 0; i--) {
    let n = parseInt(prefixed[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

/**
 * NPPES API search URL (for server-side use).
 */
export const NPPES_API_URL = 'https://npiregistry.cms.hhs.gov/api/?version=2.1';
