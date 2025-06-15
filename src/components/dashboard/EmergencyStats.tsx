import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Users, Clock, Activity } from 'lucide-react';
import { getEmergencyStatistics } from '@/services/emergency-service';
import { LoadingState } from '@/components/ui/loading-state';

const EmergencyStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['emergency-statistics'],
    queryFn: getEmergencyStatistics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <LoadingState isLoading={true} variant="skeleton">
                <div></div>
              </LoadingState>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="col-span-full">
          <CardContent className="p-6 text-center text-red-600">
            Failed to load statistics. Please try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Emergencies',
      value: stats?.activeEmergencies || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Available Responders',
      value: stats?.availableResponders || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avg Response Time',
      value: stats?.avgResponseTime || '0:00',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Hospital Capacity',
      value: `${stats?.hospitalCapacity || 0}%`,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === 'Hospital Capacity' && stats?.hospitalsAtCapacity && (
                <p className="text-xs text-gray-600 mt-1">
                  {stats.hospitalsAtCapacity} hospitals at capacity
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EmergencyStats;
