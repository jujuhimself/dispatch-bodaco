
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ambulance, Clock, Users, Hospital, Smartphone, AlertTriangle } from "lucide-react";
import { getEmergencyStatistics } from '@/services/emergency-service';
import { useQuery } from '@tanstack/react-query';

const EmergencyStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['emergencyStats'],
    queryFn: getEmergencyStatistics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2 space-y-0">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading emergency stats:', error);
  }

  const statsData = [
    {
      title: "Active Emergencies",
      value: stats?.activeEmergencies.toString() ?? "0",
      change: `${stats?.activeEmergencies && stats.activeEmergencies > 0 ? '+' : ''}${stats?.activeEmergencies - 10 || 0} from yesterday`,
      icon: <Ambulance className="h-4 w-4 text-emergency-500" />,
      textColor: "text-emergency-500"
    },
    {
      title: "Available Responders",
      value: stats?.availableResponders.toString() ?? "0",
      change: `${stats?.availableResponders || 0} on standby`,
      icon: <Users className="h-4 w-4 text-medical-500" />,
      textColor: "text-medical-500"
    },
    {
      title: "Avg. Response Time",
      value: stats?.avgResponseTime ?? "0:00",
      change: "-12% from last week",
      icon: <Clock className="h-4 w-4 text-success-500" />,
      textColor: "text-success-500"
    },
    {
      title: "Hospital Capacity",
      value: `${stats?.hospitalCapacity || 0}%`,
      change: `${stats?.hospitalsAtCapacity || 0} hospitals at capacity`,
      icon: <Hospital className="h-4 w-4 text-orange-500" />,
      textColor: "text-orange-500"
    },
    {
      title: "Connected IoT Devices",
      value: "17", // This would be populated from stats in production
      change: "12 active, 5 inactive",
      icon: <Smartphone className="h-4 w-4 text-blue-500" />,
      textColor: "text-blue-500"
    },
    {
      title: "Pending Alert Escalations",
      value: stats?.pendingEscalations?.toString() ?? "0",
      change: `${stats?.pendingEscalations && stats.pendingEscalations > 0 ? 'Requires attention' : 'All clear'}`,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      textColor: "text-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
