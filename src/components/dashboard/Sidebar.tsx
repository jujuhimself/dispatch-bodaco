
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
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    icon: <Database className="h-5 w-5" />,
    active: true
  },
  {
    title: 'Emergency Requests',
    icon: <Bell className="h-5 w-5" />,
    badge: 3
  },
  {
    title: 'Responders',
    icon: <Users className="h-5 w-5" />,
    badge: 12
  },
  {
    title: 'Ambulances',
    icon: <Ambulance className="h-5 w-5" />
  },
  {
    title: 'Bajaj (Tuk-Tuk)',
    icon: <CarTaxiFront className="h-5 w-5" />
  },
  {
    title: 'Traffic Officers',
    icon: <Car className="h-5 w-5" />
  },
  {
    title: 'Hospitals',
    icon: <Hospital className="h-5 w-5" />
  },
  {
    title: 'Live Map',
    icon: <MapPin className="h-5 w-5" />
  },
  {
    title: 'Routes',
    icon: <Route className="h-5 w-5" />
  },
  {
    title: 'Reports',
    icon: <FileText className="h-5 w-5" />
  },
  {
    title: 'Communication',
    icon: <Phone className="h-5 w-5" />
  }
];

const Sidebar = () => {
  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="text-xl font-bold text-emergency-700 flex items-center justify-center">
          <span className="text-emergency-600">Rapid</span>
          <span className="text-medical-600">Response</span>
          <span className="ml-1 bg-emergency-500 h-2 w-2 rounded-full emergency-pulse"></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
          {navItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                item.active 
                  ? "bg-emergency-50 text-emergency-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-emergency-600"
              )}
            >
              <div className={cn(
                "mr-3",
                item.active ? "text-emergency-500" : "text-gray-400 group-hover:text-emergency-500"
              )}>
                {item.icon}
              </div>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="bg-emergency-100 text-emergency-600 py-0.5 px-2 rounded-full text-xs">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
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
