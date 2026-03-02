/**
 * Domain 4.2: Alert Budget System
 * Prevents alarm fatigue by capping predictive alerts per day.
 */

export type AlertPriority = 'urgent_low' | 'predicted_low' | 'high' | 'informational';

export interface AlertBudgetConfig {
  dailyBudget: number; // max alerts per day (default 3)
  snoozeUntil: number | null; // epoch ms, null = not snoozed
  priorityOverrides: Partial<Record<AlertPriority, boolean>>; // force-enable/disable specific priorities
}

export interface PendingAlert {
  id: string;
  priority: AlertPriority;
  message: string;
  timestamp: number;
}

const PRIORITY_RANK: Record<AlertPriority, number> = {
  urgent_low: 0,
  predicted_low: 1,
  high: 2,
  informational: 3,
};

const DEFAULT_CONFIG: AlertBudgetConfig = {
  dailyBudget: 3,
  snoozeUntil: null,
  priorityOverrides: {},
};

/**
 * Filter alerts through the budget system.
 * Returns only alerts that should be shown, sorted by priority.
 */
export function applyAlertBudget(
  alerts: PendingAlert[],
  alertsShownToday: number,
  config: Partial<AlertBudgetConfig> = {}
): PendingAlert[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Check snooze
  if (cfg.snoozeUntil && Date.now() < cfg.snoozeUntil) {
    // During snooze, only urgent lows break through
    return alerts.filter((a) => a.priority === 'urgent_low');
  }

  // Filter by priority overrides
  const filtered = alerts.filter((a) => {
    const override = cfg.priorityOverrides[a.priority];
    if (override === false) return false; // explicitly disabled
    return true;
  });

  // Sort by priority (urgent first)
  const sorted = [...filtered].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  );

  // Apply budget
  const remaining = Math.max(0, cfg.dailyBudget - alertsShownToday);

  // Urgent lows always pass through regardless of budget
  const urgentLows = sorted.filter((a) => a.priority === 'urgent_low');
  const nonUrgent = sorted.filter((a) => a.priority !== 'urgent_low');

  return [...urgentLows, ...nonUrgent.slice(0, remaining)];
}

/**
 * Calculate snooze-until timestamp from duration.
 */
export function calculateSnoozeUntil(
  duration: '15min' | '30min' | '1hr' | 'rest_of_day'
): number {
  const now = Date.now();
  switch (duration) {
    case '15min': return now + 15 * 60 * 1000;
    case '30min': return now + 30 * 60 * 1000;
    case '1hr': return now + 60 * 60 * 1000;
    case 'rest_of_day': {
      const eod = new Date();
      eod.setHours(23, 59, 59, 999);
      return eod.getTime();
    }
  }
}
