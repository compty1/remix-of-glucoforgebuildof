/**
 * Phase 18.4: Device End-of-Life Tracker
 * Warranty expiration tracking with proactive alerts.
 */

export interface UserDevice {
  id: string;
  deviceName: string;
  serialNumber?: string;
  purchaseDate: string;
  warrantyMonths: number;
  notes?: string;
}

export interface DeviceWarrantyStatus {
  device: UserDevice;
  warrantyEndDate: Date;
  isExpired: boolean;
  daysRemaining: number;
  urgency: 'expired' | 'critical' | 'warning' | 'ok';
  message: string;
}

export function calculateWarrantyStatus(device: UserDevice): DeviceWarrantyStatus {
  const purchase = new Date(device.purchaseDate);
  const warrantyEnd = new Date(purchase);
  warrantyEnd.setMonth(warrantyEnd.getMonth() + device.warrantyMonths);

  const now = new Date();
  const diffMs = warrantyEnd.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining < 0;

  let urgency: DeviceWarrantyStatus['urgency'];
  let message: string;

  if (isExpired) {
    urgency = 'expired';
    message = `Warranty expired ${Math.abs(daysRemaining)} days ago. Contact manufacturer about replacement options.`;
  } else if (daysRemaining <= 30) {
    urgency = 'critical';
    message = `Warranty expires in ${daysRemaining} days! Start replacement process now.`;
  } else if (daysRemaining <= 180) {
    urgency = 'warning';
    message = `Warranty expires in ${daysRemaining} days. Begin planning for replacement.`;
  } else {
    urgency = 'ok';
    message = `Warranty valid for ${daysRemaining} more days.`;
  }

  return { device, warrantyEndDate: warrantyEnd, isExpired, daysRemaining, urgency, message };
}

/**
 * Common warranty durations for T1D devices.
 */
export const DEFAULT_WARRANTY_MONTHS: Record<string, number> = {
  'Insulin Pump': 48,
  'CGM Transmitter': 3,
  'CGM Receiver': 12,
  'Glucose Meter': 36,
  'Insulin Pen': 24,
};
