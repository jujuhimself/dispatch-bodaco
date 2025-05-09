
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Info, Smartphone } from 'lucide-react';
import DeviceRegistrationForm from '@/components/iot/DeviceRegistrationForm';
import { Link } from 'react-router-dom';

const DeviceRegistrationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Device Registration</h1>
        <Link to="/iot">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to IoT Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DeviceRegistrationForm />
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700">Device ID Format</h3>
                    <p className="text-sm text-blue-600">
                      Device IDs should follow the format: IOT-XXXXXX,
                      where X is an alphanumeric character.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-md border border-green-100">
                <div className="flex items-start">
                  <Smartphone className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-700">Supported Devices</h3>
                    <p className="text-sm text-green-600">
                      This system supports various IoT devices including sensors,
                      trackers, medical devices, cameras, and alarms.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeviceRegistrationPage;
