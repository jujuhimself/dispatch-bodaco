
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User,
  Phone,
  MessageSquare,
  FileText,
  Navigation
} from 'lucide-react';
import { getEmergencyById } from '@/services/emergency-service';
import { LoadingState } from '@/components/ui/loading-state';
import { formatDistanceToNow, format } from 'date-fns';

const EmergencyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: emergency, isLoading, error } = useQuery({
    queryKey: ['emergency', id],
    queryFn: () => getEmergencyById(id!),
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on_site': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingState isLoading={true} variant="skeleton">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </LoadingState>
      </div>
    );
  }

  if (error || !emergency) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Emergency Not Found</h2>
          <p className="text-gray-600 mb-4">The emergency you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/emergencies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Emergencies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/emergencies')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Emergencies</span>
        </Button>
      </div>

      {/* Emergency Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center text-xl">
                <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
                {emergency.type}
              </CardTitle>
              <div className="flex items-center space-x-3">
                <Badge className={getPriorityColor(emergency.priority)}>
                  Priority {emergency.priority}
                </Badge>
                <Badge className={getStatusColor(emergency.status)}>
                  {emergency.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Emergency ID: {emergency.id}</p>
              <p>Reported: {format(new Date(emergency.reported_at), 'PPp')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergency.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-700">{emergency.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{emergency.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                Reported {formatDistanceToNow(new Date(emergency.reported_at), { addSuffix: true })}
              </span>
            </div>
            {emergency.coordinates && (
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {emergency.coordinates.y.toFixed(4)}, {emergency.coordinates.x.toFixed(4)}
                </span>
              </div>
            )}
            {emergency.assigned_at && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Assigned {formatDistanceToNow(new Date(emergency.assigned_at), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="responders">Assigned Responders</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="location">Location & Map</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Emergency Reported</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(emergency.reported_at), 'PPp')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Initial emergency report received</p>
                  </div>
                </div>
                
                {emergency.assigned_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Responder Assigned</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(emergency.assigned_at), 'PPp')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Emergency response team assigned</p>
                    </div>
                  </div>
                )}
                
                {emergency.resolved_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Emergency Resolved</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(emergency.resolved_at), 'PPp')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Emergency successfully resolved</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responders">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Responders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No responders assigned yet</p>
                <Button className="mt-4" size="sm">
                  Assign Responder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communications Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No communications recorded</p>
                <Button className="mt-4" size="sm">
                  Add Communication
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location & Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Interactive Map</p>
                    <p className="text-sm text-gray-500">{emergency.location}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Address</h4>
                    <p className="text-gray-600">{emergency.location}</p>
                  </div>
                  {emergency.coordinates && (
                    <div>
                      <h4 className="font-medium mb-2">Coordinates</h4>
                      <p className="text-gray-600">
                        Lat: {emergency.coordinates.y.toFixed(6)}<br />
                        Lng: {emergency.coordinates.x.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {emergency.status === 'pending' && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            Assign Responder
          </Button>
        )}
        <Button variant="outline">
          <Phone className="h-4 w-4 mr-2" />
          Contact Dispatcher
        </Button>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default EmergencyDetailsPage;
