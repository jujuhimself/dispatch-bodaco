
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  User,
  Settings,
  Shield,
  Bell,
  Smartphone,
  MapPin
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  completed: boolean;
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Rapid Response Guardian',
      description: 'Your comprehensive emergency management platform',
      icon: Shield,
      completed: false,
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Welcome aboard!</h3>
          <p className="text-muted-foreground">
            We'll help you get started with managing emergencies efficiently and effectively.
          </p>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Set Up Your Profile',
      description: 'Configure your personal information and role',
      icon: User,
      completed: false,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Profile Setup</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Basic information configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Role permissions set</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Profile picture (optional)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Configure Notifications',
      description: 'Set up alerts and notification preferences',
      icon: Bell,
      completed: false,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notification Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Emergency alerts</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Status updates</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mobile notifications</span>
              <Badge variant="secondary">Configure</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'location',
      title: 'Location Services',
      description: 'Enable location access for better emergency response',
      icon: MapPin,
      completed: false,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location Access</h3>
          <p className="text-sm text-muted-foreground">
            Allow location access to provide accurate emergency response and tracking.
          </p>
          <Button 
            onClick={() => {
              navigator.geolocation?.getCurrentPosition(() => {
                setCompletedSteps(prev => new Set([...prev, 'location']));
              });
            }}
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Enable Location Access
          </Button>
        </div>
      )
    },
    {
      id: 'mobile',
      title: 'Mobile Setup',
      description: 'Optimize your mobile experience',
      icon: Smartphone,
      completed: false,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mobile Optimization</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Responsive design enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Touch gestures configured</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Install as PWA (optional)</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, steps[currentStep].id]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg">Setup Wizard</CardTitle>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-2 mt-2">
            <currentStepData.icon className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            {currentStepData.content}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="flex justify-center mt-4 gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
