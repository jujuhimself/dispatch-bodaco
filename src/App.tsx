import React, { useEffect, Suspense, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';
import RequireAuth from '@/components/auth/RequireAuth';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { initializeNetworkListeners, useNetworkStatus } from '@/services/network/network-status';
import UpdateNotification from '@/components/app/UpdateNotification';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { useTour, OnboardingTour, TourStep } from '@/components/onboarding/OnboardingTour';
import EnhancedDashboard from '@/pages/EnhancedDashboard';
import Auth from '@/pages/Auth';

// Use dynamic imports to improve initial load time
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
    <SkeletonCard rows={2} className="w-full max-w-md" />
  </div>
);

// Network status indicator
const NetworkStatusIndicator = () => {
  const { online } = useNetworkStatus();
  
  if (online) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-error-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center">
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

// Simplified onboarding
const AppOnboarding = () => {
  const appTour = useTour('app-onboarding');
  
  const tourSteps: TourStep[] = [
    {
      target: 'body',
      title: 'Welcome to Boda & Co Emergency Response',
      content: 'This quick tour will help you get familiar with our emergency management system.',
      position: 'bottom',
    },
    {
      target: '[data-tour="sidebar"]',
      title: 'Navigation',
      content: 'Use the sidebar to navigate between different sections of the application.',
      position: 'right',
    },
    {
      target: '[data-tour="user-menu"]',
      title: 'User Settings',
      content: 'Access your profile, preferences and logout from here.',
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

  useEffect(() => {
    // Initialize network status listeners in background
    setTimeout(() => {
      initializeNetworkListeners();
    }, 0);
  }, []);

  // Don't show loading state - let the app start immediately
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} />} />
              <Route path="/login" element={<Navigate to="/auth" />} />
              <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              
              <Route path="/dashboard" element={
                <RequireAuth>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </RequireAuth>
              } />
              
              <Route path="/enhanced-dashboard" element={
                <RequireAuth>
                  <EnhancedDashboard />
                </RequireAuth>
              } />
              
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/responders" element={<RequireAuth><RespondersPage /></RequireAuth>} />
              <Route path="/hospitals" element={<RequireAuth><HospitalsPage /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
              <Route path="/iot" element={<RequireAuth><IoTDevicesPage /></RequireAuth>} />
              <Route path="/device-registration" element={<RequireAuth><DeviceRegistrationPage /></RequireAuth>} />
              <Route path="/responder-tracking" element={<RequireAuth><ResponderTrackingPage /></RequireAuth>} />
              <Route path="/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
              <Route path="/emergencies" element={<RequireAuth><EmergenciesPage /></RequireAuth>} />
              <Route path="/emergency/create" element={<RequireAuth><EmergencyCreate /></RequireAuth>} />
              <Route path="/emergency/:id" element={<RequireAuth><EmergencyDetailsPage /></RequireAuth>} />
              <Route path="/communications" element={<RequireAuth><CommunicationsPage /></RequireAuth>} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <NetworkStatusIndicator />
          <AppOnboarding />
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
