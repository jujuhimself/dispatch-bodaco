
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
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/enhanced-dashboard', label: 'Mission Control', icon: Activity },
  { path: '/emergencies', label: 'Emergencies', icon: AlertTriangle },
  { path: '/responders', label: 'Responders', icon: Users },
  { path: '/hospitals', label: 'Hospitals', icon: Building2 },
  { path: '/communications', label: 'Communications', icon: MessageSquare },
  { path: '/iot', label: 'IoT Devices', icon: Smartphone },
  { path: '/analytics', label: 'Analytics', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleNavigation = () => {
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-red-600">Boda & Co</h2>
              <p className="text-sm text-gray-600">Emergency Response</p>
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
                        ? "bg-red-50 text-red-700 border-l-4 border-red-500" 
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
            <div className="p-4 border-t">
              <div className="mb-4">
                <p className="text-sm font-medium">{user?.name || user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
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
