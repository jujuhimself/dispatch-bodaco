import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ambulance, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth-types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  // Error handling
  const [error, setError] = useState('');
  
  // Check if user is already authenticated and handle redirects
  useEffect(() => {
    if (user && !loading) {
      if (user.approval_status === 'approved') {
        let redirectPath = '/dashboard';
        if (user.role === 'admin') redirectPath = '/admin';
        else if (user.role === 'dispatcher') redirectPath = '/dashboard/dispatcher';
        else if (user.role === 'responder') redirectPath = '/dashboard/responder';
        else if (user.role === 'user') redirectPath = '/dashboard/user';
        
        const from = (location.state as any)?.from?.pathname || redirectPath;
        navigate(from, { replace: true });
        toast.success(`Welcome back, ${user.name || user.email}!`);
      } else if (user.approval_status === 'pending') {
        toast.warning('Your account is pending admin approval. You will be contacted once approved.');
      } else if (user.approval_status === 'rejected') {
        toast.error('Your account has been rejected. Please contact support for assistance.');
      }
    }
  }, [user, loading, navigate, location]);
  
  const clearError = () => setError('');
  
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
    } catch (error: any) {
      setError(error.message || 'Error during sign in');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (registerPassword.length < 6) {
      setError('Password should be at least 6 characters');
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
      
      setActiveTab('login');
      toast.success('Registration successful! Please check your email to verify your account.');
      
    } catch (error: any) {
      setError(error.message || 'Error during registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Show pending approval message if user is pending
  if (user && user.approval_status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Account Pending Approval</h2>
            <p className="text-gray-600 mb-4">
              Your account is being reviewed by an administrator. You will receive an email notification once approved.
            </p>
            <Button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-600 hover:to-blue-700"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Ambulance className="h-8 w-8 text-red-600 mr-2" />
            <h1 className="text-2xl font-bold text-red-600">Boda & Co®</h1>
          </div>
          <h2 className="text-3xl font-semibold text-purple-600 mb-2">Welcome</h2>
          <p className="text-gray-600">Emergency Response Management System</p>
        </div>

        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail" className="text-gray-700">Email Address</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        clearError();
                      }}
                      className="h-12 bg-gray-50 border-gray-200"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="text-gray-700">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        clearError();
                      }}
                      className="h-12 bg-gray-50 border-gray-200"
                      required
                    />
                  </div>

                  <div className="text-right">
                    <button type="button" className="text-sm text-red-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-600 hover:to-blue-700 text-white font-medium" 
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

                  <div className="text-center text-sm text-gray-600">
                    Boda & Co Emergency Response — <span className="text-red-600">Already have an account?</span>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registerName" className="text-gray-700">Full Name</Label>
                    <Input
                      id="registerName"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerName}
                      onChange={(e) => {
                        setRegisterName(e.target.value);
                        clearError();
                      }}
                      className="h-12 bg-gray-50 border-gray-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="text-gray-700">Email Address</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={registerEmail}
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        clearError();
                      }}
                      className="h-12 bg-gray-50 border-gray-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPhone" className="text-gray-700">Phone Number (Optional)</Label>
                    <Input
                      id="registerPhone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={registerPhone}
                      onChange={(e) => {
                        setRegisterPhone(e.target.value);
                        clearError();
                      }}
                      className="h-12 bg-gray-50 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerRole" className="text-gray-700">Role</Label>
                    <Select value={registerRole} onValueChange={(value) => setRegisterRole(value as UserRole)}>
                      <SelectTrigger className="h-12 bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="responder">Responder</SelectItem>
                        <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-gray-700">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        clearError();
                      }}
                      className="h-12 bg-gray-50 border-gray-200"
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-600 hover:to-blue-700 text-white font-medium" 
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

                  <div className="text-center text-sm text-gray-600">
                    Boda & Co Emergency Response — Create new account
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;