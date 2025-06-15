
import React from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import Header from './Header';
import EmergencyStats from './EmergencyStats';
import ActiveEmergencies from './ActiveEmergencies';
import AvailableResponders from './AvailableResponders';
import HospitalStatus from './HospitalStatus';
import EmergencyMap from './EmergencyMap';
import RecentCommunications from './RecentCommunications';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* App Header */}
      <AppHeader />
      
      {/* Main Content */}
      <main className="p-4 md:p-6 space-y-6">
        {/* Stats Overview */}
        <EmergencyStats />
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ActiveEmergencies />
            <EmergencyMap />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <AvailableResponders />
            <HospitalStatus />
            <RecentCommunications />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
