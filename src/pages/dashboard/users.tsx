// src/pages/dashboard/home.tsx
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import UsersStatistics from '@/src/app/components/dashboard/usersStadistics';

const Users: React.FC = () => {
  return (
    <DashboardLayout title="Usuarios">
      <UsersStatistics />
    </DashboardLayout>
  );
}

export default Users;
