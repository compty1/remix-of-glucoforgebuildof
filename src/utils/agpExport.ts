/**
 * Phase 16.2 + Wave 1.7: Industry-standard AGP (Ambulatory Glucose Profile) PDF Export
 * ATTD 2019 Consensus compliant.
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
  /** TIR breakdown — ATTD 2019 standard 5-tier ranges */
  timeVeryHigh: number;  // >250
  timeHigh: number;      // 181-250
  timeInRange: number;   // 70-180
  timeLow: number;       // 54-69
  timeVeryLow: number;   // <54
  /** Hourly percentile data (24 entries) — ATTD requires 5/25/50/75/95 */
  hourlyPercentiles: Array<{
    hour: number;
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  }>;
  /** Wave 1.7: ATTD compliance flag */
  attdCompliant?: boolean;
}

/**
 * Draw the AGP percentile profile chart using jsPDF shapes.
 * ATTD 2019 requires 5/25/50/75/95th percentile bands.
 */
function drawAGPChart(
  pdf: jsPDF,
  data: AGPData,
  chartX: number,
  chartY: number,
  chartW: number,
  chartH: number,
): void {
  const minGlucose = 40;
  const maxGlucose = 350;
  const glucoseRange = maxGlucose - minGlucose;

  const toX = (hour: number) => chartX + (hour / 24) * chartW;
  const toY = (glucose: number) =>
    chartY + chartH - ((glucose - minGlucose) / glucoseRange) * chartH;

  // Background
  pdf.setFillColor(250, 250, 250);
  pdf.rect(chartX, chartY, chartW, chartH, 'F');

  // Target range shading (70-180 mg/dL)
  const targetTop = toY(180);
  const targetBottom = toY(70);
  pdf.setFillColor(220, 245, 220);
  pdf.rect(chartX, targetTop, chartW, targetBottom - targetTop, 'F');

  // Grid lines and labels
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.2);
  const gridValues = [54, 70, 100, 140, 180, 250, 300];
  pdf.setFontSize(6);
  pdf.setTextColor(140, 140, 140);
  for (const val of gridValues) {
    const gy = toY(val);
    if (gy >= chartY && gy <= chartY + chartH) {
      pdf.line(chartX, gy, chartX + chartW, gy);
      pdf.text(`${val}`, chartX - 14, gy + 1.5);
    }
  }

  // Hour labels
  for (let h = 0; h <= 24; h += 3) {
    const hx = toX(h);
    pdf.line(hx, chartY + chartH, hx, chartY + chartH + 2);
    pdf.text(`${h}:00`, hx - 4, chartY + chartH + 6);
  }

  if (data.hourlyPercentiles.length < 2) return;

  // 5th-95th percentile band (lightest)
  pdf.setFillColor(200, 220, 255);
  drawPercentileBand(pdf, data.hourlyPercentiles, 'p5', 'p95', toX, toY);

  // 25th-75th percentile band (medium)
  pdf.setFillColor(140, 180, 240);
  drawPercentileBand(pdf, data.hourlyPercentiles, 'p25', 'p75', toX, toY);

  // 50th percentile (median) line
  pdf.setDrawColor(30, 80, 180);
  pdf.setLineWidth(0.8);
  for (let i = 0; i < data.hourlyPercentiles.length - 1; i++) {
    const curr = data.hourlyPercentiles[i];
    const next = data.hourlyPercentiles[i + 1];
    pdf.line(toX(curr.hour), toY(curr.p50), toX(next.hour), toY(next.p50));
  }

  // Target range boundary lines
  pdf.setDrawColor(0, 150, 0);
  pdf.setLineWidth(0.3);
  pdf.line(chartX, toY(70), chartX + chartW, toY(70));
  pdf.line(chartX, toY(180), chartX + chartW, toY(180));

  // Low threshold lines
  pdf.setDrawColor(200, 0, 0);
  pdf.setLineWidth(0.2);
  const dashLength = 2;
  for (let dx = chartX; dx < chartX + chartW; dx += dashLength * 2) {
    pdf.line(dx, toY(54), Math.min(dx + dashLength, chartX + chartW), toY(54));
  }
}

