
import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';
import RequireAuth from '@/components/auth/RequireAuth';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { useNetworkStatus } from '@/services/network/network-status';
import UpdateNotification from '@/components/app/UpdateNotification';
import { useTour, OnboardingTour, TourStep } from '@/components/onboarding/OnboardingTour';
import EnhancedDashboard from '@/pages/EnhancedDashboard';
import Auth from '@/pages/Auth';
import { useIsMobile } from '@/hooks/use-mobile';

// Dynamic imports for better performance
const RespondersPage = React.lazy(() => import('@/pages/RespondersPage'));
const HospitalsPage = React.lazy(() => import('@/pages/HospitalsPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const IoTDevicesPage = React.lazy(() => import('@/pages/IoTDevices'));
const DeviceRegistrationPage = React.lazy(() => import('@/pages/DeviceRegistration'));
const ResponderTrackingPage = React.lazy(() => import('@/pages/ResponderTracking'));
const AnalyticsPage = React.lazy(() => import('@/pages/Analytics'));
const EmergenciesPage = React.lazy(() => import('@/pages/EmergenciesPage'));
const EmergencyDetailsPage = React.lazy(() => import('@/pages/EmergencyDetailsPage'));
const EmergencyCreate = React.lazy(() => import('@/pages/EmergencyCreate'));
const CommunicationsPage = React.lazy(() => import('@/pages/Communications'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const UpdatePassword = React.lazy(() => import('@/pages/UpdatePassword'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFound'));

// Minimal loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <div className="text-red-600 text-lg font-semibold">Boda & Co</div>
      <div className="text-sm text-gray-600">Loading Emergency Response System...</div>
    </div>
  </div>
);

// Network status indicator
const NetworkStatusIndicator = () => {
  const { online } = useNetworkStatus();
  
  if (online) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center animate-pulse">
      <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-2"></span>
      Offline Mode
    </div>
  );
};

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// App layout wrapper for authenticated routes
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      {isMobile && <MobileNavigation />}
      {children}
    </div>
  );
};

// Simplified onboarding
const AppOnboarding = () => {
  const appTour = useTour('app-onboarding');
  
  const tourSteps: TourStep[] = [
    {
      target: 'body',
      title: 'Welcome to Boda & Co Emergency Response',
      content: 'This platform helps you manage emergency incidents efficiently and coordinate response efforts.',
      position: 'bottom',
    }
  ];
  
  return (
    <OnboardingTour 
      {...appTour.tourProps}
      steps={tourSteps} 
      onComplete={() => console.log('App tour completed')}
    />
  );
};

function App() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <ProductionErrorBoundary>
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to={user ? "/enhanced-dashboard" : "/auth"} />} />
              <Route path="/login" element={<Navigate to="/auth" />} />
              <Route path="/auth" element={user ? <Navigate to="/enhanced-dashboard" /> : <Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              
              <Route path="/dashboard" element={
                <RequireAuth>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/enhanced-dashboard" element={
                <RequireAuth>
                  <AppLayout>
                    <EnhancedDashboard />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/profile" element={<RequireAuth><AppLayout><ProfilePage /></AppLayout></RequireAuth>} />
              <Route path="/responders" element={<RequireAuth><AppLayout><RespondersPage /></AppLayout></RequireAuth>} />
              <Route path="/hospitals" element={<RequireAuth><AppLayout><HospitalsPage /></AppLayout></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><AppLayout><SettingsPage /></AppLayout></RequireAuth>} />
              <Route path="/iot" element={<RequireAuth><AppLayout><IoTDevicesPage /></AppLayout></RequireAuth>} />
              <Route path="/device-registration" element={<RequireAuth><AppLayout><DeviceRegistrationPage /></AppLayout></RequireAuth>} />
              <Route path="/responder-tracking" element={<RequireAuth><AppLayout><ResponderTrackingPage /></AppLayout></RequireAuth>} />
              <Route path="/analytics" element={<RequireAuth><AppLayout><AnalyticsPage /></AppLayout></RequireAuth>} />
              <Route path="/emergencies" element={<RequireAuth><AppLayout><EmergenciesPage /></AppLayout></RequireAuth>} />
              <Route path="/emergency/create" element={<RequireAuth><AppLayout><EmergencyCreate /></AppLayout></RequireAuth>} />
              <Route path="/emergency/:id" element={<RequireAuth><AppLayout><EmergencyDetailsPage /></AppLayout></RequireAuth>} />
              <Route path="/communications" element={<RequireAuth><AppLayout><CommunicationsPage /></AppLayout></RequireAuth>} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <NetworkStatusIndicator />
          <UpdateNotification />
          <AppOnboarding />
        </Router>
      </HelmetProvider>
    </ProductionErrorBoundary>
  );
}

export default App;
