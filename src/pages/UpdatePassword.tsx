
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuth();
  
  useEffect(() => {
    // If the user is not in the password recovery flow but is already logged in,
    // redirect them to dashboard
    if (auth) {
      navigate('/dashboard');
    }
  }, [auth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error updating password');
      console.error('Password update error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-3">
            <Ambulance className="h-10 w-10 text-emergency-600" />
            <h1 className="text-4xl font-bold text-emergency-700 flex items-center">
              <span className="text-emergency-600">Respond</span>
            </h1>
          </div>
        </div>
        
        <Card className="bg-white/90 backdrop-blur-lg border border-gray-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-emergency-600 to-purple-600 bg-clip-text text-transparent">
              Update Password
            </CardTitle>
            <CardDescription>Create a new password for your account</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/70" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/70" 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emergency-600 to-purple-600 hover:from-emergency-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'} 
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex-col text-center text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Password requirements:</p>
            <ul className="list-disc text-left ml-6">
              <li>Minimum 6 characters</li>
              <li>Include a mix of letters, numbers, and symbols for stronger security</li>
            </ul>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePassword;
