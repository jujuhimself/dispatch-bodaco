
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Smartphone, AlertTriangle, Activity, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchIoTDevices } from '@/services/iot-service';
import { formatDistanceToNow } from 'date-fns';

const IoTDevices = () => {
  const { 
    data: devices, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['iotDevices'],
    queryFn: () => fetchIoTDevices(), // Wrap in anonymous function to be consistent
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getDeviceStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-gray-500';
      case 'alert':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatLastActive = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">IoT Devices</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading IoT devices:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">IoT Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading IoT devices</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">IoT Devices</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        {devices && devices.length > 0 ? (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <Avatar className="bg-primary/10">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </Avatar>
                  <div className="ml-3">
                    <div className="font-medium flex items-center">
                      {device.name}
                      <span className={`ml-2 h-2 w-2 rounded-full ${getDeviceStatusClass(device.status || 'inactive')}`}></span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {device.type} • {device.device_id}
                    </div>
                    <div className="text-xs flex items-center text-gray-500 mt-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Last active: {formatLastActive(device.last_heartbeat)}
                    </div>
                    {device.location && (
                      <div className="text-xs flex items-center text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        Location: {device.location.x.toFixed(4)}, {device.location.y.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No IoT devices registered
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IoTDevices;
