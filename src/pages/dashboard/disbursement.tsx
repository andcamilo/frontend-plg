// src/pages/dashboard/reports.tsx
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import Disbursement from '@/src/app/components/disbursement/disbursement';

const Invoices: React.FC = () => {
  return (
    <DashboardLayout title="Desembolso">
      <Disbursement id=''/>
    </DashboardLayout>
  );
}

export default Invoices;