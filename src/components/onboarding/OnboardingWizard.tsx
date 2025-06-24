import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, ArrowLeft, UserPlus, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingData {
  personalInfo: {
    name: string;
    phone: string;
    department: string;
    role: string;
  };
  preferences: {
    notifications: boolean;
    emailAlerts: boolean;
    smsAlerts: boolean;
  };
  security: {
    twoFactor: boolean;
    emergencyContact: string;
  };
}

const OnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {
      name: user?.name || '',
      phone: user?.phone_number || '',
      department: '',
      role: user?.role || 'user'
    },
    preferences: {
      notifications: true,
      emailAlerts: true,
      smsAlerts: false
    },
    security: {
      twoFactor: false,
      emergencyContact: ''
    }
  });

  const steps = [
    {
      title: 'Personal Information',
      icon: UserPlus,
      description: 'Tell us about yourself'
    },
    {
      title: 'Preferences',
      icon: Settings,
      description: 'Configure your settings'
    },
    {
      title: 'Security',
      icon: Shield,
      description: 'Secure your account'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.personalInfo.name,
          phone_number: data.personalInfo.phone,
          // Note: department field doesn't exist in profiles table
          // We could add it or store in a separate table if needed
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Onboarding completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={data.personalInfo.name}
                onChange={(e) =>
                  setData({
                    ...data,
                    personalInfo: { ...data.personalInfo, name: e.target.value }
                  })
                }
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={data.personalInfo.phone}
                onChange={(e) =>
                  setData({
                    ...data,
                    personalInfo: { ...data.personalInfo, phone: e.target.value }
                  })
                }
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={data.personalInfo.department}
                onValueChange={(value) =>
                  setData({
                    ...data,
                    personalInfo: { ...data.personalInfo, department: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency Services</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="fire">Fire Department</SelectItem>
                  <SelectItem value="police">Police</SelectItem>
                  <SelectItem value="traffic">Traffic Control</SelectItem>
                  <SelectItem value="dispatch">Dispatch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Push Notifications</Label>
              <input
                type="checkbox"
                className="toggle"
                checked={data.preferences.notifications}
                onChange={(e) =>
                  setData({
                    ...data,
                    preferences: { ...data.preferences, notifications: e.target.checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Email Alerts</Label>
              <input
                type="checkbox"
                className="toggle"
                checked={data.preferences.emailAlerts}
                onChange={(e) =>
                  setData({
                    ...data,
                    preferences: { ...data.preferences, emailAlerts: e.target.checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>SMS Alerts</Label>
              <input
                type="checkbox"
                className="toggle"
                checked={data.preferences.smsAlerts}
                onChange={(e) =>
                  setData({
                    ...data,
                    preferences: { ...data.preferences, smsAlerts: e.target.checked }
                  })
                }
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <input
                type="checkbox"
                className="toggle"
                checked={data.security.twoFactor}
                onChange={(e) =>
                  setData({
                    ...data,
                    security: { ...data.security, twoFactor: e.target.checked }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="emergency-contact">Emergency Contact</Label>
              <Input
                id="emergency-contact"
                value={data.security.emergencyContact}
                onChange={(e) =>
                  setData({
                    ...data,
                    security: { ...data.security, emergencyContact: e.target.value }
                  })
                }
                placeholder="Emergency contact phone number"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const StepIcon = steps[currentStep].icon;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Welcome to Emergency Response</CardTitle>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <div className="flex items-center space-x-2">
            <StepIcon className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-semibold">{steps[currentStep].title}</h3>
              <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
