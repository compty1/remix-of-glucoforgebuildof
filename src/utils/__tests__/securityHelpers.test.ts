import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isPHIUrl,
  buildUserScopedFilter,
  checkClientRateLimit,
  resetRateLimit,
} from '../securityHelpers';

// isSafeURL and safeExternalLink require window.location.origin (browser-only)
// Tested via integration tests instead

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
