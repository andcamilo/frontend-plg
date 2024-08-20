// src/pages/dashboard/home.tsx
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import ClientsStatistics from '@components/clientsStadistics';

const Users: React.FC = () => {
  return (
    <DashboardLayout title="Usuarios">
      <ClientsStatistics />
    </DashboardLayout>
  );
}

export default Users;
