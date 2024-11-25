import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import RequestDashboard from '@components/dashboard/user';

const Request: React.FC = () => {
  return (
    <DashboardLayout title="Usuario">
      <RequestDashboard />
    </DashboardLayout>
  );
}

export default Request;