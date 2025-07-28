
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleBasedRedirect from '@/components/auth/RoleBasedRedirect';
import Layout from '@/components/Layout';
import Auth from '@/pages/Auth';
import UserDashboard from '@/pages/UserDashboard';
import DispatcherDashboard from '@/pages/DispatcherDashboard';
import ResponderDashboard from '@/pages/ResponderDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import EmergenciesPage from '@/pages/EmergenciesPage';
import EmergencyDetailsPage from '@/pages/EmergencyDetailsPage';
import EmergencyDetail from '@/pages/EmergencyDetail';
import CreateEmergency from '@/pages/CreateEmergency';
import AdminPanel from '@/pages/AdminPanel';
import Communications from '@/pages/Communications';
import Responders from '@/pages/Responders';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import { EmergencyOperationsCenter } from '@/components/emergency/EmergencyOperationsCenter';
import TestRegistration from '@/pages/test-registration';
import TestAuthFlow from '@/pages/TestAuthFlow';
import TestPasswordReset from '@/pages/test/TestPasswordReset';
import TestAuth from '@/pages/test/TestAuth';
import ResetAuthPage from '@/pages/reset-auth';
import './App.css';

// Create QueryClient outside component to prevent re-creation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/test-registration" element={<TestRegistration />} />
            <Route path="/test-auth" element={<TestAuthFlow />} />

            {/* Public Routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-auth" element={<ResetAuthPage />} />
            <Route path="/test-registration" element={<TestRegistration />} />
            <Route path="/test-auth" element={<TestAuthFlow />} />
            <Route path="/test-password-reset" element={<TestPasswordReset />} />
            <Route path="/test-auth-debug" element={<TestAuth />} />

            {/* Protected Routes */}
            <Route element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="*" element={<Outlet />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }>
              {/* Role-based dashboard redirection */}
              <Route index element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } />
              
              {/* Common routes for all authenticated users */}
              <Route path="settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Role-specific dashboards */}
              <Route path="user-dashboard" element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="admin-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="dispatcher-dashboard" element={
                <ProtectedRoute requiredRole="dispatcher">
                  <DispatcherDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="responder-dashboard" element={
                <ProtectedRoute requiredRole="responder">
                  <ResponderDashboard />
                </ProtectedRoute>
              } />

              {/* Emergency Management */}
              <Route path="emergencies" element={
                <ProtectedRoute requiredPermissions={['view_emergencies']}>
                  <EmergenciesPage />
                </ProtectedRoute>
              } />
              <Route path="emergencies/:id" element={
                <ProtectedRoute requiredPermissions={['view_emergencies']}>
                  <EmergencyDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="emergency/:id" element={
                <ProtectedRoute requiredPermissions={['view_emergency_details']}>
                  <EmergencyDetail />
                </ProtectedRoute>
              } />
              <Route path="emergency/create" element={
                <ProtectedRoute requiredPermissions={['create_emergency']}>
                  <CreateEmergency />
                </ProtectedRoute>
              } />

              {/* Dispatcher Routes */}
              <Route path="dispatcher-dashboard" element={
                <ProtectedRoute requiredRole="dispatcher">
                  <DispatcherDashboard />
                </ProtectedRoute>
              } />
              <Route path="responders" element={
                <ProtectedRoute requiredRole="dispatcher" requiredPermissions={['manage_responders']}>
                  <Responders />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute requiredPermissions={['view_reports']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="eoc" element={
                <ProtectedRoute requiredRole="dispatcher" requiredPermissions={['access_eoc']}>
                  <EmergencyOperationsCenter />
                </ProtectedRoute>
              } />

              {/* Responder Routes */}
              <Route path="responder-dashboard" element={
                <ProtectedRoute requiredRole="responder">
                  <ResponderDashboard />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin" requiredPermissions={['access_admin_panel']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />

              {/* Communications */}
              <Route path="communications" element={
                <ProtectedRoute requiredPermissions={['access_communications']}>
                  <Communications />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
