
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plug, 
  Shield, 
  Database, 
  Wifi, 
  Server,
  CheckCircle,
  AlertTriangle,
  Activity,
  Globe
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'api' | 'database' | 'service' | 'hardware';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  uptime: number;
  lastSync: string;
  dataVolume: string;
  latency: number;
  healthScore: number;
}

export const SystemIntegration: React.FC = () => {
  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Hospital Management System',
      type: 'api',
      status: 'connected',
      uptime: 99.8,
      lastSync: '2 minutes ago',
      dataVolume: '2.4 GB',
      latency: 45,
      healthScore: 98
    },
    {
      id: '2',
      name: 'Traffic Control System',
      type: 'api',
      status: 'connected',
      uptime: 97.2,
      lastSync: '1 minute ago',
      dataVolume: '1.8 GB',
      latency: 120,
      healthScore: 89
    },
    {
      id: '3',
      name: 'Weather Service API',
      type: 'service',
      status: 'connected',
      uptime: 99.9,
      lastSync: '30 seconds ago',
      dataVolume: '150 MB',
      latency: 30,
      healthScore: 99
    },
    {
      id: '4',
      name: 'IoT Device Network',
      type: 'hardware',
      status: 'syncing',
      uptime: 94.5,
      lastSync: '5 minutes ago',
      dataVolume: '5.2 GB',
      latency: 200,
      healthScore: 76
    },
    {
      id: '5',
      name: 'Police Dispatch System',
      type: 'database',
      status: 'error',
      uptime: 85.2,
      lastSync: '1 hour ago',
      dataVolume: '980 MB',
      latency: 500,
      healthScore: 45
    }
  ]);

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'syncing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'syncing': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'disconnected': return <Wifi className="h-4 w-4 text-gray-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getTypeIcon = (type: Integration['type']) => {
    switch (type) {
      case 'api': return <Globe className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'service': return <Server className="h-4 w-4" />;
      case 'hardware': return <Plug className="h-4 w-4" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;
  const avgHealthScore = Math.round(integrations.reduce((sum, i) => sum + i.healthScore, 0) / integrations.length);
  const totalDataVolume = integrations.reduce((sum, i) => sum + parseFloat(i.dataVolume), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plug className="h-5 w-5 mr-2" />
          System Integration Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* System Health Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{connectedIntegrations}/{integrations.length}</div>
                <div className="text-xs text-gray-500">Active Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{avgHealthScore}%</div>
                <div className="text-xs text-gray-500">Average Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalDataVolume.toFixed(1)} GB</div>
                <div className="text-xs text-gray-500">Total Data Volume</div>
              </div>
            </div>
            
            {/* Integration Status Overview */}
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(integration.type)}
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-500">Last sync: {integration.lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getHealthColor(integration.healthScore)}`}>
                        {integration.healthScore}% Health
                      </div>
                      <div className="text-xs text-gray-500">{integration.latency}ms latency</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(integration.status)}
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(integration.type)}
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <Badge variant="outline" className="mt-1">
                        {integration.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Uptime:</span>
                    <div className="font-medium">{integration.uptime}%</div>
                    <Progress value={integration.uptime} className="mt-1 h-2" />
                  </div>
                  <div>
                    <span className="text-gray-500">Health Score:</span>
                    <div className={`font-medium ${getHealthColor(integration.healthScore)}`}>
                      {integration.healthScore}%
                    </div>
                    <Progress value={integration.healthScore} className="mt-1 h-2" />
                  </div>
                  <div>
                    <span className="text-gray-500">Data Volume:</span>
                    <div className="font-medium">{integration.dataVolume}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Latency:</span>
                    <div className="font-medium">{integration.latency}ms</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Test Connection
                  </Button>
                  <Button variant="outline" size="sm">
                    View Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>SSL/TLS Encryption</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Authentication</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Encryption</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      AES-256
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Access Control</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Review Required
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>HIPAA Compliance</span>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SOC 2 Type II</span>
                    <Badge className="bg-green-100 text-green-800">Certified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GDPR Compliance</span>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audit Trail</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
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
