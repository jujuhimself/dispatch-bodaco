
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="responders">Responders</TabsTrigger>
                <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
                <TabsTrigger value="comm">Comm</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <ActiveEmergencies />
                <AvailableResponders />
              </TabsContent>
              
              <TabsContent value="responders" className="space-y-6">
                <ResponderManagement />
              </TabsContent>
              
              <TabsContent value="hospitals" className="space-y-6">
                <HospitalIntegration />
              </TabsContent>
              
              <TabsContent value="comm" className="space-y-6">
                <CommunicationHub 
                  emergency={selectedEmergency}
                  responder={selectedResponder}
                />
              </TabsContent>
              
              <TabsContent value="create" className="space-y-6">
                <QuickEmergencyCreate />
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
                  <TabsList>
                    <TabsTrigger value="responders">Responder Management</TabsTrigger>
                    <TabsTrigger value="hospitals">Hospital Integration</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="responders" className="mt-6">
                    <ResponderManagement />
                  </TabsContent>
                  
                  <TabsContent value="hospitals" className="mt-6">
                    <HospitalIntegration />
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <AvailableResponders />
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
