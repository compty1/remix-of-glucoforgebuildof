/**
 * Phase 20.4 (bonus): Graceful AI Loading States
 * Rotating "Did you know?" facts shown after 3s of AI loading.
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

export function useAILoadingFacts(isLoading: boolean, delayMs = 3000) {
  const [currentFact, setCurrentFact] = useState<string | null>(null);
  const [showFact, setShowFact] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => {
        setCurrentFact(DIABETES_FACTS[Math.floor(Math.random() * DIABETES_FACTS.length)]);
        setShowFact(true);

        intervalRef.current = setInterval(() => {
          setCurrentFact(DIABETES_FACTS[Math.floor(Math.random() * DIABETES_FACTS.length)]);
        }, 6000);
      }, delayMs);
    } else {
      setShowFact(false);
      setCurrentFact(null);
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    }

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, [isLoading, delayMs]);

  return { showFact, currentFact };
}
