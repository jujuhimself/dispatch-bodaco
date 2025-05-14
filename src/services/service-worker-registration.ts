
/**
 * Service worker registration and management
 * Enhanced with better error handling and update flow
 */

// Check if service workers are supported
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

// Register service worker for the application
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.warn('Service workers are not supported by this browser');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    console.log('ServiceWorker registration successful with scope:', registration.scope);
    
    // Set up update handler
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;
      
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // At this point, the old content will have been purged and
            // the fresh content will have been added to the cache.
            console.log('New content is available; please refresh.');
            
            // Dispatch event to notify the app about the update
            window.dispatchEvent(new CustomEvent('serviceWorkerUpdated', {
              detail: { registration }
            }));
          } else {
            // At this point, everything has been precached.
            console.log('Content is cached for offline use.');
            
            // Dispatch event to notify the app about successful caching
            window.dispatchEvent(new CustomEvent('serviceWorkerCached'));
          }
        }
      };
    };
    
    return registration;
  } catch (error) {
    console.error('ServiceWorker registration failed:', error);
    return null;
  }
}

// Check if a service worker update is available
export async function checkForServiceWorkerUpdates(): Promise<boolean> {
  if (!isServiceWorkerSupported()) return false;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    
    await registration.update();
    return registration.waiting !== null;
  } catch (error) {
    console.error('Error checking for service worker updates:', error);
    return false;
  }
}

// Force update the service worker
export function updateServiceWorker(): void {
  if (!isServiceWorkerSupported()) return;
  
  navigator.serviceWorker.getRegistration().then(registration => {
    if (!registration || !registration.waiting) return;
    
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page to activate the new service worker
    window.location.reload();
  });
}

// Send message to active service worker
export function sendMessageToServiceWorker(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!isServiceWorkerSupported()) {
      reject(new Error('Service workers not supported'));
      return;
    }
    
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };
    
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    } else {
      reject(new Error('No active service worker found'));
    }
  });
}

// Set up service worker update notification
export function setupUpdateNotification(onUpdateAvailable: () => void): void {
  window.addEventListener('serviceWorkerUpdated', () => {
    onUpdateAvailable();
  });
}

// Register background sync for offline operations
export async function registerBackgroundSync(syncTag: string): Promise<boolean> {
  if (!isServiceWorkerSupported() || !('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Background sync not supported');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(syncTag);
    return true;
  } catch (error) {
    console.error('Error registering background sync:', error);
    return false;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return Notification.permission;
  }
  
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return Notification.permission;
  }
}

// Helper to show app update notification
export function showUpdateNotification() {
  if (!isServiceWorkerSupported() || Notification.permission !== 'granted') return;
  
  const options = {
    body: 'A new version of the application is available. Click to update.',
    icon: '/ambulance-icon.png',
    tag: 'app-update'
  };
  
  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification('Update Available', options);
  });
}

