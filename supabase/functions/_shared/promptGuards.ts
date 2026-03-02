/**
 * Phase 8 & 12: AI Prompt Engineering Utilities
 * - Prompt injection firewall (12.1)
 * - PII scrubbing (12.2)
 * - Hallucination disclaimers (12.3)
 * - Token limit enforcement (12.10)
 * - Temperature guidelines (8.2)
 */

/** Phase 12.1: Detect prompt injection attempts */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  /forget\s+(everything|all|your)\s+(you|instructions?|rules?)/i,
  /override\s+(your|the|all)\s+(instructions?|rules?|prompts?)/i,
  /new\s+instructions?\s*:/i,
  /act\s+as\s+(if\s+)?you\s+(are|were)\s+/i,
  /pretend\s+(you\s+are|to\s+be)\s+/i,
  /jailbreak/i,
  /DAN\s+mode/i,
];

export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/** Phase 12.2: Scrub PII from user messages before logging */
const PII_PATTERNS: Array<[RegExp, string]> = [
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]'],
  [/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]'],
  [/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, '[SSN]'],
  [/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]'],
  [/\b(?:Dr\.?\s+)?[A-Z][a-z]+\s+[A-Z][a-z]+,?\s*(?:MD|DO|NP|PA|RN)\b/g, '[PROVIDER]'],
];

export function scrubPII(text: string): string {
  let scrubbed = text;
  for (const [pattern, replacement] of PII_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, replacement);
  }
  return scrubbed;
}

/** Phase 12.3: Standard disclaimer appended to AI responses */
export const AI_DISCLAIMER = 
  "\n\n---\n*This information is AI-generated based on community data and research. " +
  "It is not medical advice. Always consult your healthcare provider before making changes to your treatment.*";

/** Phase 12.10: Estimate token count (~4 chars per token) and truncate */
export function enforceTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = Math.ceil(text.length / 4);
  if (estimatedTokens <= maxTokens) return text;
  // Truncate to approximate token limit
  const maxChars = maxTokens * 4;
  return text.slice(0, maxChars) + '... [truncated for safety]';
}

/** Phase 8.2: Recommended temperatures by use case */
export const TEMPERATURE_GUIDE = {
  clinical_analysis: 0.2,   // Factual, consistent
  chat_companion: 0.5,      // Balanced creativity
  predictions: 0.4,         // Informed speculation
  discovery_analysis: 0.3,  // Analytical
} as const;

/** Phase 12.11: Detect seed/fake data markers */
export function detectSeedData(text: string): boolean {
  const markers = ['seed_data', 'test_data', 'mock_data', 'placeholder', 'lorem ipsum'];
  const lower = text.toLowerCase();
  return markers.some(m => lower.includes(m));
}

/** Phase 8.6: Standard medical safety suffix for all AI system prompts */
export const MEDICAL_SAFETY_SUFFIX = `

CRITICAL SAFETY RULES:
- NEVER recommend specific insulin doses or adjustments
- NEVER diagnose conditions
- NEVER suggest stopping or changing prescribed medications
- Always recommend consulting healthcare providers for treatment decisions
- If a user expresses self-harm or suicidal thoughts, provide 988 Suicide & Crisis Lifeline info immediately
- Clearly label all outputs as AI-generated, not medical advice`;
