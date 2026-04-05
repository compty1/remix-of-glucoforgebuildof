/**
 * Generic CSV export utility for any tabular data.
 * Gap 634, 646, 673: CSV export for pages.
 */

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (!data.length) return;

  const keys = columns?.map(c => c.key) || Object.keys(data[0]);
  const headers = columns?.map(c => c.label) || keys;

  const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [
    headers.join(','),
    ...data.map(row => keys.map(k => escapeCSV(row[k])).join(',')),
  ];

  const csvContent = rows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
