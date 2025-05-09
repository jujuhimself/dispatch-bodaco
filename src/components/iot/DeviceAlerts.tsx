
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Smartphone, Calendar, Clock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDeviceAlerts } from '@/services/iot-service';
import { formatDistanceToNow } from 'date-fns';

const DeviceAlerts = () => {
  const { 
    data: alerts, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['deviceAlerts'],
    queryFn: () => fetchDeviceAlerts(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getSeverityClass = (severity: number) => {
    switch (true) {
      case severity >= 8:
        return 'bg-red-500';
      case severity >= 5:
        return 'bg-orange-500';
      case severity >= 3:
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getSeverityText = (severity: number) => {
    switch (true) {
      case severity >= 8:
        return 'Critical';
      case severity >= 5:
        return 'High';
      case severity >= 3:
        return 'Medium';
      default:
        return 'Low';
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
        <Badge variant="outline">{alerts?.length || 0} Total</Badge>
      </CardHeader>
      <CardContent>
        {alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-3 border rounded-md">
                <div className="flex items-start">
                  <div className={`p-2 rounded-md ${getSeverityClass(alert.severity)} text-white mr-3`}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1)} Alert
                      <Badge className={`ml-2 ${getSeverityClass(alert.severity)}`} variant="secondary">
                        {getSeverityText(alert.severity)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Smartphone className="h-3 w-3 mr-1" />
                      Device ID: {alert.device_id}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(alert.created_at || '').toLocaleDateString()}
                      <Clock className="h-3 w-3 ml-2 mr-1" />
                      {formatDistanceToNow(new Date(alert.created_at || ''), { addSuffix: true })}
                    </div>
                    {alert.processed && (
                      <Badge variant="outline" className="mt-1">Processed</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No active alerts
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceAlerts;
