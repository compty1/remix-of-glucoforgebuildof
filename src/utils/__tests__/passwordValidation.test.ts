import { describe, it, expect } from 'vitest';
import { validatePasswordStrength } from '../passwordValidation';

describe('validatePasswordStrength', () => {
  it('rejects short passwords', () => {
    const result = validatePasswordStrength('abc');
    expect(result.isValid).toBe(false);
    expect(result.score).toBeLessThan(3);
  });

  it('accepts strong passwords', () => {
    const result = validatePasswordStrength('MyStr0ng!Pass#2026');
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  it('scores moderate passwords', () => {
    const result = validatePasswordStrength('Password1');
    expect(result.score).toBeGreaterThanOrEqual(1);
  });
});
