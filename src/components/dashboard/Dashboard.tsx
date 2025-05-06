
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './Header';
import Sidebar from './Sidebar';
import EmergencyStats from './EmergencyStats';
import EmergencyMap from './EmergencyMap';
import ActiveEmergencies from './ActiveEmergencies';
import AvailableResponders from './AvailableResponders';
import HospitalStatus from './HospitalStatus';
import RecentCommunications from './RecentCommunications';
import { Toaster } from '@/components/ui/sonner';

// Create a client
const queryClient = new QueryClient();

const Dashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6">
            <EmergencyStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <EmergencyMap />
              <ActiveEmergencies />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AvailableResponders />
              <HospitalStatus />
              <RecentCommunications />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
};

export default Dashboard;
