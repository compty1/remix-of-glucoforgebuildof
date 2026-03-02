/**
 * Phase 17.2: Client-side content safety screening
 * Keyword + pattern detection for self-harm / crisis language.
 * Complements the server-side medicalCompliance.ts guardrails.
 */

const CRISIS_PATTERNS = [
  /\b(kill\s*(my)?self|suicid(e|al)|end\s*(my|it\s*all)|don['']?t\s*want\s*to\s*live|want\s*to\s*die)\b/i,
  /\b(self[- ]?harm|cut(ting)?\s*myself|overdose\s*on\s*insulin)\b/i,
  /\b(no\s*reason\s*to\s*live|better\s*off\s*dead|can['']?t\s*go\s*on)\b/i,
];

const HARMFUL_CONTENT_PATTERNS = [
  /\b(how\s*to\s*(make|build)\s*(a\s*)?bomb)\b/i,
  /\b(instructions?\s*for\s*poison)\b/i,
];

export interface SafetyScreenResult {
  isSafe: boolean;
  hasCrisisLanguage: boolean;
  hasHarmfulContent: boolean;
  matchedCategories: string[];
}

export function screenContent(text: string): SafetyScreenResult {
  const hasCrisisLanguage = CRISIS_PATTERNS.some((p) => p.test(text));
  const hasHarmfulContent = HARMFUL_CONTENT_PATTERNS.some((p) => p.test(text));

  const matchedCategories: string[] = [];
  if (hasCrisisLanguage) matchedCategories.push('crisis');
  if (hasHarmfulContent) matchedCategories.push('harmful');

  return {
    isSafe: !hasCrisisLanguage && !hasHarmfulContent,
    hasCrisisLanguage,
    hasHarmfulContent,
    matchedCategories,
  };
}

export const CRISIS_RESOURCES = {
  phone: '988',
  text: 'Text HOME to 741741',
  url: 'https://988lifeline.org',
  label: '988 Suicide & Crisis Lifeline',
} as const;
