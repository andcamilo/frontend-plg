import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import ClientsStatistics from '@components/dashboard/clientsStadistics';

const Clients: React.FC = () => {
  return (
    <DashboardLayout title="Clientes">
      <ClientsStatistics />
    </DashboardLayout>
  );
}

export default Clients;
