
import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import EmergencyStats from '@/components/dashboard/EmergencyStats';
import { QuickEmergencyCreate } from '@/components/emergency/QuickEmergencyCreate';
import { RealTimeChat } from '@/components/communication/RealTimeChat';
import { ResponderAssignment } from '@/components/responder/ResponderAssignment';
import { HospitalCapacity } from '@/components/hospital/HospitalCapacity';
import ActiveEmergencies from '@/components/dashboard/ActiveEmergencies';
import AvailableResponders from '@/components/dashboard/AvailableResponders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const EnhancedDashboard = () => {
  const isMobile = useIsMobile();

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
            <Tabs defaultValue="emergencies" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="emergencies">Emergencies</TabsTrigger>
                <TabsTrigger value="responders">Responders</TabsTrigger>
                <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="emergencies" className="space-y-6">
                <QuickEmergencyCreate />
                <ActiveEmergencies />
              </TabsContent>
              
              <TabsContent value="responders" className="space-y-6">
                <AvailableResponders />
              </TabsContent>
              
              <TabsContent value="hospitals" className="space-y-6">
                <HospitalCapacity />
              </TabsContent>
              
              <TabsContent value="chat" className="space-y-6">
                <RealTimeChat />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <QuickEmergencyCreate />
                <ActiveEmergencies />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <AvailableResponders />
                <HospitalCapacity />
                <RealTimeChat />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
