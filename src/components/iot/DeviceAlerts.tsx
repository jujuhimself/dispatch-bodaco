
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Smartphone, Calendar, Clock, Loader2, Check, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeviceAlerts, createAlertEscalation } from '@/services/iot-service';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DeviceAlerts = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unprocessed' | 'processed'>('all');
  
  const { 
    data: alerts, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['deviceAlerts', filter],
    queryFn: () => {
      if (filter === 'all') {
        return fetchDeviceAlerts();
      } else {
        return fetchDeviceAlerts(filter === 'processed');
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const escalateMutation = useMutation({
    mutationFn: (alertData: { alertId: string, reason: string, level: 'normal' | 'elevated' | 'critical' | 'emergency' }) => {
      return createAlertEscalation({
        alert_id: alertData.alertId,
        reason: alertData.reason,
        level: alertData.level,
      });
    },
    onSuccess: () => {
      toast.success('Alert escalated successfully');
      queryClient.invalidateQueries({ queryKey: ['deviceAlerts'] });
    },
    onError: (error) => {
      console.error('Error escalating alert:', error);
      toast.error('Failed to escalate alert');
    },
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

  const getEscalationLevel = (severity: number): 'normal' | 'elevated' | 'critical' | 'emergency' => {
    switch (true) {
      case severity >= 8:
        return 'emergency';
      case severity >= 5:
        return 'critical';
      case severity >= 3:
        return 'elevated';
      default:
        return 'normal';
    }
  };

  const handleEscalate = (alertId: string, severity: number) => {
    const level = getEscalationLevel(severity);
    const reason = `Manually escalated ${level} alert`;
    
    escalateMutation.mutate({
      alertId,
      reason,
      level,
    });
  };

  const validateAlert = (alert: any) => {
    // Validate required fields
    const missingFields = [];
    if (!alert.device_id) missingFields.push('device_id');
    if (!alert.alert_type) missingFields.push('alert_type');
    if (alert.severity === undefined) missingFields.push('severity');
    if (!alert.data) missingFields.push('data');
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        issues: [`Missing required fields: ${missingFields.join(', ')}`]
      };
    }
    
    // Validate data integrity
    const issues = [];
    
    if (alert.data.threshold && alert.data.value) {
      if (alert.alert_type === 'temperature' && alert.data.value > 50) {
        issues.push('Temperature value suspiciously high');
      }
      if (alert.alert_type === 'crash' && (!alert.data.impact || alert.data.impact < 0)) {
        issues.push('Invalid crash impact value');
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
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
        <div className="flex items-center space-x-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={filter === 'all' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-none"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'unprocessed' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-none"
              onClick={() => setFilter('unprocessed')}
            >
              Unprocessed
            </Button>
            <Button 
              variant={filter === 'processed' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-none"
              onClick={() => setFilter('processed')}
            >
              Processed
            </Button>
          </div>
          <Badge variant="outline">{alerts?.length || 0} Total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const validation = validateAlert(alert);
              return (
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
                        
                        {!validation.isValid && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="ml-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div>
                                  <p className="font-medium">Validation Issues:</p>
                                  <ul className="list-disc pl-4 text-xs">
                                    {validation.issues.map((issue, i) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
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
                        <Badge variant="outline" className="mt-1 flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Processed
                        </Badge>
                      )}
                      {alert.emergency_id && (
                        <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-600 border-blue-200">
                          Emergency ID: {alert.emergency_id.substring(0, 8)}...
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEscalate(alert.id!, alert.severity)}
                      disabled={alert.processed}
                    >
                      Escalate
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
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
