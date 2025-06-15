
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Command, 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Zap
} from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'emergency' | 'system' | 'integration' | 'performance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  source: string;
  actionRequired: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'emergency' | 'system' | 'communication';
  enabled: boolean;
}

export const UnifiedControlCenter: React.FC = () => {
  const [alerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'emergency',
      title: 'Mass Casualty Event Detected',
      description: 'Multiple emergency calls from downtown area. Auto-scaling response initiated.',
      severity: 'critical',
      timestamp: '2 minutes ago',
      source: 'AI Emergency Detection',
      actionRequired: true
    },
    {
      id: '2',
      type: 'system',
      title: 'Database Performance Degradation',
      description: 'Response time increased by 23%. Investigating root cause.',
      severity: 'medium',
      timestamp: '5 minutes ago',
      source: 'Performance Monitor',
      actionRequired: false
    },
    {
      id: '3',
      type: 'integration',
      title: 'Hospital System Sync Delayed',
      description: 'City General Hospital API experiencing latency issues.',
      severity: 'high',
      timestamp: '8 minutes ago',
      source: 'Integration Monitor',
      actionRequired: true
    }
  ]);

  const [quickActions] = useState<QuickAction[]>([
    {
      id: '1',
      label: 'Emergency Broadcast',
      description: 'Send system-wide alert',
      icon: <AlertTriangle className="h-4 w-4" />,
      category: 'emergency',
      enabled: true
    },
    {
      id: '2',
      label: 'All-Call Responders',
      description: 'Activate all available units',
      icon: <Users className="h-4 w-4" />,
      category: 'emergency',
      enabled: true
    },
    {
      id: '3',
      label: 'System Maintenance',
      description: 'Enter maintenance mode',
      icon: <Activity className="h-4 w-4" />,
      category: 'system',
      enabled: false
    },
    {
      id: '4',
      label: 'Conference Bridge',
      description: 'Start emergency conference',
      icon: <Phone className="h-4 w-4" />,
      category: 'communication',
      enabled: true
    }
  ]);

  const getSeverityColor = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'system': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'integration': return <Zap className="h-4 w-4 text-orange-600" />;
      case 'performance': return <Clock className="h-4 w-4 text-purple-600" />;
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const actionRequired = alerts.filter(a => a.actionRequired).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Command className="h-5 w-5 mr-2" />
            Unified Control Center
          </div>
          <div className="flex items-center gap-2">
            {criticalAlerts > 0 && (
              <Badge className="bg-red-100 text-red-800 animate-pulse">
                {criticalAlerts} Critical
              </Badge>
            )}
            <Badge variant="outline">
              System Operational
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(alert.type)}
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    {alert.actionRequired && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Action Required
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Source: {alert.source}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500">{alert.timestamp}</span>
                    </div>
                  </div>
                  
                  {alert.actionRequired && (
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Take Action
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No active alerts. All systems operating normally.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Card key={action.id} className={action.enabled ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-50'}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{action.label}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <Button 
                        variant={action.enabled ? "default" : "outline"} 
                        size="sm"
                        disabled={!action.enabled}
                      >
                        Execute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">98.7%</div>
                  <div className="text-sm text-gray-500">System Uptime</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-gray-500">Active Sessions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-gray-500">Active Emergencies</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">34</div>
                  <div className="text-sm text-gray-500">Available Responders</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Regional Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>North District</span>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>South District</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Elevated</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>East District</span>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>West District</span>
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Radio Network</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cellular Backup</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Satellite Link</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
