
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ambulance, Clock, Users, Hospital } from "lucide-react";

const statsData = [
  {
    title: "Active Emergencies",
    value: "12",
    change: "+2 from yesterday",
    icon: <Ambulance className="h-4 w-4 text-emergency-500" />,
    textColor: "text-emergency-500"
  },
  {
    title: "Available Responders",
    value: "38",
    change: "8 on standby",
    icon: <Users className="h-4 w-4 text-medical-500" />,
    textColor: "text-medical-500"
  },
  {
    title: "Avg. Response Time",
    value: "4:32",
    change: "-12% from last week",
    icon: <Clock className="h-4 w-4 text-success-500" />,
    textColor: "text-success-500"
  },
  {
    title: "Hospital Capacity",
    value: "73%",
    change: "3 hospitals at capacity",
    icon: <Hospital className="h-4 w-4 text-orange-500" />,
    textColor: "text-orange-500"
  }
];

const EmergencyStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
            <div className="p-2 bg-gray-100 rounded-md">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmergencyStats;
