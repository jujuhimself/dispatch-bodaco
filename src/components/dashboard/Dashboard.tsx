
import React, { useEffect, useState } from 'react';
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
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { OnboardingTour, useTour } from '@/components/onboarding/OnboardingTour';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { online } = useNetworkStatus();
  const isMobile = useIsMobile();
  
  // Tour setup
  const dashboardTour = useTour('dashboard-tour');
  
  // Tour steps
  const tourSteps = [
    {
      target: '[data-tour="mission-control"]',
      title: 'Welcome to Mission Control',
      content: 'This is your dashboard where you can monitor and manage all emergency activities.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="emergency-stats"]',
      title: 'Emergency Statistics',
      content: 'View key metrics and statistics about emergency incidents.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="emergency-map"]',
      title: 'Emergency Map',
      content: 'See the geographical distribution of emergencies in real-time.',
      position: 'right' as const,
    },
    {
      target: '[data-tour="active-emergencies"]',
      title: 'Active Emergencies',
      content: 'Monitor and respond to ongoing emergency incidents.',
      position: 'left' as const,
    },
    {
      target: '[data-tour="new-emergency"]',
      title: 'Create New Emergency',
      content: 'Click here to add a new emergency incident to the system.',
      position: 'bottom' as const,
    },
  ];
  
  // Network status notification (simplified)
  useEffect(() => {
    if (!online) {
      toast.warning("You're working offline. Limited functionality available.", {
        id: 'dashboard-offline',
        duration: 3000
      });
    }
  }, [online]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold" data-tour="mission-control">Mission Control</h1>
            <div className="flex items-center space-x-2">
              <NotificationCenter />
              <Link to="/emergency/create">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-emergency-600 hover:bg-emergency-700 text-white"
                  data-tour="new-emergency"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Emergency
                </Button>
              </Link>
            </div>
          </div>

          <ErrorBoundary componentName="EmergencyStats">
            <div data-tour="emergency-stats">
              <EmergencyStats />
            </div>
          </ErrorBoundary>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6 mb-6`}>
            <ErrorBoundary componentName="EmergencyMap">
              <div data-tour="emergency-map" className="lg:col-span-2">
                <EmergencyMap />
              </div>
            </ErrorBoundary>
            <ErrorBoundary componentName="ActiveEmergencies">
              <div data-tour="active-emergencies">
                <ActiveEmergencies />
              </div>
            </ErrorBoundary>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
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
      
      {/* Onboarding Tour */}
      <OnboardingTour 
        {...dashboardTour.tourProps}
        steps={tourSteps} 
        onComplete={() => console.log('Tour completed')}
      />
    </div>
  );
};

export default Dashboard;
