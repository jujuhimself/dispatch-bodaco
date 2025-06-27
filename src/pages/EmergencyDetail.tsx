
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Activity,
  Phone,
  AlertTriangle,
  Users
} from 'lucide-react';
import { SafeEmergencyService } from '@/services/safe-emergency-service';
import { EmergencyStatusTracker } from '@/components/emergency/EmergencyStatusTracker';
import { EmergencyAssignmentWorkflow } from '@/components/emergency/EmergencyAssignmentWorkflow';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const EmergencyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: emergencyData, isLoading, error } = useQuery({
    queryKey: ['emergency', id],
    queryFn: () => SafeEmergencyService.fetchEmergencyById(id!),
    enabled: !!id,
  });

  const { data: assignments } = useQuery({
    queryKey: ['emergency-assignments', id],
    queryFn: () => SafeEmergencyService.fetchEmergencyAssignments(id),
    enabled: !!id,
  });

  const handleAssignmentComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['emergency', id] });
    queryClient.invalidateQueries({ queryKey: ['emergency-assignments', id] });
    queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    toast.success('Emergency assignment updated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !emergencyData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Emergency Not Found</h2>
        <p className="text-gray-600 mb-4">The requested emergency could not be found.</p>
        <Button onClick={() => navigate('/emergencies')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Emergencies
        </Button>
      </div>
    );
  }

  const { emergency, deviceAlert } = emergencyData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'on_site': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const isEmergencyActive = ['pending', 'assigned', 'in_transit', 'on_site'].includes(emergency.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/emergencies')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emergency Details</h1>
              <p className="text-gray-600">ID: {emergency.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getPriorityColor(emergency.priority)}>
              Priority {emergency.priority}
            </Badge>
            <Badge className={getStatusColor(emergency.status)}>
              {emergency.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Emergency Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Emergency Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Type</h4>
                    <p className="text-gray-600">{emergency.type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {emergency.location}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reported</h4>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(emergency.reported_at), { addSuffix: true })}
                    </div>
                  </div>
                  {emergency.assigned_at && (
                    <div>
                      <h4 className="font-medium text-gray-900">Assigned</h4>
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(emergency.assigned_at), { addSuffix: true })}
                      </div>
                    </div>
                  )}
                </div>
                
                {emergency.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{emergency.description}</p>
                  </div>
                )}

                {emergency.coordinates && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Coordinates</h4>
                    <p className="text-gray-600 font-mono text-sm">
                      Lat: {emergency.coordinates.y}, Lng: {emergency.coordinates.x}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Alert Info */}
            {deviceAlert && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Device Alert Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Alert Type</h4>
                      <p className="text-gray-600">{deviceAlert.alert_type}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Severity</h4>
                      <Badge variant="outline">{deviceAlert.severity}</Badge>
                    </div>
                  </div>
                  {deviceAlert.data && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Alert Data</h4>
                      <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                        {JSON.stringify(deviceAlert.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Assignments */}
            {assignments && assignments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Assigned Responders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{assignment.responders?.name || 'Unknown Responder'}</h4>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>Type: {assignment.responders?.type || 'Unknown'}</span>
                            <span>Status: {assignment.responders?.status || 'Unknown'}</span>
                            {assignment.eta && <span>ETA: {assignment.eta}</span>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {assignment.responders?.phone && (
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          <Badge variant="outline">
                            {assignment.status || 'Assigned'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Tracker */}
            <EmergencyStatusTracker emergency={emergency} showControls={true} />

            {/* Assignment Workflow */}
            {isEmergencyActive && emergency.status === 'pending' && (
              <EmergencyAssignmentWorkflow 
                emergency={emergency} 
                onAssignmentComplete={handleAssignmentComplete}
              />
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Responders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View Timeline
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDetail;
