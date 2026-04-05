import { describe, it, expect } from 'vitest';
import { screenContent } from '../contentSafety';

describe('screenContent', () => {
  it('passes safe content', () => {
    const result = screenContent('My blood sugar was 120 after lunch');
    expect(result.isSafe).toBe(true);
    expect(result.hasCrisisLanguage).toBe(false);
  });

  it('detects crisis language', () => {
    const result = screenContent('I want to end it all');
    expect(result.hasCrisisLanguage).toBe(true);
  });

  it('handles empty string', () => {
    const result = screenContent('');
    expect(result.isSafe).toBe(true);
  });

  it('is case insensitive for crisis detection', () => {
    const result = screenContent('I DONT WANT TO LIVE');
    expect(result.hasCrisisLanguage).toBe(true);
  });
});
