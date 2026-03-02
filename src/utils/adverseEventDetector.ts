/**
 * Wave 7.4: Adverse Event Detection
 * Flags community posts containing keywords indicating serious medical events.
 * Surfaces FDA MedWatch reporting link for safety.
 */

const ADVERSE_EVENT_PATTERNS = [
  /\b(ICU|intensive\s+care)\b/i,
  /\bseizure[s]?\b/i,
  /\bcoma\b/i,
  /\bhospitali[sz](?:ed|ation)\b/i,
  /\bemergency\s+room\b/i,
  /\b(?:DKA|diabetic\s+ketoacidosis)\b/i,
  /\bsevere\s+hypo(?:glycemia)?\b/i,
  /\bunconscious(?:ness)?\b/i,
  /\bglucagon\s+(?:injection|administered|used)\b/i,
  /\b911\b/,
  /\bambulance\b/i,
  /\blife[- ]threatening\b/i,
];

export interface AdverseEventFlag {
  matched: boolean;
  keywords: string[];
  severity: 'moderate' | 'severe';
  medwatchUrl: string;
}

const FDA_MEDWATCH_URL = 'https://www.accessdata.fda.gov/scripts/medwatch/index.cfm?action=reporting.home';

/**
 * Check text content for adverse event indicators.
 */
export function detectAdverseEvents(content: string): AdverseEventFlag {
  const keywords: string[] = [];

  for (const pattern of ADVERSE_EVENT_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      keywords.push(match[0]);
    }
  }

  if (keywords.length === 0) {
    return { matched: false, keywords: [], severity: 'moderate', medwatchUrl: FDA_MEDWATCH_URL };
  }

  // Severe if ICU, coma, seizure, or DKA
  const severeKeywords = ['ICU', 'coma', 'seizure', 'DKA', 'unconscious', '911'];
  const isSevere = keywords.some(k =>
    severeKeywords.some(sk => k.toLowerCase().includes(sk.toLowerCase())),
  );

  return {
    matched: true,
    keywords,
    severity: isSevere ? 'severe' : 'moderate',
    medwatchUrl: FDA_MEDWATCH_URL,
  };
}
