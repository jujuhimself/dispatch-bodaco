
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, Clock, MapPin, AlertCircle } from 'lucide-react';
import { fetchAvailableResponders, assignResponder, autoAssignResponder } from '@/services/emergency-service';
import { Emergency, Responder } from '@/types/emergency-types';
import { toast } from 'sonner';

interface EmergencyAssignmentWorkflowProps {
  emergency: Emergency;
  onAssignmentComplete: () => void;
}

export const EmergencyAssignmentWorkflow: React.FC<EmergencyAssignmentWorkflowProps> = ({
  emergency,
  onAssignmentComplete
}) => {
  const queryClient = useQueryClient();
  const [selectedResponderId, setSelectedResponderId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const { data: availableResponders, isLoading } = useQuery({
    queryKey: ['available-responders'],
    queryFn: fetchAvailableResponders,
  });

  const assignResponderMutation = useMutation({
    mutationFn: ({ responderId, notes }: { responderId: string; notes: string }) =>
      assignResponder(emergency.id, responderId, notes),
    onSuccess: () => {
      toast.success('Responder assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['emergency-assignments'] });
      onAssignmentComplete();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign responder');
    }
  });

  const autoAssignMutation = useMutation({
    mutationFn: () => autoAssignResponder(emergency.id),
    onSuccess: () => {
      toast.success('Auto-assignment completed');
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['emergency-assignments'] });
      onAssignmentComplete();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Auto-assignment failed');
    }
  });

  const handleManualAssignment = () => {
    if (!selectedResponderId) {
      toast.error('Please select a responder');
      return;
    }
    assignResponderMutation.mutate({ responderId: selectedResponderId, notes: assignmentNotes });
  };

  const getResponderTypeColor = (type: string) => {
    switch (type) {
      case 'ambulance': return 'bg-red-100 text-red-800';
      case 'bajaj': return 'bg-green-100 text-green-800';
      case 'traffic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDistance = (responder: Responder) => {
    if (!responder.coordinates || !emergency.coordinates) return 'Unknown';
    const dx = responder.coordinates.x - emergency.coordinates.x;
    const dy = responder.coordinates.y - emergency.coordinates.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return `${(distance * 111).toFixed(1)} km`; // Rough conversion to km
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Assign Responder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
            Priority {emergency.priority}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {emergency.location}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => autoAssignMutation.mutate()}
            disabled={autoAssignMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Auto-Assign Best Match
          </Button>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Manual Assignment</h4>
          
          <div className="space-y-3">
            <Select value={selectedResponderId} onValueChange={setSelectedResponderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select responder" />
              </SelectTrigger>
              <SelectContent>
                {availableResponders?.map((responder) => (
                  <SelectItem key={responder.id} value={responder.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{responder.name}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge className={getResponderTypeColor(responder.type)}>
                          {responder.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {calculateDistance(responder)}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Assignment notes (optional)"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              rows={3}
            />

            <Button
              onClick={handleManualAssignment}
              disabled={!selectedResponderId || assignResponderMutation.isPending}
              className="w-full"
            >
              Assign Selected Responder
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-4 text-gray-500">
            Loading available responders...
          </div>
        )}

        {availableResponders?.length === 0 && (
          <div className="text-center py-4 text-orange-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            No responders currently available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
