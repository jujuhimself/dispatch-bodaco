import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TestRegistration() {
  const { signUp, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    name: 'Test User',
    phone: '+1234567890',
  });
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        phone_number: formData.phone,
        role: 'user',
      });
      
      setStep(2); // Move to verification step
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p>Processing your request...</p>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters with a number and special character
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verification step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium">Check your email</h3>
          <p className="text-sm text-gray-600">
            We've sent a verification link to <span className="font-medium">{formData.email}</span>.
            Please check your inbox and click the link to verify your email address.
          </p>
          
          <div className="pt-4">
            <p className="text-sm text-gray-600">
              Didn't receive the email?{' '}
              <button
                onClick={() => signUp(formData.email, formData.password, {
                  name: formData.name,
                  phone_number: formData.phone,
                  role: 'user',
                })}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Resend verification email
              </button>
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
