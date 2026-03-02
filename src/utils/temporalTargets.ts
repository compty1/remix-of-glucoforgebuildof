/**
 * Wave 1.5: Temporal Target Binding
 * Prevents retroactive misinterpretation when users switch target modes
 * (e.g., switching to Pregnancy Mode shouldn't paint historical data as failure).
 */

import { CLINICAL_MODES, type ClinicalThresholds } from './insulinModels';

export interface TargetPeriod {
  mode: string;
  effectiveDate: string; // YYYY-MM-DD
  endDate?: string;      // YYYY-MM-DD, undefined = still active
}

/**
 * Get the active clinical target for a specific date.
 * Looks through temporal periods to find which mode was active on that date.
 */
export function getTargetForDate(
  periods: TargetPeriod[],
  date: string, // YYYY-MM-DD
): ClinicalThresholds {
  if (periods.length === 0) {
    return CLINICAL_MODES.standard;
  }

  // Sort by effective date descending to find the most recent applicable period
  const sorted = [...periods].sort(
    (a, b) => b.effectiveDate.localeCompare(a.effectiveDate),
  );

  for (const period of sorted) {
    if (date >= period.effectiveDate) {
      if (!period.endDate || date <= period.endDate) {
        return CLINICAL_MODES[period.mode] || CLINICAL_MODES.standard;
      }
    }
  }

  return CLINICAL_MODES.standard;
}

/**
 * Check if a diagnosis date indicates honeymoon phase (within 12 months).
 */
export function isHoneymoonPhase(diagnosisDate: string | undefined): boolean {
  if (!diagnosisDate) return false;

  const diagnosis = new Date(diagnosisDate);
  const now = new Date();
  const monthsSinceDiagnosis =
    (now.getFullYear() - diagnosis.getFullYear()) * 12 +
    (now.getMonth() - diagnosis.getMonth());

  return monthsSinceDiagnosis >= 0 && monthsSinceDiagnosis <= 12;
}

/**
 * Generate AI prompt context about the user's target mode and honeymoon status.
 */
export function formatTargetContextForPrompt(
  currentMode: string,
  diagnosisDate?: string,
): string {
  const parts: string[] = [];

  const thresholds = CLINICAL_MODES[currentMode] || CLINICAL_MODES.standard;
  parts.push(`CLINICAL TARGET MODE: ${thresholds.label}`);
  parts.push(`- Target Range: ${thresholds.tirLow}–${thresholds.tirHigh} mg/dL`);
  parts.push(`- TIR Goal: ≥${thresholds.tirTarget}%`);
  parts.push(`- CV Goal: <${thresholds.cvTarget}%`);

  if (isHoneymoonPhase(diagnosisDate)) {
    parts.push('');
    parts.push('⚠️ HONEYMOON PHASE DETECTED:');
    parts.push('- Patient was diagnosed within the last 12 months.');
    parts.push('- Expect erratic glucose patterns with spontaneous self-correction.');
    parts.push('- Do NOT attribute variability to poor management.');
    parts.push('- Emphasize that this is a normal phase of T1D progression.');
    parts.push('- Avoid aggressive insulin adjustment recommendations.');
  }

  return parts.join('\n');
}
