
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/Layout';
import Auth from '@/pages/Auth';
import Dashboard from '@/components/dashboard/Dashboard';
import UserDashboard from '@/pages/UserDashboard';
import DispatcherDashboard from '@/pages/DispatcherDashboard';
import ResponderDashboard from '@/pages/ResponderDashboard';
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
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/user" element={
              <ProtectedRoute requiredRole="user">
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/dispatcher" element={
              <ProtectedRoute requiredRole="dispatcher">
                <Layout>
                  <DispatcherDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/responder" element={
              <ProtectedRoute requiredRole="responder">
                <Layout>
                  <ResponderDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/emergencies" element={
              <ProtectedRoute>
                <Layout>
                  <EmergenciesPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/emergency/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateEmergency />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/emergency/:id" element={
              <ProtectedRoute>
                <Layout>
                  <EmergencyDetailsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/emergency-detail/:id" element={
              <ProtectedRoute>
                <Layout>
                  <EmergencyDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/communications" element={
              <ProtectedRoute>
                <Layout>
                  <Communications />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/responders" element={
              <ProtectedRoute>
                <Layout>
                  <Responders />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/operations" element={
              <ProtectedRoute>
                <Layout>
                  <EmergencyOperationsCenter />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
