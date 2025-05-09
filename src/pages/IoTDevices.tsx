
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Smartphone, AlertCircle } from 'lucide-react';
import IoTDevices from '@/components/iot/IoTDevices';
import DeviceAlerts from '@/components/iot/DeviceAlerts';
import { useAuth } from '@/contexts/AuthContext';

const IoTDevicesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('devices');
  
  const canManageDevices = user?.role === 'admin' || user?.role === 'dispatcher';
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">IoT Devices & Alerts</h1>
        
        {canManageDevices && (
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-1" />
            Register New Device
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="devices" className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Devices
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Alerts
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="devices">
                  <IoTDevices />
                </TabsContent>
                <TabsContent value="alerts">
                  <DeviceAlerts />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Device Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Total Devices</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Active Devices</div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Recent Alerts</div>
                  <div className="text-2xl font-bold text-red-600">0</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                View Analytics
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">Device Registration</Button>
                <Button variant="outline" className="w-full justify-start">Alert Configuration</Button>
                <Button variant="outline" className="w-full justify-start">System Status</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IoTDevicesPage;
