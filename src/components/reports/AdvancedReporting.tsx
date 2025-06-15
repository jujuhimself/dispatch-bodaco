
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  PieChart,
  BarChart3,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Report {
  id: string;
  name: string;
  type: 'performance' | 'analytics' | 'compliance' | 'operational';
  description: string;
  lastGenerated: Date;
  status: 'ready' | 'generating' | 'scheduled';
  format: 'pdf' | 'excel' | 'json';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  size: string;
}

interface ReportMetrics {
  totalEmergencies: number;
  responseTime: number;
  resolutionRate: number;
  resourceUtilization: number;
  emergencyTypes: Array<{ name: string; value: number; color: string }>;
  dailyTrends: Array<{ day: string; emergencies: number; resolved: number }>;
}

export const AdvancedReporting: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async (): Promise<Report[]> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: 'rpt-001',
          name: 'Emergency Response Performance',
          type: 'performance',
          description: 'Comprehensive analysis of response times and efficiency metrics',
          lastGenerated: new Date(Date.now() - 3600000),
          status: 'ready',
          format: 'pdf',
          frequency: 'daily',
          size: '2.4 MB'
        },
        {
          id: 'rpt-002',
          name: 'Resource Utilization Analysis',
          type: 'analytics',
          description: 'Detailed breakdown of resource allocation and usage patterns',
          lastGenerated: new Date(Date.now() - 7200000),
          status: 'ready',
          format: 'excel',
          frequency: 'weekly',
          size: '5.1 MB'
        },
        {
          id: 'rpt-003',
          name: 'Compliance Audit Report',
          type: 'compliance',
          description: 'Regulatory compliance status and audit findings',
          lastGenerated: new Date(Date.now() - 86400000),
          status: 'generating',
          format: 'pdf',
          frequency: 'monthly',
          size: '3.8 MB'
        },
        {
          id: 'rpt-004',
          name: 'Operational Efficiency Dashboard',
          type: 'operational',
          description: 'Real-time operational metrics and KPI tracking',
          lastGenerated: new Date(Date.now() - 1800000),
          status: 'ready',
          format: 'json',
          frequency: 'daily',
          size: '1.2 MB'
        }
      ];
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ['report-metrics'],
    queryFn: async (): Promise<ReportMetrics> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        totalEmergencies: 847,
        responseTime: 4.2,
        resolutionRate: 94.7,
        resourceUtilization: 76.3,
        emergencyTypes: [
          { name: 'Medical', value: 45, color: '#FF6B6B' },
          { name: 'Fire', value: 25, color: '#4ECDC4' },
          { name: 'Police', value: 20, color: '#45B7D1' },
          { name: 'Other', value: 10, color: '#96CEB4' }
        ],
        dailyTrends: [
          { day: 'Mon', emergencies: 124, resolved: 118 },
          { day: 'Tue', emergencies: 98, resolved: 95 },
          { day: 'Wed', emergencies: 143, resolved: 139 },
          { day: 'Thu', emergencies: 156, resolved: 148 },
          { day: 'Fri', emergencies: 189, resolved: 180 },
          { day: 'Sat', emergencies: 87, resolved: 84 },
          { day: 'Sun', emergencies: 50, resolved: 49 }
        ]
      };
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'default';
      case 'generating': return 'secondary';
      case 'scheduled': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'operational': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Advanced Reporting
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                placeholder="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-32"
              />
              <Input
                type="date"
                placeholder="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-32"
              />
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Report Library</TabsTrigger>
          <TabsTrigger value="analytics">Live Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Report Library */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      <h3 className="font-medium">{report.name}</h3>
                    </div>
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Generated</p>
                        <p className="font-medium">{report.lastGenerated.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">File Size</p>
                        <p className="font-medium">{report.size}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Format</p>
                        <p className="font-medium uppercase">{report.format}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Frequency</p>
                        <p className="font-medium capitalize">{report.frequency}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" disabled={report.status === 'generating'}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          {metrics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Emergencies</p>
                        <p className="text-2xl font-bold">{metrics.totalEmergencies}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                        <p className="text-2xl font-bold">{metrics.responseTime}m</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                        <p className="text-2xl font-bold">{metrics.resolutionRate}%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Resource Usage</p>
                        <p className="text-2xl font-bold">{metrics.resourceUtilization}%</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <RechartsPieChart
                          data={metrics.emergencyTypes}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {metrics.emergencyTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </RechartsPieChart>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Emergency Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={metrics.dailyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="emergencies" fill="#8884d8" name="Emergencies" />
                        <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Report Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.filter(r => r.frequency !== 'daily').map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Runs {report.frequency} • Next: {new Date(Date.now() + 86400000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.frequency}</Badge>
                      <Button variant="outline" size="sm">
                        Edit Schedule
                      </Button>
                    </div>
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
