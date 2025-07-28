import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { checkPasswordStrength } from '@/utils/passwordUtils';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPasswordConfirm } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const passwordStrength = checkPasswordStrength(password);

  // Check for token in URL on component mount
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      // Here you would typically validate the token with your backend
      // For now, we'll assume it's valid
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
    }
  }, [searchParams]);

  const validateForm = useCallback(() => {
    let isValid = true;
    
    // Reset errors
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else if (passwordStrength.score < 2) {
      setPasswordError('Please choose a stronger password');
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  }, [password, confirmPassword, passwordStrength.score]);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
    
    // If confirm password exists, validate it against the new password
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };
  
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    
    // Clear error when user starts typing
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
    
    // Validate against password
    if (newConfirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Invalid or expired reset token');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordConfirm(token, password);
      toast.success('Your password has been reset successfully');
      // Add a small delay before redirecting to show the success message
      setTimeout(() => {
        navigate('/auth/signin');
      }, 1500);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p>Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Invalid or Expired Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/auth/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">New Password</Label>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <span className="flex items-center">
                      <EyeOff className="h-4 w-4 mr-1" /> Hide
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" /> Show
                    </span>
                  )}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className={passwordError ? 'border-destructive' : ''}
                />
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              <PasswordStrengthMeter password={password} className="mt-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <span className="flex items-center">
                      <EyeOff className="h-4 w-4 mr-1" /> Hide
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" /> Show
                    </span>
                  )}
                </button>
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className={confirmPasswordError ? 'border-destructive' : ''}
              />
              {confirmPasswordError && (
                <p className="text-sm text-destructive">{confirmPasswordError}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !password || !confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
            <div className="text-center text-sm">
              Remember your password?{' '}
              <Button asChild variant="link" className="p-0 h-auto">
                <Link to="/auth/signin">Sign in</Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
