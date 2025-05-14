
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/types/notification-types';

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, clearAll, clearOne } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.notification-center') && !target.closest('.notification-trigger')) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="notification-trigger relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emergency-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="notification-center absolute right-0 mt-2 w-80 sm:w-96 z-50 animate-fade-in">
          <Card className="border shadow-lg">
            <CardHeader className="pb-2 pt-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear all
                </Button>
              </div>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                    {unreadCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-emergency-100 text-emergency-500"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="px-2">
              <ScrollArea className="h-[300px] px-2">
                <TabsContent value="all" className="m-0">
                  <NotificationList 
                    notifications={notifications} 
                    onClear={clearOne} 
                    onMarkAsRead={markAsRead}
                  />
                </TabsContent>
                <TabsContent value="unread" className="m-0">
                  <NotificationList 
                    notifications={notifications.filter(n => !n.read)} 
                    onClear={clearOne} 
                    onMarkAsRead={markAsRead}
                  />
                </TabsContent>
                <TabsContent value="alerts" className="m-0">
                  <NotificationList 
                    notifications={notifications.filter(n => n.type === 'alert')} 
                    onClear={clearOne} 
                    onMarkAsRead={markAsRead}
                  />
                </TabsContent>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-3">
              <Button variant="ghost" size="sm" className="text-xs flex items-center">
                <Settings className="h-3 w-3 mr-1" />
                Preferences
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setOpen(false)}>
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClear: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onClear, onMarkAsRead }: NotificationItemProps) => {
  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (60 * 1000));
    const diffInHours = Math.floor(diffInMs / (60 * 60 * 1000));
    const diffInDays = Math.floor(diffInMs / (24 * 60 * 60 * 1000));

    if (diffInMins < 60) {
      return `${diffInMins} min${diffInMins !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className={cn(
      "group px-3 py-2 rounded-md transition-colors mb-1 border-l-2",
      notification.read 
        ? "border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-900" 
        : "border-l-emergency-500 bg-emergency-50 dark:bg-emergency-950/20"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-2">
          <h4 className={cn(
            "text-sm font-medium",
            notification.read ? "" : "font-semibold"
          )}>
            {notification.title}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-400">{timeAgo(notification.createdAt)}</span>
            {notification.type === 'alert' && (
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-500 border-red-200 text-[10px] px-1 py-0">
                Alert
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onClear(notification.id)}
          >
            <X className="h-3 w-3" />
          </Button>
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onClear: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationList = ({ notifications, onClear, onMarkAsRead }: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-base font-medium text-gray-600">No notifications</h3>
        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onClear={onClear}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};
