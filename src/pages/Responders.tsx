
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Phone, MapPin, Activity, Ambulance, Car, AlertTriangle } from 'lucide-react';
import { fetchResponders } from '@/services/emergency-service';
import { Responder } from '@/types/emergency-types';

const Responders: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: responders, isLoading, error } = useQuery({
    queryKey: ['responders'],
    queryFn: fetchResponders,
    refetchInterval: 30000
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'on_call':
        return <Badge className="bg-blue-100 text-blue-800">On Call</Badge>;
      case 'off_duty':
        return <Badge className="bg-gray-100 text-gray-800">Off Duty</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return <Ambulance className="h-4 w-4" />;
      case 'bajaj':
        return <Car className="h-4 w-4" />;
      case 'traffic':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const filterResponders = (data: Responder[] | undefined): Responder[] => {
    if (!data) return [];
    
    switch (activeTab) {
      case 'available':
        return data.filter(r => r.status === 'available');
      case 'on_call':
        return data.filter(r => r.status === 'on_call');
      case 'off_duty':
        return data.filter(r => r.status === 'off_duty');
      default:
        return data;
    }
  };

  const filteredResponders = filterResponders(responders);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading responders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-red-600">
          Error loading responders: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Responders</h1>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-500" />
          <span className="text-sm text-gray-600">
            {responders?.filter(r => r.status === 'available').length || 0} Available
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Responders</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="on_call">On Call</TabsTrigger>
          <TabsTrigger value="off_duty">Off Duty</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResponders.map((responder) => (
              <Card key={responder.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      {getTypeIcon(responder.type)}
                      <span className="ml-2">{responder.name}</span>
                    </CardTitle>
                    {getStatusBadge(responder.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Badge variant="outline" className="mr-2">
                      {responder.type}
                    </Badge>
                    <span>Type</span>
                  </div>
                  
                  {responder.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {responder.phone}
                    </div>
                  )}
                  
                  {responder.current_location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {responder.current_location}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Last Active: {new Date(responder.last_active).toLocaleString()}
                  </div>
                  
                  {responder.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {responder.notes}
                    </div>
                  )}
                  
                  <div className="pt-2 flex space-x-2">
                    {responder.phone && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="flex-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      Locate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredResponders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No responders found for this status</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Responders;
