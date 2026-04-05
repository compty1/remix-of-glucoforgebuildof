import { describe, it, expect } from 'vitest';

describe('ShareButton', () => {
  it('module exists', async () => {
    const mod = await import('../../components/shared/ShareButton');
    expect(mod.ShareButton).toBeDefined();
    expect(typeof mod.ShareButton).toBe('function');
  });
});
