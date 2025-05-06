
import React from 'react';
import { Button } from "@/components/ui/button";
import { Phone, Bell, Users } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-emergency-700 flex items-center">
            <span className="text-emergency-600">Rapid</span>
            <span className="text-medical-600">Response</span>
            <span className="ml-1 bg-emergency-500 h-2 w-2 rounded-full emergency-pulse"></span>
          </h1>
          <p className="text-sm text-gray-500">Intelligent Emergency Dispatch System</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="flex items-center">
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
        
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs font-medium">JD</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
