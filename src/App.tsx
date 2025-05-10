
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

function App() {
  const { auth, checkSession, loading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      await checkSession();
    };
    fetchData();
  }, [checkSession]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<LoginPage />} />
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
  );
}

export default App;
