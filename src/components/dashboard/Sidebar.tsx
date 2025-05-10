
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
  Hospital,
  MessageSquare
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
        "group flex items-center justify-between rounded-md p-2 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors",
        isActive ? "bg-muted text-foreground" : "text-muted-foreground"
      )}
    >
      <div className="flex items-center space-x-3">
        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} />
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

      <SidebarLink to="/communications" icon={MessageSquare}>
        Communications
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
    <div className="flex h-full border-r bg-card flex-col py-4 w-64">
      <div className="px-6 pb-4">
        <Link to="/dashboard" className="flex items-center font-semibold text-primary">
          <span className="text-lg">Rapid Response</span>
          <span className="font-bold ml-1 text-foreground">Guardian</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-6">
        <div className="space-y-1">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main
          </p>
          <SidebarLinks />
        </div>
      </nav>
      <div className="px-3 py-2 mt-auto border-t border-border">
        <div className="flex items-center px-2 py-3 space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            D
          </div>
          <div>
            <p className="text-sm font-medium">Dispatcher</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
