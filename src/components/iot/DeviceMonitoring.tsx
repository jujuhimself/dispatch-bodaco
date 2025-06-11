
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Wifi, WifiOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IoTDevice {
  id: string;
  name: string;
  device_id: string;
  type: string;
  status: string;
  location?: { x: number; y: number };
  last_heartbeat?: string;
  metadata?: any;
}

interface DeviceAlert {
  id: string;
  device_id: string;
  alert_type: string;
  severity: number;
  processed: boolean;
  created_at: string;
  data: any;
}

export const DeviceMonitoring = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
    fetchAlerts();

    // Set up real-time subscriptions
    const deviceChannel = supabase
      .channel('device-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'iot_devices'
        },
        () => fetchDevices()
      )
      .subscribe();

    const alertChannel = supabase
      .channel('device-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'device_alerts'
        },
        (payload) => {
          const newAlert = payload.new as DeviceAlert;
          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
          toast.warning(`New alert from ${newAlert.alert_type} device`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(deviceChannel);
      supabase.removeChannel(alertChannel);
    };
  }, []);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*')
        .order('last_heartbeat', { ascending: false });

      if (error) throw error;

      const transformedDevices = data.map(device => ({
        ...device,
        location: device.location ? {
          x: parseFloat(device.location.toString().split('(')[1].split(',')[0]),
          y: parseFloat(device.location.toString().split(',')[1].split(')')[0])
        } : undefined
      }));

      setDevices(transformedDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('device_alerts')
        .select('*')
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceStatusIcon = (device: IoTDevice) => {
    if (!device.last_heartbeat) return <WifiOff className="h-4 w-4 text-gray-500" />;
    
    const lastHeartbeat = new Date(device.last_heartbeat);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) return <Wifi className="h-4 w-4 text-green-500" />;
    if (diffMinutes < 15) return <Wifi className="h-4 w-4 text-yellow-500" />;
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getDeviceStatusText = (device: IoTDevice) => {
    if (!device.last_heartbeat) return 'Never connected';
    
    const lastHeartbeat = new Date(device.last_heartbeat);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);
    
    if (diffMinutes < 1) return 'Online';
    if (diffMinutes < 5) return `${Math.floor(diffMinutes)}m ago`;
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-red-100 text-red-800';
    if (severity >= 3) return 'bg-orange-100 text-orange-800';
    if (severity >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const processAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('device_alerts')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alert processed');
    } catch (error) {
      console.error('Error processing alert:', error);
      toast.error('Failed to process alert');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>IoT Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* IoT Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            IoT Devices ({devices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getDeviceStatusIcon(device)}
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-gray-600">{device.type}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                  {device.status}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {getDeviceStatusText(device)}
                </p>
              </div>
            </div>
          ))}
          
          {devices.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No IoT devices registered</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <Alert key={alert.id} className="relative">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityColor(alert.severity)}>
                      Severity {alert.severity}
                    </Badge>
                    <span className="text-sm font-medium">{alert.alert_type}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => processAlert(alert.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <p>No active alerts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
