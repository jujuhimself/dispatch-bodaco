import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { RBACProvider } from '@/services/rbac-service';
import RequireAuth from '@/components/auth/RequireAuth';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import { LoadingState } from '@/components/ui/loading-state';
import './App.css';

// Lazy load components
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const Auth = lazy(() => import('@/pages/Auth'));
const EmergenciesPage = lazy(() => import('@/pages/EmergenciesPage'));
const RespondersPage = lazy(() => import('@/pages/RespondersPage'));
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

function App() {
  return (
    <ProductionErrorBoundary>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <RBACProvider>
              <Router>
                <div className="min-h-screen bg-slate-50">
                  <Suspense fallback={<LoadingState isLoading={true} />}>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/" element={
                        <RequireAuth>
                          <Dashboard />
                        </RequireAuth>
                      } />
                      <Route path="/enhanced-dashboard" element={
                        <RequireAuth>
                          <EnhancedDashboard />
                        </RequireAuth>
                      } />
                      <Route path="/advanced-emergency-management" element={
                        <RequireAuth>
                          <AdvancedEmergencyManagement />
                        </RequireAuth>
                      } />
                      <Route path="/enhanced-ux" element={
                        <RequireAuth>
                          <EnhancedUX />
                        </RequireAuth>
                      } />
                      <Route path="/ai-enhanced-operations" element={
                        <RequireAuth>
                          <AIEnhancedOperations />
                        </RequireAuth>
                      } />
                      <Route path="/system-integration" element={
                        <RequireAuth>
                          <SystemIntegrationPage />
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
                      <Route path="/responders" element={
                        <RequireAuth>
                          <RespondersPage />
                        </RequireAuth>
                      } />
                      <Route path="/responder-tracking" element={
                        <RequireAuth>
                          <ResponderTracking />
                        </RequireAuth>
                      } />
                      <Route path="/hospitals" element={
                        <RequireAuth>
                          <HospitalsPage />
                        </RequireAuth>
                      } />
                      <Route path="/analytics" element={
                        <RequireAuth>
                          <Analytics />
                        </RequireAuth>
                      } />
                      <Route path="/communications" element={
                        <RequireAuth>
                          <Communications />
                        </RequireAuth>
                      } />
                      <Route path="/iot-devices" element={
                        <RequireAuth>
                          <IoTDevices />
                        </RequireAuth>
                      } />
                      <Route path="/device-registration" element={
                        <RequireAuth>
                          <DeviceRegistration />
                        </RequireAuth>
                      } />
                      <Route path="/profile" element={
                        <RequireAuth>
                          <ProfilePage />
                        </RequireAuth>
                      } />
                      <Route path="/settings" element={
                        <RequireAuth>
                          <SettingsPage />
                        </RequireAuth>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <Toaster />
                </div>
              </Router>
            </RBACProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ProductionErrorBoundary>
  );
}

export default App;
