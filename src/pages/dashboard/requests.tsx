import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import RequestsStadistics from '@components/requestsStadistics';

const Requests: React.FC = () => {
  return (
    <DashboardLayout title="Solicitudes">
      <RequestsStadistics />
    </DashboardLayout>
  );
}

export default Requests;