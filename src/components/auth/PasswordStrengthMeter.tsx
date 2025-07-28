import React from 'react';
import { checkPasswordStrength, getStrengthColor } from '@/utils/passwordUtils';

interface PasswordStrengthMeterProps {
  password: string;
  showSuggestions?: boolean;
  className?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showSuggestions = true,
  className = '',
}) => {
  const strength = checkPasswordStrength(password);
  const strengthWidth = `${(strength.score / 4) * 100}%`;
  const strengthColor = getStrengthColor(strength.strength);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password Strength:</span>
        <span className="font-medium">{strength.strength}</span>
      </div>
      
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{ width: strengthWidth }}
        />
      </div>
      
      {showSuggestions && strength.suggestions.length > 0 && (
        <div className="mt-3 text-sm">
          <p className="text-muted-foreground mb-1">Suggestions to improve:</p>
          <ul className="list-disc pl-5 space-y-1">
            {strength.suggestions.map((suggestion, index) => (
              <li key={index} className="text-muted-foreground">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center">
          {strength.hasMinLength ? (
            <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <span className="w-4 h-4 border border-muted-foreground/30 rounded-full mr-1" />
          )}
          <span>8+ characters</span>
        </div>
        <div className="flex items-center">
          {strength.hasUppercase && strength.hasLowercase ? (
            <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <span className="w-4 h-4 border border-muted-foreground/30 rounded-full mr-1" />
          )}
          <span>Upper & lower case</span>
        </div>
        <div className="flex items-center">
          {strength.hasNumber ? (
            <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <span className="w-4 h-4 border border-muted-foreground/30 rounded-full mr-1" />
          )}
          <span>Number (0-9)</span>
        </div>
        <div className="flex items-center">
          {strength.hasSpecialChar ? (
            <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <span className="w-4 h-4 border border-muted-foreground/30 rounded-full mr-1" />
          )}
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
};

// Simple check icon component
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default PasswordStrengthMeter;
