
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Brain, 
  AlertTriangle, 
  MapPin,
  Clock,
  Activity,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PredictionModel {
  id: string;
  name: string;
  type: 'risk_assessment' | 'resource_demand' | 'response_time' | 'incident_clustering';
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'disabled';
  predictions: number;
}

interface RiskPrediction {
  area: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  factors: string[];
  timeframe: string;
  coordinates: [number, number];
}

interface ResourceDemand {
  resource: string;
  currentLevel: number;
  predictedDemand: number;
  timeframe: string;
  confidence: number;
}

export const PredictiveEmergencyAnalytics: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('risk_assessment');

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['prediction-models'],
    queryFn: async (): Promise<PredictionModel[]> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: 'model-001',
          name: 'Emergency Risk Assessment',
          type: 'risk_assessment',
          accuracy: 87.3,
          lastTrained: new Date(Date.now() - 86400000),
          status: 'active',
          predictions: 1247
        },
        {
          id: 'model-002',
          name: 'Resource Demand Forecasting',
          type: 'resource_demand',
          accuracy: 92.1,
          lastTrained: new Date(Date.now() - 43200000),
          status: 'active',
          predictions: 856
        },
        {
          id: 'model-003',
          name: 'Response Time Optimization',
          type: 'response_time',
          accuracy: 89.7,
          lastTrained: new Date(Date.now() - 172800000),
          status: 'training',
          predictions: 634
        },
        {
          id: 'model-004',
          name: 'Incident Pattern Detection',
          type: 'incident_clustering',
          accuracy: 84.2,
          lastTrained: new Date(Date.now() - 259200000),
          status: 'active',
          predictions: 923
        }
      ];
    },
  });

  const { data: riskPredictions = [] } = useQuery({
    queryKey: ['risk-predictions'],
    queryFn: async (): Promise<RiskPrediction[]> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        {
          area: 'Downtown District',
          riskLevel: 'high',
          probability: 78.5,
          factors: ['High traffic volume', 'Event in progress', 'Weather conditions'],
          timeframe: 'Next 4 hours',
          coordinates: [40.7128, -74.0060]
        },
        {
          area: 'Industrial Zone',
          riskLevel: 'medium',
          probability: 45.2,
          factors: ['Peak work hours', 'Equipment maintenance'],
          timeframe: 'Next 2 hours',
          coordinates: [40.7589, -73.9851]
        },
        {
          area: 'Residential Area North',
          riskLevel: 'low',
          probability: 23.1,
          factors: ['School hours', 'Low activity'],
          timeframe: 'Next 6 hours',
          coordinates: [40.7831, -73.9712]
        }
      ];
    },
  });

  const { data: resourceDemands = [] } = useQuery({
    queryKey: ['resource-demands'],
    queryFn: async (): Promise<ResourceDemand[]> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return [
        {
          resource: 'Ambulances',
          currentLevel: 12,
          predictedDemand: 18,
          timeframe: 'Next 2 hours',
          confidence: 89.3
        },
        {
          resource: 'Fire Trucks',
          currentLevel: 8,
          predictedDemand: 6,
          timeframe: 'Next 4 hours',
          confidence: 76.8
        },
        {
          resource: 'Police Units',
          currentLevel: 24,
          predictedDemand: 31,
          timeframe: 'Next 3 hours',
          confidence: 92.1
        }
      ];
    },
  });

  const trendData = [
    { time: '00:00', incidents: 4, predicted: 3 },
    { time: '04:00', incidents: 2, predicted: 2 },
    { time: '08:00', incidents: 8, predicted: 9 },
    { time: '12:00', incidents: 12, predicted: 14 },
    { time: '16:00', incidents: 18, predicted: 16 },
    { time: '20:00', incidents: 15, predicted: 13 },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'training': return 'secondary';
      case 'disabled': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predictive Emergency Analytics
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Risk Predictions</TabsTrigger>
          <TabsTrigger value="resources">Resource Demand</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        {/* Risk Predictions */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskPredictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{prediction.area}</h3>
                    <Badge variant={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Risk Probability</span>
                        <span className="text-sm font-bold">{prediction.probability}%</span>
                      </div>
                      <Progress value={prediction.probability} className="h-2" />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Risk Factors:</p>
                      <div className="space-y-1">
                        {prediction.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                            <span className="text-xs">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {prediction.timeframe}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resource Demand */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceDemands.map((demand, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{demand.resource}</h3>
                    <Badge variant="outline">{demand.confidence}% confidence</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current</p>
                        <p className="text-2xl font-bold">{demand.currentLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Predicted</p>
                        <p className="text-2xl font-bold text-blue-600">{demand.predictedDemand}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Demand vs Capacity</span>
                        <span className="text-sm">
                          {Math.round((demand.predictedDemand / demand.currentLevel) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((demand.predictedDemand / demand.currentLevel) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {demand.timeframe}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ML Models */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{model.name}</h3>
                    <Badge variant={getModelStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Accuracy</span>
                        <span className="text-sm font-bold">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Predictions Made</p>
                        <p className="font-medium">{model.predictions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Trained</p>
                        <p className="font-medium">{model.lastTrained.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Target className="h-4 w-4 mr-1" />
                        Retrain
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Metrics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trend Analysis */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Prediction vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="incidents" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Actual Incidents"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted Incidents"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
