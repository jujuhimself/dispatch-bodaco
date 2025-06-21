import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { RBACProvider } from '@/services/rbac-service';
import RequireAuth from '@/components/auth/RequireAuth';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import { LoadingState } from '@/components/ui/loading-state';
import './App.css';

// Create a stable query client instance outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  },
});

// Lazy load components
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const Auth = lazy(() => import('@/pages/Auth'));
const EmergenciesPage = lazy(() => import('@/pages/EmergenciesPage'));
const Responders = lazy(() => import('@/pages/Responders'));
const HospitalsPage = lazy(() => import('@/pages/HospitalsPage'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Communications = lazy(() => import('@/pages/Communications'));
const EmergencyCreate = lazy(() => import('@/pages/EmergencyCreate'));
const EmergencyDetailsPage = lazy(() => import('@/pages/EmergencyDetailsPage'));
const IoTDevices = lazy(() => import('@/pages/IoTDevices'));
const DeviceRegistration = lazy(() => import('@/pages/DeviceRegistration'));
const ResponderTracking = lazy(() => import('@/pages/ResponderTracking'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const EnhancedDashboard = lazy(() => import('@/pages/EnhancedDashboard'));
const AdvancedEmergencyManagement = lazy(() => import('@/pages/AdvancedEmergencyManagement'));
const EnhancedUX = lazy(() => import('@/pages/EnhancedUX'));
const AIEnhancedOperations = lazy(() => import('@/pages/AIEnhancedOperations'));
const SystemIntegrationPage = lazy(() => import('@/pages/SystemIntegrationPage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

// Layout wrapper for authenticated pages
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {children}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
          <AuthProvider>
            <RBACProvider>
              <Router>
                <Suspense fallback={<LoadingState isLoading={true} className="min-h-screen" />}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={
                      <RequireAuth>
                        <AppLayout>
                          <Dashboard />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="/admin" element={
                      <RequireAuth>
                        <AppLayout>
                          <AdminDashboard />
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
                    <Route path="/advanced-emergency-management" element={
                      <RequireAuth>
                        <AppLayout>
                          <AdvancedEmergencyManagement />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="/enhanced-ux" element={
                      <RequireAuth>
                        <AppLayout>
                          <EnhancedUX />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="/ai-enhanced-operations" element={
                      <RequireAuth>
                        <AppLayout>
                          <AIEnhancedOperations />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="/system-integration" element={
                      <RequireAuth>
                        <AppLayout>
                          <SystemIntegrationPage />
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
                    <Route path="/responders" element={
                      <RequireAuth>
                        <AppLayout>
                          <Responders />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="/responder-tracking" element={
                      <RequireAuth>
                        <AppLayout>
                          <ResponderTracking />
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
                    <Route path="/analytics" element={
                      <RequireAuth>
                        <AppLayout>
                          <Analytics />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="/communications" element={
                      <RequireAuth>
                        <AppLayout>
                          <Communications />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="/iot-devices" element={
                      <RequireAuth>
                        <AppLayout>
                          <IoTDevices />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="/device-registration" element={
                      <RequireAuth>
                        <AppLayout>
                          <DeviceRegistration />
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
                    <Route path="/settings" element={
                      <RequireAuth>
                        <AppLayout>
                          <SettingsPage />
                        </AppLayout>
                      </RequireAuth>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Toaster />
              </Router>
            </RBACProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
