import jsPDF from 'jspdf';

interface DetailedAnalysis {
  readingsCount?: number;
  avgGlucose?: number;
  medianGlucose?: number;
  stdDev?: number;
  cv?: number;
  gmi?: number;
  timeInRange?: number;
  timeInTightRange?: number;
  timeAbove180?: number;
  timeAbove250?: number;
  timeBelow70?: number;
  timeBelow54?: number;
  mage?: number;
  gvi?: number;
  daysOfData?: number;
  dataStart?: string;
  dataEnd?: string;
}

interface Pattern {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
}

export interface AnalysisPDFData {
  fileName: string;
  detailedAnalysis?: DetailedAnalysis;
  patterns?: Pattern[];
  recommendations?: string[];
  confidenceScore?: number;
}

/**
 * Shared PDF export utility used by both DataExport and AnalysisResultsModal.
 * Generates a clinical-style glucose analysis report.
 */
export async function generateAnalysisPDF(data: AnalysisPDFData): Promise<void> {
  const { fileName, detailedAnalysis, patterns, recommendations, confidenceScore } = data;
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // ── Disclaimer at top (prominent per Issue 205) ──────────────────────────
  pdf.setFontSize(8);
  pdf.setTextColor(180, 60, 60);
  const disclaimer =
    'IMPORTANT: This report is patient-generated data for informational purposes only. ' +
    'It is NOT a clinical report and should not replace professional medical advice. ' +
    'Always consult your healthcare team before making any treatment changes.';
  const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 30);
  pdf.text(disclaimerLines, 15, yPos);
  yPos += disclaimerLines.length * 4 + 6;

  // ── Title ─────────────────────────────────────────────────────────────────
  pdf.setFontSize(20);
  pdf.setTextColor(33, 33, 33);
  pdf.text('Glucose Analysis Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // ── File info ─────────────────────────────────────────────────────────────
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`File: ${fileName}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
  if (confidenceScore !== undefined) {
    yPos += 5;
    pdf.text(`Analysis Confidence: ${confidenceScore}%`, pageWidth / 2, yPos, { align: 'center' });
  }
  yPos += 15;

  // ── Key Metrics ───────────────────────────────────────────────────────────
  if (detailedAnalysis) {
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    pdf.text('Key Metrics', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(66, 66, 66);

    const gmiVal = detailedAnalysis.gmi;
    const gmiDisplay = !gmiVal || gmiVal === 0 ? 'N/A' : `${gmiVal.toFixed(1)}%`;

    const metrics = [
      `Readings Analyzed: ${detailedAnalysis.readingsCount?.toLocaleString() ?? 'N/A'}`,
      `Days of Data: ${detailedAnalysis.daysOfData ?? 'N/A'}`,
      `Average Glucose: ${detailedAnalysis.avgGlucose?.toFixed(0) ?? 'N/A'} mg/dL`,
      `Time in Range (70-180): ${detailedAnalysis.timeInRange?.toFixed(1) ?? 'N/A'}%`,
      `Time Below 70: ${detailedAnalysis.timeBelow70?.toFixed(1) ?? 'N/A'}%`,
      `Time Above 180: ${detailedAnalysis.timeAbove180?.toFixed(1) ?? 'N/A'}%`,
      `CV (Variability): ${detailedAnalysis.cv?.toFixed(1) ?? 'N/A'}%`,
      `GMI (Glucose Management Indicator): ${gmiDisplay}`,
      `MAGE: ${detailedAnalysis.mage?.toFixed(0) ?? 'N/A'} mg/dL`,
    ];

    metrics.forEach((metric) => {
      if (yPos > 270) { pdf.addPage(); yPos = 20; }
      pdf.text(`• ${metric}`, 25, yPos);
      yPos += 6;
    });
    yPos += 10;
  }

  // ── T1D Targets note ──────────────────────────────────────────────────────
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  const targetNote =
    'Reference targets for T1D (ADA Standards 2024): TIR ≥70%, Time Below 70 <4%, Time Below 54 <1%, CV <36%.';
  const targetLines = pdf.splitTextToSize(targetNote, pageWidth - 30);
  pdf.text(targetLines, 20, yPos);
  yPos += targetLines.length * 4 + 8;

  // ── Patterns ──────────────────────────────────────────────────────────────
  if (patterns && patterns.length > 0) {
    if (yPos > 240) { pdf.addPage(); yPos = 20; }
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    pdf.text('Detected Patterns', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    patterns.forEach((pattern) => {
      if (yPos > 270) { pdf.addPage(); yPos = 20; }
      const r = pattern.severity === 'critical' ? 180 : pattern.severity === 'warning' ? 200 : 66;
      const g = pattern.severity === 'critical' ? 0 : pattern.severity === 'warning' ? 150 : 66;
      pdf.setTextColor(r, g, 66);
      pdf.text(`• ${pattern.title}`, 25, yPos);
      yPos += 6;
      pdf.setTextColor(100, 100, 100);
      const descLines = pdf.splitTextToSize(pattern.description, pageWidth - 50);
      descLines.forEach((line: string) => {
        if (yPos > 270) { pdf.addPage(); yPos = 20; }
        pdf.text(line, 30, yPos);
        yPos += 5;
      });
      yPos += 3;
    });
    yPos += 10;
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  if (recommendations && recommendations.length > 0) {
    if (yPos > 240) { pdf.addPage(); yPos = 20; }
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    pdf.text('Recommendations', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(66, 66, 66);
    recommendations.forEach((rec) => {
      if (yPos > 270) { pdf.addPage(); yPos = 20; }
      const recLines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 50);
      recLines.forEach((line: string) => {
        pdf.text(line, 25, yPos);
        yPos += 5;
      });
      yPos += 2;
    });
  }

  pdf.save(`glucose-analysis-${fileName.replace(/\.[^/.]+$/, '')}.pdf`);
}
