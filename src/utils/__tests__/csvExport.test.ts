import { describe, it, expect } from 'vitest';
import { exportToCSV } from '../csvExport';

describe('exportToCSV', () => {
  it('does nothing with empty data', () => {
    // Should not throw
    exportToCSV([], 'empty');
  });

  it('handles data with special characters', () => {
    const data = [
      { name: 'Test, "quoted"', value: 123 },
      { name: 'Normal', value: 456 },
    ];
    // Should not throw
    expect(() => exportToCSV(data, 'test')).not.toThrow();
  });

  it('uses custom column labels when provided', () => {
    const data = [{ a: 1, b: 2 }];
    const columns = [
      { key: 'a', label: 'Column A' },
      { key: 'b', label: 'Column B' },
    ];
    expect(() => exportToCSV(data, 'test', columns)).not.toThrow();
  });
});
