
import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { AIInsights } from '@/components/ai/AIInsights';
import { DecisionSupport } from '@/components/ai/DecisionSupport';
import { AutomationPanel } from '@/components/ai/AutomationPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AIEnhancedOperations = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">AI-Enhanced Operations</h1>
          </div>

          {isMobile ? (
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="decisions">Decisions</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="insights" className="space-y-6">
                <AIInsights />
              </TabsContent>
              
              <TabsContent value="decisions" className="space-y-6">
                <DecisionSupport />
              </TabsContent>
              
              <TabsContent value="automation" className="space-y-6">
                <AutomationPanel />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <AIInsights />
                <AutomationPanel />
              </div>
              <div className="space-y-6">
                <DecisionSupport />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedOperations;
