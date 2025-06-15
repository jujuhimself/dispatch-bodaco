
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmergencyWorkflowEngine } from '@/components/emergency/EmergencyWorkflowEngine';
import { PredictiveEmergencyAnalytics } from '@/components/analytics/PredictiveEmergencyAnalytics';
import { AdvancedReporting } from '@/components/reports/AdvancedReporting';
import { 
  Workflow, 
  Brain, 
  FileText, 
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';

const AdvancedEmergencyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workflows');

  const stats = [
    {
      title: 'Active Workflows',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: Workflow
    },
    {
      title: 'ML Predictions',
      value: '247',
      change: '+18%',
      trend: 'up',
      icon: Brain
    },
    {
      title: 'Reports Generated',
      value: '89',
      change: '+12',
      trend: 'up',
      icon: FileText
    },
    {
      title: 'Automation Rate',
      value: '94%',
      change: '+2%',
      trend: 'up',
      icon: Zap
    }
  ];

  return (
    <>
      <Helmet>
        <title>Advanced Emergency Management | Rapid Response Guardian</title>
      </Helmet>
      
      <div className="h-[calc(100vh-4rem)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Advanced Emergency Management</h1>
            <p className="text-muted-foreground">AI-powered workflows, predictions, and reporting</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Phase 7 Active
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <Badge variant={stat.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-16rem)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Workflow Engine
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Predictive Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Advanced Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
              <EmergencyWorkflowEngine />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
              <PredictiveEmergencyAnalytics />
            </TabsContent>

            <TabsContent value="reports" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
              <AdvancedReporting />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdvancedEmergencyManagement;
