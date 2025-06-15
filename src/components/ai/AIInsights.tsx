
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Clock,
  Target,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'prediction' | 'optimization' | 'alert' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  timestamp: string;
}

export const AIInsights: React.FC = () => {
  const [insights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'prediction',
      title: 'Emergency Surge Predicted',
      description: 'AI models predict 40% increase in emergency calls in the next 2 hours based on traffic patterns and weather conditions.',
      confidence: 85,
      priority: 'high',
      actionable: true,
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Responder Reallocation Suggested',
      description: 'Repositioning 3 ambulances to zones A2 and B4 could reduce average response time by 18%.',
      confidence: 92,
      priority: 'medium',
      actionable: true,
      timestamp: '5 minutes ago'
    },
    {
      id: '3',
      type: 'alert',
      title: 'Resource Constraint Detected',
      description: 'Hospital capacity in Zone C approaching critical levels (89% occupied).',
      confidence: 98,
      priority: 'critical',
      actionable: true,
      timestamp: '1 minute ago'
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Training Opportunity Identified',
      description: 'Responder performance analysis suggests focused training on medical emergencies for Team Delta.',
      confidence: 76,
      priority: 'low',
      actionable: false,
      timestamp: '15 minutes ago'
    }
  ]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-blue-600';
    if (confidence >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          AI Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <h4 className="font-medium">{insight.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(insight.priority)}>
                  {insight.priority.toUpperCase()}
                </Badge>
                {insight.actionable && (
                  <Badge variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Actionable
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600">{insight.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Confidence:</span>
                  <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                    {insight.confidence}%
                  </span>
                  <Progress value={insight.confidence} className="w-16 h-2" />
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{insight.timestamp}</span>
                </div>
              </div>
              
              {insight.actionable && (
                <Button size="sm" variant="outline">
                  Take Action
                </Button>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-xs text-gray-500">Prediction Accuracy</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">23%</div>
              <div className="text-xs text-gray-500">Efficiency Gain</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-xs text-gray-500">Active Models</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">847</div>
              <div className="text-xs text-gray-500">Decisions Automated</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
