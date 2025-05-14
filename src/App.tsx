
import React, { useEffect, Suspense, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';
import RequireAuth from '@/components/auth/RequireAuth';
import { Loader } from '@/components/ui/loader';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { initializeNetworkListeners, useNetworkStatus } from '@/services/network/network-status';
import UpdateNotification from '@/components/app/UpdateNotification';
import { initializeIndexedDB } from '@/services/indexed-db-service';
import { toast } from 'sonner';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { useTour, OnboardingTour } from '@/components/onboarding/OnboardingTour';

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
const Auth = React.lazy(() => import('@/pages/Auth'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const UpdatePassword = React.lazy(() => import('@/pages/UpdatePassword'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFound'));

// Improved loading fallback with skeleton UI
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100">
    <div className="w-full max-w-md px-4">
      <div className="flex justify-center mb-6">
        <Loader className="h-12 w-12 text-emergency-600" />
      </div>
      <SkeletonCard rows={4} className="bg-white/70 p-6 rounded-xl shadow-lg" />
    </div>
  </div>
);

// Network status indicator with better styling
const NetworkStatusIndicator = () => {
  const { online } = useNetworkStatus();
  
  if (online) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-error-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center animate-pulse">
      <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-2"></span>
      Offline Mode
    </div>
  );
};

// ScrollToTop component to ensure page scrolls to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// New onboarding guide for first-time users
const AppOnboarding = () => {
  const appTour = useTour('app-onboarding');
  
  const tourSteps = [
    {
      target: 'body',
      title: 'Welcome to Rapid Response',
      content: 'This quick tour will help you get familiar with our emergency management system.',
      position: 'center' as const,
    },
    {
      target: '[data-tour="sidebar"]',
      title: 'Navigation',
      content: 'Use the sidebar to navigate between different sections of the application.',
      position: 'right' as const,
    },
    {
      target: '[data-tour="user-menu"]',
      title: 'User Settings',
      content: 'Access your profile, preferences and logout from here.',
      position: 'bottom' as const,
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
  const { auth, checkSession, loading } = useAuth();
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check auth session
        await checkSession();
        
        // Initialize network status listeners
        initializeNetworkListeners();
        
        // Initialize IndexedDB for offline support
        await initializeIndexedDB();
        
        // Mark app as initialized
        setAppInitialized(true);
        
      } catch (error) {
        console.error("Error initializing app:", error);
        toast.error("There was a problem initializing the application. Some features may not work correctly.");
        setAppInitialized(true); // Allow the app to continue even with initialization errors
      }
    };
    
    initializeApp();
  }, [checkSession]);

  // Show loading state while app is initializing or auth is loading
  if (loading || !appInitialized) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
              <Route path="/login" element={auth ? <Navigate to="/dashboard" /> : <LoginPage />} />
              <Route path="/auth" element={auth ? <Navigate to="/dashboard" /> : <Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              
              <Route path="/dashboard" element={
                <RequireAuth>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </RequireAuth>
              } />
              
              <Route path="/profile" element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              } />
              <Route path="/responders" element={
                <RequireAuth>
                  <RespondersPage />
                </RequireAuth>
              } />
              <Route path="/hospitals" element={
                <RequireAuth>
                  <HospitalsPage />
                </RequireAuth>
              } />
              <Route path="/settings" element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              } />
              <Route path="/iot" element={
                <RequireAuth>
                  <IoTDevicesPage />
                </RequireAuth>
              } />
              <Route path="/device-registration" element={
                <RequireAuth>
                  <DeviceRegistrationPage />
                </RequireAuth>
              } />
              <Route path="/responder-tracking" element={
                <RequireAuth>
                  <ResponderTrackingPage />
                </RequireAuth>
              } />
              <Route path="/analytics" element={
                <RequireAuth>
                  <AnalyticsPage />
                </RequireAuth>
              } />
              <Route path="/emergencies" element={
                <RequireAuth>
                  <EmergenciesPage />
                </RequireAuth>
              } />
              <Route path="/emergency/create" element={
                <RequireAuth>
                  <EmergencyCreate />
                </RequireAuth>
              } />
              <Route path="/emergency/:id" element={
                <RequireAuth>
                  <EmergencyDetailsPage />
                </RequireAuth>
              } />
              <Route path="/communications" element={
                <RequireAuth>
                  <CommunicationsPage />
                </RequireAuth>
              } />
              
              {/* Catch all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <NetworkStatusIndicator />
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            visibleToasts={3} 
            duration={4000}
          />
          <UpdateNotification />
          <AppOnboarding />
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
