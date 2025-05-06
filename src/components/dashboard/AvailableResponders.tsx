
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PhoneCall, MapPin, Ambulance, CarTaxiFront, Car, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAvailableResponders } from '@/services/emergency-service';
import { formatDistanceToNow } from 'date-fns';

const getResponderIcon = (type: string) => {
  switch (type) {
    case 'ambulance':
      return <Ambulance className="h-4 w-4" />;
    case 'bajaj':
      return <CarTaxiFront className="h-4 w-4" />;
    case 'traffic':
      return <Car className="h-4 w-4" />;
    default:
      return <Ambulance className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-500';
    case 'on_call':
      return 'bg-yellow-500';
    case 'off_duty':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getResponderTypeStyle = (type: string) => {
  switch (type) {
    case 'ambulance':
      return 'bg-medical-100 text-medical-500';
    case 'bajaj':
      return 'bg-orange-100 text-orange-500';
    case 'traffic':
      return 'bg-purple-100 text-purple-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const AvailableResponders = () => {
  const { 
    data: responders, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['availableResponders'],
    queryFn: fetchAvailableResponders,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getLastActive = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Available Responders</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading responders:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Available Responders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading responders</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Available Responders</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {responders && responders.length > 0 ? (
            responders.map((responder) => (
              <div key={responder.id} className="p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${getResponderTypeStyle(responder.type)}`}>
                    {getResponderIcon(responder.type)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-sm flex items-center">
                      {responder.name}
                      <span className={`ml-2 h-2 w-2 rounded-full ${getStatusColor(responder.status)}`}></span>
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {responder.current_location || 'Unknown location'}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" /> Locate
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-emergency-600 hover:text-emergency-700 hover:bg-emergency-50">
                    <PhoneCall className="h-3 w-3 mr-1" /> Call
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No available responders at the moment
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableResponders;
