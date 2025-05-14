
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNetworkStatus } from '@/services/network/network-status';

/**
 * Hook that provides network awareness features and notifications
 * for components that need to react to online/offline status
 */
export function useNetworkAwareness(options: {
  showToasts?: boolean;
  onOnline?: () => void;
  onOffline?: () => void;
} = {}) {
  const { online } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    showToasts = true, 
    onOnline,
    onOffline
  } = options;
  
  // Custom handler for online status
  const handleOnlineStatus = useCallback(() => {
    if (wasOffline && online && showToasts) {
      toast.success("You're back online!");
    }
    
    if (wasOffline && online && onOnline) {
      onOnline();
    }
    
    if (online) {
      setWasOffline(false);
    }
  }, [online, wasOffline, showToasts, onOnline]);
  
  // Custom handler for offline status
  const handleOfflineStatus = useCallback(() => {
    if (!wasOffline && !online && showToasts) {
      toast.warning("You're offline. Some features may be limited.", {
        duration: 5000
      });
    }
    
    if (!online) {
      setWasOffline(true);
      
      if (onOffline) {
        onOffline();
      }
    }
  }, [online, wasOffline, showToasts, onOffline]);
  
  // Effect to handle status changes
  useEffect(() => {
    // Skip first render to avoid showing toasts on initial load
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }
    
    if (online) {
      handleOnlineStatus();
    } else {
      handleOfflineStatus();
    }
  }, [online, isInitialized, handleOnlineStatus, handleOfflineStatus]);
  
  // Public API
  return {
    online,
    wasOffline,
    isInitialized
  };
}

export default useNetworkAwareness;
