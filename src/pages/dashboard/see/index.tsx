// src/pages/dashboard/reports.tsx
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import ListDisbursement from '@/src/app/components/disbursement/listDisbursement';

const See: React.FC = () => {
  return (
    <DashboardLayout title="Ver Desembolsos">
      <ListDisbursement/>
    </DashboardLayout>
  );
}

export default See;