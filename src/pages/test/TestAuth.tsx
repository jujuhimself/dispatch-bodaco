import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TestAuth = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  const testConnection = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').limit(5);
      
      if (error) throw error;
      
      setUsers(data || []);
      toast.success('Successfully connected to Supabase');
    } catch (error: any) {
      console.error('Error testing connection:', error);
      toast.error(`Connection error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  };

  useEffect(() => {
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Connection Test</h2>
          <Button onClick={testConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test Supabase Connection'}
          </Button>
          
          {users.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Sample Users (first 5):</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(users, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Session Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {session ? JSON.stringify(session, null, 2) : 'No active session'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
