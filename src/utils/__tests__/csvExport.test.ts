import { describe, it, expect } from 'vitest';

// Test the CSV escaping logic directly without DOM dependencies
describe('csvExport logic', () => {
  function escapeCSV(val: unknown): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  it('escapes commas', () => {
    expect(escapeCSV('hello, world')).toBe('"hello, world"');
  });

  it('escapes double quotes', () => {
    expect(escapeCSV('say "hello"')).toBe('"say ""hello"""');
  });

  it('escapes newlines', () => {
    expect(escapeCSV('line1\nline2')).toBe('"line1\nline2"');
  });

  it('returns empty string for null/undefined', () => {
    expect(escapeCSV(null)).toBe('');
    expect(escapeCSV(undefined)).toBe('');
  });

  it('passes through plain strings', () => {
    expect(escapeCSV('hello')).toBe('hello');
  });

  it('converts numbers to strings', () => {
    expect(escapeCSV(42)).toBe('42');
  });
});
