
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertCircle, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
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

const Auth = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Form states and validation
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('user');
  const [activeTab, setActiveTab] = useState('login');
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Initialize validation service
  useEffect(() => {
    validationService.initialize();
  }, []);
  
  // Check if user is already authenticated and handle redirects
  useEffect(() => {
    if (user && !loading) {
      // Check approval status
      if (user.approval_status === 'approved') {
        // Redirect based on role
        const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
        const from = (location.state as any)?.from?.pathname || redirectPath;
        navigate(from, { replace: true });
        toast.success(`Welcome back, ${user.name || user.email}!`);
      } else if (user.approval_status === 'pending') {
        toast.warning('Your account is pending admin approval. You will be contacted once approved.');
        // Keep them on auth page but show a different message
      } else if (user.approval_status === 'rejected') {
        toast.error('Your account has been rejected. Please contact support for assistance.');
      }
    }
  }, [user, loading, navigate, location]);
  
  const handleFieldChange = (fieldName: string, value: any) => {
    // Update the form field values
    switch(fieldName) {
      case 'name':
        setRegisterName(value);
        break;
      case 'email':
        setRegisterEmail(value);
        break;
      case 'phone':
        setRegisterPhone(value);
        break;
      case 'role':
        setRegisterRole(value);
        break;
      case 'password':
        setRegisterPassword(value);
        break;
    }
    
    // Clear validation errors for this field
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };
  
  const handleLogin = async (e: FormEvent) => {
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
  
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    
    if (registerPassword.length < 6) {
      setValidationErrors({ password: 'Password should be at least 6 characters' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        role: registerRole,
        name: registerName,
        phone_number: registerPhone,
      };
      
      await signUp(registerEmail, registerPassword, userData);
      
      // Reset form
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterName('');
      setRegisterPhone('');
      setRegisterRole('user');
      setValidationErrors({});
      
      toast.success('Registration successful! Please check your email to verify your account.');
      
    } catch (error: any) {
      setValidationErrors({ register: error.message || 'Error during registration' });
    } finally {
      setIsLoading(false);
    }
  };

  // Show different content for pending users
  if (user && user.approval_status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full"
        >
          <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-warning/20 p-3 rounded-full mb-4">
                <AlertCircle className="h-12 w-12 text-warning" />
              </div>
              <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert className="bg-warning/10 border-warning/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Admin Review Required</AlertTitle>
                <AlertDescription>
                  Your account is being reviewed by an administrator. You will receive an email notification once approved.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative bg-gradient-to-r from-primary to-secondary p-3 rounded-full">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Emergency Response
            </h1>
            <p className="text-muted-foreground">
              Secure access to emergency management system
            </p>
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-6 mt-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  {validationErrors.login && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{validationErrors.login}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading || isLoading}
                  >
                    {loading || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-6 mt-8">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="registerName" className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="registerName"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerName}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        required
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="text-xs text-destructive">{validationErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={registerEmail}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        required
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-xs text-destructive">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPhone" className="text-sm font-medium">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="registerPhone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={registerPhone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-xs text-destructive">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerRole" className="text-sm font-medium">Role</Label>
                    <Select value={registerRole} onValueChange={(value) => handleFieldChange('role', value)}>
                      <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="responder">Responder</SelectItem>
                        <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.role && (
                      <p className="text-xs text-destructive">{validationErrors.role}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={registerPassword}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        required
                      />
                    </div>
                    {validationErrors.password && (
                      <p className="text-xs text-destructive">{validationErrors.password}</p>
                    )}
                  </div>

                  {validationErrors.register && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{validationErrors.register}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading || isLoading}
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
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
