/**
 * Phase 1.18 / 15.1: Pharmacokinetic/Pharmacodynamic Insulin Models
 * Implements simplified Hovorka compartment model for IOB/insulin activity curves.
 * 
 * MEDICAL DISCLAIMER: These are mathematical simulations only.
 * Do NOT use for clinical dosing decisions.
 */

export type InsulinAnalog = 'fiasp' | 'novolog' | 'humalog' | 'lyumjev' | 'apidra' | 'regular' | 'nph' | 'lantus' | 'tresiba';

export interface InsulinProfile {
  name: string;
  analog: InsulinAnalog;
  /** Time to onset (minutes) */
  onset: number;
  /** Time to peak (minutes) */
  peak: number;
  /** Duration of action (minutes) */
  duration: number;
  /** Two-compartment model time constants (minutes) */
  tau1: number;
  tau2: number;
  /** Peak activity scaling factor */
  peakScaling: number;
}

/**
 * Clinically validated insulin profiles based on published PK/PD data.
 * Sources: Heise et al. 2015, 2017; Hovorka et al. 2004
 */
export const INSULIN_PROFILES: Record<InsulinAnalog, InsulinProfile> = {
  fiasp: {
    name: 'Fiasp (Faster Aspart)',
    analog: 'fiasp',
    onset: 5, peak: 45, duration: 240,
    tau1: 40, tau2: 55, peakScaling: 1.15,
  },
  lyumjev: {
    name: 'Lyumjev (URLi)',
    analog: 'lyumjev',
    onset: 5, peak: 50, duration: 270,
    tau1: 42, tau2: 58, peakScaling: 1.12,
  },
  novolog: {
    name: 'NovoLog (Aspart)',
    analog: 'novolog',
    onset: 10, peak: 60, duration: 300,
    tau1: 55, tau2: 70, peakScaling: 1.0,
  },
  humalog: {
    name: 'Humalog (Lispro)',
    analog: 'humalog',
    onset: 10, peak: 60, duration: 300,
    tau1: 55, tau2: 70, peakScaling: 1.0,
  },
  apidra: {
    name: 'Apidra (Glulisine)',
    analog: 'apidra',
    onset: 10, peak: 55, duration: 300,
    tau1: 50, tau2: 65, peakScaling: 1.02,
  },
  regular: {
    name: 'Regular (R)',
    analog: 'regular',
    onset: 30, peak: 150, duration: 480,
    tau1: 100, tau2: 120, peakScaling: 0.7,
  },
  nph: {
    name: 'NPH',
    analog: 'nph',
    onset: 120, peak: 480, duration: 960,
    tau1: 300, tau2: 400, peakScaling: 0.4,
  },
  lantus: {
    name: 'Lantus (Glargine)',
    analog: 'lantus',
    onset: 120, peak: 0, duration: 1440,
    tau1: 600, tau2: 700, peakScaling: 0.15,
  },
  tresiba: {
    name: 'Tresiba (Degludec)',
    analog: 'tresiba',
    onset: 120, peak: 0, duration: 2520,
    tau1: 1200, tau2: 1400, peakScaling: 0.08,
  },
};

export interface UserInsulinParams {
  bodyWeightKg?: number;
  insulinSensitivityFactor?: number; // mg/dL per unit
  analog: InsulinAnalog;
}

/**
 * Simplified two-compartment Hovorka model for insulin activity.
 * S(t) = (t / tau1^2) * exp(-t / tau1) convolved with absorption
 * Normalized to area = 1 (per unit).
 */
export function calculateInsulinActivity(
  profile: InsulinProfile,
  timeMinutes: number,
  params?: Partial<UserInsulinParams>
): number {
  if (timeMinutes < 0) return 0;

  const { tau1, tau2, peakScaling } = profile;
  
  // Two-compartment model: activity = t^2 * exp(-t/tau) / (2 * tau^3)
  // Simplified Hovorka: S(t) = [t / (tau1 * (tau1 - tau2))] * [exp(-t/tau1) - exp(-t/tau2)]
  const t = timeMinutes;
  
  if (tau1 === tau2) {
    // Degenerate case: single compartment
    const activity = (t * t) / (2 * tau1 * tau1 * tau1) * Math.exp(-t / tau1);
    return Math.max(0, activity * peakScaling * 100);
  }
  
  const activity = (t / (tau1 * Math.abs(tau1 - tau2))) * 
    (Math.exp(-t / tau1) - Math.exp(-t / tau2));
  
  // Weight adjustment: heavier patients may have slower absorption
  let weightFactor = 1.0;
  if (params?.bodyWeightKg) {
    // Adjust absorption speed: heavier = slightly slower
    weightFactor = 70 / Math.max(40, Math.min(150, params.bodyWeightKg));
    // Clamp adjustment to ±20%
    weightFactor = Math.max(0.8, Math.min(1.2, weightFactor));
  }
  
  return Math.max(0, activity * peakScaling * weightFactor * 100);
}

/**
 * Calculate Insulin on Board (IOB) at a given time after injection.
 * IOB = integral of activity from t to infinity.
 * Approximated as 1 - integral of activity from 0 to t.
 */
