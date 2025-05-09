
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RespondersPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Responders</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Responder Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Responder management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RespondersPage;
