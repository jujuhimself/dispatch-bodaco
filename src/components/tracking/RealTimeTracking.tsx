
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Clock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchResponders } from '@/services/emergency-service';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Responder } from '@/types/emergency-types';

const RealTimeTracking: React.FC = () => {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [isRealtime, setIsRealtime] = useState(true);
  
  const { 
    data: initialResponders, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['responders'],
    queryFn: () => fetchResponders(),
    onSuccess: (data) => {
      if (!isRealtime) {
        setResponders(data);
      }
    },
  });
  
  useEffect(() => {
    if (!isRealtime || !initialResponders) return;
    
    // Initialize with the data from the query
    setResponders(initialResponders);
    
    // Set up real-time subscription
    const channel = supabase
      .channel('responder-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'responders' 
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // Handle different types of updates
          if (payload.eventType === 'INSERT') {
            setResponders(prev => [...prev, payload.new as Responder]);
          } else if (payload.eventType === 'UPDATE') {
            setResponders(prev => 
              prev.map(responder => 
                responder.id === payload.new.id ? { ...responder, ...payload.new } : responder
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setResponders(prev => prev.filter(responder => responder.id !== payload.old.id));
          }
        }
      )
      .subscribe();
    
    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialResponders, isRealtime]);
  
  const toggleRealtime = () => {
    setIsRealtime(!isRealtime);
    if (!isRealtime && initialResponders) {
      // When enabling real-time updates, reset to the latest data
      setResponders(initialResponders);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'on_call': return 'bg-orange-500';
      case 'off_duty': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Real-Time Responder Tracking</CardTitle>
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
          <CardTitle className="text-lg font-medium">Real-Time Responder Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading responder data</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium">Real-Time Responder Tracking</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={isRealtime ? "default" : "outline"}>
            {isRealtime ? 'Live' : 'Static'}
          </Badge>
          <Button variant="outline" size="sm" onClick={toggleRealtime}>
            {isRealtime ? 'Disable Live Updates' : 'Enable Live Updates'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {responders && responders.length > 0 ? (
          <div className="space-y-4">
            {responders.map((responder) => (
              <div key={responder.id} className="flex items-start justify-between p-4 border rounded-md">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${getStatusColor(responder.status)} text-white mr-3`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{responder.name}</div>
                    <div className="text-sm text-gray-500">{responder.type}</div>
                    {responder.coordinates && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {responder.coordinates.x.toFixed(5)}, {responder.coordinates.y.toFixed(5)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Last updated: {formatDistanceToNow(new Date(responder.last_active), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(responder.status)}`}>
                  {responder.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No responders available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeTracking;
