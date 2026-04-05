import { describe, it, expect } from 'vitest';
import { validateFileUpload, checkUploadQuota } from '../fileValidation';

function createMockFile(name: string, type: string, size: number, content?: ArrayBuffer): File {
  const blob = content ? new Blob([content]) : new Blob([new ArrayBuffer(size)]);
  return new File([blob], name, { type });
}

describe('validateFileUpload', () => {
  it('rejects disallowed file types', async () => {
    const file = createMockFile('script.exe', 'application/x-executable', 100);
    const result = await validateFileUpload(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('rejects oversized files', async () => {
    const file = createMockFile('big.csv', 'text/csv', 20 * 1024 * 1024);
    const result = await validateFileUpload(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum size');
  });

  it('rejects empty files', async () => {
    const file = createMockFile('empty.csv', 'text/csv', 0);
    const result = await validateFileUpload(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('accepts valid CSV files', async () => {
    const content = new TextEncoder().encode('name,value\ntest,123');
    const file = createMockFile('data.csv', 'text/csv', content.length, content.buffer as ArrayBuffer);
    const result = await validateFileUpload(file);
    expect(result.valid).toBe(true);
  });
});

describe('checkUploadQuota', () => {
  it('allows uploads under quota', () => {
    expect(checkUploadQuota(50, 100)).toBe(true);
  });

  it('blocks uploads at quota', () => {
    expect(checkUploadQuota(100, 100)).toBe(false);
  });
});
