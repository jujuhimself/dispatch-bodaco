import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Clock, Users } from 'lucide-react';
import { fetchActiveEmergencies } from '@/services/emergency-service';
import { LoadingState } from '@/components/ui/loading-state';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ActiveEmergencies = () => {
  const navigate = useNavigate();
  const { data: emergencies, isLoading, error } = useQuery({
    queryKey: ['active-emergencies'],
    queryFn: fetchActiveEmergencies,
    refetchInterval: 15000, // Refresh every 15 seconds for real-time updates
  });

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800 border-red-200';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-orange-100 text-orange-800';
      case 'on_site':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Active Emergencies
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
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Active Emergencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-4">
            Failed to load emergencies. Please try again.
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
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Active Emergencies
          </div>
          <Badge variant="secondary">{emergencies?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!emergencies || emergencies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No active emergencies</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {emergencies.map((emergency) => (
              <div
                key={emergency.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/emergency/${emergency.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{emergency.type}</h4>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(emergency.priority)}>
                      Priority {emergency.priority}
                    </Badge>
                    <Badge className={getStatusColor(emergency.status)}>
                      {emergency.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {emergency.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {emergency.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDistanceToNow(new Date(emergency.reported_at), { addSuffix: true })}
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
            onClick={() => navigate('/emergencies')}
          >
            View All Emergencies
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveEmergencies;
