
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, FileBarChart } from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <AnalyticsDashboard />
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileBarChart className="h-5 w-5 mr-2" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Available Reports</div>
                <Separator />
                <Button variant="ghost" className="w-full justify-start text-left">
                  Emergency Response Times
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left">
                  Responder Activity
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left">
                  IoT Device Performance
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left">
                  Alert Summary
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Scheduled Reports</div>
                <Separator />
                <div className="p-3 rounded-md border">
                  <div className="font-medium">Daily Alert Summary</div>
                  <div className="text-xs text-gray-500">Runs daily at 23:00</div>
                </div>
                <div className="p-3 rounded-md border">
                  <div className="font-medium">Weekly Performance</div>
                  <div className="text-xs text-gray-500">Runs every Monday at 08:00</div>
                </div>
              </div>
              
              <Button variant="default" className="w-full">
                Create New Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
