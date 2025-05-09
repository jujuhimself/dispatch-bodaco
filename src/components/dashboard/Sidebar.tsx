
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home,
  AlertCircle,
  Users,
  Building2,
  MessageSquare,
  Settings,
  LogOut,
  PlusCircle,
  Smartphone,
  BarChart3
} from "lucide-react";
import { useMobileMenuStore } from '@/hooks/use-mobile';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, active, onClick }) => {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start py-2 px-4 my-0.5",
        active && "bg-muted"
      )}
      onClick={onClick}
    >
      <Link to={to}>
        {icon}
        <span className="ml-2">{label}</span>
      </Link>
    </Button>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { setOpen } = useMobileMenuStore();
  
  const isActive = (path: string) => location.pathname === path;
  const handleLinkClick = () => setOpen(false);
  
  const canCreateEmergency = user?.role === 'dispatcher' || user?.role === 'admin';

  return (
    <aside className="flex flex-col w-64 border-r border-border bg-card text-card-foreground">
      <div className="p-4">
        <div className="flex items-center gap-2 py-2">
          <div className="rounded-md bg-primary/10 p-2">
            <AlertCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="font-semibold text-lg">Respond EMS</div>
        </div>
        
        {canCreateEmergency && (
          <Button className="w-full mt-4 bg-emergency-600 hover:bg-emergency-700" asChild onClick={handleLinkClick}>
            <Link to="/emergencies/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Emergency
            </Link>
          </Button>
        )}
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-4">
            Main Navigation
          </div>
          
          <SidebarLink 
            to="/" 
            icon={<Home className="h-4 w-4" />} 
            label="Dashboard" 
            active={isActive('/')} 
            onClick={handleLinkClick}
          />
          
          <SidebarLink 
            to="/emergencies" 
            icon={<AlertCircle className="h-4 w-4" />} 
            label="Emergencies" 
            active={isActive('/emergencies')} 
            onClick={handleLinkClick}
          />
          
          <SidebarLink 
            to="/responders" 
            icon={<Users className="h-4 w-4" />} 
            label="Responders" 
            active={isActive('/responders')} 
            onClick={handleLinkClick}
          />
          
          <SidebarLink 
            to="/hospitals" 
            icon={<Building2 className="h-4 w-4" />} 
            label="Hospitals" 
            active={isActive('/hospitals')} 
            onClick={handleLinkClick}
          />
          
          <SidebarLink 
            to="/communications" 
            icon={<MessageSquare className="h-4 w-4" />} 
            label="Communications" 
            active={isActive('/communications')} 
            onClick={handleLinkClick}
          />

          <SidebarLink 
            to="/iot-devices" 
            icon={<Smartphone className="h-4 w-4" />} 
            label="IoT Devices" 
            active={isActive('/iot-devices')} 
            onClick={handleLinkClick}
          />
          
          <div className="text-xs font-medium text-muted-foreground px-2 py-4 mt-4">
            System
          </div>
          
          <SidebarLink 
            to="/settings" 
            icon={<Settings className="h-4 w-4" />} 
            label="Settings" 
            active={isActive('/settings')} 
            onClick={handleLinkClick}
          />
          
          <SidebarLink 
            to="/analytics" 
            icon={<BarChart3 className="h-4 w-4" />} 
            label="Analytics" 
            active={isActive('/analytics')} 
            onClick={handleLinkClick}
          />
        </div>
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full h-8 w-8 bg-primary/10 flex items-center justify-center">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-sm font-medium">{user?.name || user?.email}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role || 'User'}</div>
          </div>
        </div>
        
        <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
