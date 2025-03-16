import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import RequestsCasos from '@components/requestsCasos';

const Requests: React.FC = () => {
  return (
    <DashboardLayout title="Casos Pensión">
      <RequestsCasos />
    </DashboardLayout>
  );
}

export default Requests;