import { useState } from 'react';
import { resetAuthState } from '@/utils/resetAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function ResetAuthPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);
    try {
      const success = await resetAuthState();
      if (success) {
        setIsDone(true);
        // Give user time to see the success message
        setTimeout(() => {
          navigate('/auth');
        }, 1500);
      } else {
        setError('Failed to reset authentication. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting auth:', error);
      setError('An error occurred while resetting authentication.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Authentication</h1>
        
        {!isDone ? (
          <>
            <p className="mb-6 text-gray-700">
              This will clear all authentication data and sign you out from all devices.
              You'll need to sign in again after this action.
            </p>
            <div className="space-y-4">
              <Button
                onClick={handleReset}
                disabled={isResetting}
                variant="destructive"
                className="w-full"
              >
                {isResetting ? 'Resetting...' : 'Reset Authentication'}
              </Button>
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-lg font-medium mb-4">Authentication reset successful!</p>
            <p className="text-gray-600">You will be redirected to the login page shortly...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// This page doesn't need any layout or authentication
ResetAuthPage.getLayout = (page: React.ReactNode) => page;
