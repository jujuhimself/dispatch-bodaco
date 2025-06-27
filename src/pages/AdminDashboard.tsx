import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Users, 
  Clock, 
  Activity,
  Plus,
  TrendingUp,
  MapPin,
  Phone
} from 'lucide-react';
import { getEmergencyStatistics, fetchActiveEmergencies } from '@/services/emergency-service';
import { QuickEmergencyCreate } from '@/components/emergency/QuickEmergencyCreate';
import { useAuth } from '@/contexts/AuthContext';
import ApprovalGuard from '@/components/auth/ApprovalGuard';

const AdminDashboard = () => {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['emergency-statistics'],
    queryFn: getEmergencyStatistics,
    refetchInterval: 30000
  });

  const { data: activeEmergencies, isLoading: emergenciesLoading } = useQuery({
    queryKey: ['active-emergencies'],
    queryFn: fetchActiveEmergencies,
    refetchInterval: 15000
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'on_site': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Emergency Response Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <Link to="/emergencies">
              <Button className="bg-red-600 hover:bg-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                View All Emergencies
              </Button>
            </Link>
          </div>

          {/* Quick Emergency Creation */}
          <QuickEmergencyCreate />

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Emergencies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEmergencies || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.activeEmergencies || 0}</div>
                <p className="text-xs text-muted-foreground">Requiring attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Responders</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.availableResponders || 0}</div>
                <p className="text-xs text-muted-foreground">Ready to deploy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.avgResponseTime || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Emergencies List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-red-600" />
                Active Emergencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emergenciesLoading ? (
                <div className="flex justify-center py-8">
                  <Activity className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : activeEmergencies && activeEmergencies.length > 0 ? (
                <div className="space-y-4">
                  {activeEmergencies.slice(0, 5).map((emergency) => (
                    <div key={emergency.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Badge className={getPriorityColor(emergency.priority)}>
                          P{emergency.priority}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{emergency.type}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {emergency.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(emergency.status)}>
                          {emergency.status.replace('_', ' ')}
                        </Badge>
                        <Link to={`/emergency/${emergency.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {activeEmergencies.length > 5 && (
                    <div className="text-center pt-4">
                      <Link to="/emergencies">
                        <Button variant="outline">View All {activeEmergencies.length} Active Emergencies</Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active emergencies at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/emergencies" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Management
                  </Button>
                </Link>
                <Link to="/responders" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Responder Management
                  </Button>
                </Link>
                <Link to="/communications" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Communications
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Health</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time Updates</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 space-y-2">
                  <p>• System initialized</p>
                  <p>• Emergency database ready</p>
                  <p>• Responder system active</p>
                  <p>• Communications enabled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default AdminDashboard;
