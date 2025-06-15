
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, User, AlertTriangle } from 'lucide-react';
import { Emergency } from '@/types/emergency-types';
import { updateEmergencyStatus } from '@/services/emergency-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface EmergencyStatusTrackerProps {
  emergency: Emergency;
  showControls?: boolean;
}

export const EmergencyStatusTracker: React.FC<EmergencyStatusTrackerProps> = ({
  emergency,
  showControls = false
}) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<Emergency['status']>(emergency.status);

  const updateStatusMutation = useMutation({
    mutationFn: (status: Emergency['status']) => updateEmergencyStatus(emergency.id, status),
    onSuccess: () => {
      toast.success('Emergency status updated');
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['emergency', emergency.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    }
  });

  const getStatusColor = (status: Emergency['status']) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on_site': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'canceled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusOptions: Emergency['status'][] = [
    'pending', 'assigned', 'in_transit', 'on_site', 'resolved', 'canceled'
  ];

  const handleStatusUpdate = () => {
    if (selectedStatus !== emergency.status) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as Emergency['status']);
  };

  useEffect(() => {
    setSelectedStatus(emergency.status);
  }, [emergency.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Emergency Status
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(emergency.status)}>
              {emergency.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(emergency.priority)}>
              Priority {emergency.priority}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>Reported: {formatDistanceToNow(new Date(emergency.reported_at), { addSuffix: true })}</span>
          </div>
          
          {emergency.assigned_at && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-blue-500" />
              <span>Assigned: {formatDistanceToNow(new Date(emergency.assigned_at), { addSuffix: true })}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{emergency.location}</span>
          </div>
          
          {emergency.resolved_at && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-green-500" />
              <span>Resolved: {formatDistanceToNow(new Date(emergency.resolved_at), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {emergency.description && (
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-gray-600">{emergency.description}</p>
          </div>
        )}

        {showControls && emergency.status !== 'resolved' && emergency.status !== 'canceled' && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Update Status</h4>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={selectedStatus === emergency.status || updateStatusMutation.isPending}
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
