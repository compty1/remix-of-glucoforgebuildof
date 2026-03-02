/**
 * Wave 6.4: Device detection for 988 crisis resource routing
 * Detects whether the device can make cellular calls.
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for mobile phones
  if (/iphone|android.*mobile|windows phone|blackberry/i.test(ua)) {
    return 'mobile';
  }
  
  // Check for tablets (iPad, Android tablet)
  if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) {
    return 'tablet';
  }
  
  return 'desktop';
}

/**
 * Whether the device likely supports cellular calling (tel: links).
 */
export function canMakeCalls(): boolean {
  return detectDeviceType() === 'mobile';
}

/**
 * Get appropriate crisis contact method based on device.
 */
export function getCrisisContactMethod(): { type: 'phone' | 'web'; url: string; label: string } {
  if (canMakeCalls()) {
    return {
      type: 'phone',
      url: 'tel:988',
      label: 'Call 988',
    };
  }
  return {
    type: 'web',
    url: 'https://988lifeline.org/chat',
    label: 'Chat with 988 Lifeline',
  };
}
