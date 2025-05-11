
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';
import RequireAuth from '@/components/auth/RequireAuth';
import RespondersPage from '@/pages/RespondersPage';
import HospitalsPage from '@/pages/HospitalsPage';
import SettingsPage from '@/pages/SettingsPage';
import IoTDevicesPage from '@/pages/IoTDevices';
import DeviceRegistrationPage from '@/pages/DeviceRegistration';
import ResponderTrackingPage from '@/pages/ResponderTracking';
import AnalyticsPage from '@/pages/Analytics';
import EmergenciesPage from '@/pages/EmergenciesPage';
import EmergencyDetailsPage from '@/pages/EmergencyDetailsPage';
import EmergencyCreate from '@/pages/EmergencyCreate';
import CommunicationsPage from '@/pages/Communications';
import Auth from '@/pages/Auth';

function App() {
  const { auth, checkSession, loading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      await checkSession();
    };
    fetchData();
  }, [checkSession]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 text-emergency-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 6h-5v12h5a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"/>
            <path d="M11 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5"/>
            <line x1="14" x2="14" y1="9" y2="15"/>
          </svg>
        </div>
        <p className="text-emergency-700">Loading...</p>
      </div>
    </div>;
  }

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
          <Route path="/login" element={auth ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/auth" element={auth ? <Navigate to="/dashboard" /> : <Auth />} />
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard />
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
      </Router>
    </HelmetProvider>
  );
}

export default App;
