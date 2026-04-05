/**
 * Shared sentiment analysis for all review edge functions.
 * Uses the improved algorithm with 1.5x ratio and minimum-word guard.
 */

const POSITIVE_WORDS = [
  'love', 'amazing', 'great', 'excellent', 'works', 'helped', 'better', 'recommend',
  'effective', 'game changer', 'life changing', 'wonderful', 'fantastic', 'improved',
  'perfect', 'happy', 'stable', 'consistent', 'controlled', 'a1c dropped', 'life saver',
  'lifesaver', 'worth it', 'no issues', 'satisfied', 'convenient', 'comfortable',
  'accurate', 'reliable', 'easy', 'impressive', 'smooth', 'best', 'loving',
];

const NEGATIVE_WORDS = [
  'hate', 'terrible', 'horrible', 'useless', 'failed', 'side effects', 'nausea',
  'problem', 'issue', 'stopped working', 'awful', 'worst', 'pain', 'dangerous',
  'disappointed', 'frustrated', 'weight gain', 'expensive', 'switched', 'rash',
  'allergic', 'recall', 'malfunction', 'uncomfortable', 'diarrhea', 'vomiting',
  'inaccurate', 'unreliable', 'annoying', 'defective', 'broken', 'error',
];

export function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();
  let pos = 0, neg = 0;
  POSITIVE_WORDS.forEach(w => { if (lowerText.includes(w)) pos++; });
  NEGATIVE_WORDS.forEach(w => { if (lowerText.includes(w)) neg++; });

  const total = pos + neg;
  if (total < 2) return 'neutral';
  if (pos > neg * 1.5) return 'positive';
  if (neg > pos * 1.5) return 'negative';
  return 'neutral';
}
