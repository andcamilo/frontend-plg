// src/pages/dashboard/home.tsx
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import LegixStadistics from '@components/legixStadistics';

const Home: React.FC = () => {
  return (
    <DashboardLayout title="Estadísticas de LEGIX">
      <LegixStadistics />
    </DashboardLayout>
  );
}

export default Home;