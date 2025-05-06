
import React from 'react';
import { 
  Ambulance, 
  MapPin, 
  Users, 
  Hospital, 
  Phone, 
  FileText, 
  Car, 
  Bell, 
  CarTaxiFront, 
  Route,
  Database,
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const navItems = [
  {
    title: 'Dashboard',
    icon: <Database className="h-5 w-5" />,
    active: true,
    path: '/'
  },
  {
    title: 'Emergency Requests',
    icon: <Bell className="h-5 w-5" />,
    badge: 3,
    path: '/emergencies'
  },
  {
    title: 'Responders',
    icon: <Users className="h-5 w-5" />,
    badge: 12,
    path: '/responders'
  },
  {
    title: 'Ambulances',
    icon: <Ambulance className="h-5 w-5" />,
    path: '/ambulances'
  },
  {
    title: 'Bajaj (Tuk-Tuk)',
    icon: <CarTaxiFront className="h-5 w-5" />,
    path: '/tuk-tuks'
  },
  {
    title: 'Traffic Officers',
    icon: <Car className="h-5 w-5" />,
    path: '/traffic'
  },
  {
    title: 'Hospitals',
    icon: <Hospital className="h-5 w-5" />,
    path: '/hospitals'
  },
  {
    title: 'Live Map',
    icon: <MapPin className="h-5 w-5" />,
    path: '/map'
  },
  {
    title: 'Routes',
    icon: <Route className="h-5 w-5" />,
    path: '/routes'
  },
  {
    title: 'Reports',
    icon: <FileText className="h-5 w-5" />,
    path: '/reports'
  },
  {
    title: 'Communication',
    icon: <Phone className="h-5 w-5" />,
    path: '/communications'
  },
  {
    title: 'Login / Register',
    icon: <LogIn className="h-5 w-5" />,
    path: '/auth',
    highlight: true
  }
];

const Sidebar = () => {
  return (
    <div className="h-full w-64 bg-sidebar shadow-md flex flex-col bg-gradient-to-b from-sidebar to-white">
      <div className="p-4 border-b border-gray-100 flex items-center justify-center">
        <Ambulance className="h-7 w-7 text-emergency-600 mr-2" />
        <div className="text-xl font-bold text-emergency-700 flex items-center">
          <span className="text-emergency-600">Respond</span>
          <span className="ml-1 bg-emergency-500 h-2 w-2 rounded-full emergency-pulse"></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-4 px-2">
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.active 
                  ? "bg-emergency-50 text-emergency-700" 
                  : item.highlight
                  ? "text-emergency-600 hover:bg-emergency-50 hover:text-emergency-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-emergency-600"
              )}
            >
              <div className={cn(
                "mr-3",
                item.active ? "text-emergency-500" : 
                item.highlight ? "text-emergency-500" : "text-gray-400 group-hover:text-emergency-500"
              )}>
                {item.icon}
              </div>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="bg-emergency-100 text-emergency-600 py-0.5 px-2 rounded-full text-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-white/60">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-xs font-medium">JD</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">John Doe</p>
            <p className="text-xs font-medium text-gray-500">Dispatcher</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
