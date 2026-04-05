import { describe, it, expect } from 'vitest';
import { applyAlertBudget, type AlertBudgetConfig, type PendingAlert } from '../alertBudget';

describe('applyAlertBudget', () => {
  const config: AlertBudgetConfig = {
    dailyCap: 3,
    priorityOrder: ['urgent', 'high', 'medium', 'low'],
  };

  it('returns all alerts when under budget', () => {
    const alerts: PendingAlert[] = [
      { id: '1', priority: 'high', message: 'High glucose', createdAt: new Date().toISOString() },
      { id: '2', priority: 'low', message: 'Log reminder', createdAt: new Date().toISOString() },
    ];
    const result = applyAlertBudget(alerts, 0, config);
    expect(result.length).toBe(2);
  });

  it('caps alerts at daily budget', () => {
    const alerts: PendingAlert[] = [
      { id: '1', priority: 'urgent', message: 'Urgent low', createdAt: new Date().toISOString() },
      { id: '2', priority: 'high', message: 'High glucose', createdAt: new Date().toISOString() },
      { id: '3', priority: 'medium', message: 'Calibrate', createdAt: new Date().toISOString() },
      { id: '4', priority: 'low', message: 'Log food', createdAt: new Date().toISOString() },
    ];
    const result = applyAlertBudget(alerts, 1, config);
    // Already shown 1, budget is 3, so 2 remaining
    expect(result.length).toBe(2);
  });

  it('prioritizes urgent over low', () => {
    const alerts: PendingAlert[] = [
      { id: '1', priority: 'low', message: 'Low pri', createdAt: new Date().toISOString() },
      { id: '2', priority: 'urgent', message: 'Urgent', createdAt: new Date().toISOString() },
    ];
    const result = applyAlertBudget(alerts, 2, config);
    expect(result.length).toBe(1);
    expect(result[0].priority).toBe('urgent');
  });

  it('returns empty when budget exhausted', () => {
    const alerts: PendingAlert[] = [
      { id: '1', priority: 'low', message: 'Low', createdAt: new Date().toISOString() },
    ];
    const result = applyAlertBudget(alerts, 3, config);
    expect(result.length).toBe(0);
  });
});
