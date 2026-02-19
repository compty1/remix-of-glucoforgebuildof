/**
 * Shared constants for the application (Item 1951)
 * Centralizes magic numbers, query limits, timeouts, and animation durations.
 */

// Query limits
export const QUERY_LIMITS = {
  DEFAULT: 20,
  SMALL: 5,
  MEDIUM: 10,
  LARGE: 50,
  MAX: 100,
  INFINITE_SCROLL_PAGE: 20,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  DEBOUNCE_SEARCH: 300,
  ENGAGEMENT_DELAY: 2000,
  TOAST_DURATION: 5000,
  ONBOARDING_DELAY: 2000,
  QUERY_STALE: 5 * 60 * 1000, // 5 minutes
} as const;

// Animation durations (in seconds)
export const ANIMATION_DURATIONS = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5,
  PAGE_TRANSITION: 0.2,
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['.csv', '.json', '.xlsx', '.xls'],
} as const;

// Donation limits
export const DONATION_LIMITS = {
  MIN_AMOUNT: 5,
  MAX_AMOUNT: 100_000,
} as const;

// Form validation limits
export const FORM_LIMITS = {
  DISPLAY_NAME_MAX: 50,
  BIO_MAX: 500,
  SUBJECT_MAX: 200,
  MESSAGE_MAX: 5000,
  NAME_MAX: 100,
  EMAIL_MAX: 255,
} as const;
