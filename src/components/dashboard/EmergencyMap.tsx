
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Zap } from 'lucide-react';

const EmergencyMap = () => {
  // Mock emergency locations for demonstration
  const mockEmergencies = [
    { id: '1', type: 'Medical Emergency', location: 'Bole Road', priority: 1, status: 'pending' },
    { id: '2', type: 'Vehicle Crash', location: 'Mexico Square', priority: 2, status: 'assigned' },
    { id: '3', type: 'Fire Emergency', location: 'Piazza', priority: 1, status: 'in_transit' },
  ];

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-red-600';
      case 'assigned': return 'text-blue-600';
      case 'in_transit': return 'text-orange-600';
      case 'on_site': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          Emergency Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Map Placeholder */}
        <div className="relative bg-gray-100 rounded-lg h-64 mb-4 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 mb-2">Interactive Map</p>
            <p className="text-sm text-gray-500">Real-time emergency locations</p>
          </div>
          
          {/* Mock emergency markers */}
          <div className="absolute top-4 left-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute top-8 right-6">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute bottom-6 left-1/3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Emergency List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700 mb-3">Active Emergencies</h4>
          {mockEmergencies.map((emergency) => (
            <div key={emergency.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(emergency.priority)}`}></div>
                <div>
                  <p className="text-sm font-medium">{emergency.type}</p>
                  <p className="text-xs text-gray-500">{emergency.location}</p>
                </div>
              </div>
              <div className={`text-xs font-medium ${getStatusColor(emergency.status)}`}>
                {emergency.status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-center text-sm text-gray-500">
          <Zap className="h-4 w-4 mr-1" />
          Live updates every 15 seconds
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyMap;
