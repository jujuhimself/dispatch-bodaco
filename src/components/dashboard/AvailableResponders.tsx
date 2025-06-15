import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Phone } from 'lucide-react';
import { fetchAvailableResponders } from '@/services/emergency-service';
import { LoadingState } from '@/components/ui/loading-state';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const AvailableResponders = () => {
  const navigate = useNavigate();
  const { data: responders, isLoading, error } = useQuery({
    queryKey: ['available-responders'],
    queryFn: fetchAvailableResponders,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getResponderTypeColor = (type: string) => {
    switch (type) {
      case 'ambulance':
        return 'bg-red-100 text-red-800';
      case 'bajaj':
        return 'bg-green-100 text-green-800';
      case 'traffic':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Available Responders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState isLoading={true} variant="skeleton">
            <div></div>
          </LoadingState>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Available Responders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-4">
            Failed to load responders. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Available Responders
          </div>
          <Badge variant="secondary">{responders?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!responders || responders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No available responders</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {responders.map((responder) => (
              <div
                key={responder.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{responder.name}</h4>
                  <Badge className={getResponderTypeColor(responder.type)}>
                    {responder.type}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {responder.current_location && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {responder.current_location}
                    </div>
                  )}
                  {responder.phone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {responder.phone}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Last active: {formatDistanceToNow(new Date(responder.last_active), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/responders')}
          >
            View All Responders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableResponders;
