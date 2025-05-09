import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const HospitalsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Hospitals</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Hospital Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Hospital management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalsPage;

