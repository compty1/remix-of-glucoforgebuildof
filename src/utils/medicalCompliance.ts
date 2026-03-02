/**
 * Phase 11: Medical Compliance & Legal Utilities
 * 
 * 11.1  AI Interaction Checker Guardrails
 * 11.2  Insulin Dosage Refusal
 * 11.3  Mental Health Crisis Interstitial (988)
 * 11.6  A1C → GMI Relabeling
 * 11.7  "Cure" → "Therapeutic Advancements"
 * 11.8  Pharmacodynamics Disclaimer
 * 11.15 Dynamic Medical Disclaimer
 */

// 11.2: Patterns that indicate insulin dosage requests
const DOSAGE_REQUEST_PATTERNS = [
  /how\s+much\s+insulin\s+(should|do)\s+i\s+(take|inject|bolus|dose)/i,
  /what\s+(dose|dosage|amount)\s+of\s+insulin/i,
  /adjust\s+my\s+(basal|bolus|insulin)\s+(rate|dose|dosage)/i,
  /increase|decrease|change\s+my\s+insulin/i,
  /recommend\s+\d+\s*u(nits)?/i,
  /give\s+me\s+\d+\s*u(nits)?/i,
  /tell\s+me\s+(my|the)\s+(exact|specific)\s+(dose|dosage)/i,
];

export function detectDosageRequest(text: string): boolean {
  return DOSAGE_REQUEST_PATTERNS.some(p => p.test(text));
}

export const DOSAGE_REFUSAL_MESSAGE = 
  "⚠️ I cannot recommend specific insulin doses or adjustments. Insulin dosing is highly individual and depends on many factors only your healthcare team can evaluate. " +
  "Please consult your endocrinologist or diabetes educator for dosing decisions. " +
  "I can discuss general insulin mechanisms, timing strategies from the community, and questions to ask your provider.";

// 11.3: Crisis detection keywords
const CRISIS_KEYWORDS = [
  /\b(suicid|kill\s+my\s*self|end\s+(my|it\s+all)|don'?t\s+want\s+to\s+(live|be\s+alive)|want\s+to\s+die)\b/i,
  /\b(self[- ]?harm|cut(ting)?\s+my\s*self|hurt\s+my\s*self)\b/i,
  /\b(no\s+reason\s+to\s+live|better\s+off\s+dead|give\s+up\s+on\s+life)\b/i,
];

export function detectCrisisLanguage(text: string): boolean {
  return CRISIS_KEYWORDS.some(p => p.test(text));
}

export const CRISIS_INTERSTITIAL = {
  title: "We Care About You",
  message: "It sounds like you may be going through a really difficult time. You're not alone, and help is available right now.",
  resources: [
    { name: "988 Suicide & Crisis Lifeline", action: "Call or text 988", url: "tel:988" },
    { name: "Crisis Text Line", action: "Text HOME to 741741", url: "sms:741741" },
    { name: "JDRF Mental Health Resources", action: "Visit JDRF", url: "https://www.jdrf.org/t1d-resources/living-with-t1d/mental-health/" },
    { name: "Beyond Type 1 Mental Health", action: "Visit BT1", url: "https://beyondtype1.org/mental-health/" },
  ],
};

// 11.6: A1C → GMI relabeling map
export function relabelA1CtoGMI(text: string): string {
  return text
    .replace(/\bestimated\s+A1[Cc]\b/g, 'GMI (Glucose Management Indicator)')
    .replace(/\bA1[Cc]\s*\(estimated\)/g, 'GMI (Glucose Management Indicator)')
    .replace(/\beA1[Cc]\b/g, 'GMI');
}

// 11.7: "Cure" language softening
export function softenCureLanguage(text: string): string {
  return text
    .replace(/\bcure\s+for\s+diabetes\b/gi, 'therapeutic advancement for diabetes')
    .replace(/\bcure\s+for\s+T1D\b/gi, 'therapeutic advancement for T1D')
    .replace(/\bfinding\s+a\s+cure\b/gi, 'advancing therapeutic options')
    .replace(/\bwill\s+cure\b/gi, 'may provide functional remission for');
}

// 11.8: Pharmacodynamics disclaimer
export const PHARMACODYNAMICS_DISCLAIMER = 
  "Individual insulin pharmacokinetics vary significantly based on injection site, body composition, temperature, and activity level. " +
  "The timing curves shown are population averages and may not reflect your personal response. " +
  "Always work with your healthcare team to determine your individual insulin timing.";

// 11.15: Dynamic medical disclaimer based on context
export function getDynamicDisclaimer(context: 'glucose' | 'insulin' | 'medication' | 'diet' | 'exercise' | 'general'): string {
  const disclaimers: Record<string, string> = {
    glucose: "CGM data analysis is for informational purposes only. Do not make treatment decisions based solely on this analysis without consulting your healthcare provider.",
    insulin: "Insulin dosing information is educational only. Never adjust your insulin regimen without guidance from your endocrinologist or diabetes care team.",
    medication: "Medication information is for educational purposes. Always consult your prescribing physician before making any changes to your medication regimen.",
    diet: "Dietary information is general guidance. Work with your registered dietitian or diabetes educator for personalized nutrition plans.",
    exercise: "Exercise recommendations are general in nature. Consult your healthcare team about exercise planning, especially regarding insulin and carbohydrate adjustments.",
    general: "The information provided is for educational and informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.",
  };
  return disclaimers[context] || disclaimers.general;
}
