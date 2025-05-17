
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TourStep {
  target: string;
  title: string;
  content: string | React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  spotlightPadding?: number;
}

interface OnboardingTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface OnboardingStore {
  completedTours: Record<string, boolean>;
  markTourAsComplete: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  resetTour: (tourId: string) => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      completedTours: {},
      markTourAsComplete: (tourId: string) => {
        set((state) => ({
          completedTours: { ...state.completedTours, [tourId]: true }
        }));
      },
      isTourCompleted: (tourId: string) => {
        return !!get().completedTours[tourId];
      },
      resetTour: (tourId: string) => {
        set((state) => {
          const newCompletedTours = { ...state.completedTours };
          delete newCompletedTours[tourId];
          return { completedTours: newCompletedTours };
        });
      }
    }),
    {
      name: 'onboarding-tours',
      skipHydration: true,
    }
  )
);

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ 
  tourId, 
  steps, 
  onComplete, 
  isOpen: controlledIsOpen, 
  onOpenChange 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const { auth } = useAuth();
  const { markTourAsComplete, isTourCompleted } = useOnboardingStore();
  
  // Handle controlled vs uncontrolled open state
  const open = controlledIsOpen ?? isOpen;
  const setOpen = onOpenChange ?? setIsOpen;
  
  useEffect(() => {
    // If the tour is already completed, don't show it
    if (isTourCompleted(tourId)) {
      return;
    }
    
    // Open the tour automatically if not explicitly controlled
    if (controlledIsOpen === undefined && !isTourCompleted(tourId)) {
      setTimeout(() => {
        setIsOpen(true);
      }, 1000);
    }
  }, [tourId, isTourCompleted, controlledIsOpen]);
  
  useEffect(() => {
    if (open && steps.length > 0) {
      // Find the target element for the current step
      const targetSelector = steps[currentStep]?.target;
      if (targetSelector) {
        const element = document.querySelector(targetSelector) as HTMLElement;
        setTargetElement(element);
      }
    }
  }, [currentStep, open, steps]);
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    setOpen(false);
    markTourAsComplete(tourId);
    onComplete?.();
    // Reset the step for next time
    setTimeout(() => setCurrentStep(0), 300);
  };
  
  const handleSkip = () => {
    setOpen(false);
    markTourAsComplete(tourId);
    // Reset the step for next time
    setTimeout(() => setCurrentStep(0), 300);
  };
  
  if (!open || !steps.length) return null;
  
  // Compute position for the tooltip
  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%' };

    const position = steps[currentStep]?.position || 'bottom';
    const rect = targetElement.getBoundingClientRect();
    const padding = steps[currentStep]?.spotlightPadding || 8;
    
    switch (position) {
      case 'top':
        return {
          top: `${rect.top - padding - 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + padding + 10}px`,
          transform: 'translate(0, -50%)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - padding - 10}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'bottom':
      default:
        return {
          top: `${rect.bottom + padding + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
    }
  };
  
  const tooltipPosition = getTooltipPosition();
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" />
      
      {/* Spotlight effect */}
      {targetElement && (
        <div 
          className="absolute rounded-md pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - (steps[currentStep]?.spotlightPadding || 8),
            left: targetElement.getBoundingClientRect().left - (steps[currentStep]?.spotlightPadding || 8),
            width: targetElement.offsetWidth + 2 * (steps[currentStep]?.spotlightPadding || 8),
            height: targetElement.offsetHeight + 2 * (steps[currentStep]?.spotlightPadding || 8),
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Tooltip */}
      <div 
        className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-72 pointer-events-auto z-10"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: tooltipPosition.transform,
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-emergency-500 mr-2" />
            <h3 className="font-medium">{steps[currentStep]?.title}</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {steps[currentStep]?.content}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevStep}
              >
                Back
              </Button>
            )}
            
            <Button 
              size="sm" 
              onClick={handleNextStep}
              className="bg-emergency-500 hover:bg-emergency-600"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Finish
                  <CheckCircle className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper hook to easily create tours
export const useTour = (tourId: string) => {
  const { isTourCompleted, resetTour } = useOnboardingStore();
  const [isOpen, setIsOpen] = useState(false);
  
  return {
    isCompleted: isTourCompleted(tourId),
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    reset: () => resetTour(tourId),
    tourProps: {
      tourId,
      isOpen,
      onOpenChange: setIsOpen,
    }
  };
};
