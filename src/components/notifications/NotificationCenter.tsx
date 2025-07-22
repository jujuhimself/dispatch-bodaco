import React, { useState, useEffect } from 'react';
import { Bell, Settings, X, Check, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { notificationService, NotificationSettings } from '@/services/notification-service';
import { useToast } from '@/hooks/use-toast';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [unreadCount] = useState(0); // TODO: Implement unread count from actual notifications
  const { toast } = useToast();

  useEffect(() => {
    setPermission(notificationService.getPermissionStatus());
    
    // Setup real-time notifications when component mounts
    notificationService.setupRealTimeNotifications();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  const handleRequestPermission = async () => {
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        toast.success("Notifications Enabled", {
          description: "You'll now receive push notifications for emergency alerts."
        });
      } else {
        toast.error("Notifications Blocked", {
          description: "Please enable notifications in your browser settings."
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to enable notifications."
      });
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
    
    toast.success("Settings Updated", {
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}.`
    });
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.testNotification();
      toast.success("Test Sent", {
        description: "Check for the test notification!"
      });
    } catch (error) {
      toast.error("Test Failed", {
        description: "Unable to send test notification."
      });
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Enabled', color: 'bg-green-500' };
      case 'denied':
        return { text: 'Blocked', color: 'bg-red-500' };
      default:
        return { text: 'Not Set', color: 'bg-yellow-500' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative ${className}`}
          aria-label="Notification center"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${permissionStatus.color}`} />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status: {permissionStatus.text}</span>
              <div className={`h-2 w-2 rounded-full ${permissionStatus.color}`} />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {permission !== 'granted' && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Enable push notifications to receive real-time emergency alerts, assignment updates, and communication messages.
                </div>
                <Button onClick={handleRequestPermission} className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
              </div>
            )}

            {permission === 'granted' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Notifications Active
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestNotification}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                </div>

                {showSettings && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Notification Settings</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emergency-alerts" className="text-sm">
                            Emergency Alerts
                          </Label>
                          <Switch
                            id="emergency-alerts"
                            checked={settings.emergencyAlerts}
                            onCheckedChange={(checked) => handleSettingChange('emergencyAlerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="assignment-notifications" className="text-sm">
                            Assignment Updates
                          </Label>
                          <Switch
                            id="assignment-notifications"
                            checked={settings.assignmentNotifications}
                            onCheckedChange={(checked) => handleSettingChange('assignmentNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="communication-updates" className="text-sm">
                            Messages
                          </Label>
                          <Switch
                            id="communication-updates"
                            checked={settings.communicationUpdates}
                            onCheckedChange={(checked) => handleSettingChange('communicationUpdates', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-updates" className="text-sm">
                            System Updates
                          </Label>
                          <Switch
                            id="system-updates"
                            checked={settings.systemUpdates}
                            onCheckedChange={(checked) => handleSettingChange('systemUpdates', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <Label htmlFor="sound" className="text-sm">
                            Sound
                          </Label>
                          <Switch
                            id="sound"
                            checked={settings.sound}
                            onCheckedChange={(checked) => handleSettingChange('sound', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="vibration" className="text-sm">
                            Vibration
                          </Label>
                          <Switch
                            id="vibration"
                            checked={settings.vibration}
                            onCheckedChange={(checked) => handleSettingChange('vibration', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {permission === 'denied' && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Notifications are blocked. To enable them:
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>1. Click the lock icon in your browser's address bar</div>
                  <div>2. Set "Notifications" to "Allow"</div>
                  <div>3. Refresh this page</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};