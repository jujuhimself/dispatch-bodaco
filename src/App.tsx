
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import RequireAuth from '@/components/auth/RequireAuth';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import Auth from '@/pages/Auth';
import EnhancedDashboard from '@/pages/EnhancedDashboard';

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

// Simple loading fallback - only for lazy loaded components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// App layout wrapper for authenticated routes
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-slate-50">
      {isMobile && <MobileNavigation />}
      {children}
    </div>
  );
};

function App() {
  const { user } = useAuth();

  return (
    <ProductionErrorBoundary>
      <HelmetProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Root route - redirect based on auth status */}
              <Route path="/" element={<Navigate to={user ? "/enhanced-dashboard" : "/auth"} replace />} />
              
              {/* Auth routes */}
              <Route path="/auth" element={user ? <Navigate to="/enhanced-dashboard" replace /> : <Auth />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              
              {/* Protected routes */}
              <Route path="/enhanced-dashboard" element={
                <RequireAuth>
                  <AppLayout>
                    <EnhancedDashboard />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/profile" element={
                <RequireAuth>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/responders" element={
                <RequireAuth>
                  <AppLayout>
                    <RespondersPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/hospitals" element={
                <RequireAuth>
                  <AppLayout>
                    <HospitalsPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/settings" element={
                <RequireAuth>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/iot" element={
                <RequireAuth>
                  <AppLayout>
                    <IoTDevicesPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/device-registration" element={
                <RequireAuth>
                  <AppLayout>
                    <DeviceRegistrationPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/responder-tracking" element={
                <RequireAuth>
                  <AppLayout>
                    <ResponderTrackingPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/analytics" element={
                <RequireAuth>
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/emergencies" element={
                <RequireAuth>
                  <AppLayout>
                    <EmergenciesPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/emergency/create" element={
                <RequireAuth>
                  <AppLayout>
                    <EmergencyCreate />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/emergency/:id" element={
                <RequireAuth>
                  <AppLayout>
                    <EmergencyDetailsPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="/communications" element={
                <RequireAuth>
                  <AppLayout>
                    <CommunicationsPage />
                  </AppLayout>
                </RequireAuth>
              } />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </HelmetProvider>
    </ProductionErrorBoundary>
  );
}

export default App;
