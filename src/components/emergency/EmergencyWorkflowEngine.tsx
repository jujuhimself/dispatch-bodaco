
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Workflow, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Users,
  MapPin,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  estimatedDuration: number;
  actualDuration?: number;
  dependencies: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface EmergencyWorkflow {
  id: string;
  emergencyId: string;
  emergencyType: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  progress: number;
  steps: WorkflowStep[];
  startedAt: Date;
  estimatedCompletion: Date;
  actualCompletion?: Date;
}

export const EmergencyWorkflowEngine: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(true);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['emergency-workflows'],
    queryFn: async (): Promise<EmergencyWorkflow[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: 'wf-001',
          emergencyId: 'em-001',
          emergencyType: 'Medical Emergency',
          status: 'active',
          progress: 65,
          startedAt: new Date(Date.now() - 1800000), // 30 min ago
          estimatedCompletion: new Date(Date.now() + 900000), // 15 min from now
          steps: [
            {
              id: 'step-001',
              name: 'Initial Assessment',
              description: 'Evaluate emergency severity and type',
              status: 'completed',
              assignedTo: 'Dispatcher A',
              estimatedDuration: 5,
              actualDuration: 4,
              dependencies: [],
              priority: 'critical'
            },
            {
              id: 'step-002',
              name: 'Resource Allocation',
              description: 'Assign appropriate responders and equipment',
              status: 'completed',
              assignedTo: 'System Auto',
              estimatedDuration: 3,
              actualDuration: 2,
              dependencies: ['step-001'],
              priority: 'high'
            },
            {
              id: 'step-003',
              name: 'Responder Dispatch',
              description: 'Send responders to emergency location',
              status: 'in_progress',
              assignedTo: 'Unit 23',
              estimatedDuration: 15,
              dependencies: ['step-002'],
              priority: 'high'
            },
            {
              id: 'step-004',
              name: 'On-Scene Assessment',
              description: 'Evaluate situation upon arrival',
              status: 'pending',
              estimatedDuration: 10,
              dependencies: ['step-003'],
              priority: 'medium'
            }
          ]
        },
        {
          id: 'wf-002',
          emergencyId: 'em-002',
          emergencyType: 'Fire Emergency',
          status: 'active',
          progress: 85,
          startedAt: new Date(Date.now() - 2700000), // 45 min ago
          estimatedCompletion: new Date(Date.now() + 600000), // 10 min from now
          steps: [
            {
              id: 'step-005',
              name: 'Fire Department Notification',
              description: 'Alert fire department of incident',
              status: 'completed',
              estimatedDuration: 2,
              actualDuration: 1,
              dependencies: [],
              priority: 'critical'
            },
            {
              id: 'step-006',
              name: 'Evacuation Coordination',
              description: 'Coordinate building evacuation',
              status: 'completed',
              estimatedDuration: 20,
              actualDuration: 18,
              dependencies: ['step-005'],
              priority: 'critical'
            },
            {
              id: 'step-007',
              name: 'Fire Suppression',
              description: 'Active fire fighting operations',
              status: 'in_progress',
              assignedTo: 'Fire Unit 12',
              estimatedDuration: 30,
              dependencies: ['step-006'],
              priority: 'critical'
            }
          ]
        }
      ];
    },
  });

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Emergency Workflow Engine
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={autoMode ? 'default' : 'secondary'}>
                {autoMode ? 'Auto Mode' : 'Manual Mode'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoMode(!autoMode)}
              >
                {autoMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedWorkflow(workflow.id)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{workflow.emergencyType}</h3>
                  <p className="text-sm text-muted-foreground">ID: {workflow.emergencyId}</p>
                </div>
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{workflow.progress}%</span>
                  </div>
                  <Progress value={workflow.progress} className="h-2" />
                </div>

                {/* Timeline */}
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Started: {workflow.startedAt.toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    ETA: {workflow.estimatedCompletion.toLocaleTimeString()}
                  </div>
                </div>

                {/* Current Step */}
                <div className="pt-2 border-t">
                  {workflow.steps.find(step => step.status === 'in_progress') && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {workflow.steps.find(step => step.status === 'in_progress')?.name}
                      </span>
                      {workflow.steps.find(step => step.status === 'in_progress')?.assignedTo && (
                        <Badge variant="outline" className="text-xs">
                          {workflow.steps.find(step => step.status === 'in_progress')?.assignedTo}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Workflow View */}
      {selectedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent>
            {workflows.filter(w => w.id === selectedWorkflow).map(workflow => (
              <div key={workflow.id} className="space-y-4">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{step.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(step.priority)}>
                            {step.priority}
                          </Badge>
                          {step.assignedTo && (
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {step.assignedTo}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Est: {step.estimatedDuration}min</span>
                        {step.actualDuration && (
                          <span>Actual: {step.actualDuration}min</span>
                        )}
                        {step.dependencies.length > 0 && (
                          <span>Dependencies: {step.dependencies.length}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
