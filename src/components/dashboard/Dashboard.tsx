
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import EmergencyStats from './EmergencyStats';
import EmergencyMap from './EmergencyMap';
import ActiveEmergencies from './ActiveEmergencies';
import AvailableResponders from './AvailableResponders';
import HospitalStatus from './HospitalStatus';
import RecentCommunications from './RecentCommunications';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FilePlus } from 'lucide-react';
import { Toaster } from 'sonner';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Mission Control</h1>
            <Link to="/emergency/create">
              <Button
                variant="default"
                size="sm"
                className="bg-emergency-600 hover:bg-emergency-700 text-white"
              >
                <FilePlus className="h-4 w-4 mr-2" />
                New Emergency
              </Button>
            </Link>
          </div>

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
