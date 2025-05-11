
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ambulance, CheckCircle2, AlertCircle } from 'lucide-react';
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
  
  // Check if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      toast.success('Successfully logged in');
    } catch (error: any) {
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
    
    try {
      const userData = {
        role,
        name,
        phone_number: phoneNumber,
      };
      
      await signUp(registerEmail, registerPassword, userData);
      setRegistrationSuccess(true);
      
      // Reset form
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRole('dispatcher');
      setName('');
      setPhoneNumber('');
    } catch (error: any) {
      toast.error(error.message || 'Error during registration');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-100">
        <div className="animate-pulse flex flex-col items-center">
          <Ambulance className="h-12 w-12 text-emergency-600 mb-4" />
          <p className="text-emergency-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Show registration success page
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="border-success-200 shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-teal-500/5 to-emerald-500/10 -z-10" />
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-success-100 p-3 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-success-500" />
              </div>
              <CardTitle className="text-2xl mt-4 text-success-700">Registration Successful!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Please check your email inbox for a verification link. You'll need to verify your email before logging in.
              </p>
              
              <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  If you don't see the email in a few minutes, check your spam folder.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => setRegistrationSuccess(false)}
                  variant="outline" 
                  className="w-full"
                >
                  Return to Login
                </Button>
                
                <Button
                  onClick={() => window.open('mailto:', '_blank')}
                  variant="ghost"
                  className="w-full"
                >
                  Need help? Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md">
        <motion.div 
          className="mb-8 flex justify-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <Ambulance className="h-12 w-12 text-emergency-600" />
            <h1 className="text-4xl font-bold text-emergency-700 flex items-center">
              <span className="text-emergency-600">Boda & Co</span>
              <span className="ml-1 bg-emergency-500 h-2 w-2 rounded-full emergency-pulse"></span>
            </h1>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/90 backdrop-blur-lg border border-gray-100 shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emergency-500/10 via-purple-500/5 to-blue-500/10 -z-10" />
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emergency-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Emergency Response Management System
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 rounded-lg p-1 bg-slate-100">
                  <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="you@example.com" 
                          required 
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required 
                          className="bg-white/70"
                        />
                        <div className="text-right">
                          <Link to="/reset-password" className="text-sm text-emergency-600 hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-emergency-600 to-blue-600 hover:from-emergency-700 hover:to-blue-700 transition-all duration-300" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name" className="text-gray-700">Full Name</Label>
                        <Input 
                          id="register-name" 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe" 
                          required 
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-gray-700">Email Address</Label>
                        <Input 
                          id="register-email" 
                          type="email" 
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="you@example.com" 
                          required 
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-phone" className="text-gray-700">Phone Number</Label>
                        <Input 
                          id="register-phone" 
                          type="tel" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1 (555) 123-4567" 
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-gray-700">Password</Label>
                        <Input 
                          id="register-password" 
                          type="password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required 
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-gray-700">Confirm Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          required 
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-700">Select Role</Label>
                        <Select 
                          value={role} 
                          onValueChange={(value) => setRole(value as UserRole)}
                        >
                          <SelectTrigger className="w-full bg-white/70">
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
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-emergency-600 to-blue-600 hover:from-emergency-700 hover:to-blue-700 transition-all duration-300" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="justify-center text-sm text-gray-500 pt-2">
              <p>
                Boda & Co Emergency Response — <Link to="/login" className="text-emergency-600 hover:underline">Already have an account?</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
