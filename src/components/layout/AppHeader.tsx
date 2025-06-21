
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Home,
  Activity,
  Users,
  AlertTriangle,
  Building2,
  MessageSquare,
  BarChart3,
  Smartphone,
  Bike,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  const navigate = useNavigate();
  
  // Safely get auth context
  let user = null;
  let signOut = () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
  } catch (error) {
    console.log('Auth context not available:', error);
  }

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback - redirect anyway
      window.location.href = '/auth';
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const navigationItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Mission Control', href: '/enhanced-dashboard', icon: Activity },
    { label: 'Emergencies', href: '/emergencies', icon: AlertTriangle },
    { label: 'Responders', href: '/responders', icon: Users },
    { label: 'Hospitals', href: '/hospitals', icon: Building2 },
    { label: 'Communications', href: '/communications', icon: MessageSquare },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'IoT Devices', href: '/iot-devices', icon: Smartphone },
  ];

  return (
    <header className={cn(
      "bg-gradient-to-r from-orange-500 to-red-500 border-b border-red-600 px-4 py-3 flex items-center justify-between shadow-lg relative z-50",
      className
    )}>
      {/* Logo and Title */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center space-x-2">
          <Bike className="h-8 w-8 text-red-700" />
          <div>
            <h1 className="text-xl font-bold text-white">Boda & Co</h1>
            <p className="text-xs text-orange-100">Emergency Response Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu - Hidden on mobile to avoid overlap */}
      <nav className="hidden lg:flex items-center space-x-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-orange-100 hover:text-white hover:bg-orange-600/30 rounded-md transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {/* Admin link for admin users */}
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center space-x-1 px-3 py-2 text-sm text-orange-100 hover:text-white hover:bg-orange-600/30 rounded-md transition-colors"
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* Right side - Notifications and User Menu */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-orange-100 hover:text-white hover:bg-orange-600/30">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full text-xs"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-1 text-orange-100 hover:text-white hover:bg-orange-600/30">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white text-red-600 text-sm font-medium">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.name || user?.email || 'User'}</p>
                <p className="text-xs text-orange-200 capitalize">{user?.role || 'user'}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg z-50">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium">{user?.name || user?.email || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role || 'user'}</p>
            </div>
            
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 cursor-pointer">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            
            {user?.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center space-x-2 px-3 py-2 cursor-pointer">
                  <Shield className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center space-x-2 px-3 py-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
