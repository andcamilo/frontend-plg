// src/pages/dashboard/home.tsx
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import RequestDisbursement from '@/src/app/components/requestDisbursement';

const Disbursement: React.FC = () => {
  return (
    <DashboardLayout title="Desembolso">
      <RequestDisbursement/>
    </DashboardLayout>
  );
}

export default Disbursement;