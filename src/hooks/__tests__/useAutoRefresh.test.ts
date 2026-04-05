import { describe, it, expect } from 'vitest';
import { useAutoRefresh } from '../useAutoRefresh';

describe('useAutoRefresh', () => {
  it('exports a function', () => {
    expect(typeof useAutoRefresh).toBe('function');
  });

  it('accepts options parameter', () => {
    // Verify the hook signature exists with expected shape
    expect(useAutoRefresh.length).toBeGreaterThanOrEqual(1);
  });
});
