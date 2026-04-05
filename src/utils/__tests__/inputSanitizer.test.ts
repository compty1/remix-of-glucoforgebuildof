import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../inputSanitizer';

describe('sanitizeFilename', () => {
  it('returns safe filename for normal input', () => {
    expect(sanitizeFilename('data.csv')).toBe('data.csv');
  });

  it('removes path traversal', () => {
    const result = sanitizeFilename('../../etc/passwd');
    expect(result).not.toContain('..');
    expect(result).not.toContain('/');
  });

  it('handles empty string', () => {
    expect(sanitizeFilename('')).toBe('unnamed_file');
  });

  it('handles dangerous extensions', () => {
    const result = sanitizeFilename('virus.exe');
    expect(result).not.toMatch(/\.exe$/);
  });

  it('truncates long filenames', () => {
    const longName = 'a'.repeat(300) + '.csv';
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(255);
  });
});
