import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import RequestDashboard from '@components/dashboard/solicitud';

const Request: React.FC = () => {
  return (
    <DashboardLayout title="Solicitud">
      <RequestDashboard />
    </DashboardLayout>
  );
}

export default Request;