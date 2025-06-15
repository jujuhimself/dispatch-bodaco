
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  database: number;
  uptime: string;
}

interface OptimizationTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: string;
}

export const SystemOptimization = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    storage: 0,
    network: 0,
    database: 0,
    uptime: '0h 0m'
  });

  const [optimizationTasks, setOptimizationTasks] = useState<OptimizationTask[]>([
    {
      id: '1',
      name: 'Cache Optimization',
      description: 'Optimize application cache for better performance',
      status: 'pending',
      progress: 0,
      estimatedTime: '2 minutes'
    },
    {
      id: '2',
      name: 'Database Cleanup',
      description: 'Clean up old logs and optimize database queries',
      status: 'pending',
      progress: 0,
      estimatedTime: '5 minutes'
    },
    {
      id: '3',
      name: 'Memory Optimization',
      description: 'Free up unused memory and optimize allocation',
      status: 'pending',
      progress: 0,
      estimatedTime: '1 minute'
    }
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    // Simulate real-time metrics
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.random() * 100,
        memory: 65 + Math.random() * 20,
        storage: 45 + Math.random() * 10,
        network: 80 + Math.random() * 20,
        database: 70 + Math.random() * 15,
        uptime: '12h 34m'
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const runOptimization = async (taskId: string) => {
    setIsOptimizing(true);
    
    // Update task status to running
    setOptimizationTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'running', progress: 0 } : task
    ));

    // Simulate optimization progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setOptimizationTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, progress: i } : task
      ));
    }

    // Mark as completed
    setOptimizationTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'completed', progress: 100 } : task
    ));

    setIsOptimizing(false);
  };

  const runAllOptimizations = async () => {
    for (const task of optimizationTasks) {
      if (task.status === 'pending') {
        await runOptimization(task.id);
      }
    }
  };

  const getMetricColor = (value: number) => {
    if (value > 80) return 'text-red-600';
    if (value > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMetricBgColor = (value: number) => {
    if (value > 80) return 'bg-red-100';
    if (value > 60) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Optimization</h2>
        <Button onClick={runAllOptimizations} disabled={isOptimizing}>
          <Zap className="h-4 w-4 mr-2" />
          {isOptimizing ? 'Optimizing...' : 'Optimize All'}
        </Button>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${getMetricColor(metrics.cpu)}`}>
                      {metrics.cpu.toFixed(1)}%
                    </span>
                    <Badge variant={metrics.cpu > 80 ? 'destructive' : metrics.cpu > 60 ? 'secondary' : 'default'}>
                      {metrics.cpu > 80 ? 'High' : metrics.cpu > 60 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  <Progress value={metrics.cpu} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Memory</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${getMetricColor(metrics.memory)}`}>
                      {metrics.memory.toFixed(1)}%
                    </span>
                    <Badge variant={metrics.memory > 80 ? 'destructive' : metrics.memory > 60 ? 'secondary' : 'default'}>
                      {metrics.memory > 80 ? 'High' : metrics.memory > 60 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  <Progress value={metrics.memory} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Network</CardTitle>
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${getMetricColor(metrics.network)}`}>
                      {metrics.network.toFixed(1)}%
                    </span>
                    <Badge variant="default">
                      Stable
                    </Badge>
                  </div>
                  <Progress value={metrics.network} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.uptime}</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">1.2s</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">45</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h4 className="font-medium">{task.name}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.estimatedTime && task.status === 'pending' && (
                          <Badge variant="outline">{task.estimatedTime}</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runOptimization(task.id)}
                          disabled={task.status === 'running' || task.status === 'completed'}
                        >
                          {task.status === 'completed' ? 'Completed' : 'Run'}
                        </Button>
                      </div>
                    </div>
                    {task.status === 'running' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
