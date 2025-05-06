
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import EmergencyStats from './EmergencyStats';
import EmergencyMap from './EmergencyMap';
import ActiveEmergencies from './ActiveEmergencies';
import AvailableResponders from './AvailableResponders';
import HospitalStatus from './HospitalStatus';
import RecentCommunications from './RecentCommunications';
import { Toaster } from '@/components/ui/sonner';

const Dashboard = () => {
  return (
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
      <Toaster />
    </div>
  );
};

export default Dashboard;
