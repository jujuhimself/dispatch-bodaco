
import { toast } from 'sonner';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.showInstallNotification();
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      toast.success('Emergency Response app installed successfully!');
    });

    // Handle offline/online status
    window.addEventListener('online', () => {
      toast.success('Connection restored');
    });

    window.addEventListener('offline', () => {
      toast.warning('You are now offline. Some features may be limited.');
    });
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      toast.error('App installation not available on this device');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast.success('Installing Emergency Response app...');
        this.deferredPrompt = null;
        return true;
      } else {
        toast.info('App installation cancelled');
        return false;
      }
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error('Failed to install app');
      return false;
    }
  }

  private showInstallNotification() {
    toast.info('Install Emergency Response app for quick access', {
      action: {
        label: 'Install',
        onClick: () => this.installApp()
      },
      duration: 8000
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  getInstallStatus(): boolean {
    return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
  }

  // Cache management for offline functionality
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      toast.success('Cache cleared successfully');
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }
}

export const pwaService = new PWAService();
