import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BootstrapAdmin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleBootstrap = async () => {
    if (!email.trim()) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.rpc('bootstrap_first_admin', {
        admin_email: email.trim()
      });

      if (error) {
        if (error.message.includes('Admin users already exist')) {
          setMessage('Admin users already exist in the system. Use the normal login process.');
        } else {
          setMessage(error.message);
        }
        return;
      }

      if (data) {
        toast.success('Successfully bootstrapped as admin! You can now login.');
        setMessage('Success! You have been made an admin. You can now login with your credentials.');
      } else {
        setMessage('User not found with that email address. Please register first.');
      }
    } catch (error: any) {
      console.error('Bootstrap error:', error);
      setMessage(error.message || 'An error occurred during bootstrap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-purple-600 mr-2" />
            <CardTitle className="text-2xl">Bootstrap Admin</CardTitle>
          </div>
          <p className="text-gray-600">
            Make yourself the first admin user
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Your Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {message && (
            <Alert variant={message.includes('Success') ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleBootstrap}
            disabled={loading || !email.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Processing...' : 'Make Me Admin'}
          </Button>

          <div className="text-center">
            <a 
              href="/auth" 
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Login
            </a>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This only works if no admin users exist yet. If admins already exist, you'll need to ask an existing admin to approve your account.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default BootstrapAdmin;