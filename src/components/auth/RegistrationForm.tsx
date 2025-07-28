import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, Loader2, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth-types';
import { useAuth } from '@/contexts/AuthContext';
import { checkPasswordStrength, validateEmail, validatePhone, validateName } from '@/lib/validation';
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onTabChange?: (tab: string) => void;
}

const RegistrationForm = ({ onSuccess, onTabChange }: RegistrationFormProps) => {
  const { signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user' as UserRole,
    termsAccepted: false,
  });
  
  // Validation state
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    termsAccepted: false,
  });
  
  // Password strength
  const passwordStrength = useMemo(
    () => checkPasswordStrength(formData.password),
    [formData.password]
  );
  
  const validateForm = () => {
    return (
      validateName(formData.name) &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.termsAccepted
    );
  };
  
  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    if (field in touched) {
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const userData = {
        name: formData.name.trim(),
        phone_number: formData.phone.trim(),
        role: formData.role,
      };
      
      await signUp(formData.email, formData.password, userData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        termsAccepted: false,
      });
      
      // Show success message or redirect
      if (onSuccess) onSuccess();
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormValid = validateForm();
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={cn(
              'h-12 bg-gray-50 border-gray-200 pl-10 pr-10',
              touched.name && !validateName(formData.name) && 'border-red-500'
            )}
            required
          />
          {touched.name && validateName(formData.name) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        {touched.name && !validateName(formData.name) && (
          <p className="text-sm text-red-500">Name must be at least 2 characters</p>
        )}
      </div>
      
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={cn(
              'h-12 bg-gray-50 border-gray-200 pl-10 pr-10',
              touched.email && formData.email && !validateEmail(formData.email) && 'border-red-500'
            )}
            required
          />
          {touched.email && formData.email && validateEmail(formData.email) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        {touched.email && formData.email && !validateEmail(formData.email) && (
          <p className="text-sm text-red-500">Please enter a valid email address</p>
        )}
      </div>
      
      {/* Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-gray-700">
          Phone Number (Optional)
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={cn(
              'h-12 bg-gray-50 border-gray-200 pl-10 pr-10',
              touched.phone && formData.phone && !validatePhone(formData.phone) && 'border-red-500'
            )}
          />
          {touched.phone && formData.phone && validatePhone(formData.phone) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        {touched.phone && formData.phone && !validatePhone(formData.phone) && (
          <p className="text-sm text-red-500">Please enter a valid phone number</p>
        )}
      </div>
      
      {/* Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-gray-700">
          I am a <span className="text-red-500">*</span>
        </Label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value as UserRole)}
          className="flex h-12 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="user">General User</option>
          <option value="responder">Emergency Responder</option>
          <option value="dispatcher">Dispatcher</option>
        </select>
      </div>
      
      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password (min 8 characters)"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={cn(
              'h-12 bg-gray-50 border-gray-200 pl-10 pr-10',
              touched.password && formData.password.length > 0 && formData.password.length < 8 && 'border-red-500'
            )}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {formData.password && (
          <PasswordStrengthMeter strength={passwordStrength} />
        )}
      </div>
      
      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-700">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className={cn(
              'h-12 bg-gray-50 border-gray-200 pl-10 pr-10',
              touched.confirmPassword && formData.password !== formData.confirmPassword && 'border-red-500'
            )}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
          {touched.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
            <div className="absolute inset-y-0 right-10 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        {touched.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-sm text-red-500">Passwords do not match</p>
        )}
      </div>
      
      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2 pt-2">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => handleChange('termsAccepted', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            required
          />
        </div>
        <div className="text-sm">
          <label htmlFor="terms" className="font-medium text-gray-700">
            I agree to the{' '}
            <a href="/terms" className="text-red-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-red-600 hover:underline">
              Privacy Policy
            </a>
            <span className="text-red-500">*</span>
          </label>
          {touched.termsAccepted && !formData.termsAccepted && (
            <p className="text-sm text-red-500">You must accept the terms and conditions</p>
          )}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-600 hover:to-blue-700 text-white font-medium" 
        disabled={loading || isLoading || !isFormValid}
      >
        {loading || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
      
      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={() => onTabChange?.('login')}
          className="text-red-600 hover:underline font-medium"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
