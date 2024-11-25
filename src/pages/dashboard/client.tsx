import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import RequestDashboard from '@components/dashboard/client';

const Request: React.FC = () => {
  return (
    <DashboardLayout title="Cliente">
      <RequestDashboard />
    </DashboardLayout>
  );
}

export default Request;