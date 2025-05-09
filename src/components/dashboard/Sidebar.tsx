import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Settings, Users, MapPin, BarChart3, Smartphone } from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, children }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-foreground",
        isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
};

const SidebarLinks = () => {
  return (
    <div className="space-y-1">
      <SidebarLink to="/dashboard" icon={LayoutDashboard}>
        Dashboard
      </SidebarLink>

      <SidebarLink to="/emergencies" icon={Home}>
        Emergencies
      </SidebarLink>

      <SidebarLink to="/responders" icon={Users}>
        Responders
      </SidebarLink>
      
      <SidebarLink to="/responder-tracking" icon={MapPin}>
        Responder Tracking
      </SidebarLink>
      
      <SidebarLink to="/analytics" icon={BarChart3}>
        Analytics & Reports
      </SidebarLink>
      
      <SidebarLink to="/iot" icon={Smartphone}>
        IoT Devices
      </SidebarLink>

      <SidebarLink to="/settings" icon={Settings}>
        Settings
      </SidebarLink>
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="flex h-full border-r bg-secondary flex-col py-4 w-64">
      <div className="px-6 pb-4">
        <Link to="/dashboard" className="flex items-center font-semibold">
          Rapid Response Guardian
        </Link>
      </div>
      <nav className="flex-1 space-y-8">
        <div className="space-y-1">
          <SidebarLinks />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
