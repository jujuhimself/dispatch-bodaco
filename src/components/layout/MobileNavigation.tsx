
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu,
  LayoutDashboard, 
  AlertTriangle, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Plus,
  X
} from 'lucide-react';

export const MobileNavigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/emergencies', label: 'Emergencies', icon: AlertTriangle },
    { path: '/communications', label: 'Communications', icon: MessageSquare },
    { path: '/responders', label: 'Responders', icon: Users },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  // Add admin panel for admin users
  if (user?.role === 'admin') {
    navItems.splice(-1, 0, { path: '/admin', label: 'Admin Panel', icon: Shield });
  }

  const closeSheet = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-50 bg-white shadow-md">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Emergency Response</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeSheet}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-orange-100 mt-1">Command Center</p>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSheet}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t">
              <Link to="/emergency/create" onClick={closeSheet}>
                <Button className="w-full bg-red-600 hover:bg-red-700 mb-3">
                  <Plus className="h-4 w-4 mr-2" />
                  New Emergency
                </Button>
              </Link>

              {/* User Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'user'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    signOut();
                    closeSheet();
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
