/**
 * Wave 1.2: IOB-Aware Pattern Engine
 * Computes cumulative Insulin on Board at each glucose reading timestamp
 * using the pharmacokinetic models from insulinModels.ts.
 * 
 * MEDICAL DISCLAIMER: Simulation only. Not for clinical dosing decisions.
 */

import {
  type InsulinProfile,
  type InsulinAnalog,
  type UserInsulinParams,
  INSULIN_PROFILES,
  calculateIOB,
} from './insulinModels';

export interface InsulinEvent {
  timestamp: Date;
  units: number;
  analog?: InsulinAnalog;
  isClosedLoop?: boolean;
}

export interface IOBAtTime {
  timestamp: Date;
  totalIOB: number;
  contributingBoluses: number;
}

/**
 * Calculate cumulative IOB at each glucose reading timestamp
 * given a set of insulin events.
 */
export function calculateIOBTimeline(
  insulinEvents: InsulinEvent[],
  glucoseTimestamps: Date[],
  defaultAnalog: InsulinAnalog = 'novolog',
  params?: Partial<UserInsulinParams>,
): IOBAtTime[] {
  if (insulinEvents.length === 0) {
    return glucoseTimestamps.map(ts => ({
      timestamp: ts,
      totalIOB: 0,
      contributingBoluses: 0,
    }));
  }

  const sorted = [...insulinEvents].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  return glucoseTimestamps.map(ts => {
    let totalIOB = 0;
    let contributing = 0;

    for (const event of sorted) {
      const timeDiffMin =
        (ts.getTime() - event.timestamp.getTime()) / 60000;

      // Only consider past events within the insulin duration window
      if (timeDiffMin < 0) break; // sorted, so future events won't contribute

      const profile =
        INSULIN_PROFILES[event.analog || defaultAnalog];
      if (timeDiffMin > profile.duration) continue;

      const iob = calculateIOB(profile, timeDiffMin, event.units, params);
      if (iob > 0.01) {
        totalIOB += iob;
        contributing++;
      }
    }

    return {
      timestamp: ts,
      totalIOB: Math.round(totalIOB * 100) / 100,
      contributingBoluses: contributing,
    };
  });
}

/**
 * Summarize IOB data for inclusion in AI prompts.
 * Returns a concise text block the AI can reason about.
 */
export function formatIOBForPrompt(
  iobTimeline: IOBAtTime[],
): string {
  if (iobTimeline.length === 0) return '';

  const withIOB = iobTimeline.filter(t => t.totalIOB > 0);
  if (withIOB.length === 0) return 'No active insulin on board detected during this period.';

  const maxIOB = Math.max(...withIOB.map(t => t.totalIOB));
  const avgIOB =
    withIOB.reduce((sum, t) => sum + t.totalIOB, 0) / withIOB.length;

  // Find peak IOB timestamp
  const peak = withIOB.find(t => t.totalIOB === maxIOB);
  const peakTime = peak
    ? peak.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'unknown';

  return [
    'INSULIN ON BOARD SUMMARY:',
    `- Peak IOB: ${maxIOB.toFixed(1)}u at ${peakTime}`,
    `- Average IOB (when active): ${avgIOB.toFixed(1)}u`,
    `- Time points with active insulin: ${withIOB.length}/${iobTimeline.length}`,
    '- Note: IOB calculations are estimates. Actual insulin absorption varies.',
  ].join('\n');
}
