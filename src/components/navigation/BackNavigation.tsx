
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackNavigationProps {
  label?: string;
  to?: string;
  className?: string;
}

export const BackNavigation: React.FC<BackNavigationProps> = ({ 
  label = 'Back', 
  to,
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <Button
        variant="ghost"
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </Button>
    </div>
  );
};
