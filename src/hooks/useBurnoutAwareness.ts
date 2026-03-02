/**
 * Domain 4.1: Hook to conditionally suppress gamification based on burnout score.
 */
import { useMemo } from 'react';
import { calculateBurnoutScore, type BurnoutSignals, type BurnoutScore } from '@/utils/burnoutDetector';

export function useBurnoutAwareness(signals: BurnoutSignals | null): BurnoutScore {
  return useMemo(() => {
    if (!signals) {
      return {
        score: 0,
        level: 'low' as const,
        suppressGamification: false,
        showMentalHealthResources: false,
        suggestedTone: 'achievement' as const,
      };
    }
    return calculateBurnoutScore(signals);
  }, [signals]);
}
