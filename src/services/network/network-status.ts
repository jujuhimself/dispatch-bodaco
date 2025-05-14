
import { create } from 'zustand';
import { toast } from 'sonner';

interface NetworkState {
  online: boolean;
  connectionType: string | null;
  saveDataMode: boolean;
  lastChecked: Date | null;
  checkConnection: () => Promise<boolean>;
}

export const useNetworkStatus = create<NetworkState>((set, get) => ({
  online: navigator.onLine,
  connectionType: (navigator as any).connection?.type || null,
  saveDataMode: (navigator as any).connection?.saveData || false,
  lastChecked: null,
  
  checkConnection: async () => {
    try {
      // Try to fetch a small file to verify actual connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const online = response.ok;
      set({ 
        online, 
        lastChecked: new Date(),
        connectionType: (navigator as any).connection?.type || null,
        saveDataMode: (navigator as any).connection?.saveData || false
      });
      
      return online;
    } catch (error) {
      // If fetch fails, we're offline
      set({ 
        online: false,
        lastChecked: new Date() 
      });
      return false;
    }
  }
}));

// Setup network status listeners
export function initializeNetworkListeners() {
  const { checkConnection } = useNetworkStatus.getState();
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    useNetworkStatus.setState({ online: true });
    toast.success('You are back online');
    // Verify connection is actually working
    checkConnection();
  });
  
  window.addEventListener('offline', () => {
    useNetworkStatus.setState({ online: false });
    toast.error('You are offline. Some features may be unavailable.');
  });
  
  // Listen for connection changes (if supported)
  if ((navigator as any).connection) {
    (navigator as any).connection.addEventListener('change', () => {
      useNetworkStatus.setState({
        connectionType: (navigator as any).connection?.type || null,
        saveDataMode: (navigator as any).connection?.saveData || false
      });
    });
  }
  
  // Initial check
  checkConnection();
}
