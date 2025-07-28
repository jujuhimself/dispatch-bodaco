import { Check, X } from 'lucide-react';
import { PasswordStrength } from '@/lib/validation';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
  className?: string;
}

const PasswordStrengthMeter = ({ strength, className = '' }: PasswordStrengthMeterProps) => {
  const getStrengthColor = () => {
    if (strength.score <= 1) return 'bg-red-500';
    if (strength.score === 2) return 'bg-yellow-500';
    if (strength.score === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthWidth = () => {
    if (strength.score === 0) return 'w-0';
    if (strength.score === 1) return 'w-1/4';
    if (strength.score === 2) return 'w-1/2';
    if (strength.score === 3) return 'w-3/4';
    return 'w-full';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Password strength:</span>
        <span 
          className={cn(
            'font-medium',
            strength.score >= 3 ? 'text-green-600' : 
            strength.score >= 2 ? 'text-blue-600' : 
            strength.score >= 1 ? 'text-yellow-600' : 'text-red-600'
          )}
        >
          {strength.message}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${getStrengthColor()} ${getStrengthWidth()}`}
        ></div>
      </div>
      
      <ul className="mt-2 text-xs text-gray-500 space-y-1">
        <li className="flex items-center">
          {strength.hasMinLength ? (
            <Check className="h-3 w-3 mr-1 text-green-600" />
          ) : (
            <X className="h-3 w-3 mr-1 text-gray-300" />
          )}
          At least 8 characters
        </li>
        <li className="flex items-center">
          {strength.hasUppercase ? (
            <Check className="h-3 w-3 mr-1 text-green-600" />
          ) : (
            <X className="h-3 w-3 mr-1 text-gray-300" />
          )}
          At least one uppercase letter
        </li>
        <li className="flex items-center">
          {strength.hasNumber ? (
            <Check className="h-3 w-3 mr-1 text-green-600" />
          ) : (
            <X className="h-3 w-3 mr-1 text-gray-300" />
          )}
          At least one number
        </li>
        <li className="flex items-center">
          {strength.hasSpecialChar ? (
            <Check className="h-3 w-3 mr-1 text-green-600" />
          ) : (
            <X className="h-3 w-3 mr-1 text-gray-300" />
          )}
          At least one special character
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
