import { describe, it, expect, vi } from 'vitest';

// Mock DOM APIs for Node environment
vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() });

describe('csvExport', () => {
  it('exports data without throwing', async () => {
    // Mock DOM elements
    const mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    const { exportToCSV } = await import('../csvExport');

    const data = [
      { name: 'Test, "quoted"', value: 123 },
      { name: 'Normal', value: 456 },
    ];
    
    exportToCSV(data, 'test');
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toBe('test.csv');
  });

  it('does nothing with empty data', async () => {
    const { exportToCSV } = await import('../csvExport');
    expect(() => exportToCSV([], 'empty')).not.toThrow();
  });

  it('uses custom column labels', async () => {
    const mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    const { exportToCSV } = await import('../csvExport');

    const data = [{ a: 1, b: 2 }];
    const columns = [
      { key: 'a', label: 'Column A' },
      { key: 'b', label: 'Column B' },
    ];
    exportToCSV(data, 'test', columns);
    expect(mockLink.click).toHaveBeenCalled();
  });
});
