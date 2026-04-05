import { describe, it, expect } from 'vitest';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('exports a function', () => {
    expect(typeof useKeyboardShortcuts).toBe('function');
  });
});
