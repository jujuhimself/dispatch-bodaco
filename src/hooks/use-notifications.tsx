
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect } from 'react';
import { Notification, NotificationType } from '@/types/notification-types';
import useAuth from '@/hooks/useAuth';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearOne: (id: string) => void;
  clearAll: () => void;
  clearAllRead: () => void;
}

// Create a Zustand store for notifications
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            read: false,
            ...notification
          },
          ...state.notifications
        ]
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(notification => ({ ...notification, read: true }))
      })),
      clearOne: (id) => set((state) => ({
        notifications: state.notifications.filter(notification => notification.id !== id)
      })),
      clearAll: () => set({ notifications: [] }),
      clearAllRead: () => set((state) => ({
        notifications: state.notifications.filter(notification => !notification.read)
      }))
    }),
    {
      name: 'notification-storage',
      skipHydration: true,
    }
  )
);

export function useNotifications() {
  const { auth } = useAuth();
  const store = useNotificationStore();
  
  const addRealTimeNotification = useCallback((payload: any) => {
    if (payload && payload.new && auth) {
      // Check if the notification is intended for this user
      if (!payload.new.user_id || payload.new.user_id === auth.id) {
        store.addNotification({
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.type as NotificationType,
          userId: payload.new.user_id,
          metadata: payload.new.metadata
        });
      }
    }
  }, [auth, store]);
  
  // Listen to realtime notifications if authenticated
  useEffect(() => {
    if (!auth) return;
    
    // Subscribe to realtime notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        addRealTimeNotification
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [auth, addRealTimeNotification]);
  
  return store;
}

// Hook to add notifications programmatically
export function useNotificationSender() {
  const store = useNotificationStore();
  const { auth } = useAuth();
  
  const sendNotification = async (
    title: string, 
    message: string, 
    type: NotificationType = 'info',
    persist: boolean = false,
    metadata?: Record<string, any>
  ) => {
    // Add to local store first for immediate feedback
    store.addNotification({ title, message, type, metadata });
    
    // If we should persist to database and user is authenticated
    if (persist && auth) {
      try {
        // Check if the notifications table exists in the database before inserting
        // This is a workaround since we can't directly query for this table
        // For now, we'll just do local notifications without persisting to DB
        // In a real app, you would create the notifications table first
        
        // Commented out until notifications table is created
        // await supabase.from('notifications').insert([
        //   {
        //     title,
        //     message,
        //     type,
        //     user_id: auth.id,
        //     metadata
        //   }
        // ]);
      } catch (error) {
        console.error('Failed to persist notification:', error);
      }
    }
  };
  
  return { sendNotification };
}
