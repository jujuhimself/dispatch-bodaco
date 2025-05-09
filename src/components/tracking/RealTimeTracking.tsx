
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActiveResponders } from '@/services/emergency-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Responder } from '@/types/emergency-types';
import { MapPin } from 'lucide-react';

const RealTimeTracking: React.FC = () => {
  const [responders, setResponders] = useState<Responder[]>([]);
  
  const { data: activeResponders, isLoading, error } = useQuery({
    queryKey: ['activeResponders'],
    queryFn: () => getActiveResponders(),
    refetchInterval: 10000 // Refetch every 10 seconds
  });
  
  useEffect(() => {
    if (activeResponders) {
      setResponders(activeResponders);
    }
  }, [activeResponders]);

  if (isLoading) return <div>Loading responder locations...</div>;
  if (error) return <div>Error fetching responder data</div>;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Real-Time Responder Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {responders.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No active responders found
            </div>
          ) : (
            <div className="space-y-3">
              {responders.map((responder) => (
                <div key={responder.id} className="flex items-start space-x-3 p-3 bg-background rounded-md border">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{responder.name}</h4>
                    <p className="text-xs text-muted-foreground">{responder.current_location || 'Location unknown'}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    responder.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : responder.status === 'busy' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {responder.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeTracking;
