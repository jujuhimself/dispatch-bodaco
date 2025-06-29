
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, User, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Mock service - replace with actual service
const fetchRecentCommunications = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    {
      id: '1',
      sender: 'Dispatch Center',
      message: 'Ambulance 001 dispatched to Bole Road accident',
      type: 'dispatch',
      emergency_id: 'emer-001',
      sent_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      priority: 'high'
    },
    {
      id: '2',
      sender: 'Responder Team A',
      message: 'ETA 8 minutes to medical emergency location',
      type: 'update',
      emergency_id: 'emer-002',
      sent_at: new Date(Date.now() - 480000).toISOString(), // 8 minutes ago
      priority: 'medium'
    },
    {
      id: '3',
      sender: 'Hospital Coordinator',
      message: 'Trauma bay prepared for incoming patient',
      type: 'coordination',
      emergency_id: 'emer-001',
      sent_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      priority: 'medium'
    },
    {
      id: '4',
      sender: 'Fire Department',
      message: 'Fire at commercial building contained',
      type: 'status_update',
      emergency_id: 'emer-003',
      sent_at: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      priority: 'low'
    }
  ];
};

const RecentCommunications = () => {
  const navigate = useNavigate();
  const { data: communications, isLoading, error } = useQuery({
    queryKey: ['recent-communications'],
    queryFn: fetchRecentCommunications,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dispatch':
        return 'bg-red-100 text-red-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'coordination':
        return 'bg-green-100 text-green-800';
      case 'status_update':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-orange-600" />;
      default:
        return <MessageSquare className="h-3 w-3 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
            Recent Communications
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
            <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
            Recent Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-4">
            Failed to load communications. Please try again.
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
            <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
            Recent Communications
          </div>
          <Badge variant="secondary">{communications?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!communications || communications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent communications</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {communications.map((comm) => (
              <div
                key={comm.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">{comm.sender}</span>
                    {getPriorityIcon(comm.priority)}
                  </div>
                  <Badge className={getTypeColor(comm.type)}>
                    {comm.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {comm.message}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Emergency: {comm.emergency_id?.split('-')[1] || 'N/A'}
                  </span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(comm.sent_at), { addSuffix: true })}
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
            onClick={() => navigate('/communications')}
          >
            View All Communications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentCommunications;
