
/**
 * Service worker registration and management
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
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('ServiceWorker registration successful with scope:', registration.scope);
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
