import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';
import RequireAuth from '@/components/auth/RequireAuth';
import { Loader } from '@/components/ui/loader';
import { toast } from 'sonner';

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

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100">
    <div className="flex flex-col items-center">
      <Loader className="h-12 w-12 text-emergency-600 mb-4" />
      <p className="text-emergency-700">Loading...</p>
    </div>
  </div>
);

function App() {
  const { auth, checkSession, loading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error("Error checking session:", error);
        toast.error("Error connecting to authentication service");
      }
    };
    
    fetchData();
  }, [checkSession]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <HelmetProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
            <Route path="/login" element={auth ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/auth" element={auth ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            <Route path="/dashboard" element={
              <RequireAuth>
                <Dashboard />
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
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
