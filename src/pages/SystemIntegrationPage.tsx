
import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { SystemIntegration } from '@/components/integration/SystemIntegration';
import { UnifiedControlCenter } from '@/components/integration/UnifiedControlCenter';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SystemIntegrationPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">System Integration & Control</h1>
          </div>

          {isMobile ? (
            <Tabs defaultValue="control" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="control">Control Center</TabsTrigger>
                <TabsTrigger value="integration">Integrations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="control" className="space-y-6">
                <UnifiedControlCenter />
              </TabsContent>
              
              <TabsContent value="integration" className="space-y-6">
                <SystemIntegration />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <UnifiedControlCenter />
              </div>
              <div className="space-y-6">
                <SystemIntegration />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemIntegrationPage;
