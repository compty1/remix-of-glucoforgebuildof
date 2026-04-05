/**
 * Gap 271: Password complexity validation beyond just length
 */
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  suggestions: string[];
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  else suggestions.push('Mix uppercase and lowercase letters');

  if (/\d/.test(password)) score++;
  else suggestions.push('Include at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('Add a special character (!@#$...)');

  // Common patterns to reject
  const common = ['password', '12345678', 'qwerty', 'diabetes', 'glucose'];
  if (common.some(c => password.toLowerCase().includes(c))) {
    score = Math.max(0, score - 2);
    suggestions.push('Avoid common words');
  }

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    suggestions,
    isValid: score >= 2 && password.length >= 8,
  };
}
