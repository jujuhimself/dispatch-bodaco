
import { toast } from 'sonner';
import { processPendingSyncRequests } from '@/services/indexed-db-service';

// Track online status changes
let wasOffline = false;

/**
 * Initialize network status monitoring and handle reconnection events
 */
export function initNetworkStatusMonitoring() {
  // Initial state check
  wasOffline = !navigator.onLine;
  
  // Handle online event
  window.addEventListener('online', () => {
    if (wasOffline) {
      handleReconnection();
    }
    wasOffline = false;
  });
  
  // Handle offline event
  window.addEventListener('offline', () => {
    wasOffline = true;
    toast.warning('You are offline. Some features may be limited.');
  });
  
  // Process any pending sync requests on load if online
  if (navigator.onLine) {
    processPendingSyncRequests().catch(error => {
      console.error('Error processing pending sync requests:', error);
    });
  }
}

/**
 * Handles reconnection events to sync data and update UI
 */
async function handleReconnection() {
  toast.success('You are back online!');
  
  try {
    // Process any pending sync operations
    await processPendingSyncRequests();
    
    // Notify application parts that might need to refresh data
    window.dispatchEvent(new CustomEvent('app:reconnected'));
    
    // Reload critical data
    // queryClient.invalidateQueries(...) - would go here if we had access to queryClient
  } catch (error) {
    console.error('Error during reconnection handling:', error);
    toast.error('Error syncing data after reconnecting');
  }
}

/**
 * Check if the device has an active internet connection
 * More reliable than just navigator.onLine 
 * as it actually attempts to reach a server
 */
export async function checkInternetConnectivity(): Promise<boolean> {
  try {
    // Try to fetch a small file from a reliable CDN
    const response = await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    return response.type === 'opaque' || response.status === 200;
  } catch (error) {
    return false;
  }
}

export default {
  initNetworkStatusMonitoring,
  checkInternetConnectivity
};
