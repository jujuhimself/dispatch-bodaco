export interface PasswordStrength {
  score: number;
  message: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const result: PasswordStrength = {
    score: 0,
    message: '',
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  };

  // Length check (minimum 8 characters)
  result.hasMinLength = password.length >= 8;
  if (result.hasMinLength) result.score += 1;

  // Uppercase letter check
  result.hasUppercase = /[A-Z]/.test(password);
  if (result.hasUppercase) result.score += 1;

  // Number check
  result.hasNumber = /[0-9]/.test(password);
  if (result.hasNumber) result.score += 1;

  // Special character check
  result.hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  if (result.hasSpecialChar) result.score += 1;

  // Determine strength message
  if (password.length === 0) {
    result.message = 'Enter a password';
  } else if (password.length < 8) {
    result.message = 'Too short (min 8 characters)';
  } else {
    switch (result.score) {
      case 1:
        result.message = 'Weak';
        break;
      case 2:
        result.message = 'Fair';
        break;
      case 3:
        result.message = 'Good';
        break;
      case 4:
        result.message = 'Strong';
        break;
      default:
        result.message = 'Weak';
    }
  }

  return result;
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  return /^[+]?[\s.-]?(?:\(?\d{1,3}\)?[\s.-]?)?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/.test(phone);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};
