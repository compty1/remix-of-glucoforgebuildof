import { describe, it, expect, beforeEach } from 'vitest';
import {
  isSafeURL,
  safeExternalLink,
  isPHIUrl,
  buildUserScopedFilter,
  checkClientRateLimit,
  resetRateLimit,
} from '../securityHelpers';

describe('isSafeURL', () => {
  it('allows http and https URLs', () => {
    expect(isSafeURL('https://example.com')).toBe(true);
    expect(isSafeURL('http://example.com/path')).toBe(true);
  });

  it('blocks javascript: protocol', () => {
    expect(isSafeURL('javascript:alert(1)')).toBe(false);
  });

  it('blocks data: protocol', () => {
    expect(isSafeURL('data:text/html,<h1>x</h1>')).toBe(false);
  });

  it('blocks blob: protocol', () => {
    expect(isSafeURL('blob:http://evil.com/abc')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isSafeURL('')).toBe(false);
  });
});

describe('safeExternalLink', () => {
  it('returns link attributes for safe URLs', () => {
    const result = safeExternalLink('https://example.com');
    expect(result).toEqual({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('returns null for unsafe URLs', () => {
    expect(safeExternalLink('javascript:void(0)')).toBeNull();
  });
});

describe('isPHIUrl', () => {
  it('detects PHI URLs', () => {
    expect(isPHIUrl('https://api.example.com/rest/v1/uploads')).toBe(true);
    expect(isPHIUrl('https://api.example.com/rest/v1/shifts')).toBe(true);
  });

  it('returns false for non-PHI URLs', () => {
    expect(isPHIUrl('https://example.com/public/page')).toBe(false);
  });
});

describe('buildUserScopedFilter', () => {
  it('builds valid filter string', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(buildUserScopedFilter(uuid)).toBe(`user_id=eq.${uuid}`);
  });

  it('accepts custom column name', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(buildUserScopedFilter(uuid, 'owner_id')).toBe(`owner_id=eq.${uuid}`);
  });

  it('throws on invalid UUID', () => {
    expect(() => buildUserScopedFilter('not-a-uuid')).toThrow('Invalid user ID format');
  });

  it('throws on empty string', () => {
    expect(() => buildUserScopedFilter('')).toThrow('User ID is required');
  });
});

describe('checkClientRateLimit', () => {
  beforeEach(() => {
    resetRateLimit('test-action');
  });

  it('allows actions within limit', () => {
    expect(checkClientRateLimit('test-action', 3)).toBe(true);
    expect(checkClientRateLimit('test-action', 3)).toBe(true);
    expect(checkClientRateLimit('test-action', 3)).toBe(true);
  });

  it('blocks after exceeding limit', () => {
    for (let i = 0; i < 5; i++) checkClientRateLimit('test-action', 5);
    expect(checkClientRateLimit('test-action', 5)).toBe(false);
  });

  it('resets correctly', () => {
    for (let i = 0; i < 5; i++) checkClientRateLimit('test-action', 5);
    resetRateLimit('test-action');
    expect(checkClientRateLimit('test-action', 5)).toBe(true);
  });
});
