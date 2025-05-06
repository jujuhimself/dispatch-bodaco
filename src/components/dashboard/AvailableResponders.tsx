
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PhoneCall, MapPin, Send, Ambulance, CarTaxiFront, Car } from 'lucide-react';

const responders = [
  {
    id: "A-01",
    name: "Ambulance 01",
    type: "ambulance",
    location: "Oyster Bay",
    status: "available",
    lastActive: "2 mins ago"
  },
  {
    id: "B-03",
    name: "Bajaj 03",
    type: "bajaj",
    location: "Mwenge",
    status: "available",
    lastActive: "5 mins ago"
  },
  {
    id: "T-02",
    name: "Traffic Officer T-02",
    type: "traffic",
    location: "Mlimani City",
    status: "available",
    lastActive: "Just now"
  },
  {
    id: "A-04",
    name: "Ambulance 04",
    type: "ambulance",
    location: "Kawe",
    status: "on_call",
    lastActive: "15 mins ago"
  }
];

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

const AvailableResponders = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Available Responders</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {responders.map((responder) => (
            <div key={responder.id} className="p-3 rounded-lg border border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${responder.type === 'ambulance' ? 'bg-medical-100 text-medical-500' : responder.type === 'bajaj' ? 'bg-orange-100 text-orange-500' : 'bg-purple-100 text-purple-500'}`}>
                  {getResponderIcon(responder.type)}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm flex items-center">
                    {responder.name}
                    <span className={`ml-2 h-2 w-2 rounded-full ${getStatusColor(responder.status)}`}></span>
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {responder.location}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableResponders;
