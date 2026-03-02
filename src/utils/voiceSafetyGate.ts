/**
 * Wave 3.4: Voice Input Safety Gate
 * Detects numeric insulin/medication values in speech transcripts
 * and requires explicit confirmation before submission.
 */

// Patterns that match dangerous numeric values in medical context
const INSULIN_PATTERNS = [
  /(\d+)\s*(?:units?|u)\b/i,
  /(\d+)\s*(?:of\s+)?(?:insulin|humalog|novolog|fiasp|lantus|levemir|tresiba|basaglar)/i,
  /(?:inject|take|bolus|dose|give)\s+(\d+)/i,
];

const CARB_PATTERNS = [
  /(\d+)\s*(?:grams?|g)\s*(?:of\s+)?(?:carb|carbs|carbohydrate)/i,
  /(\d+)\s*carb/i,
];

export interface VoiceSafetyResult {
  requiresConfirmation: boolean;
  detectedValues: DetectedValue[];
  originalTranscript: string;
}

export interface DetectedValue {
  type: 'insulin' | 'carbs';
  value: number;
  rawMatch: string;
}

/**
 * Analyze a voice transcript for numeric medical values that need confirmation.
 */
export function analyzeVoiceTranscript(transcript: string): VoiceSafetyResult {
  const detectedValues: DetectedValue[] = [];

  for (const pattern of INSULIN_PATTERNS) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const value = parseInt(match[1], 10);
      if (value > 0 && value < 1000) {
        detectedValues.push({
          type: 'insulin',
          value,
          rawMatch: match[0],
        });
      }
    }
  }

  for (const pattern of CARB_PATTERNS) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const value = parseInt(match[1], 10);
      if (value > 0 && value < 10000) {
        detectedValues.push({
          type: 'carbs',
          value,
          rawMatch: match[0],
        });
      }
    }
  }

  return {
    requiresConfirmation: detectedValues.length > 0,
    detectedValues,
    originalTranscript: transcript,
  };
}

/**
 * Check if an insulin value seems dangerously high (potential mishearing).
 * Values over 30u for a single bolus are flagged as suspicious.
 */
export function isDangerousInsulinValue(units: number): boolean {
  return units > 30;
}
