/**
 * Phase 20.4 (bonus): Graceful AI Loading States
 * Bugs 273-274: No consecutive repeats, clear intervals on re-trigger.
 */
import { useState, useEffect, useRef } from 'react';

const DIABETES_FACTS = [
  'The first insulin injection was given in 1922 to Leonard Thompson in Toronto.',
  'CGMs take a glucose reading approximately every 5 minutes — that\'s 288 readings per day.',
  'Time in Range (70-180 mg/dL) is now considered as important as A1C by many endocrinologists.',
  'The artificial pancreas concept has been researched since the 1970s.',
  'Exercise can affect blood glucose for up to 24-48 hours afterward.',
  'Stress hormones like cortisol can raise blood glucose even without eating.',
  'The term "diabetes mellitus" comes from Greek and Latin, meaning "sweet urine."',
  'Over 8.7 million people in the US have Type 1 diabetes or are undiagnosed.',
  'Glucose Management Indicator (GMI) replaced estimated A1C for CGM users in 2018.',
  'Islet cell transplantation research has been ongoing since the Edmonton Protocol in 2000.',
];

function pickRandomExcluding(exclude: number): number {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * DIABETES_FACTS.length);
  } while (idx === exclude && DIABETES_FACTS.length > 1);
  return idx;
}

export function useAILoadingFacts(isLoading: boolean, delayMs = 3000) {
  const [currentFact, setCurrentFact] = useState<string | null>(null);
  const [showFact, setShowFact] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    // Always clear previous timers first (Bug 274)
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);

    if (isLoading) {
      timerRef.current = setTimeout(() => {
        const idx = pickRandomExcluding(lastIndexRef.current);
        lastIndexRef.current = idx;
        setCurrentFact(DIABETES_FACTS[idx]);
        setShowFact(true);

        intervalRef.current = setInterval(() => {
          const nextIdx = pickRandomExcluding(lastIndexRef.current);
          lastIndexRef.current = nextIdx;
          setCurrentFact(DIABETES_FACTS[nextIdx]);
        }, 6000);
      }, delayMs);
    } else {
      setShowFact(false);
      setCurrentFact(null);
    }

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, [isLoading, delayMs]);

  return { showFact, currentFact };
}