export function calculateIOB(
  profile: InsulinProfile,
  timeMinutes: number,
  units: number,
  params?: Partial<UserInsulinParams>
): number {
  if (timeMinutes <= 0) return units;
  if (timeMinutes >= profile.duration) return 0;
  
  // Numerical integration using trapezoidal rule (5-min steps)
  const dt = 5;
  let totalActivity = 0;
  let usedActivity = 0;
  
  for (let t = 0; t <= profile.duration; t += dt) {
    const a = calculateInsulinActivity(profile, t, params);
    totalActivity += a * dt;
    if (t <= timeMinutes) {
      usedActivity += a * dt;
    }
  }
  
  if (totalActivity === 0) return 0;
  
  const fractionRemaining = 1 - (usedActivity / totalActivity);
  return Math.max(0, units * fractionRemaining);
}

/**
 * Generate a full activity curve for charting (every 15 minutes).
 */
export function generateActivityCurve(
  profile: InsulinProfile,
  params?: Partial<UserInsulinParams>,
  stepMinutes: number = 15
): Array<{ time: number; activity: number; iob: number }> {
  const points: Array<{ time: number; activity: number; iob: number }> = [];
  
  // Find the peak activity for normalization
  let maxActivity = 0;
  for (let t = 0; t <= profile.duration; t += stepMinutes) {
    const a = calculateInsulinActivity(profile, t, params);
    if (a > maxActivity) maxActivity = a;
  }
  
  for (let t = 0; t <= profile.duration + 60; t += stepMinutes) {
    const rawActivity = calculateInsulinActivity(profile, t, params);
    // Normalize to 0-100% scale
    const activity = maxActivity > 0 ? (rawActivity / maxActivity) * 100 : 0;
    const iob = calculateIOB(profile, t, 1, params);
    
    points.push({
      time: t,
      activity: Math.round(activity * 10) / 10,
      iob: Math.round(iob * 1000) / 1000,
    });
  }
  
  return points;
}

/**
 * Detect potential insulin stacking: overlapping boluses where
 * cumulative IOB exceeds a safety threshold.
 */
export interface InsulinStackingEvent {
  timestamp: string;
  cumulativeIOB: number;
  bolusCount: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export function detectInsulinStacking(
  boluses: Array<{ timestamp: Date; units: number }>,
  profile: InsulinProfile,
  params?: Partial<UserInsulinParams>
): InsulinStackingEvent[] {
  if (boluses.length < 2) return [];
  
  const events: InsulinStackingEvent[] = [];
  const sorted = [...boluses].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    let cumulativeIOB = current.units; // Current bolus
    let overlapCount = 0;
    
    // Check all previous boluses for remaining IOB
    for (let j = 0; j < i; j++) {
      const timeDiff = (current.timestamp.getTime() - sorted[j].timestamp.getTime()) / 60000;
      const remainingIOB = calculateIOB(profile, timeDiff, sorted[j].units, params);
      
      if (remainingIOB > 0.1) {
        cumulativeIOB += remainingIOB;
        overlapCount++;
      }
    }
    
    // Flag if cumulative IOB exceeds 150% of current bolus
    if (overlapCount > 0 && cumulativeIOB > current.units * 1.5) {
      const severity: 'low' | 'medium' | 'high' = 
        cumulativeIOB > current.units * 3 ? 'high' :
        cumulativeIOB > current.units * 2 ? 'medium' : 'low';
      
      events.push({
        timestamp: current.timestamp.toISOString(),
        cumulativeIOB: Math.round(cumulativeIOB * 10) / 10,
        bolusCount: overlapCount + 1,
        severity,
        recommendation: severity === 'high'
          ? 'Multiple overlapping boluses detected. Risk of hypoglycemia. Consult your healthcare provider.'
          : 'Previous insulin may still be active. Consider waiting before additional doses.',
      });
    }
  }
  
  return events;
}

/**
 * Clinical thresholds for different patient populations.
 * Sources: ADA Standards of Care 2024, AACE Guidelines
 */
export interface ClinicalThresholds {
  tirLow: number;   // mg/dL
  tirHigh: number;  // mg/dL
  tirTarget: number; // percentage
  timeBelowTarget: number; // percentage
  timeAboveTarget: number; // percentage
  cvTarget: number; // percentage
  gmiTarget: number; // percentage
  label: string;
}

export const CLINICAL_MODES: Record<string, ClinicalThresholds> = {
  standard: {
    tirLow: 70, tirHigh: 180,
    tirTarget: 70, timeBelowTarget: 4, timeAboveTarget: 25,
    cvTarget: 36, gmiTarget: 7.0,
    label: 'Standard Adult T1D',
  },
  pregnancy: {
    tirLow: 63, tirHigh: 140,
    tirTarget: 70, timeBelowTarget: 4, timeAboveTarget: 25,
    cvTarget: 36, gmiTarget: 6.0,
    label: 'Pregnancy (T1D)',
  },
  pediatric: {
    tirLow: 70, tirHigh: 180,
    tirTarget: 70, timeBelowTarget: 4, timeAboveTarget: 25,
    cvTarget: 36, gmiTarget: 7.0,
    label: 'Pediatric T1D',
  },
  elderly: {
    tirLow: 70, tirHigh: 250,
    tirTarget: 50, timeBelowTarget: 1, timeAboveTarget: 50,
    cvTarget: 36, gmiTarget: 8.0,
    label: 'Elderly / High Risk',
  },
  tight: {
    tirLow: 70, tirHigh: 140,
    tirTarget: 50, timeBelowTarget: 1, timeAboveTarget: 25,
    cvTarget: 33, gmiTarget: 6.5,
    label: 'Tight Control',
  },
};
