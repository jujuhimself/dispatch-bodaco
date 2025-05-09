
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, Loader2, Link } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDeviceAlerts } from '@/services/iot-service';
import { formatDistanceToNow } from 'date-fns';

const DeviceAlerts = () => {
  // Fix the useQuery implementation to not pass the fetchDeviceAlerts function directly
  const { 
    data: alerts, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['deviceAlerts'],
    queryFn: () => fetchDeviceAlerts(), // Wrap in anonymous function to avoid parameter mismatch
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const getSeverityBadge = (severity: number) => {
    switch (severity) {
      case 1:
        return <Badge className="bg-red-500 text-white">Critical</Badge>;
      case 2:
        return <Badge className="bg-orange-500 text-white">High</Badge>;
      case 3:
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      case 4:
        return <Badge className="bg-blue-500 text-white">Low</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const getAlertTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'crash':
        return <Badge className="bg-red-100 text-red-800 border border-red-200">Crash</Badge>;
      case 'medical':
        return <Badge className="bg-purple-100 text-purple-800 border border-purple-200">Medical</Badge>;
      case 'fire':
        return <Badge className="bg-orange-100 text-orange-800 border border-orange-200">Fire</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border border-gray-200">{type}</Badge>;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Device Alerts</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading device alerts:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Device Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading device alerts</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Device Alerts</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        {alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 border rounded-md bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <div>
                      <div className="font-medium">
                        {getAlertTypeBadge(alert.alert_type)}
                        <span className="ml-2 text-sm text-gray-500">
                          {formatTime(alert.created_at || '')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {getSeverityBadge(alert.severity)}
                </div>
                
                {alert.location && (
                  <div className="text-xs flex items-center text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    Coordinates: {alert.location.x.toFixed(4)}, {alert.location.y.toFixed(4)}
                  </div>
                )}
                
                {alert.processed && alert.emergency_id && (
                  <div className="mt-2 text-xs flex items-center">
                    <Link className="h-3 w-3 mr-1 text-blue-500" />
                    <span>
                      Linked to emergency 
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs ml-1">
                        View Emergency
                      </Button>
                    </span>
                  </div>
                )}
                
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No device alerts detected
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function that was referenced but was missing
const getAlertTypeBadge = (type: string) => {
  switch (type.toLowerCase()) {
    case 'crash':
      return <Badge className="bg-red-100 text-red-800 border border-red-200">Crash</Badge>;
    case 'medical':
      return <Badge className="bg-purple-100 text-purple-800 border border-purple-200">Medical</Badge>;
    case 'fire':
      return <Badge className="bg-orange-100 text-orange-800 border border-orange-200">Fire</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border border-gray-200">{type}</Badge>;
  }
};

const formatTime = (timestamp: string) => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (e) {
    return 'Unknown time';
  }
};

export default DeviceAlerts;
