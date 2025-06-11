
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { optimizedEmergencyService } from '@/services/optimized-emergency-service';

interface ResponderAssignmentProps {
  emergencyId: string;
  onAssignmentComplete?: () => void;
}

interface Responder {
  id: string;
  name: string;
  type: string;
  status: string;
  current_location: string;
  availability_status: string;
}

export const ResponderAssignment = ({ emergencyId, onAssignmentComplete }: ResponderAssignmentProps) => {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [selectedResponder, setSelectedResponder] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableResponders();
  }, []);

  const fetchAvailableResponders = async () => {
    try {
      const { data, error } = await supabase
        .from('responders')
        .select('*')
        .eq('availability_status', 'available')
        .order('last_active', { ascending: false });

      if (error) throw error;
      setResponders(data || []);
    } catch (error) {
      console.error('Error fetching responders:', error);
      toast.error('Failed to load available responders');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async () => {
    if (!selectedResponder) {
      toast.error('Please select a responder');
      return;
    }

    setIsAssigning(true);
    try {
      await optimizedEmergencyService.assignResponder(emergencyId, selectedResponder);
      toast.success('Responder assigned successfully');
      onAssignmentComplete?.();
    } catch (error) {
      console.error('Error assigning responder:', error);
      toast.error('Failed to assign responder');
    } finally {
      setIsAssigning(false);
    }
  };

  const autoAssignResponder = async () => {
    setIsAssigning(true);
    try {
      // Find the best available responder (closest or most suitable)
      const bestResponder = responders.find(r => 
        r.availability_status === 'available' && r.status === 'available'
      );
      
      if (!bestResponder) {
        toast.error('No available responders found');
        return;
      }

      await optimizedEmergencyService.assignResponder(emergencyId, bestResponder.id);
      toast.success(`Auto-assigned ${bestResponder.name}`);
      onAssignmentComplete?.();
    } catch (error) {
      console.error('Error auto-assigning responder:', error);
      toast.error('Failed to auto-assign responder');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on_call': return 'bg-yellow-100 text-yellow-800';
      case 'busy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assigning Responder...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Assign Responder
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={autoAssignResponder}
            disabled={isAssigning || responders.length === 0}
            variant="outline"
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Auto Assign
          </Button>
        </div>

        <div className="relative">
          <Select 
            value={selectedResponder} 
            onValueChange={setSelectedResponder}
            disabled={isAssigning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a responder manually" />
            </SelectTrigger>
            <SelectContent>
              {responders.map((responder) => (
                <SelectItem key={responder.id} value={responder.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{responder.name}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge className={getStatusColor(responder.status)}>
                        {responder.type}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedResponder && (
          <div className="mt-4">
            {(() => {
              const responder = responders.find(r => r.id === selectedResponder);
              if (!responder) return null;
              
              return (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{responder.name}</span>
                    <Badge className={getStatusColor(responder.status)}>
                      {responder.status}
                    </Badge>
                  </div>
                  {responder.current_location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {responder.current_location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Type: {responder.type}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <Button 
          onClick={handleAssignment}
          disabled={!selectedResponder || isAssigning}
          className="w-full"
        >
          {isAssigning ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
              Assigning...
            </>
          ) : (
            'Assign Selected Responder'
          )}
        </Button>

        {responders.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No available responders at the moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
