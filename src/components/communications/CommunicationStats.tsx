
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp,
  Phone,
  MessageCircle,
  Send
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CommunicationStatsData {
  totalMessages: number;
  activeChannels: number;
  responseTime: string;
  messagesGrowth: number;
  messagesByType: {
    message: number;
    voice: number;
    whatsapp: number;
  };
  busyHours: string;
}

export const CommunicationStats: React.FC = () => {
  // Mock data - in real app, this would come from an API
  const { data: stats, isLoading } = useQuery({
    queryKey: ['communication-stats'],
    queryFn: async (): Promise<CommunicationStatsData> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        totalMessages: 1247,
        activeChannels: 23,
        responseTime: '2.3 min',
        messagesGrowth: 15.7,
        messagesByType: {
          message: 895,
          voice: 241,
          whatsapp: 111
        },
        busyHours: '14:00 - 16:00'
      };
    },
  });

  const statCards = [
    {
      title: 'Total Messages',
      value: stats?.totalMessages.toLocaleString() || '0',
      icon: MessageSquare,
      trend: `+${stats?.messagesGrowth || 0}%`,
      trendUp: (stats?.messagesGrowth || 0) > 0,
      description: 'Last 24 hours'
    },
    {
      title: 'Active Channels',
      value: stats?.activeChannels || '0',
      icon: Users,
      description: 'Currently active'
    },
    {
      title: 'Avg Response Time',
      value: stats?.responseTime || 'N/A',
      icon: Clock,
      description: 'Emergency channels'
    },
    {
      title: 'Peak Hours',
      value: stats?.busyHours || 'N/A',
      icon: TrendingUp,
      description: 'Highest activity'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(null).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.trend && (
                      <Badge 
                        variant={stat.trendUp ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Message Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Text Messages</p>
                  <p className="text-sm text-muted-foreground">Standard messaging</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{stats?.messagesByType.message || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {stats ? Math.round((stats.messagesByType.message / stats.totalMessages) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Voice Calls</p>
                  <p className="text-sm text-muted-foreground">Audio communication</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{stats?.messagesByType.voice || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {stats ? Math.round((stats.messagesByType.voice / stats.totalMessages) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">External messaging</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{stats?.messagesByType.whatsapp || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {stats ? Math.round((stats.messagesByType.whatsapp / stats.totalMessages) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
