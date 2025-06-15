
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, WifiOff, Battery, Thermometer, Gauge, MapPin,
  Plus, Settings, RefreshCw, AlertTriangle, CheckCircle
} from 'lucide-react';

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'camera' | 'beacon' | 'monitor';
  status: 'online' | 'offline' | 'warning';
  location: string;
  battery: number;
  lastSeen: string;
  data?: any;
}

const IoTDeviceManagement = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([
    {
      id: '1',
      name: 'Downtown Sensor Hub',
      type: 'sensor',
      status: 'online',
      location: 'Main St & 5th Ave',
      battery: 85,
      lastSeen: '2 min ago',
      data: { temperature: 22, humidity: 65, airQuality: 'Good' }
    },
    {
      id: '2',
      name: 'Hospital Entrance Camera',
      type: 'camera',
      status: 'online',
      location: 'City General Hospital',
      battery: 92,
      lastSeen: '1 min ago'
    },
    {
      id: '3',
      name: 'Emergency Beacon #12',
      type: 'beacon',
      status: 'warning',
      location: 'Highway 101 Mile 23',
      battery: 15,
      lastSeen: '45 min ago'
    },
    {
      id: '4',
      name: 'Traffic Monitor Alpha',
      type: 'monitor',
      status: 'offline',
      location: 'Interstate Junction',
      battery: 0,
      lastSeen: '3 hours ago'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
    }
  };

  const getBatteryIcon = (battery: number) => {
    if (battery > 20) {
      return <Battery className="h-4 w-4 text-green-500" />;
    }
    return <Battery className="h-4 w-4 text-red-500" />;
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deviceCounts = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    warning: devices.filter(d => d.status === 'warning').length,
    offline: devices.filter(d => d.status === 'offline').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">IoT Device Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Device Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{deviceCounts.total}</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{deviceCounts.online}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{deviceCounts.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">{deviceCounts.offline}</p>
              </div>
              <WifiOff className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-4">
            {filteredDevices.map((device) => (
              <Card key={device.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(device.status)}
                        <div>
                          <h3 className="font-medium">{device.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{device.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {getBatteryIcon(device.battery)}
                        <span className="text-sm">{device.battery}%</span>
                      </div>
                      
                      <Badge className={getStatusColor(device.status)}>
                        {device.status}
                      </Badge>
                      
                      <span className="text-sm text-muted-foreground">
                        {device.lastSeen}
                      </span>
                      
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {device.data && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex space-x-6 text-sm">
                        {device.data.temperature && (
                          <div className="flex items-center space-x-1">
                            <Thermometer className="h-4 w-4" />
                            <span>{device.data.temperature}°C</span>
                          </div>
                        )}
                        {device.data.humidity && (
                          <div className="flex items-center space-x-1">
                            <Gauge className="h-4 w-4" />
                            <span>{device.data.humidity}% humidity</span>
                          </div>
                        )}
                        {device.data.airQuality && (
                          <div className="flex items-center space-x-1">
                            <span>Air Quality: {device.data.airQuality}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Sensor Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Gauge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Real-time sensor data visualization would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Device Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Low Battery Warning</p>
                      <p className="text-sm text-muted-foreground">Emergency Beacon #12 - 15% battery remaining</p>
                    </div>
                  </div>
                  <Badge variant="secondary">30 min ago</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <WifiOff className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Device Offline</p>
                      <p className="text-sm text-muted-foreground">Traffic Monitor Alpha lost connection</p>
                    </div>
                  </div>
                  <Badge variant="secondary">3 hours ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoTDeviceManagement;
