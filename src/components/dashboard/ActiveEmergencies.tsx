
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PhoneCall, MapPin, Send } from 'lucide-react';

const emergencyData = [
  {
    id: "EM-2023-05",
    type: "Traffic Accident",
    location: "Mabibo, Ubungo District",
    timeElapsed: "4 mins ago",
    status: "pending",
    responders: []
  },
  {
    id: "EM-2023-04",
    type: "Medical Emergency",
    location: "Sinza, Kinondoni District",
    timeElapsed: "12 mins ago",
    status: "assigned",
    responders: [
      { id: 1, name: "Ambulance 04", eta: "5 mins" }
    ]
  },
  {
    id: "EM-2023-03",
    type: "Building Fire",
    location: "Kariakoo, Ilala District",
    timeElapsed: "18 mins ago",
    status: "in-transit",
    responders: [
      { id: 2, name: "Ambulance 02", eta: "On site" },
      { id: 3, name: "Traffic Officer T-05", eta: "On site" }
    ]
  }
];

const ActiveEmergencies = () => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Active Emergencies</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emergencyData.map((emergency) => (
            <div key={emergency.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">{emergency.type}</h3>
                    <span className={`ml-2 status-badge status-${emergency.status}`}>
                      {emergency.status.charAt(0).toUpperCase() + emergency.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {emergency.location}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{emergency.timeElapsed}</span>
              </div>
              
              {emergency.responders.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Assigned Responders:</p>
                  {emergency.responders.map((responder) => (
                    <div key={responder.id} className="flex items-center justify-between bg-gray-50 p-1 px-2 rounded text-xs">
                      <span className="font-medium">{responder.name}</span>
                      <span className="text-green-600">{responder.eta}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex mt-3 space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" /> View on Map
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Send className="h-3 w-3 mr-1" /> Assign
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

export default ActiveEmergencies;
