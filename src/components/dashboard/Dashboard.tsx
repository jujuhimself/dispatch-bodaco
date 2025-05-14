
import React, { useEffect } from 'react';
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
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useNetworkStatus } from '@/services/network/network-status';
import { toast } from 'sonner';
import { markPerformance, measurePerformance } from '@/services/performance/metrics-collector';

const Dashboard = () => {
  const { online } = useNetworkStatus();

  // Performance tracking
  useEffect(() => {
    markPerformance('dashboard-mount');
    
    return () => {
      const loadTime = measurePerformance('dashboard-render', 'dashboard-mount', 'dashboard-complete');
      if (loadTime) {
        console.log(`Dashboard rendered in ${loadTime.toFixed(2)}ms`);
      }
    };
  }, []);

  // Mark when the component completes rendering
  useEffect(() => {
    // Use a small timeout to ensure all child components have rendered
    const timer = setTimeout(() => {
      markPerformance('dashboard-complete');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Network status notification
  useEffect(() => {
    if (!online) {
      toast.warning("You're working offline. Limited functionality available.");
    } else {
      // Only show this if returning from offline state
      const lastOnlineState = sessionStorage.getItem('was-online');
      if (lastOnlineState === 'false') {
        toast.success("You're back online!");
      }
      sessionStorage.setItem('was-online', 'true');
    }
    
    if (!online) {
      sessionStorage.setItem('was-online', 'false');
    }
  }, [online]);

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

          <ErrorBoundary componentName="EmergencyStats">
            <EmergencyStats />
          </ErrorBoundary>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ErrorBoundary componentName="EmergencyMap">
              <EmergencyMap />
            </ErrorBoundary>
            <ErrorBoundary componentName="ActiveEmergencies">
              <ActiveEmergencies />
            </ErrorBoundary>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ErrorBoundary componentName="AvailableResponders">
              <AvailableResponders />
            </ErrorBoundary>
            <ErrorBoundary componentName="HospitalStatus">
              <HospitalStatus />
            </ErrorBoundary>
            <ErrorBoundary componentName="RecentCommunications">
              <RecentCommunications />
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Dashboard;
