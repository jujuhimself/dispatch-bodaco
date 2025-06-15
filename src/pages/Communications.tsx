
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CommunicationDashboard } from '@/components/communications/CommunicationDashboard';

const CommunicationsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Communications | Rapid Response Guardian</title>
      </Helmet>
      
      <div className="h-[calc(100vh-4rem)]">
        <CommunicationDashboard />
      </div>
    </>
  );
};

export default CommunicationsPage;
