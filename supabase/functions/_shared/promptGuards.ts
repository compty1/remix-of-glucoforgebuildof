/**
 * Phase 8 & 12: AI Prompt Engineering Utilities
 * Phase 11: Medical Compliance Guards (server-side)
 * 
 * - Prompt injection firewall (12.1)
 * - PII scrubbing (12.2)
 * - Hallucination disclaimers (12.3)
 * - Chat context window limit (12.4)
 * - Source URL sanitization (12.5)
 * - Token limit enforcement (12.10)
 * - Seed data detection (12.11)
 * - Temperature guidelines (8.2)
 * - Dosage refusal (11.2)
 * - Crisis detection (11.3)
 * - A1C→GMI relabeling (11.6)
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
  const maxChars = maxTokens * 4;
  return text.slice(0, maxChars) + '... [truncated for safety]';
}

/** Phase 8.2: Recommended temperatures by use case */
export const TEMPERATURE_GUIDE = {
  clinical_analysis: 0.2,
  chat_companion: 0.5,
  predictions: 0.4,
  discovery_analysis: 0.3,
} as const;

/** Phase 12.11: Detect seed/fake data markers */
export function detectSeedData(text: string): boolean {
  const markers = ['seed_data', 'test_data', 'mock_data', 'placeholder', 'lorem ipsum'];
  const lower = text.toLowerCase();
  return markers.some(m => lower.includes(m));
}

/** Phase 8.6 + 11.6 + 11.7: Standard medical safety suffix for all AI system prompts */
export const MEDICAL_SAFETY_SUFFIX = `

CRITICAL SAFETY RULES:
- NEVER recommend specific insulin doses or adjustments
- NEVER diagnose conditions
- NEVER suggest stopping or changing prescribed medications
- Always recommend consulting healthcare providers for treatment decisions
- If a user expresses self-harm or suicidal thoughts, provide 988 Suicide & Crisis Lifeline info immediately
- Clearly label all outputs as AI-generated, not medical advice
- Use "GMI (Glucose Management Indicator)" instead of "estimated A1C" or "eA1C"
- Use "therapeutic advancement" instead of "cure" when discussing research outcomes
- Include pharmacodynamics variability caveat when discussing insulin timing`;

/** Phase 11.2: Detect insulin dosage requests */
const DOSAGE_PATTERNS = [
  /how\s+much\s+insulin\s+(should|do)\s+i\s+(take|inject|bolus|dose)/i,
  /what\s+(dose|dosage|amount)\s+of\s+insulin/i,
  /recommend\s+\d+\s*u(nits)?/i,
  /tell\s+me\s+(my|the)\s+(exact|specific)\s+(dose|dosage)/i,
];

export function detectDosageRequest(input: string): boolean {
  return DOSAGE_PATTERNS.some(p => p.test(input));
}

export const DOSAGE_REFUSAL =
  "I cannot recommend specific insulin doses. Insulin dosing is highly individual — please consult your endocrinologist. I can discuss general insulin mechanisms and community tips instead.";

/** Phase 11.3: Detect crisis/self-harm language */
const CRISIS_PATTERNS = [
  /\b(suicid|kill\s+my\s*self|end\s+(my|it\s+all)|don'?t\s+want\s+to\s+(live|be\s+alive)|want\s+to\s+die)\b/i,
  /\b(self[- ]?harm|hurt\s+my\s*self)\b/i,
  /\b(no\s+reason\s+to\s+live|better\s+off\s+dead)\b/i,
];

export function detectCrisisLanguage(input: string): boolean {
  return CRISIS_PATTERNS.some(p => p.test(input));
}

export const CRISIS_RESPONSE =
  "I'm concerned about what you've shared. You are not alone, and help is available right now.\n\n" +
  "🆘 **988 Suicide & Crisis Lifeline** — Call or text 988 (24/7)\n" +
  "💬 **Crisis Text Line** — Text HOME to 741741\n" +
  "🌐 **JDRF Mental Health** — jdrf.org/t1d-resources/living-with-t1d/mental-health\n\n" +
  "Please reach out to one of these resources or talk to someone you trust.";

/** Phase 12.4: Chat context window limit (max messages in conversation) */
export function enforceContextWindow(
  messages: Array<{ role: string; content: string }>,
  maxMessages = 20
): Array<{ role: string; content: string }> {
  if (messages.length <= maxMessages) return messages;
  const systemMsgs = messages.filter(m => m.role === 'system');
  const nonSystem = messages.filter(m => m.role !== 'system');
  return [...systemMsgs, ...nonSystem.slice(-maxMessages)];
}

/** Phase 12.5: Validate source URLs - strip non-http URLs from AI output */
export function sanitizeAIUrls(text: string): string {
  return text.replace(/\[([^\]]+)\]\((javascript:|data:)[^)]*\)/gi, '[$1](#)');
}
