import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import ListExpenses from '@/src/app/components/disbursement/listExpenses';

const See: React.FC = () => {
  return (
    <DashboardLayout title="Ver Gastos">
      <ListExpenses/>
    </DashboardLayout>
  );
}

export default See;