
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Emergency, Responder } from '@/types/emergency-types';
import { fetchAvailableResponders, assignResponder } from '@/services/emergency-service';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, MapPin, TimerReset, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ResponderAssignmentFlowProps {
  emergency: Emergency;
  onAssigned?: () => void;
  onCancel?: () => void;
}

const ResponderAssignmentFlow: React.FC<ResponderAssignmentFlowProps> = ({
  emergency,
  onAssigned,
  onCancel
}) => {
  const [selectedResponder, setSelectedResponder] = useState<Responder | null>(null);
  const [estimatedETA, setEstimatedETA] = useState<string>('');
  const [notesForResponder, setNotesForResponder] = useState<string>('');
  const [assignmentStep, setAssignmentStep] = useState<'select' | 'confirm'>('select');
  const [assigningResponder, setAssigningResponder] = useState(false);
  
  const {
    data: responders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['available-responders'],
    queryFn: fetchAvailableResponders
  });

  // Calculate estimated ETA when a responder is selected (mock calculation)
  useEffect(() => {
    if (selectedResponder && selectedResponder.coordinates && emergency.coordinates) {
      // This is a simplified mock calculation - in a real app, you'd use a routing service
      const distance = Math.sqrt(
        Math.pow(selectedResponder.coordinates.x - emergency.coordinates.x, 2) + 
        Math.pow(selectedResponder.coordinates.y - emergency.coordinates.y, 2)
      );
      
      // Mock calculation: 1 unit of distance = 2 minutes
      const minutes = Math.max(5, Math.round(distance * 2));
      
      if (minutes < 60) {
        setEstimatedETA(`~${minutes} minutes`);
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        setEstimatedETA(`~${hours}h ${remainingMinutes}m`);
      }
    } else {
      setEstimatedETA('Unknown');
    }
  }, [selectedResponder, emergency.coordinates]);

  const handleSelectResponder = (responder: Responder) => {
    setSelectedResponder(responder);
    setAssignmentStep('confirm');
  };

  const handleAssignResponder = async () => {
    if (!selectedResponder) return;
    
    setAssigningResponder(true);
    try {
      await assignResponder(
        emergency.id,
        selectedResponder.id,
        `ETA: ${estimatedETA}. ${notesForResponder}`
      );
      
      toast.success(`Assigned ${selectedResponder.name} to the emergency`);
      if (onAssigned) onAssigned();
    } catch (error) {
      console.error('Error assigning responder:', error);
      toast.error('Failed to assign responder');
    } finally {
      setAssigningResponder(false);
    }
  };

  const handleBackToSelection = () => {
    setSelectedResponder(null);
    setAssignmentStep('select');
  };

  const getResponderStatusBadge = (status: string) => {
    switch(status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'on_call':
        return <Badge className="bg-yellow-500">On Call</Badge>;
      case 'off_duty':
        return <Badge className="bg-gray-500">Off Duty</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getResponderTypeBadge = (type: string) => {
    switch(type) {
      case 'ambulance':
        return <Badge className="bg-emergency-600">Ambulance</Badge>;
      case 'bajaj':
        return <Badge className="bg-blue-600">Bajaj</Badge>;
      case 'traffic':
        return <Badge className="bg-purple-600">Traffic</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assign Responder to Emergency</CardTitle>
        <CardDescription>
          <div className="flex flex-col">
            <span>{emergency.type} ({emergency.priority === 1 ? 'High' : emergency.priority === 2 ? 'Medium' : 'Low'} Priority)</span>
            <span className="flex items-center text-sm mt-1">
              <MapPin className="h-3 w-3 mr-1" /> {emergency.location}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assignmentStep === 'select' ? (
          <>
            <div className="mb-4">
              <Tabs defaultValue="list">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-emergency-500" />
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <AlertCircle className="h-10 w-10 text-emergency-500 mb-2" />
                      <p>Failed to load responders</p>
                      <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                        Try Again
                      </Button>
                    </div>
                  ) : responders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-lg font-medium mb-2">No Available Responders</p>
                      <p className="text-muted-foreground">There are currently no responders available for assignment.</p>
                    </div>
                  ) : (
                    <div className="overflow-auto max-h-[400px] mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responders.map((responder) => (
                            <TableRow key={responder.id}>
                              <TableCell className="font-medium">{responder.name}</TableCell>
                              <TableCell>{getResponderTypeBadge(responder.type)}</TableCell>
                              <TableCell>{getResponderStatusBadge(responder.status)}</TableCell>
                              <TableCell>
                                {responder.current_location || 'Unknown location'}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm"
                                  className="bg-emergency-600 hover:bg-emergency-700"
                                  onClick={() => handleSelectResponder(responder)}
                                >
                                  Select
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="map">
                  <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Map view would be displayed here</p>
                    {/* In a real app, you'd render a map with responder locations here */}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">Selected Responder</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{selectedResponder?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{getResponderTypeBadge(selectedResponder?.type || '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Current Location:</span>
                    <span>{selectedResponder?.current_location || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Estimated ETA:</span>
                    <span className="flex items-center">
                      <TimerReset className="h-4 w-4 mr-1 text-emergency-600" />
                      {estimatedETA}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes for Responder
                </label>
                <Input
                  id="notes"
                  placeholder="Enter any special instructions or notes..."
                  value={notesForResponder}
                  onChange={(e) => setNotesForResponder(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel || handleBackToSelection}
          disabled={assigningResponder}
        >
          {assignmentStep === 'select' ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            'Back to Selection'
          )}
        </Button>
        
        {assignmentStep === 'confirm' && (
          <Button
            onClick={handleAssignResponder}
            disabled={!selectedResponder || assigningResponder}
            className="bg-emergency-600 hover:bg-emergency-700"
          >
            {assigningResponder ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Confirm Assignment'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResponderAssignmentFlow;
