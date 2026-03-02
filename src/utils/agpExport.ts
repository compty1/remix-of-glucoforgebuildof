/**
 * Phase 16.2: Industry-standard AGP (Ambulatory Glucose Profile) PDF Export
 * Generates a 1-page AGP report suitable for clinic visits / EMR import.
 */
import jsPDF from 'jspdf';

export interface AGPData {
  /** Patient display name (optional) */
  patientName?: string;
  /** Date range */
  startDate: string;
  endDate: string;
  daysOfData: number;
  /** Percentage of possible readings captured */
  dataCompleteness: number;
  /** Key metrics */
  avgGlucose: number;
  gmi: number;
  cv: number;
  /** TIR breakdown */
  timeVeryHigh: number;  // >250
  timeHigh: number;      // 181-250
  timeInRange: number;   // 70-180
  timeLow: number;       // 54-69
  timeVeryLow: number;   // <54
  /** Hourly percentile data (24 entries) */
  hourlyPercentiles: Array<{
    hour: number;
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  }>;
}

export async function generateAGPReport(data: AGPData): Promise<void> {
  const pdf = new jsPDF({ orientation: 'landscape' });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pw, ph, 'F');

  // Header
  pdf.setFontSize(16);
  pdf.setTextColor(33, 33, 33);
  pdf.text('Ambulatory Glucose Profile (AGP) Report', 15, 15);
  
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  if (data.patientName) pdf.text(`Patient: ${data.patientName}`, 15, 22);
  pdf.text(`Date Range: ${data.startDate} – ${data.endDate} (${data.daysOfData} days)`, 15, 28);
  pdf.text(`Data Completeness: ${data.dataCompleteness.toFixed(0)}%`, 15, 34);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pw - 80, 15);

  // Disclaimer
  pdf.setFontSize(7);
  pdf.setTextColor(180, 60, 60);
  pdf.text('Patient-generated data. Not a substitute for clinical assessment.', pw - 120, 22);

  // ── Glucose Statistics Box ──
  let y = 42;
  pdf.setFontSize(11);
  pdf.setTextColor(33, 33, 33);
  pdf.text('Glucose Statistics', 15, y);
  y += 8;

  pdf.setFontSize(9);
  pdf.setTextColor(66, 66, 66);
  const stats = [
    `Average Glucose: ${data.avgGlucose.toFixed(0)} mg/dL`,
    `GMI: ${data.gmi.toFixed(1)}%`,
    `CV: ${data.cv.toFixed(1)}%  ${data.cv <= 36 ? '✓' : '⚠'}`,
  ];
  stats.forEach(s => { pdf.text(s, 20, y); y += 6; });

  // ── TIR Bar ──
  y += 4;
  pdf.setFontSize(11);
  pdf.setTextColor(33, 33, 33);
  pdf.text('Time in Ranges', 15, y);
  y += 8;

  const barX = 20;
  const barW = 100;
  const barH = 10;
  const ranges = [
    { pct: data.timeVeryHigh, color: [255, 100, 50] as [number, number, number], label: `Very High (>250): ${data.timeVeryHigh.toFixed(1)}%` },
    { pct: data.timeHigh, color: [255, 180, 50] as [number, number, number], label: `High (181-250): ${data.timeHigh.toFixed(1)}%` },
    { pct: data.timeInRange, color: [80, 180, 80] as [number, number, number], label: `In Range (70-180): ${data.timeInRange.toFixed(1)}%` },
    { pct: data.timeLow, color: [255, 80, 80] as [number, number, number], label: `Low (54-69): ${data.timeLow.toFixed(1)}%` },
    { pct: data.timeVeryLow, color: [180, 0, 0] as [number, number, number], label: `Very Low (<54): ${data.timeVeryLow.toFixed(1)}%` },
  ];

  let xOffset = barX;
  ranges.forEach(r => {
    const w = (r.pct / 100) * barW;
    pdf.setFillColor(r.color[0], r.color[1], r.color[2]);
    pdf.rect(xOffset, y, w, barH, 'F');
    xOffset += w;
  });
  y += barH + 4;

  pdf.setFontSize(7);
  pdf.setTextColor(66, 66, 66);
  ranges.forEach(r => {
    pdf.text(r.label, 20, y);
    y += 4;
  });

  // ── ADA Targets reference ──
  y += 4;
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('ADA Targets: TIR ≥70%, Time Below 70 <4%, Time Below 54 <1%, CV <36%', 20, y);

  // ── AGP Percentile Chart (text summary since jsPDF lacks native charting) ──
  y = 42;
  const chartX = 140;
  pdf.setFontSize(11);
  pdf.setTextColor(33, 33, 33);
  pdf.text('AGP Profile (Hourly Percentiles)', chartX, y);
  y += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(66, 66, 66);
  pdf.text('Hour  |  5th  |  25th |  50th |  75th |  95th', chartX, y);
  y += 5;

  data.hourlyPercentiles.forEach(h => {
    if (y > ph - 20) return;
    const row = `${String(h.hour).padStart(4)} h |  ${String(h.p5).padStart(3)}  |  ${String(h.p25).padStart(3)}  |  ${String(h.p50).padStart(3)}  |  ${String(h.p75).padStart(3)}  |  ${String(h.p95).padStart(3)}`;
    pdf.text(row, chartX, y);
    y += 4;
  });

  // Footer
  pdf.setFontSize(7);
  pdf.setTextColor(140, 140, 140);
  pdf.text('Report format follows International Consensus on AGP (Diabetes Care, 2017). For clinical use, verify data with original CGM platform.', 15, ph - 10);

  pdf.save(`agp-report-${data.startDate}-to-${data.endDate}.pdf`);
}
