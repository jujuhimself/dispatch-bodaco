
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Users, 
  Route, 
  Hospital, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

interface DecisionOption {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: 'low' | 'medium' | 'high';
  timeToExecute: string;
  resources: string[];
  pros: string[];
  cons: string[];
}

export const DecisionSupport: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState('resource-allocation');
  
  const scenarios = {
    'resource-allocation': {
      title: 'Resource Allocation Optimization',
      description: 'Multiple emergencies detected. AI recommends optimal resource distribution.',
      options: [
        {
          id: 'option-1',
          title: 'Prioritize Critical Cases',
          description: 'Allocate 80% of resources to high-priority emergencies',
          probability: 94,
          impact: 'high',
          timeToExecute: '5 minutes',
          resources: ['6 Ambulances', '2 Fire Units', '4 Police Units'],
          pros: ['Saves more lives', 'Better outcome for critical cases'],
          cons: ['Longer wait for non-critical cases', 'Higher resource strain']
        },
        {
          id: 'option-2',
          title: 'Balanced Distribution',
          description: 'Distribute resources evenly across all active emergencies',
          probability: 76,
          impact: 'medium',
          timeToExecute: '3 minutes',
          resources: ['4 Ambulances', '3 Fire Units', '5 Police Units'],
          pros: ['Fair allocation', 'Reduced overall wait times'],
          cons: ['May compromise critical cases', 'Sub-optimal for high priority']
        }
      ]
    },
    'route-optimization': {
      title: 'Emergency Route Planning',
      description: 'Traffic incident blocking main routes. AI suggests alternative paths.',
      options: [
        {
          id: 'route-1',
          title: 'Highway Bypass Route',
          description: 'Use alternate highway with 15% longer distance but 40% faster',
          probability: 89,
          impact: 'high',
          timeToExecute: '2 minutes',
          resources: ['GPS Updates', 'Traffic Control'],
          pros: ['Faster arrival time', 'Avoids congestion'],
          cons: ['Higher fuel consumption', 'Unfamiliar territory']
        }
      ]
    }
  };

  const currentScenario = scenarios[activeScenario as keyof typeof scenarios];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          AI Decision Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeScenario} onValueChange={setActiveScenario}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resource-allocation">Resource Allocation</TabsTrigger>
            <TabsTrigger value="route-optimization">Route Planning</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeScenario} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">{currentScenario.title}</h3>
              <p className="text-sm text-blue-700 mt-1">{currentScenario.description}</p>
            </div>
            
            <div className="space-y-4">
              {currentScenario.options.map((option, index) => (
                <div key={option.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{option.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(option.impact)}>
                        {option.impact.toUpperCase()} IMPACT
                      </Badge>
                      <Badge variant="outline">
                        {option.probability}% Success
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">{option.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-2 text-green-700">Pros</h5>
                      <ul className="text-xs space-y-1">
                        {option.pros.map((pro, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-2 text-orange-700">Cons</h5>
                      <ul className="text-xs space-y-1">
                        {option.cons.map((con, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-orange-500" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-2">Resources Required</h5>
                      <div className="space-y-1">
                        {option.resources.map((resource, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{option.timeToExecute}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Success Rate:</span>
                        <Progress value={option.probability} className="w-20 h-2" />
                        <span className="text-sm font-medium">{option.probability}%</span>
                      </div>
                    </div>
                    
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Simulate
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Execute
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
