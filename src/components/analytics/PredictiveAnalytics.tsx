
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter
} from 'recharts';
import { 
  TrendingUp, Brain, AlertTriangle, Target, Calendar,
  Users, MapPin, Clock, Lightbulb
} from 'lucide-react';

const PredictiveAnalytics = () => {
  const [selectedModel, setSelectedModel] = useState('demand');

  // Mock prediction data
  const demandPrediction = [
    { time: '00:00', predicted: 8, actual: 7, confidence: 85 },
    { time: '04:00', predicted: 5, actual: 4, confidence: 90 },
    { time: '08:00', predicted: 15, actual: 16, confidence: 82 },
    { time: '12:00', predicted: 22, actual: 21, confidence: 88 },
    { time: '16:00', predicted: 19, actual: 18, confidence: 85 },
    { time: '20:00', predicted: 12, actual: 13, confidence: 87 }
  ];

  const resourceOptimization = [
    { area: 'Downtown', current: 4, optimal: 6, efficiency: 78 },
    { area: 'Suburbs', current: 8, optimal: 6, efficiency: 92 },
    { area: 'Industrial', current: 2, optimal: 3, efficiency: 68 },
    { area: 'Residential', current: 6, optimal: 5, efficiency: 85 }
  ];

  const riskAssessment = [
    {
      factor: 'Weather',
      impact: 'High',
      probability: 75,
      description: 'Storm forecast may increase emergency calls by 40%'
    },
    {
      factor: 'Events',
      impact: 'Medium',
      probability: 60,
      description: 'Concert downtown may require additional coverage'
    },
    {
      factor: 'Traffic',
      impact: 'Low',
      probability: 30,
      description: 'Rush hour delays may affect response times'
    }
  ];

  const insights = [
    {
      type: 'optimization',
      title: 'Resource Redistribution',
      description: 'Move 2 units from Suburbs to Downtown for 15% efficiency gain',
      impact: 'High',
      confidence: 92
    },
    {
      type: 'prevention',
      title: 'Proactive Deployment',
      description: 'Deploy additional unit to Industrial area before shift change',
      impact: 'Medium',
      confidence: 78
    },
    {
      type: 'maintenance',
      title: 'Preventive Maintenance',
      description: 'Schedule equipment maintenance during low-demand period',
      impact: 'Low',
      confidence: 85
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'prevention': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
        </div>
        <Button>
          <TrendingUp className="h-4 w-4 mr-2" />
          Generate Forecast
        </Button>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{insight.title}</h3>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium">{insight.confidence}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={selectedModel} onValueChange={setSelectedModel} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="resource">Resource Optimization</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Demand Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandPrediction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">87%</p>
                  <p className="text-sm text-muted-foreground">Average Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">+12%</p>
                  <p className="text-sm text-muted-foreground">Efficiency Gain</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">24h</p>
                  <p className="text-sm text-muted-foreground">Forecast Window</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resource" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resourceOptimization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="current" fill="#ef4444" name="Current" />
                  <Bar dataKey="optimal" fill="#22c55e" name="Optimal" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4">
                <h4 className="font-medium mb-3">Optimization Recommendations</h4>
                <div className="space-y-2">
                  {resourceOptimization.map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{area.area}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">
                          {area.current} → {area.optimal} units
                        </span>
                        <Badge className={area.efficiency > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {area.efficiency}% efficiency
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAssessment.map((risk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{risk.factor}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getImpactColor(risk.impact)}>
                          {risk.impact} Impact
                        </Badge>
                        <span className="text-sm font-medium">{risk.probability}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${risk.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Seasonal Patterns</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Emergency calls increase 23% during winter months
                    </p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Peak: December-February</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Time-based Patterns</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Highest activity between 2-4 PM on weekdays
                    </p>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Peak: 14:00-16:00</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Advanced pattern recognition algorithms analyzing historical data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;
