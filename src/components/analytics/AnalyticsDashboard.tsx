
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import { getEmergencyStatistics, fetchDeviceAlerts } from '@/services/iot-service';
import { Loader2, Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['emergencyStatistics'],
    queryFn: getEmergencyStatistics,
    refetchInterval: 60000, // Refetch every minute
  });
  
  const { data: alerts, isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ['deviceAlerts'],
    queryFn: () => fetchDeviceAlerts(),
  });
  
  // Prepare data for charts
  const alertTypesData = React.useMemo(() => {
    if (!alerts) return [];
    
    const alertTypes: Record<string, number> = {};
    
    alerts.forEach(alert => {
      if (!alertTypes[alert.alert_type]) {
        alertTypes[alert.alert_type] = 0;
      }
      alertTypes[alert.alert_type]++;
    });
    
    return Object.keys(alertTypes).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: alertTypes[type]
    }));
  }, [alerts]);
  
  const alertSeverityData = React.useMemo(() => {
    if (!alerts) return [];
    
    const severityCounts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };
    
    alerts.forEach(alert => {
      if (alert.severity >= 8) severityCounts.Critical++;
      else if (alert.severity >= 5) severityCounts.High++;
      else if (alert.severity >= 3) severityCounts.Medium++;
      else severityCounts.Low++;
    });
    
    return [
      { name: 'Critical', count: severityCounts.Critical },
      { name: 'High', count: severityCounts.High },
      { name: 'Medium', count: severityCounts.Medium },
      { name: 'Low', count: severityCounts.Low }
    ];
  }, [alerts]);
  
  const pieChartData = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      { name: 'Active Emergencies', value: stats.activeEmergencies },
      { name: 'Available Responders', value: stats.availableResponders },
      { name: 'Device Alerts', value: stats.deviceAlerts },
      { name: 'Pending Escalations', value: stats.pendingEscalations },
    ];
  }, [stats]);
  
  if (statsLoading || alertsLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (statsError || alertsError) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading analytics data</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Alert Analytics
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Distribution
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Emergencies</div>
                  <div className="text-2xl font-bold">{stats?.totalEmergencies || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Active Emergencies</div>
                  <div className="text-2xl font-bold text-amber-600">{stats?.activeEmergencies || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Available Responders</div>
                  <div className="text-2xl font-bold text-green-600">{stats?.availableResponders || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Hospital Capacity</div>
                  <div className="text-2xl font-bold text-blue-600">{stats?.hospitalCapacity || 0}%</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="h-[300px]">
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts">
            <div className="h-[400px]">
              <ChartContainer config={{}}>
                <BarChart data={alertSeverityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Count" fill="#8884d8" />
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution">
            <div className="h-[400px]">
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={alertTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {alertTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
