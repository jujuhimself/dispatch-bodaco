import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  MapPin, 
  Clock,
  Users,
  Activity,
  MessageSquare,
  Plus,
  RefreshCw
} from 'lucide-react';
import { 
  fetchActiveEmergencies, 
  fetchAvailableResponders,
  getEmergencyStatistics,
  subscribeToEmergencies,
  createEmergency
} from '@/services/emergency-service';
import { Emergency, Responder } from '@/types/emergency-types';
import { EmergencyAssignmentWorkflow } from '@/components/emergency/EmergencyAssignmentWorkflow';
import { EmergencyStatusTracker } from '@/components/emergency/EmergencyStatusTracker';
import RealTimeChatInterface from '@/components/communications/RealTimeChatInterface';
import { toast } from 'sonner';

export const EmergencyOperationsCenter: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch active emergencies
  const { 
    data: emergencies = [], 
    isLoading: emergenciesLoading,
    refetch: refetchEmergencies 
  } = useQuery({
    queryKey: ['active-emergencies'],
    queryFn: fetchActiveEmergencies,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch available responders
  const { 
    data: responders = [], 
    isLoading: respondersLoading 
  } = useQuery({
    queryKey: ['available-responders'],
    queryFn: fetchAvailableResponders,
    refetchInterval: 15000,
  });

  // Fetch statistics
  const { 
    data: stats,
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['emergency-statistics'],
    queryFn: getEmergencyStatistics,
    refetchInterval: 30000,
  });

  // Create emergency mutation for testing
  const createEmergencyMutation = useMutation({
    mutationFn: createEmergency,
    onSuccess: () => {
      toast.success('Test emergency created');
      queryClient.invalidateQueries({ queryKey: ['active-emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['emergency-statistics'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create emergency');
    }
  });

  // Real-time subscription
  useEffect(() => {
    const subscription = subscribeToEmergencies((payload) => {
      console.log('Real-time emergency update:', payload);
      queryClient.invalidateQueries({ queryKey: ['active-emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['emergency-statistics'] });
      toast.info('Emergency status updated');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const createTestEmergency = () => {
    const testEmergencies = [
      {
        type: 'Medical Emergency',
        description: 'Heart attack patient needs immediate assistance',
        location: 'Bole Road, near Commercial Bank',
        priority: 1,
        coordinates: { x: 38.7578, y: 9.0192 }
      },
      {
        type: 'Vehicle Crash',
        description: 'Multi-vehicle collision blocking traffic',
        location: 'Mexico Square intersection',
        priority: 2,
        coordinates: { x: 38.7614, y: 9.0084 }
      },
      {
        type: 'Fire Emergency',
        description: 'Kitchen fire spreading in restaurant',
        location: 'Piazza area, Italian restaurant',
        priority: 1,
        coordinates: { x: 38.7369, y: 9.0437 }
      }
    ];
    
    const randomEmergency = testEmergencies[Math.floor(Math.random() * testEmergencies.length)];
    createEmergencyMutation.mutate(randomEmergency);
  };

  const handleAssignmentComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['active-emergencies'] });
    queryClient.invalidateQueries({ queryKey: ['available-responders'] });
    toast.success('Assignment completed successfully');
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'destructive';
      case 2: return 'default';
      case 3: return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'assigned': return 'default';
      case 'in_transit': return 'secondary';
      case 'on_site': return 'default';
      case 'resolved': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emergency Operations Center</h1>
          <p className="text-muted-foreground">Real-time emergency management and coordination</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchEmergencies()}
            disabled={emergenciesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${emergenciesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={createTestEmergency}
            disabled={createEmergencyMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Test Emergency
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.activeEmergencies || 0}</p>
              <p className="text-xs text-muted-foreground">Active Emergencies</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.availableResponders || 0}</p>
              <p className="text-xs text-muted-foreground">Available Responders</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.avgResponseTime || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Avg Response Time</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.hospitalCapacity || 0}%</p>
              <p className="text-xs text-muted-foreground">Hospital Capacity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Operations Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Emergencies */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Active Emergencies ({emergencies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {emergenciesLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-muted-foreground">Loading emergencies...</div>
                      </div>
                    ) : emergencies.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active emergencies</p>
                        <p className="text-sm">Create a test emergency to see the workflow</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {emergencies.map((emergency) => (
                          <Card 
                            key={emergency.id} 
                            className={`cursor-pointer transition-colors ${
                              selectedEmergency?.id === emergency.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedEmergency(emergency)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={getPriorityColor(emergency.priority)}>
                                      Priority {emergency.priority}
                                    </Badge>
                                    <Badge variant={getStatusColor(emergency.status)}>
                                      {emergency.status}
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium">{emergency.type}</h4>
                                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {emergency.location}
                                  </p>
                                  {emergency.description && (
                                    <p className="text-sm mt-2">{emergency.description}</p>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(emergency.reported_at).toLocaleTimeString()}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Available Responders */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Available Responders ({responders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {respondersLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-muted-foreground">Loading responders...</div>
                      </div>
                    ) : responders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No available responders</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {responders.map((responder) => (
                          <Card key={responder.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium text-sm">{responder.name}</h5>
                                  <p className="text-xs text-muted-foreground">
                                    {responder.type} • {responder.current_location}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {responder.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedEmergency ? (
              <>
                <EmergencyStatusTracker 
                  emergency={selectedEmergency} 
                  showControls={true}
                />
                <EmergencyAssignmentWorkflow 
                  emergency={selectedEmergency}
                  onAssignmentComplete={handleAssignmentComplete}
                />
              </>
            ) : (
              <Card className="lg:col-span-2">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Emergency Selected</h3>
                  <p className="text-muted-foreground">
                    Select an emergency from the dashboard to manage assignments
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="communications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Emergency Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmergency ? (
                  <RealTimeChatInterface 
                    emergency={selectedEmergency}
                    title={`${selectedEmergency.type} Communications`}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      Select an emergency to view communications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm p-3 bg-muted rounded">
                    <span className="font-medium">System:</span> Real-time communications enabled
                  </div>
                  <div className="text-sm p-3 bg-muted rounded">
                    <span className="font-medium">Dispatch:</span> All units monitoring emergency channels
                  </div>
                  {selectedEmergency && (
                    <div className="text-sm p-3 bg-blue-50 rounded">
                      <span className="font-medium">Active:</span> {selectedEmergency.type} communications active
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};