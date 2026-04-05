import { describe, it, expect } from 'vitest';
import { formatGlucose, formatDate, formatNumber } from '../localeFormatting';

describe('localeFormatting', () => {
  it('formatGlucose returns a string for valid input', () => {
    const result = formatGlucose(120, 'mg/dL');
    expect(typeof result).toBe('string');
    expect(result).toContain('120');
  });

  it('formatGlucose handles mmol/L', () => {
    const result = formatGlucose(6.7, 'mmol/L');
    expect(typeof result).toBe('string');
    expect(result).toContain('6.7');
  });

  it('formatDate returns a string', () => {
    const result = formatDate(new Date());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formatNumber returns formatted string', () => {
    const result = formatNumber(1234567);
    expect(typeof result).toBe('string');
  });
});
