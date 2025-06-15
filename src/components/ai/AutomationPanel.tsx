
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
  action: string;
  successRate: number;
  executionCount: number;
  lastExecuted: string;
  category: 'response' | 'routing' | 'communication' | 'resource';
}

export const AutomationPanel: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-Assign Nearest Responder',
      description: 'Automatically assign the closest available responder to new emergencies',
      enabled: true,
      trigger: 'New emergency created',
      action: 'Assign optimal responder',
      successRate: 94,
      executionCount: 247,
      lastExecuted: '2 minutes ago',
      category: 'response'
    },
    {
      id: '2',
      name: 'Dynamic Route Optimization',
      description: 'Update responder routes when traffic conditions change',
      enabled: true,
      trigger: 'Traffic update detected',
      action: 'Recalculate optimal route',
      successRate: 87,
      executionCount: 156,
      lastExecuted: '5 minutes ago',
      category: 'routing'
    },
    {
      id: '3',
      name: 'Hospital Alert System',
      description: 'Alert hospitals when capacity reaches critical levels',
      enabled: false,
      trigger: 'Hospital capacity > 85%',
      action: 'Send capacity alert',
      successRate: 98,
      executionCount: 23,
      lastExecuted: '1 hour ago',
      category: 'communication'
    },
    {
      id: '4',
      name: 'Resource Redistribution',
      description: 'Automatically redistribute resources during peak periods',
      enabled: true,
      trigger: 'Emergency surge detected',
      action: 'Reallocate resources',
      successRate: 76,
      executionCount: 34,
      lastExecuted: '15 minutes ago',
      category: 'resource'
    }
  ]);

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getCategoryColor = (category: AutomationRule['category']) => {
    switch (category) {
      case 'response': return 'bg-blue-100 text-blue-800';
      case 'routing': return 'bg-green-100 text-green-800';
      case 'communication': return 'bg-purple-100 text-purple-800';
      case 'resource': return 'bg-orange-100 text-orange-800';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-blue-600';
    if (rate >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const enabledRules = rules.filter(rule => rule.enabled).length;
  const totalExecutions = rules.reduce((sum, rule) => sum + rule.executionCount, 0);
  const avgSuccessRate = Math.round(rules.reduce((sum, rule) => sum + rule.successRate, 0) / rules.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Automation Control Center
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{enabledRules}/{rules.length}</div>
            <div className="text-xs text-gray-500">Active Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalExecutions}</div>
            <div className="text-xs text-gray-500">Total Executions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{avgSuccessRate}%</div>
            <div className="text-xs text-gray-500">Avg Success Rate</div>
          </div>
        </div>

        {/* Automation Rules */}
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                </div>
                <Badge className={getCategoryColor(rule.category)}>
                  {rule.category.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Trigger:</span> {rule.trigger}
                </div>
                <div>
                  <span className="text-gray-500">Action:</span> {rule.action}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Success Rate:</span>
                    <span className={`font-medium ${getSuccessRateColor(rule.successRate)}`}>
                      {rule.successRate}%
                    </span>
                    <Progress value={rule.successRate} className="w-16 h-2" />
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-500">{rule.executionCount} runs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{rule.lastExecuted}</span>
                  </div>
                </div>
                
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  {rule.enabled ? (
                    <Button variant="outline" size="sm">
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Automation Health Check</span>
          </div>
          <p className="text-sm text-yellow-700">
            All automation systems are functioning normally. Last health check: 30 seconds ago.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
