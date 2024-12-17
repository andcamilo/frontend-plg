import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import ExpenseComponent from '@/src/app/components/ExpenseComponent';

const Clients: React.FC = () => {
  return (
    <DashboardLayout title="">
      <ExpenseComponent />
    </DashboardLayout>
  );
}

export default Clients;
