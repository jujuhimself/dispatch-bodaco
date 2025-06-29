import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ambulance, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth-types';
import { motion } from 'framer-motion';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validationService } from '@/services/validation-service';
import { enhancedAuditService } from '@/services/enhanced-audit-service';
import AdminBootstrap from '@/components/admin/AdminBootstrap';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('dispatcher');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // Initialize validation service
  useEffect(() => {
    validationService.initialize();
  }, []);
  
  // Check if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);
  
  // Real-time field validation
  const validateField = (fieldName: string, value: any) => {
    const result = validationService.validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: result.errors
    }));
    return result.valid;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    // Clear previous errors for this field
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: []
    }));
    
    // Validate after a short delay to avoid excessive validation
    setTimeout(() => validateField(fieldName, value), 300);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Log login attempt
      await enhancedAuditService.logSecurityEvent('login_attempt', {
        email: loginEmail,
        ip_address: 'client_ip_not_available',
        user_agent: navigator.userAgent
      });

      await signIn(loginEmail, loginPassword);
      
      // Log successful login
      await enhancedAuditService.logSecurityEvent('login_success', {
        email: loginEmail
      });
      
      // Navigation will be handled by the auth context
    } catch (error: any) {
      // Log failed login
      await enhancedAuditService.logSecurityEvent('login_failure', {
        email: loginEmail,
        error: error.message
      });
      
      toast.error(error.message || 'Error during sign in');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== registerConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (registerPassword.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setIsValidating(true);
    
    try {
      // Server-side validation
      const validationResult = await validationService.validateUserData({
        email: registerEmail,
        name: name,
        phone_number: phoneNumber,
        role: role
      });
      
      if (!validationResult.valid) {
        setValidationErrors({
          general: validationResult.errors
        });
        toast.error('Please fix the validation errors and try again');
        return;
      }
      
      const userData = {
        role,
        name,
        phone_number: phoneNumber,
      };
      
      // Log registration attempt
      await enhancedAuditService.logSecurityEvent('registration_attempt', {
        email: registerEmail,
        role: role,
        name: name
      });
      
      await signUp(registerEmail, registerPassword, userData);
      
      // Log successful registration
      await enhancedAuditService.logUserAction('registration_success', {
        email: registerEmail,
        role: role
      });
      
      setRegistrationSuccess(true);
      
      // Reset form
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRole('dispatcher');
      setName('');
      setPhoneNumber('');
      setValidationErrors({});
      
    } catch (error: any) {
      // Log failed registration
      await enhancedAuditService.logSecurityEvent('registration_failure', {
        email: registerEmail,
        error: error.message
      });
      
      toast.error(error.message || 'Error during registration');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };

  // Show registration success page
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-green-100 p-3 rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">Registration Successful!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-blue-800 font-medium">Check Your Email</p>
                <p className="text-blue-600 text-sm">
                  Please verify your email address before logging in.
                </p>
              </div>
              
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pending Approval</AlertTitle>
                <AlertDescription>
                  Your account will need admin approval before you can access the platform.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setRegistrationSuccess(false)}
                  className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700"
                >
                  Return to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <motion.div 
          className="mb-8 flex justify-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <Ambulance className="h-10 w-10 text-red-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Boda & Co
            </h1>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-slate-800">
                Emergency Response System
              </CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white">
                    Register
                  </TabsTrigger>
                  <TabsTrigger value="admin-bootstrap" className="data-[state=active]:bg-white text-xs">
                    First Admin
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com" 
                        required 
                        className="border-slate-200 focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required 
                        className="border-slate-200 focus:border-red-500"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-medium py-2.5" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  {/* General validation errors */}
                  {validationErrors.general && validationErrors.general.length > 0 && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {validationErrors.general.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-slate-700">Full Name</Label>
                    <Input 
                      id="register-name" 
                      type="text" 
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        handleFieldChange('name', e.target.value);
                      }}
                      placeholder="John Doe" 
                      required 
                      className={`border-slate-200 focus:border-red-500 ${
                        validationErrors.name?.length ? 'border-red-300' : ''
                      }`}
                    />
                    {validationErrors.name?.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-slate-700">Email Address</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      value={registerEmail}
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        handleFieldChange('email', e.target.value);
                      }}
                      placeholder="you@example.com" 
                      required 
                      className={`border-slate-200 focus:border-red-500 ${
                        validationErrors.email?.length ? 'border-red-300' : ''
                      }`}
                    />
                    {validationErrors.email?.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-phone" className="text-slate-700">Phone Number</Label>
                    <Input 
                      id="register-phone" 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        handleFieldChange('phone_number', e.target.value);
                      }}
                      placeholder="+1 (555) 123-4567" 
                      className={`border-slate-200 focus:border-red-500 ${
                        validationErrors.phone_number?.length ? 'border-red-300' : ''
                      }`}
                    />
                    {validationErrors.phone_number?.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-700">Select Role</Label>
                    <Select 
                      value={role} 
                      onValueChange={(value) => {
                        setRole(value as UserRole);
                        handleFieldChange('role', value);
                      }}
                    >
                      <SelectTrigger className="border-slate-200 focus:border-red-500">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          <SelectItem value="dispatcher">Dispatcher</SelectItem>
                          <SelectItem value="responder">Responder</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="user">Standard User</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {validationErrors.role?.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-slate-700">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password"
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        handleFieldChange('password', e.target.value);
                      }}
                      required 
                      className={`border-slate-200 focus:border-red-500 ${
                        validationErrors.password?.length ? 'border-red-300' : ''
                      }`}
                    />
                    {validationErrors.password?.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-700">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required 
                      className="border-slate-200 focus:border-red-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-medium py-2.5" 
                    disabled={isLoading || isValidating}
                  >
                    {isLoading ? 'Creating Account...' : isValidating ? 'Validating...' : 'Create Account'}
                  </Button>
                </TabsContent>
                
                <TabsContent value="admin-bootstrap">
                  <AdminBootstrap />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="justify-center text-sm text-slate-500 pt-2">
              <p>Boda & Co Emergency Response Platform</p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
