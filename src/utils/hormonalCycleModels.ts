/**
 * Domain 1.3: Hormonal cycle phase models for insulin resistance.
 * Progesterone during luteal phase increases insulin resistance 15-30%.
 */

export type CyclePhase = 'follicular' | 'ovulation' | 'luteal' | 'menstrual';

export interface CyclePhaseInfo {
  phase: CyclePhase;
  label: string;
  typicalDays: string;
  insulinResistanceMultiplier: number;
  description: string;
  color: string;
}

export const CYCLE_PHASES: Record<CyclePhase, CyclePhaseInfo> = {
  menstrual: {
    phase: 'menstrual',
    label: 'Menstrual',
    typicalDays: 'Days 1-5',
    insulinResistanceMultiplier: 1.0,
    description: 'Insulin sensitivity typically returns to baseline.',
    color: 'hsl(0, 70%, 50%)',
  },
  follicular: {
    phase: 'follicular',
    label: 'Follicular',
    typicalDays: 'Days 6-13',
    insulinResistanceMultiplier: 0.95,
    description: 'Rising estrogen may slightly improve insulin sensitivity.',
    color: 'hsl(200, 70%, 50%)',
  },
  ovulation: {
    phase: 'ovulation',
    label: 'Ovulation',
    typicalDays: 'Days 14-16',
    insulinResistanceMultiplier: 1.05,
    description: 'Hormonal shift may cause brief variability.',
    color: 'hsl(45, 80%, 50%)',
  },
  luteal: {
    phase: 'luteal',
    label: 'Luteal',
    typicalDays: 'Days 17-28',
    insulinResistanceMultiplier: 1.25,
    description: 'Progesterone causes significant insulin resistance (15-30%).',
    color: 'hsl(280, 60%, 50%)',
  },
};

/**
 * Estimate cycle phase from cycle day (assuming 28-day cycle).
 */
export function estimatePhaseFromDay(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

/**
 * Get insulin resistance multiplier for a given phase.
 * Returns 1.0 if phase is unknown.
 */
export function getResistanceMultiplier(phase: CyclePhase | null): number {
  if (!phase) return 1.0;
  return CYCLE_PHASES[phase]?.insulinResistanceMultiplier ?? 1.0;
}

/**
 * Determine if a phase should be excluded from baseline variance calculations.
 * Luteal phase has high variance that skews baselines.
 */
export function isHighVariancePhase(phase: CyclePhase | null): boolean {
  return phase === 'luteal';
}
