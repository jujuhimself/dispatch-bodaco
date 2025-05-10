
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Ambulance, 
  LayoutDashboard, 
  Settings, 
  Users, 
  MapPin, 
  BarChart3, 
  Smartphone,
  BellRing,
  CirclePlus,
  Hospital
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  badge?: number;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, children, badge }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center justify-between rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-foreground",
        isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
      )}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </div>
      
      {typeof badge === 'number' && badge > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
};

const SidebarLinks = () => {
  // In a real app, you would fetch these counts from your backend
  const pendingEmergencies = 3;
  
  return (
    <div className="space-y-1">
      <SidebarLink to="/dashboard" icon={LayoutDashboard}>
        Dashboard
      </SidebarLink>

      <SidebarLink to="/emergencies" icon={BellRing} badge={pendingEmergencies}>
        Emergencies
      </SidebarLink>

      <SidebarLink to="/emergency/create" icon={CirclePlus}>
        New Emergency
      </SidebarLink>

      <SidebarLink to="/responders" icon={Ambulance}>
        Responders
      </SidebarLink>
      
      <SidebarLink to="/hospitals" icon={Hospital}>
        Hospitals
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
