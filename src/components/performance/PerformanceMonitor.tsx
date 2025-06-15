
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Cpu, MemoryStick, Wifi, Smartphone, 
  Globe, Clock, Zap, AlertCircle, CheckCircle
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'good', threshold: 80 },
    { name: 'Memory Usage', value: 62, unit: '%', status: 'good', threshold: 85 },
    { name: 'Network Latency', value: 120, unit: 'ms', status: 'good', threshold: 200 },
    { name: 'Page Load Time', value: 1.8, unit: 's', status: 'good', threshold: 3 },
    { name: 'API Response', value: 340, unit: 'ms', status: 'warning', threshold: 500 },
    { name: 'Error Rate', value: 0.2, unit: '%', status: 'good', threshold: 1 }
  ]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        status: metric.value > metric.threshold ? 'critical' : 
                metric.value > metric.threshold * 0.8 ? 'warning' : 'good'
      })));
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const overallHealth = metrics.every(m => m.status === 'good') ? 'excellent' :
                       metrics.some(m => m.status === 'critical') ? 'critical' :
                       metrics.some(m => m.status === 'warning') ? 'warning' : 'good';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge className="bg-green-100 text-green-800">
              <Wifi className="h-3 w-3 mr-1" />
              Online ({connectionType})
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <Wifi className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {overallHealth === 'excellent' && <CheckCircle className="h-6 w-6 text-green-500" />}
              {overallHealth === 'warning' && <AlertCircle className="h-6 w-6 text-yellow-500" />}
              {overallHealth === 'critical' && <AlertCircle className="h-6 w-6 text-red-500" />}
              <div>
                <p className="font-medium capitalize">{overallHealth}</p>
                <p className="text-sm text-muted-foreground">
                  All systems {overallHealth === 'excellent' ? 'operating normally' : 'need attention'}
                </p>
              </div>
            </div>
            <Badge className={getStatusBadge(overallHealth)}>
              {overallHealth.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {metric.name.includes('CPU') && <Cpu className="h-4 w-4" />}
                  {metric.name.includes('Memory') && <MemoryStick className="h-4 w-4" />}
                  {metric.name.includes('Network') && <Wifi className="h-4 w-4" />}
                  {metric.name.includes('Load') && <Clock className="h-4 w-4" />}
                  {metric.name.includes('API') && <Globe className="h-4 w-4" />}
                  {metric.name.includes('Error') && <AlertCircle className="h-4 w-4" />}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <Badge className={getStatusBadge(metric.status)}>
                  {metric.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value.toFixed(metric.name.includes('Load') ? 1 : 0)}
                  </span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                
                <Progress 
                  value={(metric.value / metric.threshold) * 100} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 {metric.unit}</span>
                  <span>{metric.threshold} {metric.unit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Mobile Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Zap className="h-6 w-6 text-blue-500" />
              <div>
                <p className="font-medium">Fast Loading</p>
                <p className="text-sm text-muted-foreground">95% of pages load under 2s</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Activity className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">Responsive Design</p>
                <p className="text-sm text-muted-foreground">Optimized for all devices</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Globe className="h-6 w-6 text-purple-500" />
              <div>
                <p className="font-medium">Offline Ready</p>
                <p className="text-sm text-muted-foreground">Service worker active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Run Diagnostics
        </Button>
        <Button variant="outline" size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Optimize Performance
        </Button>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          View History
        </Button>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
