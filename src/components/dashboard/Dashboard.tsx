
import React from 'react';
import EmergencyStats from './EmergencyStats';
import ActiveEmergencies from './ActiveEmergencies';
import AvailableResponders from './AvailableResponders';
import HospitalStatus from './HospitalStatus';
import EmergencyMap from './EmergencyMap';
import RecentCommunications from './RecentCommunications';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { Shield, Users, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Emergency Response Command</h1>
              <p className="text-orange-100 text-lg">Real-time monitoring and coordination</p>
            </div>
            <div className="hidden md:flex space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold">
                  <Shield className="h-6 w-6 text-green-300" />
                  <span>24/7</span>
                </div>
                <p className="text-sm text-orange-200">Active</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold">
                  <Users className="h-6 w-6 text-blue-300" />
                  <span>15</span>
                </div>
                <p className="text-sm text-orange-200">Responders</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold">
                  <AlertTriangle className="h-6 w-6 text-yellow-300" />
                  <span>3</span>
                </div>
                <p className="text-sm text-orange-200">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
