
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
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

function App() {
  const { auth, setAuth, checkSession } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await checkSession();
      setLoading(false);
    };
    fetchData();
  }, [checkSession]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
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
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
