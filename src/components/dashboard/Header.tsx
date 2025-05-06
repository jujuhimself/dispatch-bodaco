
import React from 'react';
import { Button } from "@/components/ui/button";
import { Phone, Bell, Users, Ambulance } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-4 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Ambulance className="h-8 w-8 text-emergency-600 mr-2" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold flex items-center">
              <span className="text-emergency-600">Respond</span>
              <span className="ml-1 bg-emergency-500 h-2 w-2 rounded-full emergency-pulse"></span>
            </h1>
            <p className="text-sm text-gray-500">Emergency Response Platform</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" className="flex items-center bg-white">
          <Phone className="h-4 w-4 mr-1" />
          <span>Emergency Call</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-emergency-500 rounded-full"></span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
        
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
          <span className="text-xs font-medium">JD</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
