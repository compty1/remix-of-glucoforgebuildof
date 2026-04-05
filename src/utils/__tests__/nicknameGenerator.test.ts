import { describe, it, expect } from 'vitest';
import { generateNickname, generateMultipleNicknames } from '../nicknameGenerator';

describe('nicknameGenerator', () => {
  it('generates a non-empty string', () => {
    const name = generateNickname();
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  it('generates unique nicknames', () => {
    const names = generateMultipleNicknames(10);
    const unique = new Set(names);
    // Most should be unique (randomness allows rare collisions)
    expect(unique.size).toBeGreaterThanOrEqual(8);
  });

  it('generates requested count', () => {
    const names = generateMultipleNicknames(6);
    expect(names).toHaveLength(6);
  });
});
