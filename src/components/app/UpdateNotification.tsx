
import React, { useEffect, useState } from 'react';
import { 
  checkForServiceWorkerUpdates, 
  updateServiceWorker,
  isServiceWorkerSupported
} from '@/services/service-worker-registration';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  // Check for updates when component mounts
  useEffect(() => {
    if (!isServiceWorkerSupported()) return;
    
    // Check for updates immediately
    checkForServiceWorkerUpdates().then(hasUpdate => {
      if (hasUpdate) {
        setUpdateAvailable(true);
      }
    });
    
    // Listen for service worker update events
    const handleServiceWorkerUpdated = () => {
      setUpdateAvailable(true);
    };
    
    window.addEventListener('serviceWorkerUpdated', handleServiceWorkerUpdated);
    
    // Set up periodic checks
    const checkInterval = setInterval(() => {
      checkForServiceWorkerUpdates().then(hasUpdate => {
        if (hasUpdate) {
          setUpdateAvailable(true);
        }
      });
    }, 60 * 60 * 1000); // Check once per hour
    
    return () => {
      window.removeEventListener('serviceWorkerUpdated', handleServiceWorkerUpdated);
      clearInterval(checkInterval);
    };
  }, []);
  
  // Show update notification when available
  useEffect(() => {
    if (updateAvailable) {
      toast(
        <div className="flex flex-col space-y-2">
          <div className="font-medium">Application update available!</div>
          <div>A new version of the app is ready to install.</div>
          <Button 
            size="sm" 
            onClick={() => {
              updateServiceWorker();
              toast.success('Updating application...');
            }}
            className="flex items-center justify-center mt-1"
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Update Now
          </Button>
        </div>,
        {
          duration: 0, // Don't auto-dismiss
          id: 'app-update-toast'
        }
      );
    }
  }, [updateAvailable]);
  
  // This component doesn't render anything, it just manages the update notification
  return null;
}

export default UpdateNotification;
