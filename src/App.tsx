
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import RequireAuth from '@/components/auth/RequireAuth';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster } from 'sonner';
import Auth from '@/pages/Auth';
import EnhancedDashboard from '@/pages/EnhancedDashboard';

// Critical pages loaded immediately
import EmergenciesPage from '@/pages/EmergenciesPage';
import EmergencyDetailsPage from '@/pages/EmergencyDetailsPage';
import EmergencyCreate from '@/pages/EmergencyCreate';

// Secondary pages lazy loaded
const RespondersPage = React.lazy(() => import('@/pages/RespondersPage'));
const HospitalsPage = React.lazy(() => import('@/pages/HospitalsPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const CommunicationsPage = React.lazy(() => import('@/pages/Communications'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const UpdatePassword = React.lazy(() => import('@/pages/UpdatePassword'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFound'));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Simplified app layout
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-slate-50">
      {isMobile && <MobileNavigation />}
      {children}
      <Toaster position="top-right" richColors />
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
              {/* Root route - immediate redirect */}
              <Route path="/" element={<Navigate to={user ? "/enhanced-dashboard" : "/auth"} replace />} />
              
              {/* Auth routes - no lazy loading */}
              <Route path="/auth" element={user ? <Navigate to="/enhanced-dashboard" replace /> : <Auth />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              
              {/* Critical protected routes - no lazy loading */}
              <Route path="/enhanced-dashboard" element={
                <RequireAuth>
                  <AppLayout>
                    <EnhancedDashboard />
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
              
              {/* Secondary protected routes - lazy loaded */}
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
