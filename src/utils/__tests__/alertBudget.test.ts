import { describe, it, expect } from 'vitest';
import { applyAlertBudget, type AlertBudgetConfig, type PendingAlert } from '../alertBudget';

describe('applyAlertBudget', () => {
  it('returns all alerts when under budget', () => {
    const alerts: PendingAlert[] = [
      { id: '1', priority: 'high', message: 'High glucose', timestamp: Date.now() },
      { id: '2', priority: 'informational', message: 'Log reminder', timestamp: Date.now() },
    ];
    const result = applyAlertBudget(alerts, 0);
    expect(result.length).toBe(2);
  });

  it('caps alerts at daily budget', () => {
    const alerts: PendingAlert[] = [
      { id: '1', priority: 'urgent_low', message: 'Urgent low', timestamp: Date.now() },
      { id: '2', priority: 'high', message: 'High glucose', timestamp: Date.now() },
      { id: '3', priority: 'predicted_low', message: 'Predicted low', timestamp: Date.now() },
      { id: '4', priority: 'informational', message: 'Log food', timestamp: Date.now() },
    ];
    const result = applyAlertBudget(alerts, 1, { dailyBudget: 3 });
    // Already shown 1, budget is 3, so 2 remaining
    expect(result.length).toBe(2);
  });

  it('prioritizes urgent_low over informational', () => {
    const alerts: PendingAlert[] = [
      { id: '1', priority: 'informational', message: 'Low pri', timestamp: Date.now() },
      { id: '2', priority: 'urgent_low', message: 'Urgent', timestamp: Date.now() },
    ];
    const result = applyAlertBudget(alerts, 2, { dailyBudget: 3 });
    expect(result.length).toBe(1);
    expect(result[0].priority).toBe('urgent_low');
  });

  it('returns empty when budget exhausted', () => {
    const alerts: PendingAlert[] = [
      { id: '1', priority: 'informational', message: 'Low', timestamp: Date.now() },
    ];
    const result = applyAlertBudget(alerts, 3, { dailyBudget: 3 });
    expect(result.length).toBe(0);
  });
});
