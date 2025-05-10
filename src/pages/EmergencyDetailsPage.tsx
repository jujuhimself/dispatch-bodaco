import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, Edit, MapPin, MessageSquare, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { fetchEmergencyWithDeviceAlert, fetchEmergencyAssignments, updateEmergencyStatus } from '@/services/emergency-service';
import { formatDistanceToNow, format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const EmergencyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['emergency', id],
    queryFn: () => fetchEmergencyWithDeviceAlert(id || ''),
    enabled: !!id
  });
  
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['emergency-assignments', id],
    queryFn: () => fetchEmergencyAssignments(id),
    enabled: !!id
  });

  // Add mutation to update emergency status
  const resolveEmergencyMutation = useMutation({
    mutationFn: () => updateEmergencyStatus(id || '', 'resolved'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency', id] });
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      toast.success('Emergency marked as resolved');
      setShowResolveDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to resolve emergency: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading emergency details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold">Error loading emergency data</h2>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  
  const { emergency, deviceAlert } = data;
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP p');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const getTimeElapsed = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'on_site': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'canceled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      case 5: return 'Minimal';
      default: return 'Unknown';
    }
  };
  
  const handleResolveEmergency = () => {
    setShowResolveDialog(true);
  };

  const confirmResolveEmergency = () => {
    resolveEmergencyMutation.mutate();
  };

  const handleAssignResponder = () => {
    // Navigate to assign responder page or open modal
    navigate(`/emergency/${id}/assign`);
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{emergency.type}</h1>
          <Badge className={`ml-3 ${getStatusBadgeClass(emergency.status)}`}>
            {emergency.status.charAt(0).toUpperCase() + emergency.status.slice(1).replace('_', ' ')}
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleAssignResponder}
            disabled={emergency.status === 'resolved' || emergency.status === 'canceled'}
          >
            <User className="h-4 w-4 mr-2" />
            Assign Responder
          </Button>
          
          {emergency.status !== 'resolved' && emergency.status !== 'canceled' && (
            <Button 
              variant="outline" 
              onClick={handleResolveEmergency}
              className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
              disabled={resolveEmergencyMutation.isPending}
            >
              {resolveEmergencyMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Mark as Resolved"
              )}
            </Button>
          )}
          
          <Link to={`/emergency/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="responders">Responders</TabsTrigger>
                  <TabsTrigger value="comms">Communications</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-4">
              <TabsContent value="details" className="mt-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                        <p>{emergency.location}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
                      <div className="flex items-center">
                        <Badge className={`
                          ${emergency.priority === 1 ? 'bg-red-500 text-white' :
                            emergency.priority === 2 ? 'bg-orange-500 text-white' :
                            emergency.priority === 3 ? 'bg-yellow-500 text-white' :
                            emergency.priority === 4 ? 'bg-blue-500 text-white' :
                            'bg-green-500 text-white'
                          }
                        `}>
                          {getPriorityLabel(emergency.priority)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Reported</h3>
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                        <div>
                          <p>{formatDate(emergency.reported_at)}</p>
                          <p className="text-sm text-gray-500">{getTimeElapsed(emergency.reported_at)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {emergency.assigned_at && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned</h3>
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                          <div>
                            <p>{formatDate(emergency.assigned_at)}</p>
                            <p className="text-sm text-gray-500">{getTimeElapsed(emergency.assigned_at)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {emergency.resolved_at && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Resolved</h3>
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                          <div>
                            <p>{formatDate(emergency.resolved_at)}</p>
                            <p className="text-sm text-gray-500">{getTimeElapsed(emergency.resolved_at)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {emergency.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                      <p className="bg-gray-50 p-3 rounded-md">{emergency.description}</p>
                    </div>
                  )}
                  
                  {emergency.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                      <p className="bg-gray-50 p-3 rounded-md">{emergency.notes}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="responders" className="mt-0">
                {assignmentsLoading ? (
                  <div className="py-8 text-center">Loading responder assignments...</div>
                ) : assignments && assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <Card key={assignment.id} className="border p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{assignment.responders?.name || 'Unknown Responder'}</div>
                            <div className="text-sm text-gray-500">{assignment.responders?.type || 'Unknown'}</div>
                          </div>
                          <Badge>{assignment.status || 'Unknown Status'}</Badge>
                        </div>
                        <div className="mt-2 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-600">ETA: {assignment.eta || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-600">{assignment.responders?.phone || 'No phone'}</span>
                          </div>
                        </div>
                        {assignment.notes && (
                          <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">Notes:</span> {assignment.notes}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <User className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p>No responders have been assigned to this emergency</p>
                    <Button 
                      className="mt-4" 
                      variant="outline" 
                      onClick={handleAssignResponder}
                      disabled={emergency.status === 'resolved' || emergency.status === 'canceled'}
                    >
                      Assign Responders
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comms" className="mt-0">
                <div className="py-8 text-center text-gray-500">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No communications recorded for this emergency</p>
                  <Button className="mt-4" variant="outline">
                    Create Communication Log
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0">
                <div className="py-8 text-center text-gray-500">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Timeline view will be implemented soon</p>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
          
          {deviceAlert && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IoT Device Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Alert Type</h3>
                    <p>{deviceAlert.alert_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Severity</h3>
                    <Badge className={`
                      ${deviceAlert.severity === 1 ? 'bg-red-500 text-white' :
                        deviceAlert.severity === 2 ? 'bg-orange-500 text-white' :
                        deviceAlert.severity === 3 ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }
                    `}>
                      {deviceAlert.severity === 1 ? 'Critical' :
                        deviceAlert.severity === 2 ? 'High' :
                        deviceAlert.severity === 3 ? 'Medium' :
                        'Low'
                      }
                    </Badge>
                  </div>
                  
                  {deviceAlert.data && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Alert Data</h3>
                      <pre className="bg-gray-50 p-3 rounded-md overflow-auto text-xs">
                        {JSON.stringify(deviceAlert.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 h-52 rounded-md flex items-center justify-center">
                {emergency.coordinates ? (
                  <p className="text-gray-500">
                    Coordinates: {emergency.coordinates.x.toFixed(4)}, {emergency.coordinates.y.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-gray-500">No coordinates available</p>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Open in Maps
                </Button>
                <Button variant="outline" className="w-full">
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-medical-600 hover:bg-medical-700">
                <Phone className="h-4 w-4 mr-2" />
                Emergency Contact
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Alert
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Resolve confirmation dialog */}
      <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve Emergency</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this emergency as resolved? This action will update the status and mark the current time as the resolution time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResolveEmergency} className="bg-green-600 hover:bg-green-700">
              Yes, Resolve Emergency
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmergencyDetailsPage;
