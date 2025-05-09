import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const CommunicationsPage: React.FC = () => {
  const { auth: user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Communications</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Communication Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Communication functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationsPage;
