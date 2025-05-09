
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, MapPin, Activity } from 'lucide-react';
import RealTimeTracking from '@/components/tracking/RealTimeTracking';
import { Link } from 'react-router-dom';

const ResponderTrackingPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('list');
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Responder Tracking</h1>
        <Link to="/responders">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Responders
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Map View
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Activity Log
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="list">
                  <RealTimeTracking />
                </TabsContent>
                <TabsContent value="map">
                  <div className="h-[500px] bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-500">Map view coming soon</p>
                  </div>
                </TabsContent>
                <TabsContent value="activity">
                  <div className="h-[500px] bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-500">Activity log coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Responder Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-md bg-gray-50">
                  <div className="text-sm text-gray-500">Available</div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                </div>
                
                <div className="p-3 rounded-md bg-gray-50">
                  <div className="text-sm text-gray-500">On Call</div>
                  <div className="text-2xl font-bold text-orange-600">0</div>
                </div>
                
                <div className="p-3 rounded-md bg-gray-50">
                  <div className="text-sm text-gray-500">Off Duty</div>
                  <div className="text-2xl font-bold text-gray-600">0</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                Dispatch Console
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResponderTrackingPage;
