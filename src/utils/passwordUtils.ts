export interface PasswordStrength {
  score: number; // 0-4
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  suggestions: string[];
}

/**
 * Check the strength of a password and provide feedback
 * @param password The password to check
 * @returns An object containing strength information and suggestions
 */
export const checkPasswordStrength = (password: string): PasswordStrength => {
  const result: PasswordStrength = {
    score: 0,
    strength: 'Very Weak',
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    suggestions: []
  };

  // Calculate score (0-4)
  if (password.length >= 8) result.score++;
  if (result.hasUppercase && result.hasLowercase) result.score++;
  if (result.hasNumber) result.score++;
  if (result.hasSpecialChar) result.score++;
  
  // Additional point for longer passwords
  if (password.length >= 12) result.score = Math.min(4, result.score + 1);

  // Set strength label based on score
  result.strength = [
    'Very Weak', // 0
    'Weak',      // 1
    'Fair',      // 2
    'Good',      // 3
    'Strong'     // 4
  ][result.score] as PasswordStrength['strength'];

  // Generate suggestions
  if (!result.hasMinLength) {
    result.suggestions.push('Use at least 8 characters');
  }
  if (!result.hasUppercase || !result.hasLowercase) {
    result.suggestions.push('Use both uppercase and lowercase letters');
  }
  if (!result.hasNumber) {
    result.suggestions.push('Add at least one number');
  }
  if (!result.hasSpecialChar) {
    result.suggestions.push('Add a special character (e.g., !@#$%^&*)');
  }
  if (password.length < 12 && result.score < 4) {
    result.suggestions.push('Consider using a longer password (12+ characters)');
  }

  return result;
};

/**
 * Get a color based on password strength
 * @param strength The password strength
 * @returns A Tailwind CSS color class
 */
export const getStrengthColor = (strength: PasswordStrength['strength']): string => {
  switch (strength) {
    case 'Very Weak': return 'bg-red-500';
    case 'Weak': return 'bg-orange-500';
    case 'Fair': return 'bg-yellow-500';
    case 'Good': return 'bg-blue-500';
    case 'Strong': return 'bg-green-500';
    default: return 'bg-gray-200';
  }
};

/**
 * Validate password against common requirements
 * @param password The password to validate
 * @returns An error message if invalid, or empty string if valid
 */
export const validatePassword = (password: string): string => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return 'Password must contain both uppercase and lowercase letters';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};
