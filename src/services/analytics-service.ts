
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsMetric {
  label: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface ResponseTimeMetrics {
  average: number;
  median: number;
  min: number;
  max: number;
  percentile95: number;
}

export interface PerformanceReport {
  totalEmergencies: number;
  resolvedEmergencies: number;
  averageResponseTime: number;
  activeResponders: number;
  hospitalCapacity: number;
  responseTimeMetrics: ResponseTimeMetrics;
}

class AnalyticsService {
  // Real-time metrics
  async getEmergencyMetrics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<AnalyticsMetric[]> {
    const startDate = this.getStartDate(timeframe);
    
    try {
      const [totalRes, activeRes, resolvedRes, avgResponseRes] = await Promise.all([
        supabase
          .from('emergencies')
          .select('*', { count: 'exact', head: true })
          .gte('reported_at', startDate),
        
        supabase
          .from('emergencies')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'assigned', 'in_transit', 'on_site']),
        
        supabase
          .from('emergencies')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved')
          .gte('reported_at', startDate),
        
        this.calculateAverageResponseTime(timeframe)
      ]);

      return [
        {
          label: 'Total Emergencies',
          value: totalRes.count || 0,
          trend: 'up'
        },
        {
          label: 'Active Emergencies',
          value: activeRes.count || 0,
          trend: 'stable'
        },
        {
          label: 'Resolved Emergencies',
          value: resolvedRes.count || 0,
          trend: 'up'
        },
        {
          label: 'Avg Response Time (min)',
          value: avgResponseRes,
          trend: 'down'
        }
      ];
    } catch (error) {
      console.error('Error fetching emergency metrics:', error);
      return [];
    }
  }

  async getPerformanceReport(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<PerformanceReport> {
    const startDate = this.getStartDate(timeframe);
    
    try {
      const [emergencies, responders, hospitals] = await Promise.all([
        supabase
          .from('emergencies')
          .select('*')
          .gte('reported_at', startDate),
        
        supabase
          .from('responders')
          .select('*')
          .eq('status', 'available'),
        
        supabase
          .from('hospitals')
          .select('total_beds, available_beds')
      ]);

      const totalEmergencies = emergencies.data?.length || 0;
      const resolvedEmergencies = emergencies.data?.filter(e => e.status === 'resolved').length || 0;
      const activeResponders = responders.data?.length || 0;
      
      const hospitalCapacity = hospitals.data?.reduce((acc, h) => 
        acc + (h.available_beds / h.total_beds), 0) / (hospitals.data?.length || 1);

      const responseTimeMetrics = this.calculateResponseTimeMetrics(emergencies.data || []);
      
      return {
        totalEmergencies,
        resolvedEmergencies,
        averageResponseTime: responseTimeMetrics.average,
        activeResponders,
        hospitalCapacity: Math.round(hospitalCapacity * 100),
        responseTimeMetrics
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  // Export functionality
  async exportEmergencyData(startDate: string, endDate: string): Promise<Blob> {
    try {
      const { data, error } = await supabase
        .from('emergencies')
        .select(`
          *,
          emergency_assignments(*)
        `)
        .gte('reported_at', startDate)
        .lte('reported_at', endDate);

      if (error) throw error;

      const csvContent = this.convertToCSV(data || []);
      return new Blob([csvContent], { type: 'text/csv' });
    } catch (error) {
      console.error('Error exporting emergency data:', error);
      throw error;
    }
  }

  private getStartDate(timeframe: string): string {
    const now = new Date();
    switch (timeframe) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private async calculateAverageResponseTime(timeframe: string): Promise<number> {
    // Simplified calculation - in production, this would use actual response time data
    return Math.floor(Math.random() * 10) + 3; // 3-13 minutes
  }

  private calculateResponseTimeMetrics(emergencies: any[]): ResponseTimeMetrics {
    if (emergencies.length === 0) {
      return { average: 0, median: 0, min: 0, max: 0, percentile95: 0 };
    }

    // Mock calculation for demonstration
    const responseTimes = emergencies.map(() => Math.floor(Math.random() * 30) + 1);
    responseTimes.sort((a, b) => a - b);

    return {
      average: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      median: responseTimes[Math.floor(responseTimes.length / 2)],
      min: responseTimes[0],
      max: responseTimes[responseTimes.length - 1],
      percentile95: responseTimes[Math.floor(responseTimes.length * 0.95)]
    };
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

export const analyticsService = new AnalyticsService();
