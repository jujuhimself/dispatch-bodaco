
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  userId?: string;
  metadata?: Record<string, any>;
  link?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    emergencies: boolean;
    system: boolean;
    reports: boolean;
    responders: boolean;
  };
}
