
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  AlertTriangle, 
  Users, 
  Building2, 
  MessageSquare,
  Settings,
  Activity,
  Smartphone,
  X,
  Bike
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/enhanced-dashboard', label: 'Mission Control', icon: Activity },
  { path: '/emergencies', label: 'Emergencies', icon: AlertTriangle },
  { path: '/responders', label: 'Responders', icon: Users },
  { path: '/hospitals', label: 'Hospitals', icon: Building2 },
  { path: '/communications', label: 'Communications', icon: MessageSquare },
  { path: '/iot-devices', label: 'IoT Devices', icon: Smartphone },
  { path: '/analytics', label: 'Analytics', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Safely handle auth context
  let user = null;
  let signOut = () => {};
  
  try {
    const { useAuth } = require('@/contexts/AuthContext');
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
  } catch (error) {
    console.log('Auth context not available in mobile nav:', error);
  }

  const handleNavigation = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/auth';
    }
  };

  return (
    <div className="lg:hidden fixed top-4 left-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="bg-white/10 text-white hover:bg-white/20">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-white">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-orange-500 to-red-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bike className="h-6 w-6 text-red-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">Boda & Co</h2>
                    <p className="text-sm text-orange-100">Emergency Response</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavigation}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive 
                        ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t bg-gray-50">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
