
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommunicationDashboard } from '@/components/communications/CommunicationDashboard';

const Communications: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <CommunicationDashboard />
    </div>
  );
};

export default Communications;
