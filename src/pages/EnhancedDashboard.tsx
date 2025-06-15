
import React, { useState } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import EmergencyStats from '@/components/dashboard/EmergencyStats';
import { QuickEmergencyCreate } from '@/components/emergency/QuickEmergencyCreate';
import { CommunicationHub } from '@/components/communication/CommunicationHub';
import { ResponderManagement } from '@/components/responder/ResponderManagement';
import { HospitalIntegration } from '@/components/hospital/HospitalIntegration';
import ActiveEmergencies from '@/components/dashboard/ActiveEmergencies';
import AvailableResponders from '@/components/dashboard/AvailableResponders';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';
import IoTDeviceManagement from '@/components/iot/IoTDeviceManagement';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
import PredictiveAnalytics from '@/components/analytics/PredictiveAnalytics';
import { RealTimeUpdates } from '@/components/realtime/RealTimeUpdates';
import { UserManagement } from '@/components/admin/UserManagement';
import { SystemOptimization } from '@/components/system/SystemOptimization';
import { AdvancedMonitoring } from '@/components/advanced/AdvancedMonitoring';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { Emergency, Responder } from '@/types/emergency-types';

const EnhancedDashboard = () => {
  const isMobile = useIsMobile();
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | undefined>();
  const [selectedResponder, setSelectedResponder] = useState<Responder | undefined>();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">Enhanced Mission Control</h1>
          </div>

          {/* Emergency Stats */}
          <div className="mb-6">
            <EmergencyStats />
          </div>

          {/* Main Content Tabs for Mobile, Grid for Desktop */}
          {isMobile ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6 text-xs">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="responders">Responders</TabsTrigger>
                <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="iot">IoT</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <ActiveEmergencies />
                <AvailableResponders />
                <RealTimeUpdates />
                <CommunicationHub 
                  emergency={selectedEmergency}
                  responder={selectedResponder}
                />
              </TabsContent>
              
              <TabsContent value="responders" className="space-y-6">
                <ResponderManagement />
              </TabsContent>
              
              <TabsContent value="hospitals" className="space-y-6">
                <HospitalIntegration />
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <Tabs defaultValue="advanced" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="predictive">Predictive</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="advanced">
                    <AdvancedAnalytics />
                  </TabsContent>
                  
                  <TabsContent value="predictive">
                    <PredictiveAnalytics />
                  </TabsContent>
                  
                  <TabsContent value="performance">
                    <PerformanceMonitor />
                  </TabsContent>
                </Tabs>
              </TabsContent>
              
              <TabsContent value="iot" className="space-y-6">
                <IoTDeviceManagement />
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-6">
                <Tabs defaultValue="users" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users">
                    <UserManagement />
                  </TabsContent>
                  
                  <TabsContent value="system">
                    <SystemOptimization />
                  </TabsContent>
                  
                  <TabsContent value="monitoring">
                    <AdvancedMonitoring />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <QuickEmergencyCreate />
                <ActiveEmergencies />
                
                {/* Enhanced tabs for desktop */}
                <Tabs defaultValue="responders" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="responders">Responders</TabsTrigger>
                    <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="iot">IoT</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="responders" className="mt-6">
                    <ResponderManagement />
                  </TabsContent>
                  
                  <TabsContent value="hospitals" className="mt-6">
                    <HospitalIntegration />
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="mt-6">
                    <Tabs defaultValue="advanced" className="w-full">
                      <TabsList>
                        <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
                        <TabsTrigger value="predictive">Predictive</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="advanced" className="mt-4">
                        <AdvancedAnalytics />
                      </TabsContent>
                      
                      <TabsContent value="predictive" className="mt-4">
                        <PredictiveAnalytics />
                      </TabsContent>
                      
                      <TabsContent value="performance" className="mt-4">
                        <PerformanceMonitor />
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                  
                  <TabsContent value="iot" className="mt-6">
                    <IoTDeviceManagement />
                  </TabsContent>
                  
                  <TabsContent value="admin" className="mt-6">
                    <Tabs defaultValue="users" className="w-full">
                      <TabsList>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="system">System Optimization</TabsTrigger>
                        <TabsTrigger value="monitoring">Advanced Monitoring</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="users" className="mt-4">
                        <UserManagement />
                      </TabsContent>
                      
                      <TabsContent value="system" className="mt-4">
                        <SystemOptimization />
                      </TabsContent>
                      
                      <TabsContent value="monitoring" className="mt-4">
                        <AdvancedMonitoring />
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <AvailableResponders />
                <RealTimeUpdates />
                <CommunicationHub 
                  emergency={selectedEmergency}
                  responder={selectedResponder}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