function drawPercentileBand(
  pdf: jsPDF,
  hourly: AGPData['hourlyPercentiles'],
  lowKey: 'p5' | 'p25',
  highKey: 'p75' | 'p95',
  toX: (h: number) => number,
  toY: (g: number) => number,
): void {
  // Build polygon path: upper boundary left-to-right, then lower boundary right-to-left
  const points: Array<{ x: number; y: number }> = [];

  for (const h of hourly) {
    points.push({ x: toX(h.hour), y: toY(h[highKey]) });
  }
  for (let i = hourly.length - 1; i >= 0; i--) {
    points.push({ x: toX(hourly[i].hour), y: toY(hourly[i][lowKey]) });
  }

  // jsPDF doesn't have native polygon fill, so draw filled triangles
  if (points.length < 3) return;
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[0];
    const p1 = points[i];
    const p2 = points[i + 1];
    pdf.triangle(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, 'F');
  }
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

  // ATTD 2019 compliance notice
  if (data.attdCompliant !== false) {
    pdf.setFontSize(6);
    pdf.setTextColor(80, 130, 80);
    pdf.text('Follows International Consensus on Time in Range (ATTD 2019)', pw - 120, 28);
  }

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

  // ── TIR Bar (ATTD 2019 standard 5-tier ranges) ──
  y += 4;
  pdf.setFontSize(11);
  pdf.setTextColor(33, 33, 33);
  pdf.text('Time in Ranges', 15, y);
  y += 8;

  const barX = 20;
  const barW = 100;
  const barH = 10;
  const ranges = [
    { pct: data.timeVeryHigh, color: [255, 100, 50] as [number, number, number], label: `Very High (>250): ${data.timeVeryHigh.toFixed(1)}%`, target: '<5%' },
    { pct: data.timeHigh, color: [255, 180, 50] as [number, number, number], label: `High (181-250): ${data.timeHigh.toFixed(1)}%`, target: '<25%' },
    { pct: data.timeInRange, color: [80, 180, 80] as [number, number, number], label: `In Range (70-180): ${data.timeInRange.toFixed(1)}%`, target: '≥70%' },
    { pct: data.timeLow, color: [255, 80, 80] as [number, number, number], label: `Low (54-69): ${data.timeLow.toFixed(1)}%`, target: '<4%' },
    { pct: data.timeVeryLow, color: [180, 0, 0] as [number, number, number], label: `Very Low (<54): ${data.timeVeryLow.toFixed(1)}%`, target: '<1%' },
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
    pdf.text(`${r.label}  (Target: ${r.target})`, 20, y);
    y += 4;
  });

  // ── ADA/ATTD Targets reference ──
  y += 4;
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('ATTD 2019 Targets: TIR ≥70%, Time Below 70 <4%, Time Below 54 <1%, Time Above 250 <5%, CV <36%', 20, y);

  // ── AGP Percentile Chart ──
  const chartX = 140;
  const chartY = 42;
  const chartW = pw - chartX - 15;
  const chartH = ph - chartY - 30;

  pdf.setFontSize(11);
  pdf.setTextColor(33, 33, 33);
  pdf.text('AGP Profile (Hourly Percentiles)', chartX, chartY - 5);

  drawAGPChart(pdf, data, chartX, chartY, chartW, chartH);

  // Chart legend
  const legendY = chartY + chartH + 12;
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.setFillColor(200, 220, 255);
  pdf.rect(chartX, legendY, 6, 3, 'F');
  pdf.text('5th-95th percentile', chartX + 8, legendY + 2.5);
  pdf.setFillColor(140, 180, 240);
  pdf.rect(chartX + 45, legendY, 6, 3, 'F');
  pdf.text('25th-75th percentile', chartX + 53, legendY + 2.5);
  pdf.setDrawColor(30, 80, 180);
  pdf.setLineWidth(0.8);
  pdf.line(chartX + 90, legendY + 1.5, chartX + 96, legendY + 1.5);
  pdf.text('Median (50th)', chartX + 98, legendY + 2.5);

  // Footer
  pdf.setFontSize(7);
  pdf.setTextColor(140, 140, 140);
  pdf.text(
    'Report format follows International Consensus on Time in Range (Battelino et al., Diabetes Care, 2019). For clinical use, verify data with original CGM platform.',
    15,
    ph - 10,
  );
  pdf.text(
    'Not an FDA-cleared medical device report. AGP interpretation requires clinical context.',
    15,
    ph - 6,
  );

  pdf.save(`agp-report-${data.startDate}-to-${data.endDate}.pdf`);
}
