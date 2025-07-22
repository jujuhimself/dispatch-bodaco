import { supabase } from '@/integrations/supabase/client';

interface NotificationActionType {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationActionType[];
  requireInteraction?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface NotificationSettings {
  enabled: boolean;
  emergencyAlerts: boolean;
  assignmentNotifications: boolean;
  communicationUpdates: boolean;
  systemUpdates: boolean;
  sound: boolean;
  vibration: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';
  private settings: NotificationSettings;

  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.settings = this.loadSettings();
    this.init();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if (this.isSupported && this.permission === 'granted') {
      await this.registerServiceWorker();
    }
  }

  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;

    if (permission === 'granted') {
      await this.registerServiceWorker();
    }

    return permission;
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.canShowNotification(payload.priority)) {
      return;
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const options: any = {
      body: payload.body,
      icon: payload.icon || '/ambulance-icon.png',
      badge: payload.badge || '/ambulance-icon.png',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.requireInteraction || payload.priority === 'critical',
      silent: !this.settings.sound
    };

    // Add actions if supported
    if (payload.actions && payload.actions.length > 0) {
      options.actions = payload.actions;
    }

    // Add vibration if supported and enabled
    if (this.settings.vibration && 'vibrate' in navigator) {
      (options as any).vibrate = [200, 100, 200];
    }

    // For critical notifications, ensure they are persistent
    if (payload.priority === 'critical') {
      options.requireInteraction = true;
      options.silent = false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(payload.title, options);
    } catch (error) {
      console.error('Failed to show notification:', error);
      // Fallback to basic notification
      new Notification(payload.title, options);
    }
  }

  private canShowNotification(priority?: string): boolean {
    if (!this.settings.enabled) return false;

    // Always show critical notifications
    if (priority === 'critical') return true;

    return this.permission === 'granted';
  }

  // Emergency-specific notification methods
  async notifyEmergencyCreated(emergency: any): Promise<void> {
    if (!this.settings.emergencyAlerts) return;

    await this.showNotification({
      title: '🚨 New Emergency Alert',
      body: `${emergency.type} reported at ${emergency.location}`,
      tag: `emergency-${emergency.id}`,
      priority: 'critical',
      requireInteraction: true,
      data: { emergencyId: emergency.id, type: 'emergency_created' },
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'assign', title: 'Assign Responder' }
      ]
    });
  }

  async notifyResponderAssigned(assignment: any): Promise<void> {
    if (!this.settings.assignmentNotifications) return;

    await this.showNotification({
      title: '👨‍🚒 Responder Assigned',
      body: `Emergency ${assignment.emergency_id} has been assigned to a responder`,
      tag: `assignment-${assignment.id}`,
      priority: 'high',
      data: { assignmentId: assignment.id, type: 'responder_assigned' }
    });
  }

  async notifyNewMessage(message: any): Promise<void> {
    if (!this.settings.communicationUpdates) return;

    await this.showNotification({
      title: '💬 New Message',
      body: `${message.sender}: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`,
      tag: `message-${message.id}`,
      priority: 'normal',
      data: { messageId: message.id, type: 'new_message' }
    });
  }

  async notifyStatusUpdate(emergency: any): Promise<void> {
    if (!this.settings.emergencyAlerts) return;

    const statusEmoji = {
      'pending': '⏳',
      'assigned': '👨‍🚒',
      'en_route': '🚑',
      'on_scene': '🏥',
      'resolved': '✅'
    };

    await this.showNotification({
      title: `${statusEmoji[emergency.status as keyof typeof statusEmoji] || '📋'} Emergency Status Updated`,
      body: `Emergency at ${emergency.location} is now ${emergency.status}`,
      tag: `status-${emergency.id}`,
      priority: 'normal',
      data: { emergencyId: emergency.id, type: 'status_update' }
    });
  }

  // Settings management
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }

    return {
      enabled: true,
      emergencyAlerts: true,
      assignmentNotifications: true,
      communicationUpdates: true,
      systemUpdates: true,
      sound: true,
      vibration: true
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  // Real-time subscription setup
  setupRealTimeNotifications(): void {
    // Emergency notifications
    supabase
      .channel('emergency-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergencies' },
        (payload) => this.notifyEmergencyCreated(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergencies' },
        (payload) => this.notifyStatusUpdate(payload.new)
      )
      .subscribe();

    // Assignment notifications
    supabase
      .channel('assignment-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_assignments' },
        (payload) => this.notifyResponderAssigned(payload.new)
      )
      .subscribe();

    // Communication notifications
    supabase
      .channel('communication-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'communications' },
        (payload) => this.notifyNewMessage(payload.new)
      )
      .subscribe();
  }

  // Cleanup
  cleanup(): void {
    supabase.removeAllChannels();
  }

  // Utility methods
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  async testNotification(): Promise<void> {
    await this.showNotification({
      title: '🔔 Test Notification',
      body: 'Push notifications are working correctly!',
      tag: 'test-notification',
      priority: 'normal'
    });
  }
}

export const notificationService = NotificationService.getInstance();