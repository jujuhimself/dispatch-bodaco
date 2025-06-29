import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SafeEmergencyService } from '@/services/safe-emergency-service';
import { Loader2, MapPin, ArrowLeft, AlertTriangle, CalendarClock, Ambulance, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import ResponderAssignmentFlow from '@/components/emergencies/ResponderAssignmentFlow';
import EmergencyTimeline from '@/components/emergencies/EmergencyTimeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BackNavigation } from '@/components/navigation/BackNavigation';

const EmergencyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAssignmentFlow, setShowAssignmentFlow] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  
  const { 
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['emergency', id],
    queryFn: () => SafeEmergencyService.fetchEmergencyById(id!),
    enabled: !!id,
    retry: 2
  });

  const {
    data: assignmentsData = [],
    isLoading: assignmentsLoading,
    refetch: refetchAssignments
  } = useQuery({
    queryKey: ['emergency-assignments', id],
    queryFn: () => SafeEmergencyService.fetchEmergencyAssignments(id!),
    enabled: !!id,
    retry: 2
  });
  
  const handleResolveEmergency = async () => {
    if (!id) return;
    
    try {
      const result = await SafeEmergencyService.updateEmergencyStatus(id, 'resolved');
      if (result) {
        toast.success('Emergency has been marked as resolved');
        setShowResolveDialog(false);
        refetch();
      }
    } catch (error) {
      console.error('Error resolving emergency:', error);
      toast.error('Failed to resolve emergency');
    }
  };
  
  const handleAssignmentComplete = () => {
    setShowAssignmentFlow(false);
    refetch();
    refetchAssignments();
    toast.success('Responder has been assigned successfully');
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPp');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-600">Assigned</Badge>;
      case 'in_transit':
        return <Badge className="bg-purple-600">In Transit</Badge>;
      case 'on_site':
        return <Badge className="bg-green-600">On Site</Badge>;
      case 'resolved':
        return <Badge className="bg-gray-600">Resolved</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch(priority) {
      case 1:
        return <Badge className="bg-red-600">High Priority</Badge>;
      case 2:
        return <Badge className="bg-orange-500">Medium Priority</Badge>;
      case 3:
        return <Badge className="bg-blue-500">Low Priority</Badge>;
      default:
        return <Badge>Priority {priority}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !data || !data.emergency) {
    return (
      <div className="container mx-auto p-4">
        <BackNavigation label="Emergency Details" />
        <div className="text-center">
          <div className="mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold mt-4">Error Loading Emergency</h1>
            <p className="text-muted-foreground mt-2">
              We couldn't load the emergency details. The emergency may have been deleted or you don't have permission to view it.
            </p>
          </div>
          <Button onClick={() => navigate('/emergencies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Emergencies
          </Button>
        </div>
      </div>
    );
  }

  const { emergency, deviceAlert } = data;
  const isActive = ['pending', 'assigned', 'in_transit', 'on_site'].includes(emergency.status);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <BackNavigation label={`Emergency: ${emergency.type}`} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{emergency.type}</h1>
            {getStatusBadge(emergency.status)}
            {getPriorityBadge(emergency.priority)}
          </div>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" /> {emergency.location}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isActive && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAssignmentFlow(true)}
                disabled={emergency.status !== 'pending'}
              >
                <Ambulance className="h-4 w-4 mr-2" />
                {emergency.status === 'pending' ? 'Assign Responder' : 'Add Another Responder'}
              </Button>
              
              <Button 
                size="sm"
                onClick={() => setShowResolveDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Details</CardTitle>
              <CardDescription>
                Reported at {formatDate(emergency.reported_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(emergency.status)}
                    <span>
                      {emergency.status === 'resolved' && emergency.resolved_at && `(${formatDate(emergency.resolved_at)})`}
                      {emergency.status === 'assigned' && emergency.assigned_at && `(${formatDate(emergency.assigned_at)})`}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                  <div>
                    {getPriorityBadge(emergency.priority)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="bg-muted/30 p-3 rounded-md">
                  {emergency.description || 'No description provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Reported</h3>
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(emergency.reported_at)}
                  </div>
                </div>
                
                {emergency.assigned_at && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned</h3>
                    <div className="flex items-center">
                      <Ambulance className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(emergency.assigned_at)}
                    </div>
                  </div>
                )}
              </div>
              
              {emergency.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <div className="bg-muted/30 p-3 rounded-md">
                    {emergency.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="assignments">
                Responders {assignmentsData.length > 0 && `(${assignmentsData.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="mt-4">
              <EmergencyTimeline 
                emergency={emergency}
                assignments={assignmentsData}
              />
            </TabsContent>
            <TabsContent value="assignments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Responders</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignmentsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : assignmentsData.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No responders have been assigned yet</p>
                      {emergency.status === 'pending' && (
                        <Button 
                          onClick={() => setShowAssignmentFlow(true)}
                          className="mt-4"
                        >
                          <Ambulance className="h-4 w-4 mr-2" />
                          Assign a Responder
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assignmentsData.map(assignment => (
                        <div 
                          key={assignment.id}
                          className="border rounded-lg p-4 flex flex-col space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {assignment.responders?.name || 'Unknown Responder'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Assigned: {formatDate(assignment.assigned_at)}
                              </p>
                            </div>
                            <Badge>
                              {assignment.responders?.type || 'Unknown Type'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Current Location: </span>
                              <span>{assignment.responders?.current_location || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="font-medium">Estimated ETA: </span>
                              <span>{assignment.eta || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          {assignment.notes && (
                            <div className="bg-muted/30 p-2 rounded-sm text-sm">
                              {assignment.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          {deviceAlert && (
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  Device Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="font-medium">Alert Type</div>
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm inline-block">
                      {deviceAlert.alert_type}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">Severity</div>
                    <Badge variant="outline" className="bg-orange-100 border-orange-200">
                      Level {deviceAlert.severity}
                    </Badge>
                  </div>
                  {deviceAlert.data && (
                    <div className="space-y-1">
                      <div className="font-medium">Alert Data</div>
                      <pre className="bg-orange-100 border border-orange-200 p-2 rounded-md text-xs overflow-auto max-h-40">
                        {JSON.stringify(deviceAlert.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4">
                <p className="text-muted-foreground mb-4">
                  View and send messages related to this emergency
                </p>
                <Button 
                  onClick={() => navigate('/communications')}
                  className="w-full"
                >
                  Open Communications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={showAssignmentFlow} onOpenChange={setShowAssignmentFlow}>
        <DialogContent className="sm:max-w-[800px]">
          <ResponderAssignmentFlow 
            emergency={emergency}
            onAssigned={handleAssignmentComplete}
            onCancel={() => setShowAssignmentFlow(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Emergency</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this emergency as resolved?
              This action will update the status and notify all assigned responders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>Cancel</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleResolveEmergency}
            >
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyDetailsPage;
