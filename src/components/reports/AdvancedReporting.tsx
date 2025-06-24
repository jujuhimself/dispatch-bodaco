
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { FileDown, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { addDays } from 'date-fns';

const AdvancedReporting = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 30)
  });
  const [reportType, setReportType] = useState('emergency');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'emergency', label: 'Emergency Response Report' },
    { value: 'responder', label: 'Responder Performance Report' },
    { value: 'hospital', label: 'Hospital Capacity Report' },
    { value: 'communication', label: 'Communication Analysis Report' }
  ];

  const generateReport = async () => {
    setLoading(true);
    // Simulate report generation
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
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
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
            
            <Button 
              onClick={generateReport}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Response Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <Badge variant="outline">4.2 min</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <Badge variant="default">94%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Emergencies</span>
                <Badge variant="secondary">247</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Emergency Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Medical</span>
                <Badge variant="destructive">45%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fire</span>
                <Badge variant="secondary">30%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Traffic</span>
                <Badge variant="outline">25%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Resolution Rate</span>
                <Badge variant="default">98%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Duration</span>
                <Badge variant="outline">25 min</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Peak Hours</span>
                <Badge variant="secondary">2-6 PM</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedReporting;
