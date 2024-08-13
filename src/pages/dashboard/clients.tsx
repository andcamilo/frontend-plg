// src/pages/dashboard/home.tsx
import React from 'react';
import DashboardLayout from '@components/DashboardLayout';
import ClientsStatistics from '@/src/app/components/clientsStadistics';

const Home: React.FC = () => {
  return (
    <DashboardLayout title="Clientes">
      <ClientsStatistics />
    </DashboardLayout>
  );
}

export default Home;
