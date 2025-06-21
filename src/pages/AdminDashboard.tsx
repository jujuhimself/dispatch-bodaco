
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserApprovalPanel } from '@/components/admin/UserApprovalPanel';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { UserManagement } from '@/components/admin/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Bell, 
  Settings, 
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Only allow admin access
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-orange-100">System administration and user management</p>
            </div>
            <div className="hidden md:flex space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold">
                  <Shield className="h-6 w-6 text-green-300" />
                  <span>Admin</span>
                </div>
                <p className="text-sm text-orange-200">Access Level</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              User Approvals
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-6">
            <UserApprovalPanel />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <AdminNotifications />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>All systems operational</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Platform Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Active Users:</span>
                          <span className="font-semibold">24/7</span>
                        </div>
                        <div className="flex justify-between">
                          <span>System Uptime:</span>
                          <span className="font-semibold">99.9%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
