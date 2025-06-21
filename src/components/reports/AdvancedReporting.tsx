
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, Calendar, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

const AdvancedReporting = () => {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [reportType, setReportType] = useState('emergency');
  const [exportFormat, setExportFormat] = useState('pdf');

  // Fetch report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-data', reportType, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_report_data', {
        report_type: reportType,
        start_date: startOfDay(dateRange.from).toISOString(),
        end_date: endOfDay(dateRange.to).toISOString()
      });

      if (error) throw error;
      return data;
    },
    enabled: !!dateRange.from && !!dateRange.to
  });

  const handleExport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          type: reportType,
          format: exportFormat,
          dateRange: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString()
          },
          data: reportData
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { 
        type: exportFormat === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const emergencyData = [
    { name: 'Medical', value: 45, color: '#ef4444' },
    { name: 'Traffic', value: 30, color: '#f97316' },
    { name: 'Fire', value: 15, color: '#dc2626' },
    { name: 'Other', value: 10, color: '#6b7280' }
  ];

  const responseTimeData = [
    { day: 'Mon', avgTime: 8.5 },
    { day: 'Tue', avgTime: 7.2 },
    { day: 'Wed', avgTime: 9.1 },
    { day: 'Thu', avgTime: 6.8 },
    { day: 'Fri', avgTime: 8.9 },
    { day: 'Sat', avgTime: 7.5 },
    { day: 'Sun', avgTime: 8.2 }
  ];

  const monthlyTrends = [
    { month: 'Jan', emergencies: 65, resolved: 62 },
    { month: 'Feb', emergencies: 78, resolved: 75 },
    { month: 'Mar', emergencies: 82, resolved: 80 },
    { month: 'Apr', emergencies: 71, resolved: 69 },
    { month: 'May', emergencies: 89, resolved: 86 },
    { month: 'Jun', emergencies: 93, resolved: 91 }
  ];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Advanced Reporting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency Reports</SelectItem>
                  <SelectItem value="responder">Responder Performance</SelectItem>
                  <SelectItem value="hospital">Hospital Capacity</SelectItem>
                  <SelectItem value="iot">IoT Device Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Emergencies</p>
                <p className="text-2xl font-bold">476</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">7.8 min</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">-2.1 min improvement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Responders</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mt-2">8 on duty now</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">+1.8% improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emergencyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {emergencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time (Minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Emergency Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="emergencies" fill="#ef4444" name="Total Emergencies" />
              <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedReporting;
